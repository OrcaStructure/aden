"use client";

export default function PlannerHeader({ todayLabel, saveStatus }) {
  const statusCopy = {
    idle: "Idle",
    saving: "Saving...",
    saved: "Saved",
    offline: "Offline",
  };

  const statusTone = {
    idle: "border-gray-800 text-gray-500",
    saving: "border-amber-500/50 text-amber-200",
    saved: "border-emerald-500/50 text-emerald-200",
    offline: "border-red-500/50 text-red-200",
  };

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
          Firebase Planner
        </p>
        <h1 className="text-3xl font-semibold">Daily Plan</h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-gray-400">
            Auto-plan will honor the active mode windows.
          </p>
          <span
            className={`inline-flex min-w-[110px] justify-center rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
              statusTone[saveStatus] || statusTone.idle
            }`}
          >
            {statusCopy[saveStatus] || statusCopy.idle}
          </span>
        </div>
      </div>
      <div className="rounded-xl border border-gray-800 bg-black px-5 py-4">
        <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
          Today
        </p>
        <p className="text-xl font-semibold">
          {todayLabel || "Loading date..."}
        </p>
      </div>
    </header>
  );
}
