"use client";

import { useEffect } from "react";

const logGaps = (label, items) => {
  if (!items.length) {
    return;
  }
  const sorted = [...items].sort((a, b) => a.displayStart - b.displayStart);
  const gaps = [];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const gap = next.displayStart - current.displayEnd;
    if (gap > 0) {
      gaps.push({
        gapMinutes: gap,
        current: {
          id: current.id,
          title: current.title,
          start: current.startMinutes,
          end: current.endMinutes,
          displayStart: current.displayStart,
          displayEnd: current.displayEnd,
        },
        next: {
          id: next.id,
          title: next.title,
          start: next.startMinutes,
          end: next.endMinutes,
          displayStart: next.displayStart,
          displayEnd: next.displayEnd,
        },
      });
    }
  }
  if (gaps.length) {
    console.log(`[Planner] ${label} gaps`, gaps);
  }
};

const getRadiusClass = (height) => {
  if (height < 12) {
    return "rounded-[4px]";
  }
  if (height < 20) {
    return "rounded-md";
  }
  return "rounded-xl";
};

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
  currentDisplayMinutes,
  currentTopPx,
  scrollRef,
  fillHeight = false,
}) {
  useEffect(() => {
    console.log("[Planner] DayPlan render tick", {
      calendarCount: calendarEvents.length,
      plannedCount: plannedBlocks.length,
    });
    logGaps("calendarEvents", calendarEvents);
  }, [calendarEvents]);

  useEffect(() => {
    logGaps("plannedBlocks", plannedBlocks);
  }, [plannedBlocks]);
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
            {timelineHours.map((hour, index) => (
              <div
                key={`${hour.label}-${index}`}
                className="absolute left-0 text-[10px] uppercase tracking-[0.2em] text-[#9E957F]"
                style={{ top: index * 60 * minuteHeight - 6 }}
              >
                {hour.label}
              </div>
            ))}
          </div>
          <div className="relative w-6 shrink-0" style={{ height: timelineHeight }}>
            {timelineHours.slice(0, 24).map((hour, index) => {
              const modeId = hourModes[hour.storageIndex];
              const mode = modes.find((item) => item.id === modeId);
              return (
                <button
                  key={`mode-${hour.storageIndex}`}
                  type="button"
                  onClick={() => onHourModeChange(hour.storageIndex)}
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
            {modeWindows.map((window) => {
              return (
              <div
                key={window.id}
                className={`absolute left-0 right-0 opacity-25 ${window.color}`}
                style={{
                  top: window.topPx,
                  height: window.heightPx,
                }}
              />
              );
            })}
            <div
              className="absolute inset-0 grid"
              style={{
                gridAutoRows: `${minuteHeight}px`,
                gridTemplateColumns: "1fr",
              }}
            >
              {calendarEvents.map((event) => {
                const height = event.heightPx;
                const isSelected = selectedEventId === event.id;
                const minTextHeight = 32;
                const showText = isSelected || height >= minTextHeight;
                const displayHeight = isSelected
                  ? Math.max(height, minTextHeight)
                  : height;
                const isExpanded = isSelected && displayHeight > height;
                const radiusClass = getRadiusClass(height);
                const expandedRadiusClass = getRadiusClass(displayHeight);
                const rowStart = event.displayStart + 1;
                const rowEnd = event.displayEnd + 1;
                return (
                  <div
                    key={event.id}
                    onClick={() => onSelectEvent?.(event.id)}
                    className={`mx-3 border text-xs box-border ${radiusClass} ${
                      isSelected ? "z-30" : "z-10"
                    } ${isExpanded ? "border-transparent bg-transparent" : "border-[#2B3A4B] bg-[#18212B]/90"} relative overflow-visible`}
                    style={{
                      gridRow: `${rowStart} / ${rowEnd}`,
                    }}
                  >
                    {isExpanded && (
                      <div
                        className={`absolute inset-x-0 top-0 border border-[#2B3A4B] bg-[#18212B]/90 px-2 py-1 text-xs text-[#C8D4E3] pointer-events-none box-border ${expandedRadiusClass}`}
                        style={{ height: displayHeight }}
                      >
                        <div className="flex items-baseline justify-between gap-3 leading-tight">
                          <p className="text-sm font-semibold">{event.title}</p>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#9FB4D6]">
                            {formatMinutes(event.startMinutes)} -{" "}
                            {formatMinutes(event.endMinutes)}
                          </p>
                        </div>
                      </div>
                    )}
                    {!isExpanded && showText && (
                      <div className="px-2 py-1 text-[#C8D4E3]">
                        <div className="flex items-baseline justify-between gap-3 leading-tight">
                          <p className="text-sm font-semibold">{event.title}</p>
                          <p className="text-[11px] uppercase tracking-[0.2em] text-[#9FB4D6]">
                            {formatMinutes(event.startMinutes)} -{" "}
                            {formatMinutes(event.endMinutes)}
                          </p>
                        </div>
                      </div>
                    )}
                    {!showText && <div className="h-full" />}
                  </div>
                );
              })}
            </div>
            {timelineHours.slice(0, 24).map((_, index) => (
              <div
                key={`grid-${index}`}
                className="absolute left-0 right-0 border-t border-[#1A1712]"
                style={{ top: index * 60 * minuteHeight }}
              />
            ))}
            <div
              className="absolute inset-0 grid"
              style={{
                gridAutoRows: `${minuteHeight}px`,
                gridTemplateColumns: "1fr",
              }}
            >
              {plannedBlocks.map((block) => {
                const height = block.heightPx;
                const isSelected = selectedTaskId === block.taskId;
                const minTextHeight = 32;
                const showText = isSelected || height >= minTextHeight;
                const displayHeight = isSelected
                  ? Math.max(height, minTextHeight)
                  : height;
                const isExpanded = isSelected && displayHeight > height;
                const radiusClass = getRadiusClass(height);
                const expandedRadiusClass = getRadiusClass(displayHeight);
                const modeColor =
                  modes.find((mode) => mode.name === block.mode)?.color ||
                  "bg-[#6C6352]";
                const baseClasses = isSelected
                  ? "border-[#E4A949] bg-[#E4A949] text-[#1A140C]"
                  : "border-[#3A3428] bg-[#1C1B14]/80 text-[#F7F3E8]";
                const zClass = isSelected ? "z-30" : "z-20";
                const rowStart = block.displayStart + 1;
                const rowEnd = block.displayEnd + 1;
                return (
                  <div
                    key={block.id}
                    onClick={() => onSelectTask(block.taskId)}
                    className={`mx-4 border text-xs box-border ${radiusClass} ${
                      isExpanded ? "border-transparent bg-transparent" : baseClasses
                    } ${zClass} relative overflow-visible`}
                    style={{
                      gridRow: `${rowStart} / ${rowEnd}`,
                    }}
                  >
                    {isExpanded && (
                      <div
                        className={`absolute inset-x-0 top-0 border text-xs box-border ${expandedRadiusClass} ${
                          isSelected
                            ? "border-[#E4A949] bg-[#E4A949] text-[#1A140C]"
                            : "border-[#3A3428] bg-[#1C1B14]/80 text-[#F7F3E8]"
                        } pointer-events-none`}
                        style={{ height: displayHeight }}
                      >
                        <div
                          className={`absolute left-2 top-2 bottom-2 w-1 rounded-full ${modeColor}`}
                        />
                        <div className="ml-4 px-2 py-1">
                          <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 leading-tight">
                            <p className="min-w-0 truncate text-sm font-semibold">
                              {block.title}
                            </p>
                            <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em]">
                              {formatMinutes(block.startMinutes)} -{" "}
                              {formatMinutes(block.endMinutes)}
                            </p>
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  onMoveTask?.(block.taskId, "up");
                                }}
                                disabled={
                                  !moveAvailability?.get(block.taskId)?.canMoveUp
                                }
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${
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
                                disabled={
                                  !moveAvailability?.get(block.taskId)?.canMoveDown
                                }
                                className={`rounded-full border px-2 py-0.5 text-[11px] ${
                                  moveAvailability?.get(block.taskId)?.canMoveDown
                                    ? "border-[#3A3428] text-[#E1D9C7] hover:border-[#E4A949]"
                                    : "border-[#1A1712] text-[#6E6758] cursor-not-allowed"
                                }`}
                              >
                                ▼
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {!isExpanded && showText && (
                      <>
                        <div
                          className={`absolute left-2 top-2 bottom-2 w-1 rounded-full ${modeColor}`}
                        />
                        <div className="ml-4 grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 px-2 py-1 leading-tight">
                          <p className="min-w-0 truncate text-sm font-semibold">
                            {block.title}
                          </p>
                          <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.2em]">
                            {formatMinutes(block.startMinutes)} -{" "}
                            {formatMinutes(block.endMinutes)}
                          </p>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onMoveTask?.(block.taskId, "up");
                              }}
                              disabled={
                                !moveAvailability?.get(block.taskId)?.canMoveUp
                              }
                              className={`rounded-full border px-2 py-0.5 text-[11px] ${
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
                              disabled={
                                !moveAvailability?.get(block.taskId)?.canMoveDown
                              }
                              className={`rounded-full border px-2 py-0.5 text-[11px] ${
                                moveAvailability?.get(block.taskId)?.canMoveDown
                                  ? "border-[#3A3428] text-[#E1D9C7] hover:border-[#E4A949]"
                                  : "border-[#1A1712] text-[#6E6758] cursor-not-allowed"
                              }`}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    {!showText && <div className="h-full" />}
                  </div>
                );
              })}
            </div>
            <div
              className="absolute left-0 right-0 z-10 flex items-center gap-2"
              style={{
                top:
                  currentTopPx ??
                  (currentDisplayMinutes ?? currentMinutes) * minuteHeight,
              }}
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
