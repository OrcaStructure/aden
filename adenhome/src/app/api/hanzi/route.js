// app/api/hanzi/route.js
import { NextResponse } from "next/server";
import { cert, getApps, getApp, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

const MAX_BYTES = 900_000; // stay under Firestore's 1 MiB doc limit
const NO_STORE = { "Cache-Control": "no-store" };

// Imports stay static (dynamic import of externals breaks under
// turbopack-on-Netlify), but initialization stays lazy and inside the request
// so a misconfigured server answers with a diagnostic instead of an opaque 500.
function progressDoc() {
  const missing = [
    "FIREBASE_PROJECT_ID",
    "FIREBASE_CLIENT_EMAIL",
    "FIREBASE_PRIVATE_KEY",
  ].filter((k) => !process.env[k]);
  if (missing.length) {
    const err = new Error(
      `Server is missing environment variables: ${missing.join(", ")}. ` +
        "Add them (plus HANZI_SYNC_KEY) in Netlify and trigger a redeploy."
    );
    err.status = 503;
    throw err;
  }
  try {
    const app = getApps().length
      ? getApp()
      : initializeApp({
          credential: cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
          }),
        });
    return getFirestore(app).doc("hanzi/progress");
  } catch (e) {
    const err = new Error(
      "Firebase admin failed to initialize — check FIREBASE_PRIVATE_KEY formatting. " +
        (e?.message || "")
    );
    err.status = 503;
    throw err;
  }
}

function errorResponse(error) {
  const status = error?.status || 500;
  return NextResponse.json(
    { error: status === 503 ? error.message : "Internal server error" },
    { status, headers: NO_STORE }
  );
}

// If HANZI_SYNC_KEY is set, both reads and writes require the matching
// x-sync-key header. Unset = open (local dev convenience).
function authorized(request) {
  const key = process.env.HANZI_SYNC_KEY;
  if (!key) return true;
  return request.headers.get("x-sync-key") === key;
}

function sanitizeDeck(d) {
  if (
    !d ||
    typeof d.pool !== "number" ||
    typeof d.cards !== "object" ||
    d.cards === null
  ) {
    return null;
  }
  return {
    name: typeof d.name === "string" ? d.name.slice(0, 60) : "deck",
    data: Array.isArray(d.data) ? d.data : null,
    gen: typeof d.gen === "number" ? d.gen : 0,
    pool: d.pool,
    reviews: d.reviews || 0,
    day: d.day || "",
    today: d.today || 0,
    cards: d.cards,
    hist: d.hist && typeof d.hist === "object" ? d.hist : {},
  };
}

// Client format (data as nested arrays) <-> storage format (data serialized,
// because Firestore rejects nested arrays).
function toStorage(state) {
  return {
    ...state,
    decks: Object.fromEntries(
      Object.entries(state.decks).map(([id, d]) => [
        id,
        { ...d, data: Array.isArray(d.data) ? JSON.stringify(d.data) : null },
      ])
    ),
  };
}

function fromStorage(doc) {
  if (!doc?.decks) return doc;
  const decks = {};
  for (const [id, d] of Object.entries(doc.decks)) {
    let data = d.data ?? null;
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        data = null;
      }
    }
    decks[id] = { ...d, data };
  }
  return { ...doc, decks };
}

// Per-deck merge: a deck can never silently regress. Higher generation wins
// (resets/restores bump gen); same generation -> more reviews wins.
function pickDeck(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ga = a.gen || 0;
  const gb = b.gen || 0;
  if (ga !== gb) return ga > gb ? a : b;
  return (b.reviews || 0) >= (a.reviews || 0) ? b : a;
}

function mergeStates(existing, incoming) {
  const dead = [
    ...new Set([...(existing?.dead || []), ...(incoming.dead || [])]),
  ].slice(-200);
  const ids = new Set([
    ...Object.keys(existing?.decks || {}),
    ...Object.keys(incoming.decks),
  ]);
  const decks = {};
  for (const id of ids) {
    if (dead.includes(id)) continue;
    const winner = pickDeck(existing?.decks?.[id], incoming.decks[id]);
    if (winner) decks[id] = winner;
  }
  return {
    v: 2,
    cur: typeof incoming.cur === "string" ? incoming.cur : "hanzi",
    decks,
    dead,
  };
}

export async function GET(request) {
  try {
    if (!authorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
    }
    const snap = await progressDoc().get();
    const doc = snap.exists ? fromStorage(snap.data()) : null;
    return NextResponse.json(doc, { headers: NO_STORE });
  } catch (error) {
    console.error("Error loading hanzi progress:", error);
    return errorResponse(error);
  }
}

export async function POST(request) {
  try {
    if (!authorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: NO_STORE });
    }
    const body = await request.json();

    if (body?.v !== 2 || !body.decks || typeof body.decks !== "object") {
      return NextResponse.json({ error: "Invalid state" }, { status: 400, headers: NO_STORE });
    }
    const decks = {};
    for (const [id, d] of Object.entries(body.decks)) {
      const clean = sanitizeDeck(d);
      if (clean) decks[id] = clean;
    }
    if (Object.keys(decks).length === 0) {
      return NextResponse.json({ error: "Invalid state" }, { status: 400, headers: NO_STORE });
    }
    const incoming = {
      v: 2,
      cur: body.cur,
      decks,
      dead: Array.isArray(body.dead) ? body.dead.filter((x) => typeof x === "string") : [],
    };

    const docRef = progressDoc();
    const snap = await docRef.get();
    const existing = snap.exists ? fromStorage(snap.data()) : null;
    const merged = mergeStates(existing, incoming);

    const stored = { ...toStorage(merged), updatedAt: new Date().toISOString() };
    if (JSON.stringify(stored).length > MAX_BYTES) {
      return NextResponse.json({ error: "State too large" }, { status: 413, headers: NO_STORE });
    }
    await docRef.set(stored);

    return NextResponse.json({ status: "success", state: merged }, { headers: NO_STORE });
  } catch (error) {
    console.error("Error saving hanzi progress:", error);
    return errorResponse(error);
  }
}
