"use client";

const formatMinutes = (totalMinutes) => {
  const hours24 = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const period = hours24 >= 12 ? "PM" : "AM";
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, "0")} ${period}`;
};

export default function DayPlan({
  activeModeName,
  timelineHours,
  timelineHeight,
  minuteHeight,
  hourModes,
  modes,
  onHourModeChange,
  modeWindows,
  plannedBlocks,
  selectedTaskId,
  onSelectTask,
  currentMinutes,
  scrollRef,
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Day Plan</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-gray-500">
          Default: {activeModeName || "Personal"}
        </span>
      </div>
      <div ref={scrollRef} className="mt-4 max-h-[520px] overflow-y-auto pr-2">
        <div className="flex gap-4">
          <div className="relative w-16 shrink-0" style={{ height: timelineHeight }}>
            {timelineHours.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="absolute left-0 text-[10px] uppercase tracking-[0.2em] text-gray-500"
                style={{ top: index * 60 * minuteHeight - 6 }}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="relative w-8 shrink-0" style={{ height: timelineHeight }}>
            {hourModes.map((modeId, index) => {
              const mode = modes.find((item) => item.id === modeId);
              return (
                <button
                  key={`mode-${index}`}
                  type="button"
                  onClick={() => onHourModeChange(index)}
                  className={`absolute left-0 right-0 rounded-md border border-gray-900 ${
                    mode ? mode.color : "bg-gray-800"
                  }`}
                  style={{
                    top: index * 60 * minuteHeight,
                    height: 60 * minuteHeight - 2,
                  }}
                  aria-label={`Set hour ${index} to ${activeModeName || "mode"}`}
                />
              );
            })}
          </div>
          <div
            className="relative flex-1 rounded-2xl border border-gray-800 bg-black"
            style={{ height: timelineHeight }}
          >
            {modeWindows.map((window) => (
              <div
                key={window.id}
                className={`absolute left-0 right-0 opacity-15 ${window.color}`}
                style={{
                  top: window.startMinutes * minuteHeight,
                  height: (window.endMinutes - window.startMinutes) * minuteHeight,
                }}
              />
            ))}
            {timelineHours.slice(0, 24).map((_, index) => (
              <div
                key={`grid-${index}`}
                className="absolute left-0 right-0 border-t border-gray-900"
                style={{ top: index * 60 * minuteHeight }}
              />
            ))}
            {plannedBlocks.map((block) => (
              <div
                key={block.id}
                onClick={() => onSelectTask(block.taskId)}
                className={`absolute left-4 right-4 rounded-xl border p-3 text-xs ${
                  selectedTaskId === block.taskId
                    ? "border-white bg-gray-100 text-black"
                    : "border-gray-700 bg-gray-900/80 text-white"
                }`}
                style={{
                  top: block.startMinutes * minuteHeight,
                  height: (block.endMinutes - block.startMinutes) * minuteHeight,
                }}
              >
                <div
                  className={`absolute left-2 top-2 bottom-2 w-1 rounded-full ${
                    modes.find((mode) => mode.name === block.mode)?.color ||
                    "bg-gray-600"
                  }`}
                />
                <div className="ml-4 flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold">{block.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em]">
                    {formatMinutes(block.startMinutes)} -{" "}
                    {formatMinutes(block.endMinutes)}
                  </p>
                </div>
              </div>
            ))}
            <div
              className="absolute left-0 right-0 z-10 flex items-center gap-2"
              style={{ top: currentMinutes * minuteHeight }}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <div className="h-px flex-1 bg-emerald-400/70" />
              <span className="text-[11px] text-emerald-300">now</span>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-dashed border-gray-700 p-3 text-xs text-gray-500">
              Drag to define mode ranges. Tasks will slot into matching blocks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
