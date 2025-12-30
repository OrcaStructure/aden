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
  selectedEventId,
  onSelectEvent,
  plannedBlocks,
  selectedTaskId,
  onSelectTask,
  onMoveTask,
  moveAvailability,
  currentMinutes,
  scrollRef,
  fillHeight = false,
}) {
  const scrollClass = fillHeight
    ? "mt-4 flex-1 min-h-0 overflow-y-auto pr-2"
    : "mt-4 max-h-[520px] overflow-y-auto pr-2";

  return (
    <div
      className={`rounded-2xl border border-[#2A261E] bg-[#14130F] p-6 ${
        fillHeight ? "flex h-full min-h-0 flex-col" : ""
      }`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Day Plan</h2>
        <span className="text-xs uppercase tracking-[0.2em] text-[#9E957F]">
          Default: {activeModeName || "Personal"}
        </span>
      </div>
      <div
        ref={scrollRef}
        data-no-swipe
        className={`${scrollClass} overscroll-contain touch-pan-y`}
        style={{
          WebkitOverflowScrolling: "touch",
          height: fillHeight ? "100%" : undefined,
        }}
      >
        <div className="flex gap-3" style={{ minHeight: timelineHeight }}>
          <div className="relative w-12 shrink-0" style={{ height: timelineHeight }}>
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
          <div className="relative w-6 shrink-0" style={{ height: timelineHeight }}>
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
            style={{ height: timelineHeight, minHeight: timelineHeight }}
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
            {calendarEvents.map((event) => {
              const height = (event.endMinutes - event.startMinutes) * minuteHeight;
              const isSelected = selectedEventId === event.id;
              const showText = isSelected || height >= 40;
              const displayHeight = isSelected ? Math.max(height, 32) : height;
              return (
                <div
                  key={event.id}
                  onClick={() => onSelectEvent?.(event.id)}
                  className={`absolute left-3 right-3 rounded-xl border border-[#2B3A4B] bg-[#18212B]/90 text-xs text-[#C8D4E3] ${
                    isSelected ? "z-30" : "z-10"
                  } ${showText ? "px-2 py-1" : "p-1 overflow-hidden"}`}
                  style={{
                    top: event.startMinutes * minuteHeight,
                    height: displayHeight,
                  }}
                >
                  {showText && (
                    <div className="flex items-baseline justify-between gap-3">
                      <p className="text-sm font-semibold">{event.title}</p>
                      <p className="text-[11px] uppercase tracking-[0.2em] text-[#9FB4D6]">
                        {formatMinutes(event.startMinutes)} -{" "}
                        {formatMinutes(event.endMinutes)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {timelineHours.slice(0, 24).map((_, index) => (
              <div
                key={`grid-${index}`}
                className="absolute left-0 right-0 border-t border-[#1A1712]"
                style={{ top: index * 60 * minuteHeight }}
              />
            ))}
            {plannedBlocks.map((block) => {
              const height = (block.endMinutes - block.startMinutes) * minuteHeight;
              const isSelected = selectedTaskId === block.taskId;
              const showText = isSelected || height >= 44;
              const displayHeight = isSelected ? Math.max(height, 32) : height;
              return (
                <div
                  key={block.id}
                  onClick={() => onSelectTask(block.taskId)}
                  className={`absolute left-4 right-4 rounded-xl border text-xs ${
                    isSelected
                      ? "border-[#E4A949] bg-[#E4A949] text-[#1A140C] z-30"
                      : "border-[#3A3428] bg-[#1C1B14]/80 text-[#F7F3E8] z-20"
                  } ${showText ? "px-2 py-1" : "p-1 overflow-hidden"}`}
                  style={{
                    top: block.startMinutes * minuteHeight,
                    height: displayHeight,
                  }}
                >
                <div
                  className={`absolute left-2 top-2 bottom-2 w-1 rounded-full ${
                    modes.find((mode) => mode.name === block.mode)?.color ||
                    "bg-[#6C6352]"
                  }`}
                />
                <div className="absolute right-2 top-2 flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveTask?.(block.taskId, "up");
                    }}
                    disabled={!moveAvailability?.get(block.taskId)?.canMoveUp}
                    className={`h-6 w-6 rounded-full border text-[10px] ${
                      moveAvailability?.get(block.taskId)?.canMoveUp
                        ? "border-[#3A3428] text-[#E1D9C7] hover:border-[#E4A949]"
                        : "border-[#1A1712] text-[#6E6758] cursor-not-allowed"
                    }`}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onMoveTask?.(block.taskId, "down");
                    }}
                    disabled={!moveAvailability?.get(block.taskId)?.canMoveDown}
                    className={`h-6 w-6 rounded-full border text-[10px] ${
                      moveAvailability?.get(block.taskId)?.canMoveDown
                        ? "border-[#3A3428] text-[#E1D9C7] hover:border-[#E4A949]"
                        : "border-[#1A1712] text-[#6E6758] cursor-not-allowed"
                    }`}
                  >
                    ▼
                  </button>
                </div>
                {showText && (
                  <div className="ml-4 flex items-baseline justify-between gap-3">
                    <p className="text-sm font-semibold">{block.title}</p>
                    <p className="text-[11px] uppercase tracking-[0.2em]">
                      {formatMinutes(block.startMinutes)} -{" "}
                      {formatMinutes(block.endMinutes)}
                    </p>
                  </div>
                )}
              </div>
              );
            })}
            <div
              className="absolute left-0 right-0 z-10 flex items-center gap-2"
              style={{ top: currentMinutes * minuteHeight }}
            >
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
              <div className="h-px flex-1 bg-emerald-400/70" />
              <span className="text-[11px] text-emerald-300">now</span>
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
