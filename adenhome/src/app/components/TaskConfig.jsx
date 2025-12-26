"use client";

export default function TaskConfig({ selectedTask, modes, onTaskUpdate }) {
  return (
    <aside className="hidden w-[320px] shrink-0 xl:block">
      <div className="sticky top-8 rounded-2xl border border-gray-800 bg-gray-950 p-6">
        <h2 className="text-lg font-semibold">Task Config</h2>
        <p className="text-sm text-gray-500">
          Configure the task you just added or selected.
        </p>
        <div className="mt-5 space-y-4">
          {selectedTask ? (
            <>
              <div className="rounded-xl border border-gray-800 bg-black p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-gray-500">
                  Selected
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {selectedTask.title}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedTask.duration} min · {selectedTask.mode}
                </p>
              </div>
              <div className="grid gap-3">
                <div className="space-y-2">
                  <label
                    className="text-xs uppercase tracking-[0.2em] text-gray-500"
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
                    className="w-full rounded-xl border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-gray-500 focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="text-xs uppercase tracking-[0.2em] text-gray-500"
                    htmlFor="task-deadline"
                  >
                    Deadline
                  </label>
                  <input
                    id="task-deadline"
                    type="time"
                    value={selectedTask.deadline}
                    onChange={(event) =>
                      onTaskUpdate(selectedTask.id, {
                        deadline: event.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-gray-800 bg-black px-3 py-2 text-sm text-white focus:border-gray-500 focus:outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-[0.2em] text-gray-500">
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
                          ? "bg-white text-black"
                          : `${mode.color} text-white`
                      }`}
                    >
                      {mode.name}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-dashed border-gray-700 p-4 text-xs text-gray-500">
                Duration, priority, and constraints go here.
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Select a task to configure.</p>
          )}
        </div>
      </div>
    </aside>
  );
}
