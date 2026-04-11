"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import ResumeDocument from "./ResumeDocument";
import { savePrintResume } from "@/lib/printResumeStorage";

const MANUAL_SECTIONS = [
  { key: "experience", title: "Experience" },
  { key: "projects", title: "Mathematical Writing" },
  { key: "publications", title: "Publications" },
  { key: "education", title: "Education" },
  { key: "skills", title: "Skills" },
  { key: "awards", title: "Awards" },
];

function getItemTitle(item) {
  return item.title || item.degree || item.name || item.id;
}

function getItemMeta(item) {
  return item.organization || item.institution || item.venue || item.year || "";
}

const HARD_CODED_PROFILE = {
  name: "Aden Power",
  location: "Canberra, Australia",
  email: "adenpower.work@gmail.com",
  phone: "0426051560",
};

function orderItems(allItems, selectedIds) {
  const selectedSet = new Set(selectedIds);
  const selectedItems = selectedIds
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean);
  const unselectedItems = allItems.filter((item) => !selectedSet.has(item.id));

  return [...selectedItems, ...unselectedItems];
}

function getLeadingYear(value) {
  const match = String(value ?? "").match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}

function sortItemsByYearDesc(items) {
  return [...items].sort((a, b) => {
    const yearDiff = getLeadingYear(b.year) - getLeadingYear(a.year);
    if (yearDiff !== 0) {
      return yearDiff;
    }
    return getItemTitle(a).localeCompare(getItemTitle(b));
  });
}

function getDefaultSelectedIds(items, initialIds) {
  const fallback = items.map((item) => item.id);
  if (!Array.isArray(initialIds) || !initialIds.length) {
    return fallback;
  }

  const idSet = new Set(fallback);
  const selected = initialIds.filter((id) => idSet.has(id));

  return selected.length ? selected : fallback;
}

function buildManualResume(inventory, selectedIdsBySection, profile) {
  const selectItems = (section) => {
    const items = inventory[section] ?? [];
    const ids = selectedIdsBySection[section] ?? [];

    return ids
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean);
  };

  return {
    profile,
    experience: selectItems("experience"),
    projects: selectItems("projects"),
    publications: selectItems("publications"),
    education: selectItems("education"),
    skills: selectItems("skills"),
    awards: selectItems("awards"),
  };
}

export default function ManualResumeBuilder({ inventory, initialSelection }) {
  const router = useRouter();
  const sortedProjectIds = sortItemsByYearDesc(inventory.projects).map((item) => item.id);
  const [selectedIdsBySection, setSelectedIdsBySection] = useState(() => ({
    experience: getDefaultSelectedIds(
      inventory.experience,
      initialSelection?.experience
    ),
    projects: getDefaultSelectedIds(
      inventory.projects,
      initialSelection?.projects ?? sortedProjectIds
    ),
    publications: getDefaultSelectedIds(
      inventory.publications,
      initialSelection?.publications
    ),
    education: getDefaultSelectedIds(
      inventory.education,
      initialSelection?.education
    ),
    skills: getDefaultSelectedIds(inventory.skills, initialSelection?.skills),
    awards: getDefaultSelectedIds(inventory.awards, initialSelection?.awards),
  }));
  const [dragState, setDragState] = useState(null);
  const [dropIndicator, setDropIndicator] = useState(null);

  const resume = useMemo(
    () =>
      buildManualResume(inventory, selectedIdsBySection, {
        ...inventory.profile,
        ...HARD_CODED_PROFILE,
      }),
    [inventory, selectedIdsBySection]
  );

  function toggleItem(section, itemId) {
    setSelectedIdsBySection((current) => {
      const selected = current[section] ?? [];
      const exists = selected.includes(itemId);

      return {
        ...current,
        [section]: exists
          ? selected.filter((id) => id !== itemId)
          : [...selected, itemId],
      };
    });
  }

  function handleDragStart(section, itemId) {
    setDragState({ section, itemId });
  }

  function handleDragOver(event, section, itemId) {
    if (!dragState || dragState.section !== section || dragState.itemId === itemId) {
      return;
    }

    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    const position = event.clientY < bounds.top + bounds.height / 2 ? "before" : "after";

    setDropIndicator((current) => {
      if (
        current?.section === section &&
        current?.itemId === itemId &&
        current?.position === position
      ) {
        return current;
      }

      return { section, itemId, position };
    });
  }

  function handleDrop(section, targetItemId) {
    if (
      !dragState ||
      !dropIndicator ||
      dragState.section !== section ||
      dropIndicator.section !== section
    ) {
      return;
    }

    setSelectedIdsBySection((current) => {
      const items = [...(current[section] ?? [])];
      const draggedIndex = items.indexOf(dragState.itemId);
      const targetIndex = items.indexOf(targetItemId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return current;
      }

      items.splice(draggedIndex, 1);
      const adjustedTargetIndex =
        draggedIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const insertIndex =
        dropIndicator.position === "before"
          ? adjustedTargetIndex
          : adjustedTargetIndex + 1;
      items.splice(insertIndex, 0, dragState.itemId);

      return {
        ...current,
        [section]: items,
      };
    });

    setDragState(null);
    setDropIndicator(null);
  }

  function handleDragEnd() {
    setDragState(null);
    setDropIndicator(null);
  }

  function handleDownloadPdf() {
    savePrintResume(resume);
    router.push("/print");
  }

  return (
    <main className="resume-builder min-h-screen px-4 py-8 md:px-8 md:py-12">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-8 xl:flex-row xl:items-start xl:justify-center">
        <section className="no-print w-full max-w-2xl space-y-8 xl:sticky xl:top-8">
          <div className="space-y-3">
            <h1 className="text-3xl leading-tight text-[var(--foreground)] md:text-5xl">
              {HARD_CODED_PROFILE.name}
            </h1>
            <p className="text-sm leading-7 text-[var(--muted)] md:text-base">
              {HARD_CODED_PROFILE.phone}
              <br />
              {HARD_CODED_PROFILE.email}
            </p>
            <p className="max-w-xl text-sm leading-7 text-[var(--muted)] md:text-base">
              Toggle any item to include or remove it. Drag selected items to reorder how they appear on the resume.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.18em]">
            <Link
              href="/"
              className="border border-[var(--line)] px-4 py-3 text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            >
              Back
            </Link>
            <button
              type="button"
              onClick={handleDownloadPdf}
              className="border border-[var(--line)] px-4 py-3 text-[var(--muted)] transition hover:border-[var(--foreground)] hover:text-[var(--foreground)]"
            >
              Download PDF
            </button>
          </div>

          <div className="space-y-8">
            {MANUAL_SECTIONS.map(({ key, title }) => {
              const allItems = inventory[key] ?? [];
              const selectedIds = selectedIdsBySection[key] ?? [];

              return (
                <section key={key} className="space-y-4 border-t border-[var(--line)] pt-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
                      {title}
                    </h2>
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {selectedIds.length} selected
                    </p>
                  </div>

                  <div className="space-y-2">
                    {orderItems(allItems, selectedIds).map((item) => {
                      const selected = selectedIds.includes(item.id);
                      const showBeforeIndicator =
                        selected &&
                        dropIndicator?.section === key &&
                        dropIndicator?.itemId === item.id &&
                        dropIndicator?.position === "before";
                      const showAfterIndicator =
                        selected &&
                        dropIndicator?.section === key &&
                        dropIndicator?.itemId === item.id &&
                        dropIndicator?.position === "after";
                      return (
                        <div key={item.id} className="space-y-2">
                          {showBeforeIndicator ? (
                            <div className="h-0.5 bg-[var(--foreground)]" />
                          ) : null}
                          <div
                            draggable={selected}
                            onDragStart={() => handleDragStart(key, item.id)}
                            onDragOver={(event) => handleDragOver(event, key, item.id)}
                            onDrop={() => handleDrop(key, item.id)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-start justify-between gap-4 border px-4 py-3 transition ${
                              selected
                                ? "border-[var(--foreground)] bg-[var(--sheet)]"
                                : "border-[var(--line)] text-[var(--muted)]"
                            }`}
                          >
                            <span>
                              <span className="block text-sm leading-7 text-[var(--foreground)]">
                                {getItemTitle(item)}
                              </span>
                              {getItemMeta(item) ? (
                                <span className="block text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                                  {getItemMeta(item)}
                                </span>
                              ) : null}
                            </span>
                            <div className="flex items-center gap-3">
                              {selected ? (
                                <span className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                                  Drag
                                </span>
                              ) : null}
                              <button
                                type="button"
                                onClick={() => toggleItem(key, item.id)}
                                className="border border-[var(--line)] px-3 py-2 text-xs uppercase tracking-[0.16em] text-[var(--foreground)] transition hover:border-[var(--foreground)]"
                              >
                                {selected ? "On" : "Off"}
                              </button>
                            </div>
                          </div>
                          {showAfterIndicator ? (
                            <div className="h-0.5 bg-[var(--foreground)]" />
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </section>

        <ResumeDocument resume={resume} />
      </div>
    </main>
  );
}
