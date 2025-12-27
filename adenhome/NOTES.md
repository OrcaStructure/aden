# Planner Notes

## Intent
- Replace the old deliberate flow with a Firebase-backed planner.
- Auto-plan tasks into time blocks based on mode windows (Personal, Work, etc.).
- Keep the UI modular so the algorithm and Firebase wiring can slot in cleanly.

## Current UI Skeleton
- Left rail with mode buttons; one mode is always active.
- Main column includes:
  - Header with day info.
  - Horizontal scroll strip for unscheduled tasks (scheduled tasks are excluded).
  - Continuous day plan timeline (24 hours) with placeholder blocks.
  - Sticky bottom input to add tasks.
- Right column shows task config for the selected or newly added task.

## Structure Notes (Refactor)
- Moved initial data to top-level constants for easy replacement with Firebase:
  - INITIAL_TASKS
  - INITIAL_MODES
  - INITIAL_PLANNED_BLOCKS
- Timeline scale constants:
  - MINUTE_HEIGHT
  - DAY_MINUTES
- Derived data:
  - selectedTask, activeMode
  - scheduledTaskIds (from planned blocks)
  - unscheduledTasks (tasks not in plan)
- Handlers:
  - handleAddTask is memoized; tasks are unscheduled by default.
  - handleTaskUpdate updates the selected task config.

## State & Data Flow
- tasks: source of truth for all tasks (unscheduled + scheduled).
- plannedBlocks: placements in the day plan referencing taskId.
- activeModeId: current mode for new tasks and default schedule context.
- selectedTaskId: drives the Task Config panel and highlights.
- currentMinutes: updates every minute to draw the “now” line.
- hourModes: 24-length array of mode ids (1 per hour) to define mode windows.

## UI Behaviors Today
- Clicking an unscheduled task selects it.
- Clicking a planned block selects the associated task.
- Task Config fields update the selected task (duration, deadline, mode).
- Unscheduled strip hides tasks that appear in plannedBlocks.
- Timeline auto-scrolls to the current time on load.
- Hour mode column lets you assign the active mode to a specific hour.
- Mode windows tint the day plan background for the active ranges.
- Autogenerate schedules tasks as early as possible inside their mode windows.
- Planned blocks display title + time range and a mode-colored stripe.
- Task config includes Move up / Move down to reorder tasks.
- Planner state auto-saves to Firestore after changes.

## Behaviors to Add Later
- Create/select day-plan ranges to assign mode windows.
- Improve range editing (drag to paint multiple hours).
- Autogenerate places tasks into matching mode windows while honoring user order.
- Firebase reads/writes for tasks and plan blocks.
- Ensure tasks cannot be both scheduled and unscheduled at the same time.
- Persist and display mode windows so the auto-plan respects them.

## Data Concepts (Draft)
- Task: id, title, duration, mode, deadlineAt (YYYY-MM-DDTHH:mm), order, status.
- Plan block: id, taskId, startMinutes, endMinutes, mode.
- Mode window: id, mode, startMinutes, endMinutes.

## Autogenerate Logic (Current)
- Uses mode windows derived from the hour column.
- Uses the current task list order as the primary ordering constraint.
- For each task (in order), finds the earliest available slot in matching mode windows.
- Only schedules tasks in the future (no slots before the current time).
- Respects deadline time when provided; skips tasks that cannot fit.
- Replaces the entire plan each time it runs.

## Firestore Wiring (Current)
- Collection: planner
- Document id: current
- Stored fields: tasks, plannedBlocks, hourModes, updatedAt
- Fetch on load; debounce-save on change (500ms).

## Ordering Design Goals
- Users define a rough order by moving tasks up/down (no manual numbering).
- Autogenerate keeps tasks as close as possible to that order.
- Constraints (mode windows, deadlines, current time) can skip tasks.
- Re-running autogenerate should feel stable unless constraints change.
- Task order is stored on each task (`order`) and is scoped per mode.

## Scaling Plan (When Ready)
## Component Split (Done)
- `src/app/components/ModeRail.jsx`
- `src/app/components/PlannerHeader.jsx`
- `src/app/components/TaskStrip.jsx`
- `src/app/components/DayPlan.jsx`
- `src/app/components/TaskConfig.jsx`
- `src/app/components/AddTaskBar.jsx`
- `src/app/page.js` now orchestrates state/data flow and passes props.

## Scaling Plan (When Ready)
- Move planning logic into a separate planner module.
- Add a small store (context or reducer) once Firebase is wired.

## Behaviors to Add Later
- Create/select day-plan ranges to assign mode windows.
- Autogenerate places tasks into matching mode windows.
- Firebase reads/writes for tasks and plan blocks.
 - Ensure tasks cannot be both scheduled and unscheduled at the same time.

## Data Concepts (Draft)
- Task: id, title, duration, mode, status.
- Plan block: id, taskId, startMinutes, endMinutes, mode.
- Mode window: id, mode, startMinutes, endMinutes.

## Questions / Next Decisions
- Mode names + colors?
- How to select time ranges (drag to create, click to edit)?
- Timeline scale (minute height / density)?
