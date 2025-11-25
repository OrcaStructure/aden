// app/deliberate/components/SessionPlanner.jsx
"use client";

import { useState, useMemo } from "react";

export default function SessionPlanner({
  totalMinutes,
  onTotalMinutesChange,
  plan,
  actualMinutes,
  onBuildPlan,
  onActualChange,
}) {
  // Which top-level groups (first element of path) are expanded
  const [expandedGroups, setExpandedGroups] = useState(() => new Set());

  // Group plan rows by top-level activity name (path[0])
  const grouped = useMemo(() => {
    const groups = new Map();

    (plan || []).forEach((item) => {
      const top = Array.isArray(item.path) && item.path.length
        ? item.path[0]
        : "Uncategorised";

      if (!groups.has(top)) groups.set(top, []);
      groups.get(top).push(item);
    });

    return groups;
  }, [plan]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  // Utility: sum minutes for a group
  const sumSuggested = (items) =>
    items.reduce((sum, p) => sum + (p.suggestedMinutes || 0), 0);

  const sumActual = (items) =>
    items.reduce((sum, p) => sum + (actualMinutes[p.activityId] || 0), 0);

  return (
    <section className="space-y-4">
      {/* Header + total minutes control */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-200">
            Session planner
          </h2>
          <p className="text-xs text-gray-500">
            Build a plan based on your activity weights, then log what you
            actually did.
          </p>
        </div>

        <div className="flex items-end gap-2">
          <div>
            <label className="block text-xs text-gray-400 mb-1">
              Total minutes
            </label>
            <input
              type="number"
              min={0}
              className="
                bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-24
                [appearance:textfield]
                [&::-webkit-outer-spin-button]:appearance-none
                [&::-webkit-inner-spin-button]:appearance-none
              "
              value={totalMinutes}
              onChange={(e) => onTotalMinutesChange(Number(e.target.value) || 0)}
            />
          </div>

          <button
            type="button"
            onClick={onBuildPlan}
            className="px-3 py-2 text-xs font-semibold rounded border border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-500"
          >
            Build plan
          </button>
        </div>
      </div>

      {/* Plan table: grouped + collapsible */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left">Activity / Path</th>
              <th className="px-3 py-2 text-right">Planned (min)</th>
              <th className="px-3 py-2 text-right">Actual (min)</th>
            </tr>
          </thead>

          {grouped.size === 0 ? (
            <tbody>
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-4 text-center text-gray-500 text-sm"
                >
                  No plan yet. Choose total minutes and click{" "}
                  <span className="font-semibold">Build plan</span>.
                </td>
              </tr>
            </tbody>
          ) : (
            Array.from(grouped.entries()).map(([groupName, items]) => {
              const isExpanded = expandedGroups.has(groupName);
              const groupSuggested = sumSuggested(items);
              const groupActual = sumActual(items);

              return (
                <tbody key={groupName}>
                  {/* Group header row */}
                  <tr className="border-t border-gray-800 bg-gray-950/60">
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => toggleGroup(groupName)}
                        className="flex items-center text-sm text-gray-100 hover:text-white"
                      >
                        <span className="mr-2 text-xs text-gray-400">
                          {isExpanded ? "▾" : "▸"}
                        </span>
                        <span className="font-medium">{groupName}</span>
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right text-gray-200">
                      {groupSuggested}
                    </td>
                    <td className="px-3 py-2 text-right text-gray-200">
                      {groupActual}
                    </td>
                  </tr>

                  {/* Child rows */}
                  {isExpanded &&
                    items.map((p) => {
                      const pathParts = Array.isArray(p.path) ? p.path : [];
                      const fullPath = pathParts.join(" › ");
                      const actual = actualMinutes[p.activityId] ?? p.suggestedMinutes ?? 0;

                      return (
                        <tr
                          key={`${p.activityId}-${fullPath}`}
                          className="border-t border-gray-900"
                        >
                          <td className="px-3 py-2">
                            <div className="flex items-center">
                              <div className="w-4" />
                              <span className="text-xs text-gray-400 mr-2">
                                •
                              </span>
                              <span className="text-gray-100">
                                {fullPath}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-right text-gray-200">
                            {p.suggestedMinutes}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              min={0}
                              className="
                                bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs w-20
                                text-right
                                [appearance:textfield]
                                [&::-webkit-outer-spin-button]:appearance-none
                                [&::-webkit-inner-spin-button]:appearance-none
                              "
                              value={actual}
                              onChange={(e) =>
                                onActualChange(
                                  p.activityId,
                                  e.target.value
                                )
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              );
            })
          )}
        </table>
      </div>
    </section>
  );
}
