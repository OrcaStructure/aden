"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { CHARS } from "./data";

const STORE_KEY = "hanzi-v2";
const OLD_STORE_KEY = "hanzi-v1";
const SYNC_KEY_STORE = "hanzi-sync-key";
const START_POOL = 10;
const NO_REPEAT_WINDOW = 3;
const BOOST_SHOWINGS = 2; // guaranteed appearances for a freshly adopted card...
const BOOST_WINDOW = 15; // ...scheduled at random points within this many reviews

const HANZI_FONT =
  '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", sans-serif';

const DECK_FORMAT_HINT =
  '{"name":"Deck name","cards":[["front","hint (optional)","back"],["front","back"]]}';

// Local-timezone day key (UTC would flip "today" mid-morning outside GMT).
function dayKeyFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function todayKey() {
  return dayKeyFromDate(new Date());
}

function deckData(deck) {
  return deck.data || CHARS;
}

function freshDeck(extra = {}) {
  return {
    name: "汉字",
    data: null, // null = built-in hanzi deck
    gen: 0, // bumped on reset/restore so merges don't resurrect old progress
    pool: START_POOL,
    reviews: 0,
    day: "",
    today: 0,
    cards: {},
    hist: {},
    ...extra,
  };
}

function freshState() {
  return { v: 2, cur: "hanzi", decks: { hanzi: freshDeck() }, dead: [] };
}

// Accept a v1 (single-deck) or v2 blob and return v2, or null if unusable.
function migrate(raw) {
  if (!raw || typeof raw !== "object") return null;
  if (raw.v === 2 && raw.decks && typeof raw.decks === "object") return raw;
  if (typeof raw.pool === "number" && raw.cards && typeof raw.cards === "object") {
    return {
      v: 2,
      cur: "hanzi",
      dead: [],
      decks: {
        hanzi: freshDeck({
          pool: raw.pool,
          reviews: raw.reviews || 0,
          day: raw.day || "",
          today: raw.today || 0,
          cards: raw.cards,
          hist: raw.hist || {},
        }),
      },
    };
  }
  return null;
}

function normalize(s) {
  const next = JSON.parse(JSON.stringify(s));
  if (!next.dead || !Array.isArray(next.dead)) next.dead = [];
  for (const id of next.dead) delete next.decks[id];
  if (!next.decks.hanzi) next.decks.hanzi = freshDeck();
  for (const d of Object.values(next.decks)) {
    const len = deckData(d).length;
    d.gen = typeof d.gen === "number" ? d.gen : 0;
    d.pool = Math.min(Math.max(d.pool || 1, Math.min(START_POOL, len)), len);
    if (d.day !== todayKey()) {
      d.day = todayKey();
      d.today = 0;
    }
    if (!d.cards || typeof d.cards !== "object") d.cards = {};
    if (!d.hist || typeof d.hist !== "object") d.hist = {};
  }
  if (!next.decks[next.cur]) next.cur = "hanzi";
  return next;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY) || localStorage.getItem(OLD_STORE_KEY);
    const parsed = raw ? migrate(JSON.parse(raw)) : null;
    return normalize(parsed || freshState());
  } catch {
    return normalize(freshState());
  }
}

function saveState(s) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(s));
  } catch {
    // storage full or unavailable — reviews still sync to the server
  }
}

// strip anything that isn't a printable ASCII header character — an invisible
// pasted character (newline, curly quote, zero-width space) makes fetch throw
// a bare TypeError before the request is even sent
function cleanSyncKey(key) {
  return (key || "").replace(/[^\x21-\x7e]/g, "");
}

function getSyncKey() {
  try {
    return cleanSyncKey(localStorage.getItem(SYNC_KEY_STORE) || "");
  } catch {
    return "";
  }
}

function syncHeaders() {
  const h = { "Content-Type": "application/json" };
  const k = getSyncKey();
  if (k) h["x-sync-key"] = k;
  return h;
}

// Same rule as the server: higher generation wins; same generation, more
// reviews wins. A stale device can never regress a deck.
function pickDeck(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ga = a.gen || 0;
  const gb = b.gen || 0;
  if (ga !== gb) return ga > gb ? a : b;
  return (b.reviews || 0) >= (a.reviews || 0) ? b : a;
}

function mergeIntoLocal(local, remote) {
  const dead = [...new Set([...(local.dead || []), ...(remote.dead || [])])].slice(-200);
  const ids = new Set([
    ...Object.keys(local.decks),
    ...Object.keys(remote.decks || {}),
  ]);
  const decks = {};
  let changed = dead.length !== (local.dead || []).length;
  for (const id of ids) {
    if (dead.includes(id)) {
      if (local.decks[id]) changed = true;
      continue;
    }
    const winner = pickDeck(local.decks[id], remote.decks?.[id]);
    decks[id] = winner;
    if (winner !== local.decks[id]) changed = true;
  }
  return changed ? normalize({ ...local, decks, dead }) : null;
}

function card(deck, front) {
  return deck.cards[front] || { n: 0 };
}

// The review rotation: only cards adopted from the grid (card.a flag).
// Nothing enters by default, and a wrong answer removes the card again.
function rotation(deck) {
  return deckData(deck).filter(([f]) => card(deck, f).a);
}

// Fresh cards carry scheduled appearance slots (absolute review numbers in
// card.due). A card whose slot has come up takes priority; otherwise every
// card in rotation is equally likely (uniform base rate).
function pickNext(deck, recent) {
  const pool = rotation(deck);
  if (pool.length === 0) return null;
  const avoid = new Set(recent.slice(-Math.min(NO_REPEAT_WINDOW, pool.length - 1)));
  const nextReview = (deck.reviews || 0) + 1;
  const due = pool.filter(([f]) => (card(deck, f).due || [])[0] <= nextReview);
  const candidates = due.length ? due : pool;
  let filtered = candidates.filter(([f]) => !avoid.has(f));
  if (filtered.length === 0) filtered = candidates;
  return filtered[Math.floor(Math.random() * filtered.length)][0];
}

function settledCount(deck) {
  return rotation(deck).filter(([f]) => {
    const c = card(deck, f);
    return c.n > 0 && !(c.due || []).length;
  }).length;
}

function statusOf(deck, front) {
  const c = card(deck, front);
  return (c.due || []).length || c.n === 0 ? "fresh" : "settled";
}

function frontFontSize(text) {
  if (text.length <= 2) return "clamp(6rem, 24vmin, 11rem)";
  if (text.length <= 10) return "clamp(2.2rem, 9vmin, 4.5rem)";
  return "clamp(1.4rem, 5vmin, 2.5rem)";
}

function streakOf(deck) {
  let streak = 0;
  const d = new Date();
  if (!deck.hist[todayKey()]) d.setDate(d.getDate() - 1);
  for (;;) {
    const key = dayKeyFromDate(d);
    if (deck.hist[key] && deck.hist[key].r > 0) {
      streak += 1;
      d.setDate(d.getDate() - 1);
    } else break;
  }
  return streak;
}

// [front, hint, back] with hint optional in the source JSON.
function parseDeckJson(text) {
  let obj;
  try {
    obj = JSON.parse(text);
  } catch {
    return { error: "not valid JSON" };
  }
  if (obj && obj.v === 2 && obj.decks) return { backup: obj };
  if (!obj || typeof obj.name !== "string" || !obj.name.trim())
    return { error: "missing name" };
  if (!Array.isArray(obj.cards) || obj.cards.length < 4)
    return { error: "needs a cards array with at least 4 cards" };
  const seen = new Set();
  const data = [];
  for (const row of obj.cards) {
    if (!Array.isArray(row) || row.length < 2 || row.length > 3)
      return { error: "each card must be [front, back] or [front, hint, back]" };
    if (row.some((x) => typeof x !== "string"))
      return { error: "card fields must be strings" };
    const front = row[0].trim();
    const hint = row.length === 3 ? row[1].trim() : "";
    const back = row[row.length - 1].trim();
    if (!front || !back) return { error: "front and back cannot be empty" };
    if (seen.has(front)) continue; // silently dedupe
    seen.add(front);
    data.push([front, hint, back]);
  }
  if (data.length < 4) return { error: "needs at least 4 unique cards" };
  return {
    deck: freshDeck({
      name: obj.name.trim().slice(0, 40),
      data,
      day: todayKey(),
      pool: Math.min(START_POOL, data.length),
    }),
  };
}

function DailyChart({ deck }) {
  const days = [];
  const d = new Date();
  d.setDate(d.getDate() - 29);
  for (let i = 0; i < 30; i++) {
    const key = dayKeyFromDate(d);
    days.push({ key, r: deck.hist[key]?.r || 0, k: deck.hist[key]?.k ?? null });
    d.setDate(d.getDate() + 1);
  }
  // carry known-count forward through gap days so the line doesn't dip to 0
  let lastK = 0;
  for (const day of days) {
    if (day.k === null) day.k = lastK;
    else lastK = day.k;
  }
  const maxR = Math.max(...days.map((x) => x.r), 1);
  const maxK = Math.max(...days.map((x) => x.k), 1);
  const W = 300;
  const H = 72;
  const bw = W / 30;
  const line = days
    .map(
      (x, i) =>
        `${i === 0 ? "M" : "L"}${(i * bw + bw / 2).toFixed(1)} ${(
          H - (x.k / maxK) * (H - 10)
        ).toFixed(1)}`
    )
    .join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20" preserveAspectRatio="none">
        {days.map((x, i) => (
          <rect
            key={x.key}
            x={i * bw + 1}
            width={bw - 2}
            y={H - (x.r / maxR) * (H - 10)}
            height={(x.r / maxR) * (H - 10)}
            className="fill-neutral-700"
          />
        ))}
        <path d={line} fill="none" strokeWidth="1.5" className="stroke-amber-300/80" />
      </svg>
      <div className="flex justify-between text-[10px] text-neutral-600 mt-1">
        <span>{days[0].key.slice(5)}</span>
        <span>
          <span className="text-neutral-500">▮ reviews/day (max {maxR})</span>{" "}
          <span className="text-amber-300/70">— settled ({days[29].k})</span>
        </span>
        <span>today</span>
      </div>
    </div>
  );
}

const STATUS_STYLE = {
  settled: "text-emerald-300 border-emerald-900",
  fresh: "text-sky-300 border-sky-900",
};

function syncLabel(sync) {
  if (sync === "ok") return ["● synced", "text-emerald-400/80"];
  if (sync === "auth") {
    return getSyncKey()
      ? [
          "⚠ key rejected — the server expects a different key (copy just the value after HANZI_SYNC_KEY=)",
          "text-amber-300/90",
        ]
      : ["⚠ sync key needed — paste it below", "text-amber-300/90"];
  }
  if (sync === "error") {
    return [
      "⚠ sync server unreachable or erroring — reviews stay on this device until it recovers (a key can't fix this)",
      "text-red-400/90",
    ];
  }
  return ["… checking", "text-neutral-500"];
}

function StatsView({
  state,
  recent,
  sync,
  syncMsg,
  onSwitchDeck,
  onImportDeck,
  onDeleteDeck,
  onSaveSyncKey,
  onRetrySync,
  onClose,
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [keyDraft, setKeyDraft] = useState(getSyncKey());
  const [copied, setCopied] = useState("");
  const [keyFlash, setKeyFlash] = useState("");
  const deck = state.decks[state.cur];
  const data = deckData(deck);
  const rot = rotation(deck);
  const settled = settledCount(deck);
  const counts = { settled: 0, fresh: 0 };
  rot.forEach(([f]) => counts[statusOf(deck, f)]++);
  let dropped = 0;
  let unseen = 0;
  data.forEach(([f]) => {
    const c = card(deck, f);
    if (c.a) return;
    if (c.n === 0) unseen += 1;
    else dropped += 1;
  });

  // fresh cards still owed scheduled showings
  const queued = rot
    .filter(([f]) => (card(deck, f).due || []).length > 0)
    .slice(0, 8);

  const sortedRot = [...rot].sort((a, b) => {
    const ca = card(deck, a[0]);
    const cb = card(deck, b[0]);
    const fa = (ca.due || []).length ? 0 : 1;
    const fb = (cb.due || []).length ? 0 : 1;
    return fa - fb || cb.n - ca.n;
  });

  const copyBackup = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(state));
      setCopied("copied");
    } catch {
      setCopied("copy failed");
    }
    setTimeout(() => setCopied(""), 2000);
  };

  const [syncText, syncClass] = syncLabel(sync);

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100">
      <div className="max-w-2xl mx-auto px-4 pb-12">
        <div className="flex justify-between items-center pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-xs text-neutral-600 sticky top-0 bg-neutral-950 z-10">
          <span>stats</span>
          <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200">
            review (s)
          </button>
        </div>

        {/* decks */}
        <div className="flex flex-wrap gap-2 items-center mb-6">
          {Object.entries(state.decks).map(([id, d]) => (
            <span key={id} className="inline-flex">
              <button
                onClick={() => onSwitchDeck(id)}
                className={`px-3 py-1.5 rounded-lg text-sm border ${
                  id === state.cur
                    ? "bg-neutral-100 text-neutral-950 border-neutral-100"
                    : "bg-neutral-900 text-neutral-300 border-neutral-800 hover:border-neutral-600"
                }`}
              >
                {d.name}
              </button>
              {id !== "hanzi" && (
                <button
                  onClick={() => onDeleteDeck(id)}
                  className="px-1.5 text-neutral-700 hover:text-red-400 text-sm"
                  title="delete deck"
                >
                  ×
                </button>
              )}
            </span>
          ))}
          <button
            onClick={() => {
              setAdding((a) => !a);
              setError("");
            }}
            className="px-3 py-1.5 rounded-lg text-sm border border-dashed border-neutral-700 text-neutral-500 hover:text-neutral-300"
          >
            + deck
          </button>
        </div>

        {adding && (
          <div className="mb-6">
            <div className="text-[11px] text-neutral-500 mb-1">
              paste deck JSON — <code className="text-neutral-400">{DECK_FORMAT_HINT}</code>{" "}
              — or a full backup to restore everything
            </div>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              spellCheck={false}
              className="w-full rounded-lg bg-neutral-900 border border-neutral-800 p-3 text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-600"
              placeholder={DECK_FORMAT_HINT}
            />
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => {
                  const res = onImportDeck(draft);
                  if (res) setError(res);
                  else {
                    setDraft("");
                    setAdding(false);
                    setError("");
                  }
                }}
                className="px-4 py-1.5 rounded-lg bg-neutral-100 text-neutral-950 text-sm"
              >
                import
              </button>
              {error && <span className="text-red-400 text-xs">{error}</span>}
            </div>
          </div>
        )}

        {/* headline numbers */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center">
          {[
            [deck.reviews, "reviews"],
            [deck.today, "today"],
            [streakOf(deck), "day streak"],
            [`${settled}`, "settled"],
          ].map(([v, label]) => (
            <div key={label} className="rounded-lg bg-neutral-900 border border-neutral-800 py-3">
              <div className="text-xl tabular-nums">{v}</div>
              <div className="text-[10px] text-neutral-500">{label}</div>
            </div>
          ))}
        </div>

        {/* daily chart */}
        <div className="mb-6">
          <div className="text-[11px] text-neutral-600 mb-2">last 30 days</div>
          <DailyChart deck={deck} />
        </div>

        {/* status breakdown */}
        <div className="mb-6">
          <div className="text-[11px] text-neutral-600 mb-2">cards</div>
          <div className="flex h-2 rounded-full overflow-hidden bg-neutral-900 mb-2">
            {counts.settled > 0 && (
              <div className="bg-emerald-500/70" style={{ flex: counts.settled }} />
            )}
            {counts.fresh > 0 && (
              <div className="bg-sky-500/70" style={{ flex: counts.fresh }} />
            )}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
            <span><span className="text-emerald-400">●</span> settled {counts.settled}</span>
            <span><span className="text-sky-400">●</span> fresh {counts.fresh}</span>
            <span className="text-red-400/80">dropped {dropped}</span>
            <span className="text-neutral-700">unseen {unseen}</span>
          </div>
        </div>

        {/* per-card map */}
        <div className="mb-6">
          <div className="text-[11px] text-neutral-600 mb-2">
            rotation, fresh first (number = times seen)
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sortedRot.map(([f]) => {
              const c = card(deck, f);
              return (
                <span
                  key={f}
                  lang="zh-Hans"
                  title={`seen ${c.n}×`}
                  className={`px-1.5 py-0.5 rounded border bg-neutral-900 text-sm ${
                    STATUS_STYLE[statusOf(deck, f)]
                  }`}
                  style={{ fontFamily: deck.data ? undefined : HANZI_FONT }}
                >
                  {f.length > 12 ? f.slice(0, 12) + "…" : f}
                  <span className="text-[9px] text-neutral-600 ml-1">
                    {c.n === 0 ? "new" : `×${c.n}`}
                  </span>
                </span>
              );
            })}
          </div>
        </div>

        {/* algorithm */}
        <div className="text-[11px] text-neutral-600 mb-2">algorithm</div>
        <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 text-xs text-neutral-400 leading-relaxed space-y-2 mb-6">
          <p>
            Cards enter reviews only when you tap them in the grid. A freshly
            added (or re-added) card is guaranteed {BOOST_SHOWINGS} appearances,
            scheduled at random points within its next {BOOST_WINDOW} reviews;
            after that it joins the base rate — every card in rotation equally
            likely, drawn at random (the last {NO_REPEAT_WINDOW} shown are
            excluded).
          </p>
          <p>
            <span className="text-emerald-400">right</span> keeps a card in
            rotation · <span className="text-red-400">wrong</span> sends it
            straight back to the grid.
          </p>
          {queued.length > 0 && (
            <p className="text-neutral-500">
              scheduled soon:{" "}
              {queued.map(([f]) => (
                <span key={f} className="mr-2 text-neutral-300" lang="zh-Hans">
                  {f.length > 8 ? f.slice(0, 8) + "…" : f}
                  <span className="text-neutral-600">
                    {" "}
                    ×{(card(deck, f).due || []).length}
                  </span>
                </span>
              ))}
            </p>
          )}
        </div>

        {/* sync + backup */}
        <div className="text-[11px] text-neutral-600 mb-2">sync</div>
        <div className="rounded-lg bg-neutral-900 border border-neutral-800 p-4 text-xs space-y-3">
          <div className={syncClass}>{syncText}</div>
          {sync === "error" && syncMsg && (
            <div className="text-neutral-500">server says: {syncMsg}</div>
          )}
          <div className="flex gap-2 items-center flex-wrap">
            <input
              type="password"
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              placeholder="sync key"
              autoComplete="off"
              className="rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-1.5 text-neutral-200 focus:outline-none focus:border-neutral-600 w-48"
            />
            <button
              onClick={() => {
                onSaveSyncKey(keyDraft.trim());
                setKeyFlash("key saved — retrying sync…");
                setTimeout(() => setKeyFlash(""), 3000);
              }}
              className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:border-neutral-500"
            >
              save key
            </button>
            {keyFlash && <span className="text-neutral-400">{keyFlash}</span>}
            <button
              onClick={onRetrySync}
              className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:border-neutral-500"
            >
              retry sync
            </button>
            <button
              onClick={copyBackup}
              className="px-3 py-1.5 rounded-lg border border-neutral-700 text-neutral-300 hover:border-neutral-500"
            >
              copy backup
            </button>
            {copied && <span className="text-neutral-500">{copied}</span>}
          </div>
          <div className="text-neutral-700">
            build {(process.env.NEXT_PUBLIC_COMMIT || "dev").slice(0, 7)} ·{" "}
            {typeof navigator !== "undefined" && navigator.standalone
              ? "home-screen app"
              : "browser"}{" "}
            · {typeof window !== "undefined" ? window.location.origin : ""}
          </div>
        </div>
      </div>
    </main>
  );
}

function GridView({ deck, onPromote, onClose }) {
  const data = deckData(deck);
  const hard = [];
  const unseen = [];
  data.forEach(([f, h, b], i) => {
    const c = card(deck, f);
    if (c.a) return; // in rotation
    if (c.n === 0) unseen.push({ f, h, b, i });
    else hard.push({ f, h, b, n: c.n, i }); // dropped out of rotation
  });
  hard.sort((a, b) => b.n - a.n || a.i - b.i);

  const cell = (item, isHard) => (
    <button
      key={item.f}
      onClick={() => onPromote(item.f)}
      className={`rounded-lg bg-neutral-900 border p-2 pb-1.5 flex flex-col items-center gap-0.5 text-center active:bg-neutral-800 hover:border-neutral-500 ${
        isHard ? "border-red-900/70" : "border-neutral-800"
      }`}
      title="add to reviews"
    >
      <span
        lang="zh-Hans"
        className={`leading-tight break-words max-w-full ${
          item.f.length <= 2 ? "text-3xl" : "text-base"
        }`}
        style={{ fontFamily: deck.data ? undefined : HANZI_FONT }}
      >
        {item.f}
      </span>
      {item.h && <span className="text-amber-200/90 text-xs">{item.h}</span>}
      <span className="text-neutral-500 text-[10px] leading-tight line-clamp-2">
        {item.b}
      </span>
    </button>
  );

  return (
    <main className="min-h-dvh bg-neutral-950 text-neutral-100 flex flex-col">
      <div className="flex justify-between items-center px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-xs text-neutral-600 tabular-nums sticky top-0 bg-neutral-950 z-10">
        <span>
          {hard.length} hard · {unseen.length} unseen — tap a card to put it into reviews
        </span>
        <button onClick={onClose} className="text-neutral-400 hover:text-neutral-200">
          review (g)
        </button>
      </div>
      <div className="flex-1 px-4 pb-8">
        {hard.length > 0 && (
          <>
            <div className="text-[11px] text-red-400/70 mb-2 mt-1">hard</div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2 mb-6">
              {hard.map((item) => cell(item, true))}
            </div>
          </>
        )}
        <div className="text-[11px] text-neutral-600 mb-2 mt-1">unseen</div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(104px,1fr))] gap-2">
          {unseen.map((item) => cell(item, false))}
        </div>
      </div>
    </main>
  );
}

export default function HanziApp() {
  const [state, setState] = useState(null);
  const [char, setChar] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [view, setView] = useState("review"); // "review" | "grid" | "stats"
  const [sync, setSync] = useState(null); // null | "ok" | "auth" | "error"
  const [syncMsg, setSyncMsg] = useState(""); // server-provided detail for "error"
  const recentRef = useRef([]);
  const undoRef = useRef(null);
  const syncedRef = useRef(false);
  const swipeRef = useRef(null);
  const suppressClickRef = useRef(false);
  const versionRef = useRef(0);
  const stateRef = useRef(null);
  const lastPostOkRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  // every local mutation goes through commit so the sync effect can tell
  // whether the user moved on while a request was in flight
  const commit = useCallback((next) => {
    versionRef.current += 1;
    saveState(next);
    setState(next);
  }, []);

  // kill pull-to-refresh / rubber-band while the app is open
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.style.overscrollBehavior;
    html.style.overscrollBehavior = "none";
    return () => {
      html.style.overscrollBehavior = prev;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const local = loadState();
    setState(local);
    setChar(pickNext(local.decks[local.cur], []));

    // no `cache` fetch option: it can make WebKit reject the request outright
    // in installed home-screen apps; freshness comes from the ?t= buster and
    // the server's no-store headers
    fetch(`/api/hanzi?t=${Date.now()}`, { headers: syncHeaders() })
      .then((res) => {
        if (res.status === 401) {
          setSync("auth");
          return null;
        }
        if (!res.ok) {
          setSync("error");
          res
            .json()
            .then((b) => setSyncMsg(b?.error || `HTTP ${res.status}`))
            .catch(() => setSyncMsg(`HTTP ${res.status} (non-JSON response)`));
          return null;
        }
        setSync("ok");
        setSyncMsg("");
        return res.json();
      })
      .then((remoteRaw) => {
        if (cancelled || !remoteRaw) return;
        const remote = migrate(remoteRaw);
        if (!remote) return;
        const merged = mergeIntoLocal(local, remote);
        if (merged) {
          commit(merged);
          recentRef.current = [];
          setChar(pickNext(merged.decks[merged.cur], []));
          setRevealed(false);
        }
      })
      .catch((error) => {
        setSync("error");
        setSyncMsg(`network error: ${error?.message || "request failed"}`);
      })
      .finally(() => {
        syncedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [commit]);

  useEffect(() => {
    if (!state || !syncedRef.current) return;
    const version = versionRef.current;
    const timeout = setTimeout(() => {
      fetch("/api/hanzi", {
        method: "POST",
        headers: syncHeaders(),
        body: JSON.stringify(state),
      })
        .then(async (res) => {
          if (res.status === 401) {
            setSync("auth");
            return;
          }
          if (!res.ok) {
            setSync("error");
            res
              .json()
              .then((b) => setSyncMsg(b?.error || `HTTP ${res.status}`))
              .catch(() => setSyncMsg(`HTTP ${res.status} (non-JSON response)`));
            return;
          }
          setSync("ok");
          setSyncMsg("");
          lastPostOkRef.current = Date.now();
          const body = await res.json().catch(() => null);
          const merged = body?.state;
          // adopt the server's merge only if nothing changed locally meanwhile
          if (!merged || versionRef.current !== version) return;
          if (
            JSON.stringify(merged.decks) !== JSON.stringify(state.decks) ||
            JSON.stringify(merged.dead || []) !== JSON.stringify(state.dead || [])
          ) {
            const curChanged =
              JSON.stringify(merged.decks[state.cur]) !==
              JSON.stringify(state.decks[state.cur]);
            const next = normalize({ ...merged, cur: state.cur });
            commit(next);
            if (curChanged || !next.decks[state.cur]) {
              recentRef.current = [];
              setChar(pickNext(next.decks[next.cur], []));
              setRevealed(false);
            }
          }
        })
        .catch((error) => {
          setSync("error");
          setSyncMsg(`network error: ${error?.message || "request failed"}`);
        });
    }, 400);
    return () => clearTimeout(timeout);
  }, [state, commit]);

  // Re-sync when a dormant session wakes up: a resumed phone PWA or a
  // long-lived laptop tab would otherwise show stale data until reload, and
  // offline reviews would sit unpushed until the next grade. A single POST
  // covers both directions (it pushes local state and adopts the merge).
  useEffect(() => {
    const onWake = () => {
      if (document.visibilityState === "hidden") return;
      if (!syncedRef.current || !stateRef.current) return;
      if (Date.now() - lastPostOkRef.current < 60_000) return;
      setState((s) => (s ? { ...s } : s)); // touch state to run the sync effect
    };
    document.addEventListener("visibilitychange", onWake);
    window.addEventListener("focus", onWake);
    window.addEventListener("online", onWake);
    return () => {
      document.removeEventListener("visibilitychange", onWake);
      window.removeEventListener("focus", onWake);
      window.removeEventListener("online", onWake);
    };
  }, []);

  const grade = useCallback(
    (kind) => {
      if (!state || !char || !revealed) return;
      undoRef.current = {
        state: JSON.parse(JSON.stringify(state)),
        char,
        recent: [...recentRef.current],
      };

      const next = { ...state, decks: { ...state.decks } };
      const d = { ...next.decks[next.cur], cards: { ...next.decks[next.cur].cards } };
      const c = { ...card(d, char) };
      if (kind === "wrong") {
        // back to the grid
        delete c.a;
        delete c.due;
      } else if ((c.due || []).length) {
        // this appearance consumes the earliest scheduled slot
        const rest = c.due.slice(1);
        if (rest.length) c.due = rest;
        else delete c.due;
      }
      c.n += 1;
      d.cards[char] = c;
      // a tab left open across midnight must roll its daily counter
      if (d.day !== todayKey()) {
        d.day = todayKey();
        d.today = 0;
      }
      d.reviews += 1;
      d.today += 1;

      d.hist = {
        ...d.hist,
        [todayKey()]: { r: d.today, k: settledCount(d), n: rotation(d).length },
      };
      next.decks[next.cur] = d;

      recentRef.current = [...recentRef.current, char].slice(-10);
      commit(next);
      setChar(pickNext(d, recentRef.current));
      setRevealed(false);
    },
    [state, char, revealed, commit]
  );

  const undo = useCallback(() => {
    const u = undoRef.current;
    if (!u) return;
    undoRef.current = null;
    const restored = JSON.parse(JSON.stringify(u.state));
    // keep review counters monotonic — the server merge treats a lower count
    // as a stale device and would revert the undo otherwise
    for (const [id, d] of Object.entries(restored.decks)) {
      if (state?.decks[id]) {
        d.reviews = Math.max(d.reviews || 0, state.decks[id].reviews || 0);
      }
    }
    recentRef.current = u.recent;
    commit(restored);
    setChar(u.char);
    setRevealed(true);
  }, [state, commit]);

  // Grid click: pull a card into rotation and schedule its guaranteed
  // showings at random points within the next BOOST_WINDOW reviews.
  const promote = useCallback(
    (front) => {
      if (!state) return;
      const next = { ...state, decks: { ...state.decks } };
      const d = { ...next.decks[next.cur], cards: { ...next.decks[next.cur].cards } };
      const c = { ...card(d, front) };
      c.a = 1;
      const offsets = new Set();
      while (offsets.size < BOOST_SHOWINGS) {
        offsets.add(1 + Math.floor(Math.random() * BOOST_WINDOW));
      }
      c.due = [...offsets].map((o) => (d.reviews || 0) + o).sort((x, y) => x - y);
      d.cards[front] = c;
      next.decks[next.cur] = d;
      commit(next);
      // if reviews were empty, deal the first card now
      if (!char) setChar(pickNext(d, recentRef.current));
    },
    [state, char, commit]
  );

  const switchDeck = useCallback(
    (id) => {
      if (!state || !state.decks[id]) return;
      const next = { ...state, cur: id };
      recentRef.current = [];
      undoRef.current = null;
      commit(next);
      setChar(pickNext(next.decks[id], []));
      setRevealed(false);
    },
    [state, commit]
  );

  const cycleDeck = useCallback(() => {
    if (!state) return;
    const ids = Object.keys(state.decks);
    if (ids.length < 2) return;
    switchDeck(ids[(ids.indexOf(state.cur) + 1) % ids.length]);
  }, [state, switchDeck]);

  const importDeck = useCallback(
    (text) => {
      if (!state) return "no state";
      const res = parseDeckJson(text);
      if (res.error) return res.error;
      if (res.backup) {
        if (!window.confirm("Replace ALL decks and progress with this backup?"))
          return "cancelled";
        const restored = normalize(res.backup);
        // bump generations so the restore beats whatever the server holds
        for (const d of Object.values(restored.decks)) d.gen = (d.gen || 0) + 1;
        recentRef.current = [];
        undoRef.current = null;
        commit(restored);
        setChar(pickNext(restored.decks[restored.cur], []));
        setRevealed(false);
        return null;
      }
      const id = "d" + Date.now().toString(36);
      const next = { ...state, cur: id, decks: { ...state.decks, [id]: res.deck } };
      recentRef.current = [];
      undoRef.current = null;
      commit(next);
      setChar(pickNext(res.deck, []));
      setRevealed(false);
      return null;
    },
    [state, commit]
  );

  const deleteDeck = useCallback(
    (id) => {
      if (!state || id === "hanzi" || !state.decks[id]) return;
      if (!window.confirm(`Delete deck "${state.decks[id].name}"?`)) return;
      const decks = { ...state.decks };
      delete decks[id];
      const next = {
        ...state,
        decks,
        dead: [...(state.dead || []), id].slice(-200),
        cur: state.cur === id ? "hanzi" : state.cur,
      };
      recentRef.current = [];
      undoRef.current = null;
      commit(next);
      setChar(pickNext(next.decks[next.cur], []));
      setRevealed(false);
    },
    [state, commit]
  );

  const saveSyncKey = useCallback(
    (key) => {
      const clean = cleanSyncKey(key);
      try {
        if (clean) localStorage.setItem(SYNC_KEY_STORE, clean);
        else localStorage.removeItem(SYNC_KEY_STORE);
      } catch {}
      // show "checking" until the retry resolves, then retry with the new key
      setSync(null);
      if (state) commit({ ...state });
    },
    [state, commit]
  );

  const retrySync = useCallback(() => {
    setSync(null);
    lastPostOkRef.current = 0;
    if (state) commit({ ...state });
  }, [state, commit]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.repeat) return;
      const tag = e.target?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "g") {
        setView((v) => (v === "grid" ? "review" : "grid"));
        return;
      }
      if (e.key === "s") {
        setView((v) => (v === "stats" ? "review" : "stats"));
        return;
      }
      if (view !== "review") {
        if (e.key === "Escape") setView("review");
        return;
      }
      if (e.key === " " || e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        setRevealed((r) => (r ? r : true));
      } else if (e.key === "1" || e.code === "Digit1" || e.key === "ArrowLeft") {
        grade("wrong");
      } else if (e.key === "2" || e.code === "Digit2" || e.key === "ArrowRight") {
        grade("right");
      } else if (e.key === "z" || e.key === "u") {
        undo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [grade, undo, view]);

  const reset = () => {
    if (!state) return;
    const deck = state.decks[state.cur];
    if (!window.confirm(`Reset all progress for "${deck.name}"?`)) return;
    const next = {
      ...state,
      decks: {
        ...state.decks,
        [state.cur]: freshDeck({
          name: deck.name,
          data: deck.data,
          gen: (deck.gen || 0) + 1,
          day: todayKey(),
          pool: Math.min(START_POOL, deckData(deck).length),
        }),
      },
    };
    recentRef.current = [];
    undoRef.current = null;
    commit(next);
    setChar(pickNext(next.decks[next.cur], []));
    setRevealed(false);
  };

  if (!state) {
    return <main className="min-h-dvh bg-neutral-950" />;
  }

  const deck = state.decks[state.cur];

  if (view === "stats") {
    return (
      <StatsView
        state={state}
        recent={recentRef.current}
        sync={sync}
        syncMsg={syncMsg}
        onSwitchDeck={switchDeck}
        onImportDeck={importDeck}
        onDeleteDeck={deleteDeck}
        onSaveSyncKey={saveSyncKey}
        onRetrySync={retrySync}
        onClose={() => setView("review")}
      />
    );
  }

  if (view === "grid") {
    return <GridView deck={deck} onPromote={promote} onClose={() => setView("review")} />;
  }

  const entry = char
    ? deckData(deck).find(([f]) => f === char) || [char, "", ""]
    : null;
  const [, hint, back] = entry || ["", "", ""];
  const isHanzi = !deck.data;

  // swipe-to-grade: ← wrong, → right (pointer events cover touch + mouse)
  const onCardPointerDown = (e) => {
    swipeRef.current = { x: e.clientX, y: e.clientY };
  };
  const onCardPointerUp = (e) => {
    const s0 = swipeRef.current;
    swipeRef.current = null;
    if (!s0 || !revealed) return;
    const dx = e.clientX - s0.x;
    const dy = e.clientY - s0.y;
    if (Math.abs(dx) > 60 && Math.abs(dx) > 1.3 * Math.abs(dy)) {
      suppressClickRef.current = true;
      grade(dx < 0 ? "wrong" : "right");
    }
  };
  const onCardClick = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setRevealed(true);
  };

  return (
    <main
      className="min-h-dvh bg-neutral-950 text-neutral-100 flex flex-col select-none"
      style={{ WebkitTouchCallout: "none", touchAction: "manipulation" }}
    >
      <div className="flex justify-between items-center px-4 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] text-xs text-neutral-600 tabular-nums">
        <button
          onClick={cycleDeck}
          className="hover:text-neutral-400"
          title="switch deck"
        >
          {deck.name} · {rotation(deck).length} / {deckData(deck).length}
        </button>
        <div className="flex gap-4 items-center">
          {(sync === "auth" || sync === "error") && (
            <button
              onClick={() => setView("stats")}
              className="text-amber-400/90 hover:text-amber-300"
              title="sync problem — open stats"
            >
              ⚠ sync
            </button>
          )}
          <span>{deck.today} today</span>
          <button
            onClick={() => setView("grid")}
            className="text-neutral-400 hover:text-neutral-200"
          >
            grid (g)
          </button>
          <button
            onClick={() => setView("stats")}
            className="text-neutral-400 hover:text-neutral-200"
          >
            stats (s)
          </button>
        </div>
      </div>

      {!char ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <div className="text-neutral-500 text-sm">nothing in rotation</div>
          <button
            onClick={() => setView("grid")}
            className="px-5 py-3 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-200 active:bg-neutral-800"
          >
            open the grid and tap cards to learn
          </button>
        </div>
      ) : (
      <div
        className="flex-1 flex items-center justify-center px-6 py-2"
        style={{ touchAction: "none" }}
        onClick={onCardClick}
        onPointerDown={onCardPointerDown}
        onPointerUp={onCardPointerUp}
      >
        <div
          key={char}
          className="w-[min(88vw,400px)] h-[min(58dvh,520px)] cursor-pointer"
          style={{ perspective: "1400px" }}
        >
          <div
            className="relative w-full h-full transition-transform duration-300"
            style={{
              transformStyle: "preserve-3d",
              transform: revealed ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            <div
              className="absolute inset-0 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center px-4"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div
                lang={isHanzi ? "zh-Hans" : undefined}
                className="leading-tight text-center break-words max-w-full"
                style={{
                  fontSize: frontFontSize(char),
                  fontFamily: isHanzi ? HANZI_FONT : undefined,
                }}
              >
                {char}
              </div>
              <div className="absolute bottom-5 text-neutral-700 text-xs">
                tap / space
              </div>
            </div>

            <div
              className="absolute inset-0 rounded-2xl bg-neutral-900 border border-neutral-800 flex flex-col items-center justify-center gap-5 px-6 text-center"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div
                lang={isHanzi ? "zh-Hans" : undefined}
                className={`leading-tight break-words max-w-full ${
                  char.length <= 4 ? "text-6xl sm:text-7xl" : "text-2xl"
                }`}
                style={{ fontFamily: isHanzi ? HANZI_FONT : undefined }}
              >
                {char}
              </div>
              {hint && (
                <div className="text-3xl sm:text-4xl text-amber-200">{hint}</div>
              )}
              <div className="text-base sm:text-lg text-neutral-400 max-w-md">
                {back}
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      <div className="p-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {revealed ? (
          <div className="flex gap-3 max-w-lg mx-auto">
            <button
              onClick={() => grade("wrong")}
              className="flex-1 py-4 rounded-xl bg-neutral-900 text-red-400/90 text-lg font-medium active:bg-neutral-800"
            >
              wrong
            </button>
            <button
              onClick={() => grade("right")}
              className="flex-1 py-4 rounded-xl bg-neutral-900 text-emerald-400/90 text-lg font-medium active:bg-neutral-800"
            >
              right
            </button>
          </div>
        ) : (
          <div className="h-[60px]" />
        )}
        <div className="flex justify-center flex-wrap gap-x-5 gap-y-1 mt-3 text-[11px] text-neutral-800">
          <span className="sm:hidden">swipe ← wrong · → right</span>
          <span className="hidden sm:inline">1 / ← wrong</span>
          <span className="hidden sm:inline">2 / → right</span>
          <button onClick={undo} className="hover:text-neutral-500">
            undo<span className="hidden sm:inline"> (z)</span>
          </button>
          <span className="hidden sm:inline">g grid</span>
          <span className="hidden sm:inline">s stats</span>
          <button onClick={reset} className="hover:text-neutral-500">
            reset
          </button>
        </div>
      </div>
    </main>
  );
}
