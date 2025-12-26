"use client";

export default function ModeRail({
  modes,
  activeModeId,
  onModeChange,
  dbReady,
}) {
  return (
    <aside className="w-24 shrink-0">
      <div className="sticky top-8 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-gray-500">
          Modes
        </p>
        <div className="space-y-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
              className={`flex h-12 w-full items-center justify-center rounded-xl border text-xs uppercase tracking-[0.2em] ${
                activeModeId === mode.id
                  ? "border-white bg-white text-black"
                  : "border-gray-800 text-gray-400 hover:border-gray-600"
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4 text-xs text-gray-500">
        <p className="uppercase tracking-[0.2em] text-gray-600">Status</p>
        <p className="mt-2">db ready: {dbReady ? "yes" : "no"}</p>
      </div>
      </div>
    </aside>
  );
}
