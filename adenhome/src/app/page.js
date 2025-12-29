"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { app } from "../lib/firebaseClient";
import AddTaskBar from "./components/AddTaskBar";
import DayPlan from "./components/DayPlan";
import ModeRail from "./components/ModeRail";
import PlannerHeader from "./components/PlannerHeader";
import TaskConfig from "./components/TaskConfig";
import TaskStrip from "./components/TaskStrip";

const INITIAL_MODES = [
  { id: "m1", name: "Personal", color: "bg-slate-700" },
  { id: "m2", name: "Work", color: "bg-emerald-700" },
  { id: "m3", name: "Deep Focus", color: "bg-amber-700" },
];

const MODE_COLORS = [
  "bg-slate-700",
  "bg-emerald-700",
  "bg-amber-700",
  "bg-rose-700",
  "bg-sky-700",
  "bg-lime-700",
];

const MINUTE_HEIGHT = 2;
const DAY_MINUTES = 24 * 60;
const DEFAULT_TASK_DURATION = 30;

const formatDateKey = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate()
  ).padStart(2, "0")}`;

const combineDateTime = (dateKey, timeValue) =>
  timeValue ? `${dateKey}T${timeValue}` : "";

const extractTime = (deadlineAt) =>
  deadlineAt ? deadlineAt.split("T")[1] || "" : "";

export default function PlannerPage() {
  const [todayLabel, setTodayLabel] = useState("");
  const todayRef = useRef(new Date());
  const dayKey = useMemo(() => formatDateKey(todayRef.current), []);
  const [tasks, setTasks] = useState([]);
  const [plannedBlocks, setPlannedBlocks] = useState([]);
  const [modes, setModes] = useState(INITIAL_MODES);
  const [activeModeId, setActiveModeId] = useState("m1");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [currentMinutes, setCurrentMinutes] = useState(0);
  const [hourModes, setHourModes] = useState(() =>
    Array.from({ length: 24 }, () => "m1")
  );
  const [autoAfterMove, setAutoAfterMove] = useState(false);
  const timelineScrollRef = useRef(null);
  const hasAutoScrolledRef = useRef(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const hasLocalEditsRef = useRef(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [mobileView, setMobileView] = useState("plan");
  const [plannerFocus, setPlannerFocus] = useState(false);
  const swipeStartRef = useRef(null);

  const db = useMemo(() => getFirestore(app), []);

  const getModeOrderedTasks = useCallback(
    (list, modeName) =>
      list
        .filter((task) => task.mode === modeName)
        .sort(
          (a, b) =>
            (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
        ),
    []
  );

  useEffect(() => {
    setTodayLabel(
      todayRef.current.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  useEffect(() => {
    const fetchPlanner = async () => {
      try {
        const plannerDoc = doc(db, "planner", "current");
        const snapshot = await getDoc(plannerDoc);
        if (snapshot.exists() && !hasLocalEditsRef.current) {
          const data = snapshot.data();
          if (Array.isArray(data.tasks)) {
            setTasks(data.tasks);
            if (data.tasks.length > 0) {
              setSelectedTaskId((prev) => prev ?? data.tasks[0].id);
            }
          }
          if (Array.isArray(data.modes) && data.modes.length > 0) {
            setModes(data.modes);
          }
          if (Array.isArray(data.plannedBlocks)) {
            setPlannedBlocks(data.plannedBlocks);
          }
          if (Array.isArray(data.hourModes) && data.hourModes.length === 24) {
            setHourModes(data.hourModes);
          }
        }
      } catch (error) {
        if (typeof navigator !== "undefined" && !navigator.onLine) {
          setSaveStatus("offline");
        } else {
          console.warn("Failed to fetch planner data.", error);
        }
      }
      setHasLoaded(true);
    };
    fetchPlanner();
  }, [db, dayKey]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`/api/google/events?date=${dayKey}`);
        if (!response.ok) {
          return;
        }
        const data = await response.json();
        setCalendarEvents(Array.isArray(data.events) ? data.events : []);
      } catch (error) {
        console.warn("Failed to fetch Google Calendar events.", error);
      }
    };
    fetchEvents();
  }, [dayKey]);

  useEffect(() => {
    const container = timelineScrollRef.current;
    if (!container || hasAutoScrolledRef.current) {
      return;
    }
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const target = Math.max(minutes * MINUTE_HEIGHT - 120, 0);
    requestAnimationFrame(() => {
      container.scrollTo({ top: target, behavior: "auto" });
      hasAutoScrolledRef.current = true;
    });
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
    hasLocalEditsRef.current = true;
    const newId = `task-${Date.now()}`;
    const maxOrder = tasks
      .filter((task) => task.mode === (activeMode?.name || "Personal"))
      .reduce((maxValue, task) => Math.max(maxValue, task.order ?? 0), 0);
    const newTask = {
      id: newId,
      title,
      duration: DEFAULT_TASK_DURATION,
      mode: activeMode?.name || "Personal",
      deadlineAt: "",
      order: maxOrder + 1,
    };
    setTasks((prev) => [newTask, ...prev]);
    setSelectedTaskId(newTask.id);
    setNewTaskTitle("");
  }, [activeMode?.name, newTaskTitle, tasks]);

  const handleTouchStart = useCallback((event) => {
    const touch = event.touches[0];
    const target = event.target;
    if (target?.closest?.("[data-no-swipe]")) {
      swipeStartRef.current = null;
      return;
    }
    swipeStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((event) => {
    const start = swipeStartRef.current;
    if (!start) {
      return;
    }
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    swipeStartRef.current = null;
    if (Math.abs(dy) > Math.abs(dx) + 20 && Math.abs(dy) > 60) {
      setPlannerFocus(dy < 0);
      return;
    }
    if (Math.abs(dx) < 60 || Math.abs(dx) < Math.abs(dy) + 20) {
      return;
    }
    const views = ["modes", "plan", "config"];
    const currentIndex = views.indexOf(mobileView);
    const nextIndex =
      dx < 0 ? Math.min(currentIndex + 1, views.length - 1) : Math.max(currentIndex - 1, 0);
    setMobileView(views[nextIndex]);
  }, [mobileView]);

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
    const timePart = value.includes("T") ? value.split("T")[1] : value;
    const [hours, minutes] = timePart.split(":").map(Number);
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

  const subtractBusyIntervals = useCallback((intervals, busyIntervals) => {
    let available = intervals;
    busyIntervals.forEach((busy) => {
      available = available.flatMap((interval) => {
        if (busy.end <= interval.start || busy.start >= interval.end) {
          return [interval];
        }
        const next = [];
        if (busy.start > interval.start) {
          next.push({ start: interval.start, end: busy.start });
        }
        if (busy.end < interval.end) {
          next.push({ start: busy.end, end: interval.end });
        }
        return next;
      });
    });
    return available;
  }, []);

  const handleAutogenerate = useCallback(() => {
    hasLocalEditsRef.current = true;
    const remainingTasks = tasks.filter((task) => !task.completed);
    if (remainingTasks.length !== tasks.length) {
      setTasks(remainingTasks);
      if (!remainingTasks.find((task) => task.id === selectedTaskId)) {
        setSelectedTaskId(remainingTasks[0]?.id ?? null);
      }
    }
    const nowMinutes = currentMinutes;
    const availability = buildAvailabilityByMode(modeWindows, nowMinutes);
    const busyIntervals = calendarEvents.map((event) => ({
      start: event.startMinutes,
      end: event.endMinutes,
    }));

    const nextBlocks = [];
    modes.forEach((mode) => {
      const modeTasks = getModeOrderedTasks(remainingTasks, mode.name);
      const intervals = availability.get(mode.id);
      if (!intervals || intervals.length === 0) {
        return;
      }
      const freeIntervals = subtractBusyIntervals(intervals, busyIntervals);
      if (freeIntervals.length === 0) {
        return;
      }
      modeTasks.forEach((task) => {
        const deadlineMinutes = parseTimeToMinutes(task.deadlineAt);
        if (deadlineMinutes !== null && deadlineMinutes <= nowMinutes) {
          return;
        }
        for (let i = 0; i < freeIntervals.length; i += 1) {
          const slot = freeIntervals[i];
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
            freeIntervals.splice(i, 1);
          }
          break;
        }
      });
    });

    setPlannedBlocks(nextBlocks);
  }, [
    buildAvailabilityByMode,
    calendarEvents,
    currentMinutes,
    modeWindows,
    modes,
    parseTimeToMinutes,
    selectedTaskId,
    getModeOrderedTasks,
    subtractBusyIntervals,
    tasks,
  ]);

  const handleHourModeChange = useCallback(
    (hourIndex) => {
      hasLocalEditsRef.current = true;
      setHourModes((prev) =>
        prev.map((modeId, index) =>
          index === hourIndex ? activeModeId : modeId
        )
      );
    },
    [activeModeId]
  );

  const handleTaskUpdate = useCallback((taskId, updates) => {
    hasLocalEditsRef.current = true;
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  }, []);

  const handleModeNameChange = useCallback((modeId, name) => {
    hasLocalEditsRef.current = true;
    setModes((prev) =>
      prev.map((mode) => (mode.id === modeId ? { ...mode, name } : mode))
    );
  }, []);

  const handleAddMode = useCallback(() => {
    hasLocalEditsRef.current = true;
    setModes((prev) => {
      const nextIndex = prev.length;
      const nextColor = MODE_COLORS[nextIndex % MODE_COLORS.length];
      return [
        ...prev,
        {
          id: `mode-${Date.now()}`,
          name: `Mode ${nextIndex + 1}`,
          color: nextColor,
        },
      ];
    });
  }, []);

  const handleRemoveMode = useCallback((modeId) => {
    hasLocalEditsRef.current = true;
    const fallbackModeName =
      modes.find((mode) => mode.id === "m1")?.name || "Personal";
    const removedModeName = modes.find((mode) => mode.id === modeId)?.name;
    setModes((prev) => prev.filter((mode) => mode.id !== modeId));
    setHourModes((prev) =>
      prev.map((mode) => (mode === modeId ? "m1" : mode))
    );
    setTasks((prev) =>
      prev.map((task) =>
        task.mode === removedModeName
          ? { ...task, mode: fallbackModeName }
          : task
      )
    );
    if (activeModeId === modeId) {
      setActiveModeId("m1");
    }
  }, [activeModeId, modes]);

  const handleMoveTask = useCallback((taskId, direction) => {
    hasLocalEditsRef.current = true;
    setTasks((prev) => {
      const currentTask = prev.find((task) => task.id === taskId);
      if (!currentTask) {
        return prev;
      }
      const ordered = getModeOrderedTasks(prev, currentTask.mode);
      const index = ordered.findIndex((task) => task.id === taskId);
      if (index === -1) {
        return prev;
      }
      const nextIndex = direction === "up" ? index - 1 : index + 1;
      if (nextIndex < 0 || nextIndex >= ordered.length) {
        return prev;
      }
      const currentOrderedTask = ordered[index];
      const swapTask = ordered[nextIndex];
      const currentOrder = currentOrderedTask.order ?? index + 1;
      const swapOrder = swapTask.order ?? nextIndex + 1;
      return prev.map((task) => {
        if (task.id === currentOrderedTask.id) {
          return { ...task, order: swapOrder };
        }
        if (task.id === swapTask.id) {
          return { ...task, order: currentOrder };
        }
        return task;
      });
    });
    setAutoAfterMove(true);
  }, []);

  const handleDeadlineChange = useCallback(
    (taskId, timeValue) => {
      const task = tasks.find((item) => item.id === taskId);
      const datePart = task?.deadlineAt
        ? task.deadlineAt.split("T")[0]
        : dayKey;
      handleTaskUpdate(taskId, {
        deadlineAt: combineDateTime(datePart, timeValue),
      });
    },
    [dayKey, handleTaskUpdate, tasks]
  );

  const handleTaskComplete = useCallback((taskId) => {
    handleTaskUpdate(taskId, { completed: true });
  }, [handleTaskUpdate]);

  const timelineHeight = DAY_MINUTES * MINUTE_HEIGHT;
  const scheduledTaskIds = useMemo(
    () => new Set(plannedBlocks.map((block) => block.taskId)),
    [plannedBlocks]
  );
  const orderedTasks = useMemo(
    () =>
      [...tasks].sort(
        (a, b) =>
          (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
      ),
    [tasks]
  );
  const selectedModeTasks = useMemo(
    () =>
      selectedTask
        ? getModeOrderedTasks(orderedTasks, selectedTask.mode)
        : [],
    [getModeOrderedTasks, orderedTasks, selectedTask]
  );
  const moveAvailability = useMemo(() => {
    const map = new Map();
    modes.forEach((mode) => {
      const list = getModeOrderedTasks(tasks, mode.name);
      list.forEach((task, index) => {
        map.set(task.id, {
          canMoveUp: index > 0,
          canMoveDown: index < list.length - 1,
        });
      });
    });
    return map;
  }, [getModeOrderedTasks, modes, tasks]);
  const unscheduledTasks = useMemo(
    () => orderedTasks.filter((task) => !scheduledTaskIds.has(task.id)),
    [orderedTasks, scheduledTaskIds]
  );

  useEffect(() => {
    if (tasks.length === 0) {
      setSelectedTaskId(null);
      return;
    }
    if (!selectedTaskId || !tasks.find((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(tasks[0].id);
    }
  }, [selectedTaskId, tasks]);

  useEffect(() => {
    if (tasks.length === 0) {
      return;
    }
    const byMode = tasks.reduce((acc, task) => {
      const key = task.mode || "Personal";
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(task);
      return acc;
    }, {});
    let needsNormalization = false;
    Object.values(byMode).forEach((group) => {
      const orders = group.map((task) => task.order ?? 0);
      const hasMissing = group.some((task) => task.order == null);
      const hasDupes = new Set(orders).size !== orders.length;
      if (hasMissing || hasDupes) {
        needsNormalization = true;
      }
    });
    if (!needsNormalization) {
      return;
    }
    hasLocalEditsRef.current = true;
    setTasks((prev) => {
      const next = [];
      const groups = prev.reduce((acc, task) => {
        const key = task.mode || "Personal";
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(task);
        return acc;
      }, {});
      Object.values(groups).forEach((group) => {
        const normalized = group
          .slice()
          .sort(
            (a, b) =>
              (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
          )
          .map((task, index) => ({ ...task, order: index + 1 }));
        next.push(...normalized);
      });
      return next;
    });
  }, [tasks]);

  useEffect(() => {
    if (!autoAfterMove) {
      return;
    }
    handleAutogenerate();
    setAutoAfterMove(false);
  }, [autoAfterMove, handleAutogenerate]);

  useEffect(() => {
    if (!hasLoaded && !hasLocalEditsRef.current) {
      return;
    }
    const timeout = setTimeout(() => {
      const plannerDoc = doc(db, "planner", "current");
      setSaveStatus("saving");
      setDoc(
        plannerDoc,
        {
          tasks,
          modes,
          plannedBlocks,
          hourModes,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )
        .then(() => setSaveStatus("saved"))
        .catch((error) => {
          console.warn("Failed to save planner data.", error);
          setSaveStatus("offline");
        });
    }, 500);
    return () => clearTimeout(timeout);
  }, [db, hasLoaded, hourModes, modes, plannedBlocks, tasks]);

  return (
    <main
      className="h-[100svh] overflow-hidden text-[#F7F3E8] lg:min-h-screen lg:overflow-visible"
      style={{
        overflowAnchor: "none",
        backgroundImage:
          "radial-gradient(circle at top, rgba(228,169,73,0.12), transparent 55%), linear-gradient(135deg, #0f1410, #14100c 55%, #0b0c09)",
        fontFamily:
          '"Space Grotesk", "Montserrat", "Trebuchet MS", sans-serif',
      }}
    >
      <section
        className="mx-auto flex h-full max-w-7xl flex-col gap-4 px-4 py-6 lg:min-h-screen lg:flex-row lg:gap-6 lg:px-6 lg:py-8"
        style={{ overflowAnchor: "none" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="flex items-center gap-2 rounded-full border border-[#2A261E] bg-[#14130F] p-1 text-xs uppercase tracking-[0.2em] text-[#9E957F] lg:hidden">
          {[
            { id: "modes", label: "Modes" },
            { id: "plan", label: "Plan" },
            { id: "config", label: "Config" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setMobileView(tab.id)}
              className={`flex-1 rounded-full px-3 py-2 text-center ${
                mobileView === tab.id
                  ? "bg-[#E4A949] text-[#1A140C]"
                  : "text-[#9E957F]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={mobileView === "modes" ? "block w-full lg:hidden" : "hidden lg:hidden"}>
          <ModeRail
            modes={modes}
            activeModeId={activeModeId}
            onModeChange={setActiveModeId}
            dbReady={Boolean(db)}
            onModeNameChange={handleModeNameChange}
            onAddMode={handleAddMode}
            onRemoveMode={handleRemoveMode}
            layout="panel"
          />
        </div>

        <div className="hidden lg:block">
          <ModeRail
            modes={modes}
            activeModeId={activeModeId}
            onModeChange={setActiveModeId}
            dbReady={Boolean(db)}
            onModeNameChange={handleModeNameChange}
            onAddMode={handleAddMode}
            onRemoveMode={handleRemoveMode}
          />
        </div>

        <div
          className={`min-w-0 flex-1 flex-col gap-6 ${
            mobileView === "plan"
              ? "flex h-full min-h-0 overflow-hidden"
              : "hidden lg:flex"
          }`}
        >
          <div className="hidden lg:flex justify-end">
            <button
              type="button"
              onClick={() => setPlannerFocus((prev) => !prev)}
              className="rounded-full border border-[#5A4B2A] bg-[#201A10] px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#F1D79A] hover:border-[#E4A949]"
            >
              {plannerFocus ? "Unfocus plan" : "Focus plan"}
            </button>
          </div>
          <div className={plannerFocus ? "hidden" : ""}>
            <PlannerHeader todayLabel={todayLabel} saveStatus={saveStatus} />
          </div>

          <div className={plannerFocus ? "hidden" : ""}>
            <TaskStrip
              tasks={unscheduledTasks}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
              onAutogenerate={handleAutogenerate}
              mobileScrollable
            />
          </div>

          <div className="flex-1 min-h-0">
            <DayPlan
              activeModeName={activeMode?.name}
              timelineHours={timelineHours}
              timelineHeight={timelineHeight}
              minuteHeight={MINUTE_HEIGHT}
              hourModes={hourModes}
              modes={modes}
              onHourModeChange={handleHourModeChange}
              modeWindows={modeWindows}
              calendarEvents={calendarEvents}
              fillHeight={mobileView === "plan"}
              plannedBlocks={plannedBlocks}
              selectedTaskId={selectedTaskId}
              onSelectTask={setSelectedTaskId}
              onMoveTask={handleMoveTask}
              moveAvailability={moveAvailability}
              currentMinutes={currentMinutes}
              scrollRef={timelineScrollRef}
            />
          </div>

          <div className={plannerFocus ? "hidden" : ""}>
            <AddTaskBar
              activeModeName={activeMode?.name}
              newTaskTitle={newTaskTitle}
              onTitleChange={(event) => setNewTaskTitle(event.target.value)}
              onAddTask={handleAddTask}
            />
          </div>
        </div>

        <div className={mobileView === "config" ? "block w-full lg:hidden" : "hidden lg:hidden"}>
          <TaskConfig
            selectedTask={selectedTask}
            modes={modes}
            onTaskUpdate={handleTaskUpdate}
            onDeadlineChange={handleDeadlineChange}
            deadlineTime={extractTime(selectedTask?.deadlineAt)}
            onTaskComplete={handleTaskComplete}
            onMoveTask={handleMoveTask}
            canMoveUp={
              selectedTask
                ? selectedModeTasks.findIndex((task) => task.id === selectedTask.id) >
                  0
                : false
            }
            canMoveDown={
              selectedTask
                ? selectedModeTasks.findIndex((task) => task.id === selectedTask.id) <
                  selectedModeTasks.length - 1
                : false
            }
            layout="panel"
          />
        </div>

        <div className="hidden lg:block">
          <TaskConfig
            selectedTask={selectedTask}
            modes={modes}
            onTaskUpdate={handleTaskUpdate}
            onDeadlineChange={handleDeadlineChange}
            deadlineTime={extractTime(selectedTask?.deadlineAt)}
            onTaskComplete={handleTaskComplete}
            onMoveTask={handleMoveTask}
            canMoveUp={
              selectedTask
                ? selectedModeTasks.findIndex((task) => task.id === selectedTask.id) >
                  0
                : false
            }
            canMoveDown={
              selectedTask
                ? selectedModeTasks.findIndex((task) => task.id === selectedTask.id) <
                  selectedModeTasks.length - 1
                : false
            }
          />
        </div>
      </section>
    </main>
  );
}
