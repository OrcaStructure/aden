// app/api/deliberate/sessions/route.js
import { NextResponse } from "next/server";
import { strapiFetch } from "@/lib/strapi";
import { fetchPracticeActivityTree } from "@/lib/strapi";

// -----------------------
// Helpers
// -----------------------

const MAX_WINDOW_MINUTES = 600; // 10 hours
const MIN_PER_ACTIVITY = 5;     // "like a minimum number (say 5 minutes)"

/**
 * Fetch recent deliberate-sessions from Strapi, newest first,
 * until their totalMinutes sum reaches at most maxWindowMinutes.
 *
 * Returns:
 *  {
 *    usage: Map<activityId, minutes>,
 *    totalMinutes: number
 *  }
 */
async function computeRecentUsage(maxWindowMinutes = MAX_WINDOW_MINUTES) {
  const res = await strapiFetch(
    "/api/deliberate-sessions?sort=createdAt:desc&pagination[pageSize]=100"
  );

  const items = Array.isArray(res?.data) ? res.data : [];
  const usage = new Map();
  let accumulated = 0;

  for (const item of items) {
    if (accumulated >= maxWindowMinutes) break;

    const attrs = item.attributes ?? item ?? {};
    const sessionTotal = Number(attrs.totalMinutes) || 0;
    if (sessionTotal <= 0) continue;

    // If including this session would exceed the window, just stop.
    if (accumulated + sessionTotal > maxWindowMinutes) break;

    const planned = Array.isArray(attrs.plannedItems)
      ? attrs.plannedItems
      : Array.isArray(attrs.planned)
      ? attrs.planned
      : [];

    const actual = Array.isArray(attrs.actualItems)
      ? attrs.actualItems
      : Array.isArray(attrs.actual)
      ? attrs.actual
      : [];

    // Prefer actuals; if none recorded, fall back to planned
    const entries = actual.length ? actual : planned;

    for (const entry of entries) {
      if (!entry) continue;
      const activityId = entry.activityId;
      if (activityId == null) continue;

      const minutes =
        Number(entry.actualMinutes ?? entry.suggestedMinutes ?? 0) || 0;
      if (minutes <= 0) continue;

      usage.set(activityId, (usage.get(activityId) || 0) + minutes);
    }

    accumulated += sessionTotal;
  }

  return { usage, totalMinutes: accumulated };
}

/**
 * Recursively gather leaf activities and their *ideal fractions* according
 * to weights, normalised level-by-level (so it respects your hierarchical
 * weighting).
 *
 * Returns array of { activityId, path, fraction } summing to ~1.
 */
function gatherLeafFractions(nodes, parentFraction = 1, parentPath = []) {
  const leaves = [];
  const active = (nodes || []).filter((n) => (n.weight ?? 0) > 0);
  if (!active.length) return leaves;

  const totalWeight = active.reduce(
    (sum, n) => sum + (n.weight ?? 0),
    0
  );

  for (const node of active) {
    const share = (node.weight ?? 0) / totalWeight;
    const frac = parentFraction * share;
    const path = [...parentPath, node.name];

    const childLeaves = gatherLeafFractions(node.children || [], frac, path);
    if (childLeaves.length) {
      leaves.push(...childLeaves);
    } else {
      leaves.push({
        activityId: node.id, // relational id
        path,
        fraction: frac,
      });
    }
  }

  return leaves;
}

/**
 * Quantise raw allocations (real numbers) into integer minutes,
 * enforcing a minimum per activity as best as possible while keeping
 * the total == totalMinutes.
 */
function quantizeAllocations(leavesWithRaw, totalMinutes, minPerActivity) {
  if (!leavesWithRaw.length || totalMinutes <= 0) return [];

  const S = Math.round(totalMinutes);
  const count = leavesWithRaw.length;

  // Effective minimum can't exceed average allocation; otherwise it's impossible.
  const effectiveMin =
    minPerActivity > 0
      ? Math.min(minPerActivity, Math.floor(S / count))
      : 0;

  const sorted = [...leavesWithRaw].sort(
    (a, b) => (b.rawAlloc ?? 0) - (a.rawAlloc ?? 0)
  );

  const result = [];
  let remaining = S;
  let remainingCount = sorted.length;

  for (let i = 0; i < sorted.length; i++) {
    const leaf = sorted[i];
    const isLast = i === sorted.length - 1;
    let base = Math.round(leaf.rawAlloc ?? 0);

    if (base < effectiveMin) base = effectiveMin;

    const minNeededForRest = isLast ? 0 : effectiveMin * (remainingCount - 1);
    if (base > remaining - minNeededForRest) {
      base = Math.max(effectiveMin, remaining - minNeededForRest);
    }

    if (isLast) base = remaining; // dump the remaining onto the last one
    if (base < 0) base = 0;

    result.push({
      activityId: leaf.activityId,
      path: leaf.path,
      suggestedMinutes: base,
    });

    remaining -= base;
    remainingCount -= 1;
  }

  return result.filter((p) => p.suggestedMinutes > 0);
}

/**
 * Simple "weights-only" allocation (no history), using the leaf fractions.
 */
function simpleWeightPlan(leaves, totalMinutes, minPerActivity) {
  const totalFraction =
    leaves.reduce((sum, l) => sum + (l.fraction ?? 0), 0) || 1;

  const normalised = leaves.map((l) => ({
    ...l,
    fraction: (l.fraction ?? 0) / totalFraction,
  }));

  normalised.forEach((l) => {
    l.rawAlloc = (l.fraction ?? 0) * totalMinutes;
  });

  return quantizeAllocations(normalised, totalMinutes, minPerActivity);
}

/**
 * Build a history-aware plan that nudges the last 10 hours toward
 * the weighted ideal composition.
 */
function buildBalancedPlan(
  activityTree,
  usageMap,
  usageMinutes,
  requestedMinutes,
  options = {}
) {
  const totalMinutes = Math.max(1, Math.round(requestedMinutes));
  const maxWindowMinutes = options.maxWindowMinutes ?? MAX_WINDOW_MINUTES;
  const minPerActivity = options.minPerActivity ?? MIN_PER_ACTIVITY;

  const leaves = gatherLeafFractions(activityTree, 1, []);
  if (!leaves.length) return [];

  // If we have no history yet, fall back to weights only
  if (!usageMinutes || usageMinutes <= 0 || usageMap.size === 0) {
    return simpleWeightPlan(leaves, totalMinutes, minPerActivity);
  }

  const targetTotal = Math.min(maxWindowMinutes, usageMinutes + totalMinutes);

  // Compute current vs desired for *every* leaf
  const leafInfos = leaves.map((leaf) => {
    const current = usageMap.get(leaf.activityId) || 0;
    const desired = (leaf.fraction ?? 0) * targetTotal;
    const deficit = desired - current; // >0 = under-served

    return {
      ...leaf,
      current,
      desired,
      deficit,
    };
  });

  // Build a weight for each leaf that combines:
  // - its positive deficit (under-served activities get more)
  // - a small base term from its ideal fraction (so nobody is ever fully dropped)
  const baseScale = targetTotal || 1;

  const weights = leafInfos.map((l) => {
    const deficitPos = Math.max(l.deficit, 0); // 0 if at/above target
    const softWeight = (l.fraction ?? 0) * baseScale;
    // 0.1 is an arbitrary "blend" factor; tweak if you like.
    return deficitPos + 0.1 * softWeight;
  });

  const sumWeights = weights.reduce((sum, w) => sum + w, 0);
  if (!sumWeights || !Number.isFinite(sumWeights)) {
    return simpleWeightPlan(leaves, totalMinutes, minPerActivity);
  }

  const withRawAlloc = leafInfos.map((l, i) => ({
    ...l,
    rawAlloc: (weights[i] / sumWeights) * totalMinutes,
  }));

  return quantizeAllocations(withRawAlloc, totalMinutes, minPerActivity);
}


// -----------------------
// Existing: save session
// -----------------------

// POST /api/deliberate/sessions
export async function POST(req) {
  const body = await req.json();

  const payload = {
    data: {
      totalMinutes: body.totalMinutes,
      plannedItems: body.planned,
      actualItems: body.actual,
    },
  };

  const result = await strapiFetch("/api/deliberate-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return NextResponse.json(result);
}

// -----------------------
// NEW: build suggested plan
// -----------------------

// GET /api/deliberate/sessions?totalMinutes=NN
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const totalParam = searchParams.get("totalMinutes");
  const requestedMinutes = Number(totalParam) || 0;

  if (requestedMinutes <= 0) {
    return NextResponse.json(
      { error: "totalMinutes must be > 0" },
      { status: 400 }
    );
  }

  try {
    const [activityTree, usageInfo] = await Promise.all([
      fetchPracticeActivityTree(),
      computeRecentUsage(MAX_WINDOW_MINUTES),
    ]);

    const plan = buildBalancedPlan(
      activityTree,
      usageInfo.usage,
      usageInfo.totalMinutes,
      requestedMinutes,
      { maxWindowMinutes: MAX_WINDOW_MINUTES, minPerActivity: MIN_PER_ACTIVITY }
    );

    return NextResponse.json({ plan });
  } catch (err) {
    console.error("GET /api/deliberate/sessions (plan) error:", err);
    return NextResponse.json(
      { error: "Failed to build plan", details: String(err) },
      { status: 500 }
    );
  }
}
