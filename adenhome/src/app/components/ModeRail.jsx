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
        <p className="text-xs uppercase tracking-[0.3em] text-[#9E957F]">
          Modes
        </p>
        <div className="space-y-3">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => onModeChange(mode.id)}
              className={`flex h-12 w-full items-center justify-center rounded-xl border text-[11px] uppercase tracking-[0.2em] ${
                activeModeId === mode.id
                  ? "border-[#E4A949] bg-[#E4A949] text-[#1A140C]"
                  : "border-[#2E2A22] text-[#BFB6A2] hover:border-[#4A4236]"
              }`}
            >
              {mode.name}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-[#2A261E] bg-[#14130F] p-4 text-xs text-[#9E957F]">
        <p className="uppercase tracking-[0.2em] text-[#7F7764]">Status</p>
        <p className="mt-2">db ready: {dbReady ? "yes" : "no"}</p>
      </div>
      </div>
    </aside>
  );
}
