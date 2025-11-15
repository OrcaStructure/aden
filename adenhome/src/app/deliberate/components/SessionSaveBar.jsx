"use client";

/**
 * Props:
 * - hasPlan: boolean
 * - saving: boolean
 * - message: string
 * - onSave(): Promise<void> | void
 */
export default function SessionSaveBar({
  hasPlan,
  saving,
  message,
  onSave,
}) {
  if (!hasPlan) return null;

  return (
    <section className="space-y-2">
      <button
        type="button"
        disabled={saving}
        onClick={onSave}
        className="bg-white text-black text-sm px-4 py-2 rounded hover:bg-gray-200 transition disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save session"}
      </button>

      {message && (
        <p className="text-sm text-gray-300">
          {message}
        </p>
      )}
    </section>
  );
}
