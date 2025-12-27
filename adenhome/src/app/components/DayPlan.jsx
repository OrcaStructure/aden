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
  calendarEvents,
  plannedBlocks,
  selectedTaskId,
  onSelectTask,
  currentMinutes,
  scrollRef,
}) {
  return (
    <div className="rounded-2xl border border-[#2A261E] bg-[#14130F] p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Day Plan</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-[#9E957F]">
          Default: {activeModeName || "Personal"}
        </span>
      </div>
      <div ref={scrollRef} className="mt-4 max-h-[520px] overflow-y-auto pr-2">
        <div className="flex gap-4">
          <div className="relative w-16 shrink-0" style={{ height: timelineHeight }}>
            {timelineHours.map((label, index) => (
              <div
                key={`${label}-${index}`}
                className="absolute left-0 text-[10px] uppercase tracking-[0.2em] text-[#9E957F]"
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
                  className={`absolute left-0 right-0 rounded-md border border-[#1A1712] ${
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
            className="relative flex-1 rounded-2xl border border-[#2A261E] bg-[#10100C]"
            style={{ height: timelineHeight }}
          >
            {modeWindows.map((window) => (
              <div
                key={window.id}
                className={`absolute left-0 right-0 opacity-25 ${window.color}`}
                style={{
                  top: window.startMinutes * minuteHeight,
                  height: (window.endMinutes - window.startMinutes) * minuteHeight,
                }}
              />
            ))}
            {calendarEvents.map((event) => (
              <div
                key={event.id}
                className="absolute left-3 right-3 rounded-xl border border-[#2B3A4B] bg-[#18212B]/90 p-3 text-xs text-[#C8D4E3]"
                style={{
                  top: event.startMinutes * minuteHeight,
                  height: (event.endMinutes - event.startMinutes) * minuteHeight,
                }}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#9FB4D6]">
                    {formatMinutes(event.startMinutes)} -{" "}
                    {formatMinutes(event.endMinutes)}
                  </p>
                </div>
              </div>
            ))}
            {timelineHours.slice(0, 24).map((_, index) => (
              <div
                key={`grid-${index}`}
                className="absolute left-0 right-0 border-t border-[#1A1712]"
                style={{ top: index * 60 * minuteHeight }}
              />
            ))}
            {plannedBlocks.map((block) => (
              <div
                key={block.id}
                onClick={() => onSelectTask(block.taskId)}
                className={`absolute left-4 right-4 rounded-xl border p-3 text-xs ${
                  selectedTaskId === block.taskId
                    ? "border-[#E4A949] bg-[#E4A949] text-[#1A140C]"
                    : "border-[#3A3428] bg-[#1C1B14]/80 text-[#F7F3E8]"
                }`}
                style={{
                  top: block.startMinutes * minuteHeight,
                  height: (block.endMinutes - block.startMinutes) * minuteHeight,
                }}
              >
                <div
                  className={`absolute left-2 top-2 bottom-2 w-1 rounded-full ${
                    modes.find((mode) => mode.name === block.mode)?.color ||
                    "bg-[#6C6352]"
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
              <div className="h-2 w-2 rounded-full bg-[#E4A949]" />
              <div className="h-px flex-1 bg-[#E4A949]/70" />
              <span className="text-[11px] text-[#F1D79A]">now</span>
            </div>
            <div className="absolute inset-x-4 bottom-4 rounded-xl border border-dashed border-[#3A3428] p-3 text-xs text-[#9E957F]">
              Drag to define mode ranges. Tasks will slot into matching blocks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
