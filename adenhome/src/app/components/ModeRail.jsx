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
        <p className="text-xs uppercase tracking-[0.3em] text-[#7FA5AE]">
          Modes
        </p>
        <div className="space-y-3">
          {modes.map((mode) => (
            <div
              key={mode.id}
              className={`rounded-xl border px-2 py-2 ${
                activeModeId === mode.id
                  ? "border-[#2CB8C8] bg-[#0F2630]"
                  : "border-[#2E2A22] bg-[#0B1B24]"
              }`}
            >
              <button
                type="button"
                onClick={() => onModeChange(mode.id)}
                className={`w-full rounded-lg px-2 py-2 text-[11px] uppercase tracking-[0.2em] ${
                  activeModeId === mode.id
                    ? "bg-[#2CB8C8] text-[#03161B]"
                    : "text-[#BFB6A2] hover:bg-[#0F2630]"
                }`}
              >
                {mode.name}
              </button>
              <input
                value={mode.name}
                onChange={(event) =>
                  onModeNameChange(mode.id, event.target.value)
                }
                className="mt-2 w-full rounded-lg border border-[#1B2C36] bg-[#08141C] px-2 py-1 text-[11px] uppercase tracking-[0.18em] text-[#D3EEF2] focus:border-[#2CB8C8] focus:outline-none"
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
          className="w-full rounded-xl border border-dashed border-[#1F3B46] px-2 py-2 text-[11px] uppercase tracking-[0.2em] text-[#6FE3E2] hover:border-[#2CB8C8]"
        >
          Add mode
        </button>
      </div>
      <div className="rounded-2xl border border-[#1B2C36] bg-[#0B1B24] p-4 text-xs text-[#7FA5AE]">
        <p className="uppercase tracking-[0.2em] text-[#7F7764]">Status</p>
        <p className="mt-2">db ready: {dbReady ? "yes" : "no"}</p>
      </div>
      </div>
    </aside>
  );
}
