import { readFile } from "node:fs/promises";
import path from "node:path";
import { cache } from "react";

const CONTENT_PATH = path.join(process.cwd(), "content", "resume.md");
const SECTION_NAMES = [
  "profile",
  "summary",
  "experience",
  "projects",
  "publications",
  "education",
  "skills",
  "awards",
];

function normalizeValue(value) {
  if (value === "Present") {
    return value;
  }
  return value.trim();
}

function parseField(line) {
  const match = line.match(/^-\s+([^:]+):\s*(.*)$/);
  if (!match) {
    return null;
  }
  return {
    key: match[1].trim(),
    value: normalizeValue(match[2] ?? ""),
  };
}

function parseTags(value) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseMarkdownInventory(markdown) {
  const inventory = Object.fromEntries(SECTION_NAMES.map((section) => [section, []]));
  const profile = {};
  const lines = markdown.split(/\r?\n/);

  let section = null;
  let item = null;
  let activeListField = null;

  const pushItem = () => {
    if (!section || !item) {
      return;
    }
    inventory[section].push(item);
    item = null;
    activeListField = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      activeListField = null;
      continue;
    }

    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      pushItem();
      const nextSection = sectionMatch[1].trim().toLowerCase();
      section = SECTION_NAMES.includes(nextSection) ? nextSection : null;
      continue;
    }

    if (!section) {
      continue;
    }

    const itemMatch = line.match(/^###\s+(.+)$/);
    if (itemMatch) {
      pushItem();
      item = { id: itemMatch[1].trim() };
      activeListField = null;
      continue;
    }

    const listItemMatch = rawLine.match(/^\s{2}-\s+(.*)$/);
    if (listItemMatch && activeListField && item) {
      item[activeListField].push(listItemMatch[1].trim());
      continue;
    }

    const field = parseField(line);
    if (!field) {
      continue;
    }

    if (section === "profile") {
      profile[field.key] = field.key === "tags" ? parseTags(field.value) : field.value;
      continue;
    }

    if (!item) {
      continue;
    }

    if (!field.value) {
      item[field.key] = [];
      activeListField = field.key;
      continue;
    }

    item[field.key] = field.key === "tags" ? parseTags(field.value) : field.value;
    activeListField = null;
  }

  pushItem();

  return {
    profile,
    ...inventory,
  };
}

function scoreItem(item, promptTerms) {
  const haystack = [
    item.title,
    item.name,
    item.degree,
    item.organization,
    item.institution,
    item.subtitle,
    item.description,
    item.venue,
    item.text,
    ...(item.tags ?? []),
    ...(item.bullets ?? []),
    ...(item.highlights ?? []),
    ...(item.details ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return promptTerms.reduce((score, term) => {
    if (!term || term.length < 3) {
      return score;
    }
    return haystack.includes(term) ? score + 1 : score;
  }, 0);
}

function rankItems(items, prompt) {
  const promptTerms = prompt
    .toLowerCase()
    .split(/[^a-z0-9+#.-]+/i)
    .filter(Boolean);

  return [...items]
    .map((item) => ({ item, score: scoreItem(item, promptTerms) }))
    .sort((a, b) => b.score - a.score || a.item.id.localeCompare(b.item.id))
    .map(({ item }) => item);
}

function getLeadingYear(value) {
  const match = String(value ?? "").match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}

function sortByYearDesc(items) {
  return [...items].sort((a, b) => {
    const yearDiff = getLeadingYear(b.year) - getLeadingYear(a.year);
    if (yearDiff !== 0) {
      return yearDiff;
    }
    return (a.title ?? a.id ?? "").localeCompare(b.title ?? b.id ?? "");
  });
}

function sortEducationByRecency(items) {
  return [...items].sort((a, b) => {
    const aRecency = getLeadingYear(a.end) || getLeadingYear(a.start);
    const bRecency = getLeadingYear(b.end) || getLeadingYear(b.start);
    const recencyDiff = bRecency - aRecency;
    if (recencyDiff !== 0) {
      return recencyDiff;
    }
    return (a.degree ?? a.id ?? "").localeCompare(b.degree ?? b.id ?? "");
  });
}

export function buildFallbackResume(inventory, prompt) {
  const rankedExperience = rankItems(inventory.experience, prompt);
  const rankedProjects = sortByYearDesc(rankItems(inventory.projects, prompt));
  const rankedPublications = sortByYearDesc(
    rankItems(inventory.publications, prompt)
  );
  const rankedEducation = rankItems(inventory.education, prompt);
  const rankedSkills = rankItems(inventory.skills, prompt);
  const rankedAwards = rankItems(inventory.awards, prompt);

  return {
    prompt,
    profile: inventory.profile,
    experience: rankedExperience.slice(0, 3),
    projects: rankedProjects.slice(0, 3),
    publications: rankedPublications.slice(0, 3),
    education: rankedEducation.slice(0, 3),
    skills: rankedSkills.slice(0, 3),
    awards: rankedAwards.slice(0, 3),
    source: "fallback",
  };
}

export function materializeResumeSelection(inventory, selection, prompt, metadata = {}) {
  const pickByIds = (section, ids, maxItems = 3) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return [];
    }
    const items = inventory[section] ?? [];
    return ids
      .map((id) => items.find((item) => item.id === id))
      .filter(Boolean)
      .slice(0, maxItems);
  };

  const result = {
    prompt,
    profile: inventory.profile,
    experience: pickByIds("experience", selection.experienceIds, 4),
    projects: sortByYearDesc(pickByIds("projects", selection.projectIds, 8)),
    publications: sortByYearDesc(
      pickByIds("publications", selection.publicationIds, 6)
    ),
    education: pickByIds("education", selection.educationIds, 3),
    skills: pickByIds("skills", selection.skillIds, 3),
    awards: pickByIds("awards", selection.awardIds, 3),
    source: metadata.source ?? "openrouter",
  };

  if (!result.experience.length) {
    return buildFallbackResume(inventory, prompt);
  }

  if (!result.education.length) {
    result.education = sortEducationByRecency(inventory.education).slice(0, 2);
  }

  return result;
}

export const loadResumeInventory = cache(async function loadResumeInventory() {
  const markdown = await readFile(CONTENT_PATH, "utf8");
  return parseMarkdownInventory(markdown);
});

export function createInventoryPreview(inventory) {
  return {
    profile: inventory.profile,
    summary: inventory.summary.map(({ id, text, tags }) => ({ id, text, tags })),
    experience: inventory.experience.map(({ id, title, organization, tags }) => ({
      id,
      title,
      organization,
      tags,
    })),
    projects: inventory.projects.map(({ id, title, subtitle, tags }) => ({
      id,
      title,
      subtitle,
      tags,
    })),
    publications: inventory.publications.map(
      ({ id, title, description, venue, year, tags }) => ({
        id,
        title,
        description,
        venue,
        year,
        tags,
      })
    ),
    education: inventory.education.map(({ id, degree, institution, tags }) => ({
      id,
      degree,
      institution,
      tags,
    })),
    skills: inventory.skills.map(({ id, name, tags }) => ({ id, name, tags })),
    awards: inventory.awards.map(({ id, title, tags }) => ({ id, title, tags })),
  };
}
