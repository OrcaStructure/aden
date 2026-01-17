"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { app } from "../../lib/firebaseClient";

const AXIS_MIN = 0;
const AXIS_MAX = 100;
const SAMPLES = 320;

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const smoothstep = (edge0, edge1, x) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

const gaussian = (x, mean, sigma) => {
  if (sigma <= 0) return 0;
  const z = (x - mean) / sigma;
  return Math.exp(-0.5 * z * z);
};

const curveValue = (x, left, median, right) => {
  if (left >= median || median >= right) return 0;
  const leftSpan = Math.max(median - left, 1);
  const rightSpan = Math.max(right - median, 1);
  const sigma = Math.max(Math.min(leftSpan, rightSpan) / 2, 4);
  const taper = Math.max(6, (right - left) * 0.15);
  const leftTaper = Math.min(taper, leftSpan);
  const rightTaper = Math.min(taper, rightSpan);
  const base = gaussian(x, median, sigma);
  const leftGate = smoothstep(left, left + leftTaper, x);
  const rightGate = 1 - smoothstep(right - rightTaper, right, x);
  return base * leftGate * rightGate;
};

const buildCurve = (left, median, right, width, height) => {
  if (left < AXIS_MIN || right > AXIS_MAX || left >= median || median >= right) {
    return null;
  }

  const step = (AXIS_MAX - AXIS_MIN) / SAMPLES;
  const points = [];
  let maxY = 0;

  for (let i = 0; i <= SAMPLES; i += 1) {
    const x = AXIS_MIN + step * i;
    const y = curveValue(x, left, median, right);
    maxY = Math.max(maxY, y);
    points.push({ x, y });
  }

  const mapX = (value) =>
    ((value - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * (width - 20) + 10;
  const mapY = (value) =>
    height - 12 - (maxY ? (value / maxY) * (height - 28) : 0);

  const path = points
    .map((point, index) => {
      const x = mapX(point.x).toFixed(2);
      const y = mapY(point.y).toFixed(2);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");

  return { path, mapX, mapY };
};

const buildDensityCurve = (samples, width, height, axisMaxOverride) => {
  if (!samples.length) return null;
  const sorted = [...samples].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const axisMin = 0;
  const axisMax = Math.max(axisMaxOverride ?? max, 1);
  const mean = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;
  const variance =
    sorted.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) /
    Math.max(sorted.length - 1, 1);
  const std = Math.sqrt(variance);
  const bandwidth = Math.max(std * 0.3, 2);
  const step = (axisMax - axisMin) / SAMPLES || 1;
  const points = [];
  let maxY = 0;
  for (let i = 0; i <= SAMPLES; i += 1) {
    const x = axisMin + step * i;
    let density = 0;
    samples.forEach((value) => {
      const z = (x - value) / bandwidth;
      density += Math.exp(-0.5 * z * z);
    });
    maxY = Math.max(maxY, density);
    points.push({ x, y: density });
  }
  const mapX = (value) =>
    ((value - axisMin) / (axisMax - axisMin || 1)) * (width - 20) + 10;
  const mapY = (value) =>
    height - 10 - (maxY ? (value / maxY) * (height - 20) : 0);
  const path = points
    .map((point, index) => {
      const x = mapX(point.x).toFixed(2);
      const y = mapY(point.y).toFixed(2);
      return `${index === 0 ? "M" : "L"}${x} ${y}`;
    })
    .join(" ");
  return { path, min, max: axisMax };
};

const buildSampler = (left, median, right) => {
  const bins = 200;
  const step = (AXIS_MAX - AXIS_MIN) / bins;
  const weights = [];
  let total = 0;
  for (let i = 0; i <= bins; i += 1) {
    const x = AXIS_MIN + step * i;
    const y = curveValue(x, left, median, right);
    total += y;
    weights.push(total);
  }
  return () => {
    if (total <= 0) return AXIS_MIN;
    const r = Math.random() * total;
    let low = 0;
    let high = weights.length - 1;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (weights[mid] < r) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }
    return AXIS_MIN + step * low;
  };
};

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`;

function DistributionCard({ task, onChange, formatMinutes }) {
  const [dragHandle, setDragHandle] = useState(null);
  const svgRef = useRef(null);

  const left = task?.left ?? 15;
  const median = task?.median ?? 45;
  const right = task?.right ?? 80;
  const leftPos = (left / AXIS_MAX) * 100;
  const medianPos = (median / AXIS_MAX) * 100;
  const rightPos = (right / AXIS_MAX) * 100;
  const labelOffsets = useMemo(() => {
    const offsets = [0, 0, 0];
    const leftGap = Math.abs(medianPos - leftPos);
    const rightGap = Math.abs(rightPos - medianPos);
    if (leftGap < 12) {
      offsets[0] = 0;
      offsets[1] = 12;
    }
    if (rightGap < 12) {
      offsets[1] = offsets[1] ? offsets[1] : 0;
      offsets[2] = 12;
    }
    if (leftGap < 12 && rightGap < 12) {
      offsets[0] = 0;
      offsets[1] = 12;
      offsets[2] = 24;
    }
    return offsets.map((offset) => clamp(offset, 0, 28));
  }, [leftPos, medianPos, rightPos]);
  const compactLabels =
    Math.abs(medianPos - leftPos) < 10 || Math.abs(rightPos - medianPos) < 10;
  const curve = useMemo(() => buildCurve(left, median, right, 520, 200), [
    left,
    median,
    right,
  ]);

  if (!task) {
    return (
      <section className="dist-card">
        <h2>Distribution</h2>
        <p className="muted">Select a task to edit its curve.</p>
      </section>
    );
  }

  const handlePointerMove = (event) => {
    if (!dragHandle || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 10, rect.width - 10);
    const value =
      AXIS_MIN + ((x - 10) / (rect.width - 20)) * (AXIS_MAX - AXIS_MIN);

    if (dragHandle === "left") {
      onChange({ left: Math.round(clamp(value, AXIS_MIN, median - 1)) });
    } else if (dragHandle === "median") {
      onChange({ median: Math.round(clamp(value, left + 1, right - 1)) });
    } else {
      onChange({ right: Math.round(clamp(value, median + 1, AXIS_MAX)) });
    }
  };

  return (
    <section className="dist-card">
      <h2>{task.title}</h2>
      <div className="dist-chart">
        <svg
          ref={svgRef}
          viewBox="0 0 520 200"
          preserveAspectRatio="none"
          onPointerMove={handlePointerMove}
          onPointerUp={() => setDragHandle(null)}
          onPointerCancel={() => setDragHandle(null)}
        >
          <rect x="0" y="0" width="520" height="200" rx="12" className="frame" />
          {curve && <path d={curve.path} className="curve" />}
          <line x1="10" y1="182" x2="510" y2="182" className="axis" />
          <circle
            cx={curve ? curve.mapX(left) : 10}
            cy={curve ? curve.mapY(0) : 180}
            r="10"
            className="handle left"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragHandle("left");
            }}
          />
          <circle
            cx={curve ? curve.mapX(median) : 120}
            cy={
              curve
                ? curve.mapY(curveValue(median, left, median, right))
                : 100
            }
            r="10"
            className="handle median"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragHandle("median");
            }}
          />
          <circle
            cx={curve ? curve.mapX(right) : 360}
            cy={curve ? curve.mapY(0) : 180}
            r="10"
            className="handle right"
            onPointerDown={(event) => {
              event.preventDefault();
              event.currentTarget.setPointerCapture(event.pointerId);
              setDragHandle("right");
            }}
          />
        </svg>
        <div className={`labels ${compactLabels ? "compact" : ""}`}>
          <span
            style={{
              left: `${leftPos}%`,
              top: labelOffsets[0],
            }}
          >
            {formatMinutes(left)}
          </span>
          <span
            style={{
              left: `${medianPos}%`,
              top: labelOffsets[1],
            }}
          >
            {formatMinutes(median)}
          </span>
          <span
            style={{
              left: `${rightPos}%`,
              top: labelOffsets[2],
            }}
          >
            {formatMinutes(right)}
          </span>
        </div>
      </div>
    </section>
  );
}

export default function ChecklistPage() {
  const db = useMemo(() => getFirestore(app), []);
  const [tasks, setTasks] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [newTitle, setNewTitle] = useState("");
  const [dropIndex, setDropIndex] = useState(null);
  const [showAbsoluteTime, setShowAbsoluteTime] = useState(false);
  const [listCount, setListCount] = useState(1);
  const [activeList, setActiveList] = useState(1);
  const [completionLog, setCompletionLog] = useState([]);
  const [showCompletionDist, setShowCompletionDist] = useState(false);
  const [completionInputId, setCompletionInputId] = useState(null);
  const [completionInputValue, setCompletionInputValue] = useState("");
  const [compareCount, setCompareCount] = useState(10);
  const dragIdRef = useRef(null);
  const hasLoadedRef = useRef(false);
  const runsRef = useRef(1200);

  useEffect(() => {
    const load = async () => {
      const snapshot = await getDoc(doc(db, "planner", "checklist"));
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (Array.isArray(data.tasks)) {
          const normalized = data.tasks
            .filter((task) => !task.completed)
            .map((task) => ({
              ...task,
              listId: task.listId ?? 1,
            }));
          setTasks(normalized);
        }
        if (Number.isFinite(data.listCount)) {
          setListCount(Math.max(1, Number(data.listCount)));
        }
        if (Array.isArray(data.completions)) {
          setCompletionLog(data.completions);
        }
      }
      hasLoadedRef.current = true;
    };
    load();
  }, [db]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const preventScroll = (event) => {
      if (event.target.closest?.(".dist-chart")) return;
      event.preventDefault();
    };
    document.addEventListener("touchmove", preventScroll, { passive: false });
    document.addEventListener("wheel", preventScroll, { passive: false });
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("touchmove", preventScroll);
      document.removeEventListener("wheel", preventScroll);
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedRef.current) return;
    const timeout = setTimeout(() => {
      setDoc(
        doc(db, "planner", "checklist"),
        {
          tasks,
          listCount,
          completions: completionLog,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      ).catch((error) => {
        console.warn("Failed to save checklist.", error);
      });
    }, 400);
    return () => clearTimeout(timeout);
  }, [completionLog, db, listCount, tasks]);

  const ordered = useMemo(
    () =>
      tasks
        .filter((task) => (task.listId ?? 1) === activeList)
        .sort(
          (a, b) =>
            (a.order ?? 0) - (b.order ?? 0) || a.id.localeCompare(b.id)
        ),
    [activeList, tasks]
  );

  const selectedTasks = ordered.filter((task) =>
    selectedIds.includes(task.id)
  );
  const selectedTask =
    selectedTasks.length === 1 ? selectedTasks[0] : null;
  const isMultiSelect = selectedTasks.length > 1;

  const addTask = () => {
    const title = newTitle.trim();
    if (!title) return;
    const nextOrder = ordered.length
      ? Math.max(...ordered.map((task) => task.order ?? 0)) + 1
      : 1;
    const next = {
      id: createId(),
      title,
      order: nextOrder,
      listId: activeList,
      completed: false,
      left: 15,
      median: 45,
      right: 80,
    };
    setTasks((prev) => [...prev, next]);
    setNewTitle("");
    setSelectedIds([next.id]);
  };

  const handleDragStart = (id) => {
    if (isMultiSelect) return;
    dragIdRef.current = id;
  };

  const handleDrop = () => {
    if (isMultiSelect) return;
    if (dropIndex === null || !dragIdRef.current) return;
    const fromIndex = ordered.findIndex(
      (task) => task.id === dragIdRef.current
    );
    if (fromIndex === -1) return;
    const updated = [...ordered];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(dropIndex, 0, moved);
    const normalized = updated.map((task, index) => ({
      ...task,
      order: index + 1,
    }));
    setTasks((prev) => {
      const rest = prev.filter(
        (task) => (task.listId ?? 1) !== activeList
      );
      return [...rest, ...normalized];
    });
    setDropIndex(null);
    dragIdRef.current = null;
  };

  const updateSelectedTask = (patch) => {
    if (!selectedTask) return;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === selectedTask.id ? { ...task, ...patch } : task
      )
    );
  };

  const toggleComplete = (id) => {
    const target = tasks.find((task) => task.id === id);
    if (!target) return;
    if (!target.completed) {
      setCompletionInputId(id);
      setCompletionInputValue("");
      return;
    }
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: false } : task
      )
    );
    setCompletionLog((prev) => {
      const idx = [...prev].reverse().findIndex((entry) => entry.id === id);
      if (idx === -1) return prev;
      const removeIndex = prev.length - 1 - idx;
      return prev.filter((_, index) => index !== removeIndex);
    });
  };

  const deleteActiveList = () => {
    if (listCount <= 1) return;
    const confirmed = window.confirm(
      `Delete List ${activeList}? This cannot be undone.`
    );
    if (!confirmed) return;
    setTasks((prev) => prev.filter((task) => (task.listId ?? 1) !== activeList));
    setListCount((count) => Math.max(1, count - 1));
    setActiveList((prev) => (prev === 1 ? 1 : prev - 1));
    setSelectedIds([]);
    setDropIndex(null);
  };

  const recentCompletions = useMemo(() => {
    if (!completionLog.length) return [];
    const count = Math.max(1, Number(compareCount) || 1);
    return completionLog.slice(-count);
  }, [compareCount, completionLog]);

  const actualCompletions = useMemo(
    () => recentCompletions.map((entry) => entry.minutes),
    [recentCompletions]
  );
  const predictedSamples = useMemo(
    () => recentCompletions.flatMap((entry) => entry.samples || []),
    [recentCompletions]
  );

  const formatMinutes = (value) => {
    const minutes = Math.max(0, Math.round(value));
    if (!showAbsoluteTime) return `${minutes}m`;
    const now = new Date();
    const future = new Date(now.getTime() + minutes * 60000);
    return future.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const monteCarlo = useMemo(() => {
    if (selectedTasks.length < 2) return null;
    const runs = runsRef.current;
    const samplers = selectedTasks.map((task) =>
      buildSampler(task.left ?? 15, task.median ?? 45, task.right ?? 80)
    );
    const totals = [];
    for (let i = 0; i < runs; i += 1) {
      let total = 0;
      samplers.forEach((sample) => {
        total += sample();
      });
      totals.push(total);
    }
    totals.sort((a, b) => a - b);
    const density = buildDensityCurve(totals, 520, 200);
    const median =
      totals.length > 0
        ? totals[Math.floor(totals.length * 0.5)]
        : 0;
    return density ? { totals, median, ...density } : null;
  }, [selectedTasks]);

  const completionCurves = useMemo(() => {
    if (!predictedSamples.length && !actualCompletions.length) return null;
    const maxSample = Math.max(...predictedSamples, ...actualCompletions, 1);
    const predicted = predictedSamples.length
      ? buildDensityCurve(predictedSamples, 520, 200, maxSample)
      : null;
    const actual = actualCompletions.length
      ? buildDensityCurve(actualCompletions, 520, 200, maxSample)
      : null;
    return { predicted, actual, max: maxSample };
  }, [actualCompletions, predictedSamples]);

  return (
    <main className="page">
      <header>
        <div className="header-row">
          <div>
            <h1>Checklist</h1>
            <p className="muted">Drag to reorder. Click to edit distribution.</p>
          </div>
          <label className="toggle">
            <input
              type="checkbox"
              checked={showAbsoluteTime}
              onChange={(event) => setShowAbsoluteTime(event.target.checked)}
            />
            <span>Show clock times</span>
          </label>
        </div>
      </header>

      <section className="layout">
        <section className="list">
          <div className="list-tabs">
            {Array.from({ length: listCount }, (_, index) => {
              const id = index + 1;
              return (
                <button
                  key={`list-${id}`}
                  type="button"
                  className={id === activeList ? "tab active" : "tab"}
                  onClick={() => {
                    setActiveList(id);
                    setSelectedIds([]);
                    setDropIndex(null);
                  }}
                >
                  List {id}
                </button>
              );
            })}
            <button
              type="button"
              className="tab add"
              onClick={() => {
                setListCount((count) => count + 1);
                setActiveList(listCount + 1);
                setSelectedIds([]);
                setDropIndex(null);
              }}
            >
              + List
            </button>
            {listCount > 1 && (
              <button
                type="button"
                className="tab danger"
                onClick={deleteActiveList}
              >
                Delete list
              </button>
            )}
            <button
              type="button"
              className="tab"
              onClick={() => setShowCompletionDist((prev) => !prev)}
            >
              {showCompletionDist ? "Hide stats" : "Show stats"}
            </button>
          </div>
          <div className="add-row">
            <input
              value={newTitle}
              onChange={(event) => setNewTitle(event.target.value)}
              placeholder="New task"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTask();
                }
              }}
            />
            <button type="button" onClick={addTask}>
              Add
            </button>
          </div>
          <div className="tasks">
            {ordered.map((task, index) => (
              <div key={task.id} className="task-wrap">
                {!isMultiSelect && dropIndex === index && (
                  <div className="drop-line" />
                )}
                <div
                  role="button"
                  tabIndex={0}
                  className={`task ${
                    selectedIds.includes(task.id) ? "active" : ""
                  }`}
                  draggable={!isMultiSelect}
                  onDragStart={() => handleDragStart(task.id)}
                  onDragOver={(event) => {
                    if (isMultiSelect) return;
                    event.preventDefault();
                    const rect = event.currentTarget.getBoundingClientRect();
                    const isAfter = event.clientY - rect.top > rect.height / 2;
                    setDropIndex(isAfter ? index + 1 : index);
                  }}
                  onDrop={(event) => {
                    if (isMultiSelect) return;
                    event.preventDefault();
                    handleDrop();
                  }}
                  onClick={() =>
                    setSelectedIds((prev) =>
                      prev.includes(task.id)
                        ? prev.filter((id) => id !== task.id)
                        : [...prev, task.id]
                    )
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelectedIds((prev) =>
                        prev.includes(task.id)
                          ? prev.filter((id) => id !== task.id)
                          : [...prev, task.id]
                      );
                    }
                  }}
                >
                  <button
                    type="button"
                    className={`check ${
                      task.completed ? "checked" : ""
                    }`}
                    onClick={(event) => {
                      event.stopPropagation();
                      toggleComplete(task.id);
                    }}
                    aria-label={`Mark ${task.title} complete`}
                  >
                    {task.completed ? "✓" : ""}
                  </button>
                  <span className="handle">::</span>
                  <span className={task.completed ? "done" : ""}>
                    {task.title}
                  </span>
                </div>
                {completionInputId === task.id && (
                  <div className="complete-row">
                    <input
                      type="number"
                      min="1"
                      value={completionInputValue}
                      onChange={(event) =>
                        setCompletionInputValue(event.target.value)
                      }
                      placeholder="Minutes"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget
                            .closest(".complete-row")
                            ?.querySelector("button")
                            ?.click();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const minutes = Number(completionInputValue);
                        if (!Number.isFinite(minutes) || minutes <= 0) return;
                        const samples = [];
                        const sampler = buildSampler(
                          task.left ?? 15,
                          task.median ?? 45,
                          task.right ?? 80
                        );
                        for (let i = 0; i < 200; i += 1) {
                          samples.push(sampler());
                        }
                        setTasks((prev) =>
                          prev.map((item) =>
                            item.id === task.id
                              ? { ...item, completed: true, completedMinutes: minutes }
                              : item
                          )
                        );
                        setCompletionLog((prev) => [
                          ...prev,
                          {
                            id: task.id,
                            minutes,
                            samples,
                            completedAt: new Date().toISOString(),
                          },
                        ]);
                        setCompletionInputId(null);
                        setCompletionInputValue("");
                      }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCompletionInputId(null);
                        setCompletionInputValue("");
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
            {!isMultiSelect && dropIndex === ordered.length && (
              <div className="drop-line" />
            )}
          </div>
        </section>

        {isMultiSelect ? (
          <section className="dist-card">
            <h2>Simulation</h2>
            <p className="muted">
              {selectedTasks.length} tasks selected. Dragging disabled.
            </p>
            {monteCarlo ? (
              <div className="chart">
                <svg viewBox="0 0 520 200" preserveAspectRatio="none">
                  <rect
                    x="0"
                    y="0"
                    width="520"
                    height="200"
                    rx="12"
                    className="frame"
                  />
                  <path d={monteCarlo.path} className="curve" />
                  <line x1="10" y1="182" x2="510" y2="182" className="axis" />
                </svg>
                <div className="axis-labels">
                  <span style={{ left: "0%" }}>{formatMinutes(0)}</span>
                  <span
                    style={{
                      left: `${
                        monteCarlo.max > 0
                          ? (monteCarlo.median / monteCarlo.max) * 100
                          : 50
                      }%`,
                    }}
                  >
                    {formatMinutes(monteCarlo.median)}
                  </span>
                  <span style={{ left: "100%" }}>
                    {formatMinutes(monteCarlo.max)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="muted">Select two or more tasks.</p>
            )}
          </section>
        ) : showCompletionDist ? (
          <section className="dist-card">
            <h2>Completed tasks</h2>
            <p className="muted">Predicted vs actual completion times.</p>
            <div className="complete-row">
              <label htmlFor="compare-count">Last N</label>
            <input
              id="compare-count"
              type="number"
              min="1"
              value={compareCount}
              onChange={(event) => setCompareCount(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.currentTarget.blur();
                }
              }}
            />
            </div>
            {completionCurves ? (
              <div className="chart">
                <svg viewBox="0 0 520 200" preserveAspectRatio="none">
                  <rect
                    x="0"
                    y="0"
                    width="520"
                    height="200"
                    rx="12"
                    className="frame"
                  />
                  {completionCurves.predicted && (
                    <path d={completionCurves.predicted.path} className="curve" />
                  )}
                  {completionCurves.actual && (
                    <path
                      d={completionCurves.actual.path}
                      className="curve actual"
                    />
                  )}
                  <line x1="10" y1="182" x2="510" y2="182" className="axis" />
                </svg>
                <div className="axis-labels">
                  <span style={{ left: "0%" }}>{formatMinutes(0)}</span>
                  <span style={{ left: "100%" }}>
                    {formatMinutes(completionCurves.max)}
                  </span>
                </div>
              </div>
            ) : (
              <p className="muted">Complete tasks to see the comparison.</p>
            )}
          </section>
        ) : (
          <DistributionCard
            task={selectedTask}
            onChange={updateSelectedTask}
            formatMinutes={formatMinutes}
          />
        )}
      </section>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          font-family: "Helvetica Neue", Arial, sans-serif;
          color: #111;
          background: #fff;
          height: 100svh;
          overscroll-behavior: none;
          touch-action: none;
        }

        .page {
          max-width: 900px;
          margin: 0 auto;
          padding: 32px 20px;
          height: 100%;
        }

        header {
          margin-bottom: 24px;
        }

        .header-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .toggle {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
        }

        h1 {
          margin: 0;
          font-size: 28px;
        }

        .muted {
          margin: 6px 0 0;
          color: #555;
          font-size: 14px;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(240px, 1fr) minmax(280px, 1fr);
          gap: 24px;
          align-items: start;
        }

        .list {
          border: 1px solid #111;
          padding: 16px;
        }

        .list-tabs {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 12px;
        }

        .tab {
          border: 1px solid #111;
          background: #fff;
          padding: 6px 10px;
          font-size: 12px;
          cursor: pointer;
        }

        .tab.active {
          background: #111;
          color: #fff;
        }

        .tab.add {
          border-style: dashed;
        }

        .tab.danger {
          border-color: #111;
          background: #fff;
        }

        .check {
          width: 20px;
          height: 20px;
          border: 1px solid #111;
          background: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: pointer;
        }

        .check.checked {
          background: #111;
          color: #fff;
        }

        .add-row {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        .add-row input {
          flex: 1;
          padding: 8px 10px;
          border: 1px solid #111;
        }

        .add-row button {
          padding: 8px 12px;
          border: 1px solid #111;
          background: #111;
          color: #fff;
          cursor: pointer;
        }

        .tasks {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .task-wrap {
          position: relative;
        }

        .task {
          width: 100%;
          text-align: left;
          padding: 10px 12px;
          border: 1px solid #111;
          background: #fff;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: grab;
        }

        .task.active {
          background: #111;
          color: #fff;
        }

        .done {
          text-decoration: line-through;
          opacity: 0.7;
        }

        .handle {
          font-weight: bold;
        }

        .drop-line {
          position: absolute;
          left: 0;
          right: 0;
          top: -4px;
          height: 2px;
          background: #111;
          animation: pulse 0.4s ease-in-out;
        }

        .dist-card {
          border: 1px solid #111;
          padding: 16px;
        }

        .dist-card h2 {
          margin: 0 0 8px;
          font-size: 18px;
        }

        .dist-chart svg {
          width: 100%;
          height: 180px;
          display: block;
          touch-action: none;
        }

        .frame {
          fill: #fff;
          stroke: #111;
        }

        .curve {
          fill: none;
          stroke: #111;
          stroke-width: 2;
        }

        .curve.actual {
          stroke-dasharray: 4 4;
        }

        .axis {
          stroke: #111;
          stroke-width: 1;
        }

        .handle {
          stroke: #fff;
          stroke-width: 2;
          cursor: ew-resize;
          touch-action: none;
        }

        .handle.left {
          fill: #111;
        }

        .handle.median {
          fill: #555;
        }

        .handle.right {
          fill: #111;
        }

        .labels {
          position: relative;
          height: 36px;
          font-size: 12px;
          color: #111;
        }

        .labels span {
          position: absolute;
          transform: translateX(-50%);
          white-space: nowrap;
          background: #fff;
          padding: 0 4px;
        }

        .labels.compact span {
          font-size: 11px;
        }

        .complete-row {
          display: flex;
          gap: 8px;
          margin-top: 6px;
        }

        .complete-row label {
          font-size: 12px;
        }

        .complete-row input {
          width: 90px;
          padding: 6px 8px;
          border: 1px solid #111;
        }

        .complete-row button {
          padding: 6px 10px;
          border: 1px solid #111;
          background: #fff;
          cursor: pointer;
        }

        .axis-labels {
          position: relative;
          height: 18px;
          font-size: 12px;
          color: #111;
        }

        .axis-labels span {
          position: absolute;
          transform: translateX(-50%);
          white-space: nowrap;
        }

        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 1;
          }
        }

        @media (max-width: 760px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
