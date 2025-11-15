// app/api/deliberate/activities/route.js
import { NextResponse } from "next/server";
import { strapiFetch, fetchPracticeActivityTree } from "@/lib/strapi";

// GET /api/deliberate/activities
export async function GET() {
  try {
    const tree = await fetchPracticeActivityTree();
    return NextResponse.json({ tree });
  } catch (err) {
    console.error("GET /api/deliberate/activities error:", err);
    return NextResponse.json(
      { error: "Failed to load activities" },
      { status: 500 }
    );
  }
}

// POST /api/deliberate/activities
// Body: { name, weight, parentId: number | null }
// Creates the activity AND a "Misc" child for it.
export async function POST(req) {
  try {
    const body = await req.json();
    const name = body.name;
    const weight = body.weight ?? 1;
    const parentId = body.parentId ?? null;

    // 1) Create the parent activity
    const parentRes = await strapiFetch("/api/practice-activities", {
      method: "POST",
      body: JSON.stringify({
        data: {
          name,
          weight,
          parent_activity: parentId,
        },
      }),
    });

    const parentIdFromStrapi = parentRes.data.id;

    // 2) Create default "Misc" child
    await strapiFetch("/api/practice-activities", {
      method: "POST",
      body: JSON.stringify({
        data: {
          name: "Misc",
          weight: 1,
          parent_activity: parentIdFromStrapi,
        },
      }),
    });

    // 3) Rebuild the tree
    const tree = await fetchPracticeActivityTree();
    return NextResponse.json({ tree });
  } catch (err) {
    console.error("POST /api/deliberate/activities error:", err);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 }
    );
  }
}
