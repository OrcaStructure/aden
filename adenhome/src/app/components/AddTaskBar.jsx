"use client";

export default function AddTaskBar({
  activeModeName,
  newTaskTitle,
  onTitleChange,
  onAddTask,
}) {
  return (
    <div className="sticky bottom-0 rounded-2xl border border-[#1B2C36] bg-[#0B1B24] p-4">
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
            className="w-full rounded-xl border border-[#1B2C36] bg-[#08141C] px-4 py-3 text-[16px] text-[#E6F4F7] focus:border-[#2CB8C8] focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onAddTask}
          className="rounded-xl bg-[#2CB8C8] px-5 py-3 text-sm font-semibold text-[#03161B] hover:bg-[#6FE3E2]"
        >
          Add task
        </button>
      </div>
    </div>
  );
}
