"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getFirestore } from "firebase/firestore";
import { app } from "../lib/firebaseClient";
import AddTaskBar from "./components/AddTaskBar";
import DayPlan from "./components/DayPlan";
import ModeRail from "./components/ModeRail";
import PlannerHeader from "./components/PlannerHeader";
import TaskConfig from "./components/TaskConfig";
import TaskStrip from "./components/TaskStrip";

const INITIAL_TASKS = [
  {
    id: "t1",
    title: "Draft outline",
    duration: 45,
    mode: "Personal",
    deadline: "11:00",
  },
  {
    id: "t2",
    title: "Client email",
    duration: 20,
    mode: "Work",
    deadline: "14:30",
  },
  { id: "t3", title: "Gym", duration: 60, mode: "Personal", deadline: "" },
];

const INITIAL_MODES = [
  { id: "m1", name: "Personal", color: "bg-slate-700" },
  { id: "m2", name: "Work", color: "bg-emerald-700" },
  { id: "m3", name: "Deep Focus", color: "bg-amber-700" },
];

const INITIAL_PLANNED_BLOCKS = [
  {
    id: "b1",
    taskId: "t1",
    title: "Draft outline",
    startMinutes: 8 * 60,
    endMinutes: 8 * 60 + 45,
    mode: "Personal",
  },
  {
    id: "b2",
    taskId: "t2",
    title: "Client email",
    startMinutes: 10 * 60,
    endMinutes: 10 * 60 + 20,
    mode: "Work",
  },
];

const MINUTE_HEIGHT = 2;
const DAY_MINUTES = 24 * 60;
const DEFAULT_TASK_DURATION = 30;

export default function PlannerPage() {
  const [todayLabel, setTodayLabel] = useState("");
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [plannedBlocks, setPlannedBlocks] = useState(INITIAL_PLANNED_BLOCKS);
  const modes = INITIAL_MODES;
  const [activeModeId, setActiveModeId] = useState("m1");
  const [selectedTaskId, setSelectedTaskId] = useState("t1");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [hourModes, setHourModes] = useState(() =>
    Array.from({ length: 24 }, () => "m1")
  );
  const timelineScrollRef = useRef(null);

  const db = useMemo(() => getFirestore(app), []);

  useEffect(() => {
    const now = new Date();
    setTodayLabel(
      now.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    const container = timelineScrollRef.current;
    if (!container) {
      return;
    }
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const target = Math.max(minutes * MINUTE_HEIGHT - 120, 0);
    container.scrollTo({ top: target, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentMinutes(now.getHours() * 60 + now.getMinutes());
    };
    updateTime();
    const timer = setInterval(updateTime, 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) || null,
    [tasks, selectedTaskId]
  );
  const activeMode = useMemo(
    () => modes.find((mode) => mode.id === activeModeId) || modes[0],
    [modes, activeModeId]
  );

  const handleAddTask = useCallback(() => {
    const title = newTaskTitle.trim();
    if (!title) {
      return;
    }
    const newTask = {
      id: `task-${Date.now()}`,
      title,
      duration: DEFAULT_TASK_DURATION,
      mode: activeMode?.name || "Personal",
      deadline: "",
    };
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    setNewTaskTitle("");
  }, [activeMode?.name, newTaskTitle]);

  const timelineHours = useMemo(
    () =>
      Array.from({ length: 25 }).map((_, index) => {
        const hour = index % 12 || 12;
        const suffix = index < 12 ? "AM" : "PM";
        return `${hour} ${suffix}`;
      }),
    []
  );

  const modeWindows = useMemo(() => {
    if (!hourModes.length) {
      return [];
    }
    const windows = [];
    let currentModeId = hourModes[0];
    let startHour = 0;

    for (let hour = 1; hour <= 24; hour += 1) {
      const modeId = hour < 24 ? hourModes[hour] : null;
      if (modeId !== currentModeId) {
        const mode = modes.find((item) => item.id === currentModeId);
        if (mode) {
          windows.push({
            id: `window-${startHour}-${hour}`,
            modeId: currentModeId,
            label: mode.name,
            color: mode.color,
            startMinutes: startHour * 60,
            endMinutes: hour * 60,
          });
        }
        currentModeId = modeId;
        startHour = hour;
      }
    }

    return windows;
  }, [hourModes, modes]);

  const parseTimeToMinutes = useCallback((value) => {
    if (!value) {
      return null;
    }
    const [hours, minutes] = value.split(":").map(Number);
    if (Number.isNaN(hours) || Number.isNaN(minutes)) {
      return null;
    }
    return hours * 60 + minutes;
  }, []);

  const buildAvailabilityByMode = useCallback(
    (windows, minStartMinutes) => {
      const availability = new Map();
      windows.forEach((window) => {
        const start = Math.max(window.startMinutes, minStartMinutes);
        if (start >= window.endMinutes) {
          return;
        }
        if (!availability.has(window.modeId)) {
          availability.set(window.modeId, []);
        }
        availability.get(window.modeId).push({
          start,
          end: window.endMinutes,
        });
      });
      availability.forEach((intervals) =>
        intervals.sort((a, b) => a.start - b.start)
      );
      return availability;
    },
    []
  );

  const handleAutogenerate = useCallback(() => {
    const nowMinutes = currentMinutes;
    const availability = buildAvailabilityByMode(modeWindows, nowMinutes);

    const sortedTasks = [...tasks].sort((a, b) => {
      const deadlineA = parseTimeToMinutes(a.deadline);
      const deadlineB = parseTimeToMinutes(b.deadline);
      const timeA = deadlineA ?? Number.POSITIVE_INFINITY;
      const timeB = deadlineB ?? Number.POSITIVE_INFINITY;
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      return a.duration - b.duration;
    });

    const nextBlocks = [];
    sortedTasks.forEach((task) => {
      const intervals = availability.get(
        modes.find((mode) => mode.name === task.mode)?.id || ""
      );
      if (!intervals || intervals.length === 0) {
        return;
      }
      const deadlineMinutes = parseTimeToMinutes(task.deadline);
      if (deadlineMinutes !== null && deadlineMinutes <= nowMinutes) {
        return;
      }
      for (let i = 0; i < intervals.length; i += 1) {
        const slot = intervals[i];
        const start = slot.start;
        const end = start + task.duration;
        if (end > slot.end) {
          continue;
        }
        if (deadlineMinutes !== null && end > deadlineMinutes) {
          continue;
        }
        nextBlocks.push({
          id: `block-${task.id}-${start}`,
          taskId: task.id,
          title: task.title,
          startMinutes: start,
          endMinutes: end,
          mode: task.mode,
        });
        slot.start = end;
        if (slot.start >= slot.end) {
          intervals.splice(i, 1);
        }
        break;
      }
    });

    setPlannedBlocks(nextBlocks);
  }, [
    buildAvailabilityByMode,
    currentMinutes,
    modeWindows,
    modes,
    parseTimeToMinutes,
    tasks,
  ]);

  const handleHourModeChange = useCallback(
    (hourIndex) => {
      setHourModes((prev) =>
        prev.map((modeId, index) =>
          index === hourIndex ? activeModeId : modeId
        )
      );
    },
    [activeModeId]
  );

  const handleTaskUpdate = useCallback((taskId, updates) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }, []);

  const timelineHeight = DAY_MINUTES * MINUTE_HEIGHT;
  const scheduledTaskIds = useMemo(
    () => new Set(plannedBlocks.map((block) => block.taskId)),
    [plannedBlocks]
  );
  const unscheduledTasks = useMemo(
    () => tasks.filter((task) => !scheduledTaskIds.has(task.id)),
    [tasks, scheduledTaskIds]
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-8">
        <ModeRail
          modes={modes}
          activeModeId={activeModeId}
          onModeChange={setActiveModeId}
          dbReady={Boolean(db)}
        />

        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <PlannerHeader todayLabel={todayLabel} />

          <TaskStrip
            tasks={unscheduledTasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            onAutogenerate={handleAutogenerate}
          />

          <DayPlan
            activeModeName={activeMode?.name}
            timelineHours={timelineHours}
            timelineHeight={timelineHeight}
            minuteHeight={MINUTE_HEIGHT}
            hourModes={hourModes}
            modes={modes}
            onHourModeChange={handleHourModeChange}
            modeWindows={modeWindows}
            plannedBlocks={plannedBlocks}
            selectedTaskId={selectedTaskId}
            onSelectTask={setSelectedTaskId}
            currentMinutes={currentMinutes}
            scrollRef={timelineScrollRef}
          />

          <AddTaskBar
            activeModeName={activeMode?.name}
            newTaskTitle={newTaskTitle}
            onTitleChange={(event) => setNewTaskTitle(event.target.value)}
            onAddTask={handleAddTask}
          />
        </div>

        <TaskConfig
          selectedTask={selectedTask}
          modes={modes}
          onTaskUpdate={handleTaskUpdate}
        />
      </section>
    </main>
  );
}
