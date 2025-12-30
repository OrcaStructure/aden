"use client";

export default function TaskStrip({
  tasks,
  selectedTaskId,
  onSelectTask,
  onAutogenerate,
  mobileScrollable = false,
}) {
  return (
    <div
      data-no-swipe
      className={`rounded-2xl border border-[#1B2C36] bg-[#0B1B24] p-4 ${
        mobileScrollable ? "max-h-[30vh] overflow-y-auto overscroll-contain" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Unscheduled Tasks</h2>
          <p className="text-sm text-[#7FA5AE]">
            Scroll to review tasks waiting for placement.
          </p>
        </div>
        <button
          type="button"
          onClick={onAutogenerate}
          className="rounded-full border border-[#1F3B46] bg-[#0F2630] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#6FE3E2] hover:border-[#2CB8C8]"
        >
          Autogenerate
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 overflow-x-hidden pb-3 lg:flex-nowrap lg:overflow-x-auto">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#1B2C36] px-4 py-3 text-sm text-[#7FA5AE]">
            All tasks are scheduled for today.
          </div>
        ) : (
          tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => onSelectTask(task.id)}
              className={`w-full rounded-2xl border px-4 py-3 text-left sm:w-auto sm:min-w-[200px] ${
                selectedTaskId === task.id
                  ? "border-[#2CB8C8] bg-[#2CB8C8] text-[#03161B]"
                  : "border-[#1B2C36] bg-[#08141C] text-[#E6F4F7] hover:border-[#4A4236]"
              }`}
            >
              <p className="text-sm font-semibold">{task.title}</p>
              <p className="text-xs text-[#7FA5AE]">
                {task.duration} min · {task.mode}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
