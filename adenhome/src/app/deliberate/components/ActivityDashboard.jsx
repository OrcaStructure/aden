// app/deliberate/components/ActivityDashboard.jsx
"use client";

import { useState } from "react";

export default function ActivityDashboard({
  activities,
  breadcrumb,
  onAddActivity,
  onUpdateWeight,
  onDeleteActivity,
  onEnterActivity,
  onGoUp,
  showBack,
}) {
  const [newName, setNewName] = useState("");
  const [newWeight, setNewWeight] = useState(1);

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddActivity(newName, Number(newWeight) || 0);
    setNewName("");
    setNewWeight(1);
  };

  return (
    <section className="space-y-4">
      {/* Header / breadcrumb + Up button */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-400 flex flex-wrap items-center gap-1">
          <span className="text-gray-500">Path:</span>
          {breadcrumb && breadcrumb.length > 0 ? (
            <span className="text-gray-200">
              {breadcrumb.join(" › ")}
            </span>
          ) : (
            <span className="text-gray-300 italic">Root</span>
          )}
        </div>

        {showBack && (
          <button
            type="button"
            onClick={onGoUp}
            className="text-xs px-3 py-1 rounded border border-gray-600 text-gray-200 hover:bg-gray-800"
          >
            ← Up one level
          </button>
        )}
      </div>

      {/* Add-activity form */}
      <div className="mb-4 flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs text-gray-400 mb-1">
            New activity name
          </label>
          <input
            type="text"
            className="w-full bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
            placeholder="e.g. Deep Work, Gym, Reading"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-400 mb-1">Weight</label>
          <input
            type="number"
            min={0}
            className="
              bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-24
              [appearance:textfield]
              [&::-webkit-outer-spin-button]:appearance-none
              [&::-webkit-inner-spin-button]:appearance-none
            "
            value={newWeight}
            onChange={(e) => setNewWeight(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleAdd}
          disabled={!newName.trim()}
          className={`
            px-3 py-2 text-xs font-semibold rounded
            border border-blue-500
            ${
              newName.trim()
                ? "bg-blue-600 text-white hover:bg-blue-500"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }
          `}
        >
          Add activity
        </button>
      </div>

      {/* Activity table */}
      <div className="border border-gray-800 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-300">
            <tr>
              <th className="px-3 py-2 text-left">Activity</th>
              <th className="px-3 py-2 text-left">Weight</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id} className="border-t border-gray-800">
                <td className="px-3 py-2">
                  <button
                    type="button"
                    onClick={() => onEnterActivity(a.id)}
                    className="text-left text-sm text-blue-300 hover:text-blue-200 underline-offset-2 hover:underline"
                  >
                    {a.name}
                  </button>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    min={0}
                    className="
                      bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-24
                      [appearance:textfield]
                      [&::-webkit-outer-spin-button]:appearance-none
                      [&::-webkit-inner-spin-button]:appearance-none
                    "
                    value={a.weight ?? ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      onUpdateWeight(a.id, value, { immediate: false });
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      onUpdateWeight(a.id, value, { immediate: true });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.currentTarget.blur(); // triggers onBlur save
                      }
                    }}
                  />
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => onEnterActivity(a.id)}
                    className="text-xs text-gray-300 hover:text-white"
                  >
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteActivity(a.id)}
                    className="text-xs text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {!activities.length && (
              <tr>
                <td
                  colSpan={3}
                  className="px-3 py-4 text-center text-gray-500 text-sm"
                >
                  No activities here yet. Add your first one above.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
