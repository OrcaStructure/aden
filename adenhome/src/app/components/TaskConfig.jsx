"use client";

export default function TaskConfig({
  selectedTask,
  modes,
  onTaskUpdate,
  onDeadlineChange,
  deadlineTime,
  onTaskComplete,
  onMoveTask,
  canMoveUp,
  canMoveDown,
  layout = "sidebar",
}) {
  const wrapperClass =
    layout === "panel"
      ? "w-full"
      : "hidden w-[320px] shrink-0 xl:block";
  const containerClass =
    layout === "panel"
      ? "rounded-2xl border border-[#2A261E] bg-[#14130F] p-6"
      : "sticky top-8 rounded-2xl border border-[#2A261E] bg-[#14130F] p-6";

  return (
    <aside className={wrapperClass}>
      <div className={containerClass}>
        <h2 className="text-lg font-semibold">Task Config</h2>
        <p className="text-sm text-[#9E957F]">
          Configure the task you just added or selected.
        </p>
        <div className="mt-5 space-y-4">
          {selectedTask ? (
            <>
              <div className="rounded-xl border border-[#2A261E] bg-[#10100C] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#9E957F]">
                  Selected
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedTask.title}
                </p>
                <p className="text-xs text-[#9E957F]">
                  {selectedTask.duration} min · {selectedTask.mode}
                </p>
                {selectedTask.completed ? (
                  <span className="mt-3 inline-flex rounded-full bg-[#2F2A18] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#F1D79A]">
                    Completed
                  </span>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onTaskComplete(selectedTask.id)}
                      className="inline-flex rounded-full border border-[#5A4B2A] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#F1D79A] hover:border-[#E4A949]"
                    >
                      Mark complete
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTask(selectedTask.id, "up")}
                      disabled={!canMoveUp}
                      className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        canMoveUp
                          ? "border-[#3A3428] text-[#E1D9C7] hover:border-[#5A4B2A]"
                          : "border-[#1A1712] text-[#6E6758] cursor-not-allowed"
                      }`}
                    >
                      Move up
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTask(selectedTask.id, "down")}
                      disabled={!canMoveDown}
                      className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        canMoveDown
                          ? "border-[#3A3428] text-[#E1D9C7] hover:border-[#5A4B2A]"
                          : "border-[#1A1712] text-[#6E6758] cursor-not-allowed"
                      }`}
                    >
                      Move down
                    </button>
                  </div>
                )}
              </div>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <label
                    className="text-xs uppercase tracking-[0.2em] text-[#9E957F]"
                    htmlFor="task-duration"
                  >
                    Duration (min)
                  </label>
                  <input
                    id="task-duration"
                    type="number"
                    min="5"
                    step="5"
                    value={selectedTask.duration}
                    onChange={(event) =>
                      onTaskUpdate(selectedTask.id, {
                        duration: Number(event.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[#2A261E] bg-[#10100C] px-3 py-2 text-[16px] text-[#F7F3E8] focus:border-[#E4A949] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs uppercase tracking-[0.2em] text-[#9E957F]"
                    htmlFor="task-deadline"
                  >
                    Deadline
                  </label>
                  <input
                    id="task-deadline"
                    type="time"
                    value={deadlineTime}
                    onChange={(event) =>
                      onDeadlineChange(selectedTask.id, event.target.value)
                    }
                    className="w-full rounded-xl border border-[#2A261E] bg-[#10100C] px-3 py-2 text-[16px] text-[#F7F3E8] focus:border-[#E4A949] focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[#9E957F]">
                  Mode
                </label>
                <div className="flex flex-wrap gap-2">
                  {modes.map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() =>
                        onTaskUpdate(selectedTask.id, { mode: mode.name })
                      }
                      className={`rounded-full px-3 py-1 text-xs ${
                        selectedTask.mode === mode.name
                          ? "bg-[#E4A949] text-[#1A140C]"
                          : `${mode.color} text-white`
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-[#3A3428] p-4 text-xs text-[#9E957F]">
                Duration, priority, and constraints go here.
              </div>
            </>
          ) : (
            <p className="text-sm text-[#9E957F]">Select a task to configure.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
