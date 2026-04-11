import fs from "node:fs/promises";
import path from "node:path";

const OUTPUTS_DIR = path.join(process.cwd(), "public", "outputs");
const OUTPUTS_METADATA_PATH = path.join(process.cwd(), "content", "outputs.json");

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function prettyTitle(filename) {
  const base = filename.replace(/\.pdf$/i, "");
  return base
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sanitizeText(value) {
  if (typeof value !== "string") {
    return "";
  }
  return value.trim();
}

async function loadOutputsMetadata() {
  try {
    const raw = await fs.readFile(OUTPUTS_METADATA_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return new Map();
    }

    const byFilename = new Map();
    for (const item of parsed) {
      if (!item || typeof item !== "object") {
        continue;
      }
      const filename = sanitizeText(item.filename);
      if (!filename) {
        continue;
      }
      byFilename.set(filename, {
        title: sanitizeText(item.title),
        description: sanitizeText(item.description),
      });
    }
    return byFilename;
  } catch (error) {
    if (error && (error.code === "ENOENT" || error.name === "SyntaxError")) {
      return new Map();
    }
    throw error;
  }
}

function buildOutputRecord(filename, metadata = null) {
  const title = sanitizeText(metadata?.title) || prettyTitle(filename);
  const description = sanitizeText(metadata?.description);
  const safeTitle = title || "Untitled";

  return {
    filename,
    slug: slugify(safeTitle),
    title: safeTitle,
    description,
    pdfPath: `/outputs/${encodeURIComponent(filename)}`,
  };
}

export async function listOutputs() {
  try {
    const metadataByFilename = await loadOutputsMetadata();
    const entries = await fs.readdir(OUTPUTS_DIR, { withFileTypes: true });
    const baseOutputs = entries
      .filter((entry) => entry.isFile() && /\.pdf$/i.test(entry.name))
      .map((entry) =>
        buildOutputRecord(entry.name, metadataByFilename.get(entry.name) ?? null)
      )
      .sort((a, b) => a.title.localeCompare(b.title));

    const slugCount = new Map();
    return baseOutputs.map((item) => {
      const seen = slugCount.get(item.slug) ?? 0;
      slugCount.set(item.slug, seen + 1);
      if (seen === 0) {
        return item;
      }
      return { ...item, slug: `${item.slug}-${seen + 1}` };
    });
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

export async function getOutputBySlug(slug) {
  const outputs = await listOutputs();
  return outputs.find((item) => item.slug === slug) ?? null;
}
