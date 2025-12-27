"use client";

export default function AddTaskBar({
  activeModeName,
  newTaskTitle,
  onTitleChange,
  onAddTask,
}) {
  return (
    <div className="sticky bottom-0 rounded-2xl border border-[#2A261E] bg-[#14130F] p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <label className="sr-only" htmlFor="new-task">
            New task
          </label>
          <input
            id="new-task"
            value={newTaskTitle}
            onChange={onTitleChange}
            placeholder={`Add a ${activeModeName || "Personal"} task...`}
            className="w-full rounded-xl border border-[#2A261E] bg-[#10100C] px-4 py-3 text-sm text-[#F7F3E8] focus:border-[#E4A949] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onAddTask}
          className="rounded-xl bg-[#E4A949] px-5 py-3 text-sm font-semibold text-[#1A140C] hover:bg-[#F1D79A]"
        >
          Add task
        </button>
      </div>
    </div>
  );
}
