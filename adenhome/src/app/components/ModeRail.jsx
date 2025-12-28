"use client";

export default function ModeRail({
  modes,
  activeModeId,
  onModeChange,
  dbReady,
  onModeNameChange,
  onAddMode,
  onRemoveMode,
  layout = "sidebar",
}) {
  const wrapperClass =
    layout === "panel" ? "w-full" : "w-24 shrink-0";
  const stickyClass = layout === "panel" ? "" : "sticky top-8";

  return (
    <aside className={wrapperClass}>
      <div className={`${stickyClass} space-y-6`}>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-[#9E957F]">
          Modes
        </p>
        <div className="space-y-3">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`rounded-xl border px-2 py-2 ${
                activeModeId === mode.id
                  ? "border-[#E4A949] bg-[#201A10]"
                  : "border-[#2E2A22] bg-[#14130F]"
              }`}
            >
              <button
                type="button"
                onClick={() => onModeChange(mode.id)}
                className={`w-full rounded-lg px-2 py-2 text-[11px] uppercase tracking-[0.2em] ${
                  activeModeId === mode.id
                    ? "bg-[#E4A949] text-[#1A140C]"
                    : "text-[#BFB6A2] hover:bg-[#201A10]"
                }`}
              >
                {mode.name}
              </button>
              <input
                value={mode.name}
                onChange={(event) =>
                  onModeNameChange(mode.id, event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-[#2A261E] bg-[#10100C] px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[#E7E0D2] focus:border-[#E4A949] focus:outline-none"
                aria-label={`Rename ${mode.name}`}
              />
              {mode.name !== "Personal" && (
                <button
                  type="button"
                  onClick={() => onRemoveMode(mode.id)}
                  className="mt-2 w-full rounded-lg border border-[#4A2A2A] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#F2B3B3] hover:border-[#D97C7C]"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={onAddMode}
          className="w-full rounded-xl border border-dashed border-[#5A4B2A] px-2 py-2 text-[11px] uppercase tracking-[0.2em] text-[#F1D79A] hover:border-[#E4A949]"
        >
          Add mode
        </button>
      </div>
      <div className="rounded-2xl border border-[#2A261E] bg-[#14130F] p-4 text-xs text-[#9E957F]">
        <p className="uppercase tracking-[0.2em] text-[#7F7764]">Status</p>
        <p className="mt-2">db ready: {dbReady ? "yes" : "no"}</p>
      </div>
      </div>
    </aside>
  );
}
