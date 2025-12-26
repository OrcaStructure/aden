"use client";

export default function TaskStrip({
  tasks,
  selectedTaskId,
  onSelectTask,
  onAutogenerate,
}) {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-950 p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Unscheduled Tasks</h2>
          <p className="text-sm text-gray-500">
            Scroll to review tasks waiting for placement.
          </p>
        </div>
        <button
          type="button"
          onClick={onAutogenerate}
          className="rounded-full border border-gray-700 px-4 py-2 text-xs uppercase tracking-[0.2em] text-gray-200 hover:border-gray-500"
        >
          Autogenerate
        </button>
      </div>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-3">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-800 px-4 py-3 text-sm text-gray-500">
            All tasks are scheduled for today.
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              className={`min-w-[200px] rounded-2xl border px-4 py-3 text-left ${
                selectedTaskId === task.id
                  ? "border-white bg-white text-black"
                  : "border-gray-800 bg-black text-white hover:border-gray-600"
              }`}
            >
              <p className="text-sm font-semibold">{task.title}</p>
              <p className="text-xs text-gray-500">
                {task.duration} min · {task.mode}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
