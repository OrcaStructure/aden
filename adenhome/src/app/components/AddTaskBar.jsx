"use client";

export default function AddTaskBar({
  activeModeName,
  newTaskTitle,
  onTitleChange,
  onAddTask,
}) {
  return (
    <div className="sticky bottom-0 rounded-2xl border border-gray-800 bg-gray-950 p-4">
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
            className="w-full rounded-xl border border-gray-800 bg-black px-4 py-3 text-sm text-white focus:border-gray-500 focus:outline-none"
          />
        </div>
        <button
          type="button"
          onClick={onAddTask}
          className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-200"
        >
          Add task
        </button>
      </div>
    </div>
  );
}
