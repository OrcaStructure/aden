"use client";

export default function PlannerHeader({ todayLabel }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-gray-950 p-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
          Firebase Planner
        </p>
        <h1 className="text-3xl font-semibold">Daily Plan</h1>
        <p className="text-gray-400">
          Auto-plan will honor the active mode windows.
        </p>
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
