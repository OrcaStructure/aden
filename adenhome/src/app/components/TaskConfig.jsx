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
      ? "rounded-2xl border border-[#1B2C36] bg-[#0B1B24] p-6"
      : "sticky top-8 rounded-2xl border border-[#1B2C36] bg-[#0B1B24] p-6";

  return (
    <aside className={wrapperClass}>
      <div className={containerClass}>
        <h2 className="text-lg font-semibold">Task Config</h2>
        <p className="text-sm text-[#7FA5AE]">
          Configure the task you just added or selected.
        </p>
        <div className="mt-5 space-y-4">
          {selectedTask ? (
            <>
              <div className="rounded-xl border border-[#1B2C36] bg-[#08141C] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[#7FA5AE]">
                  Selected
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedTask.title}
                </p>
                <p className="text-xs text-[#7FA5AE]">
                  {selectedTask.duration} min · {selectedTask.mode}
                </p>
                {selectedTask.completed ? (
                  <span className="mt-3 inline-flex rounded-full bg-[#2F2A18] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#6FE3E2]">
                    Completed
                  </span>
                ) : (
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onTaskComplete(selectedTask.id)}
                      className="inline-flex rounded-full border border-[#1F3B46] px-3 py-1 text-xs uppercase tracking-[0.2em] text-[#6FE3E2] hover:border-[#2CB8C8]"
                    >
                      Mark complete
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTask(selectedTask.id, "up")}
                      disabled={!canMoveUp}
                      className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${
                        canMoveUp
                          ? "border-[#27404A] text-[#C8E5EA] hover:border-[#1F3B46]"
                          : "border-[#0B1A22] text-[#5D7A84] cursor-not-allowed"
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
                          ? "border-[#27404A] text-[#C8E5EA] hover:border-[#1F3B46]"
                          : "border-[#0B1A22] text-[#5D7A84] cursor-not-allowed"
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
                    className="text-xs uppercase tracking-[0.2em] text-[#7FA5AE]"
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
                    className="w-full rounded-xl border border-[#1B2C36] bg-[#08141C] px-3 py-2 text-[16px] text-[#E6F4F7] focus:border-[#2CB8C8] focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs uppercase tracking-[0.2em] text-[#7FA5AE]"
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
                    className="w-full rounded-xl border border-[#1B2C36] bg-[#08141C] px-3 py-2 text-[16px] text-[#E6F4F7] focus:border-[#2CB8C8] focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-[#7FA5AE]">
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
                          ? "bg-[#2CB8C8] text-[#03161B]"
                          : `${mode.color} text-white`
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-[#27404A] p-4 text-xs text-[#7FA5AE]">
                Duration, priority, and constraints go here.
              </div>
            </>
          ) : (
            <p className="text-sm text-[#7FA5AE]">Select a task to configure.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
