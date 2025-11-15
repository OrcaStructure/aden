// app/deliberate/components/SessionPlanner.jsx
"use client";

/**
 * Props:
 * - totalMinutes
 * - onTotalMinutesChange
 * - plan: [{ activityId, path: string[], suggestedMinutes }]
 * - actualMinutes: { [activityId]: number }
 * - onBuildPlan()
 * - onActualChange(activityId, value)
 */
export default function SessionPlanner({
  totalMinutes,
  onTotalMinutesChange,
  plan,
  actualMinutes,
  onBuildPlan,
  onActualChange,
}) {
  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">
        Create a Deliberate Practice Session
      </h2>

      <div className="flex flex-wrap items-end gap-3 mb-4">
        <div>
          <label className="block text-xs text-gray-400 mb-1">
            How many minutes do you have?
          </label>
          <input
            type="number"
            min={1}
            className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm w-32"
            value={totalMinutes}
            onChange={(e) => onTotalMinutesChange(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={onBuildPlan}
          className="bg-white text-black text-sm px-4 py-2 rounded hover:bg-gray-200 transition"
        >
          Suggest plan
        </button>
      </div>

      {plan.length > 0 && (
        <div className="border border-gray-800 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-900 text-gray-300">
              <tr>
                <th className="px-3 py-2 text-left">Activity path</th>
                <th className="px-3 py-2 text-right">Suggested (min)</th>
                <th className="px-3 py-2 text-right">Actual (min)</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((p, idx) => (
                <tr key={`${p.activityId}-${idx}`} className="border-t border-gray-800">
                  <td className="px-3 py-2">
                    {p.path.join(" → ")}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.suggestedMinutes}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <input
                      type="number"
                      min={0}
                      className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-sm w-24 text-right"
                      value={actualMinutes[p.activityId] ?? ""}
                      onChange={(e) =>
                        onActualChange(p.activityId, e.target.value)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
