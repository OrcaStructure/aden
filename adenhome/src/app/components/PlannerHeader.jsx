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
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#2A261E] bg-[#14130F] px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#9E957F]">
          Today
        </span>
        <span className="text-sm font-semibold">
          {todayLabel || "Loading date..."}
        </span>
      </div>
      <span
        className={`inline-flex min-w-[96px] justify-center rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] ${
          statusTone[saveStatus] || statusTone.idle
        }`}
      >
        {statusCopy[saveStatus] || statusCopy.idle}
      </span>
    </header>
  );
}
