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
      className={`rounded-2xl border border-[#2A261E] bg-[#14130F] p-4 ${
        mobileScrollable ? "max-h-[30vh] overflow-y-auto overscroll-contain" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Unscheduled Tasks</h2>
          <p className="text-sm text-[#9E957F]">
            Scroll to review tasks waiting for placement.
          </p>
        </div>
        <button
          type="button"
          onClick={onAutogenerate}
          className="rounded-full border border-[#5A4B2A] bg-[#201A10] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#F1D79A] hover:border-[#E4A949]"
        >
          Autogenerate
        </button>
      </div>
      <div className="mt-4 flex flex-wrap gap-3 overflow-x-hidden pb-3 lg:flex-nowrap lg:overflow-x-auto">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#2A261E] px-4 py-3 text-sm text-[#9E957F]">
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
                  ? "border-[#E4A949] bg-[#E4A949] text-[#1A140C]"
                  : "border-[#2A261E] bg-[#10100C] text-[#F7F3E8] hover:border-[#4A4236]"
              }`}
            >
              <p className="text-sm font-semibold">{task.title}</p>
              <p className="text-xs text-[#9E957F]">
                {task.duration} min · {task.mode}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
