// lib/strapi.js

const STRAPI_API_URL = process.env.STRAPI_API_URL?.replace(/\/+$/, "");
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

if (!STRAPI_API_URL || !STRAPI_API_TOKEN) {
  console.warn("Missing STRAPI_API_URL or STRAPI_API_TOKEN env vars");
}

/**
 * Thin wrapper around fetch for talking to Strapi.
 */
export async function strapiFetch(path, options = {}) {
  const url = `${STRAPI_API_URL}${path}`;

  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Strapi error", res.status, text);
    throw new Error(`Strapi request failed: ${res.status}`);
  }

  return res.json();
}

/**
 * Fetch all practice-activities from Strapi and build a tree.
 *
 * Conventions:
 * - item.id          → Strapi's *relational* primary key (used for parent/child relations)
 * - item.documentId  → Strapi's *document* id (used for PATCH/DELETE)
 *
 * Returned node shape:
 * {
 *   id: number,              // relational id (for relations & local navigation)
 *   documentId: string|null, // document id (for updates/deletes)
 *   name: string,
 *   weight: number,
 *   parentId: number|null,   // relational parent's id
 *   children: ActivityNode[],
 * }
 */
export async function fetchPracticeActivityTree() {
  const res = await strapiFetch(
    "/api/practice-activities" +
      "?populate[parent_activity]=true" +
      "&pagination[pageSize]=1000"
  );

  const rawItems = Array.isArray(res?.data) ? res.data : [];

  // First pass: normalise items to our internal node shape
  const flatNodes = rawItems.map((item) => {
    // Support both classic v4 style (item.attributes) and "flat" style (item.*)
    const attrs = item.attributes ?? item ?? {};

    // parent_activity can be:
    // - { data: { id, ... } }
    // - { id, ... }
    // - null / undefined
    let parentId = null;
    const parentRel = attrs.parent_activity ?? attrs.parent_activity?.data;

    if (parentRel) {
      if (Array.isArray(parentRel)) {
        // Just in case it's an array, grab the first
        parentId = parentRel[0]?.id ?? null;
      } else if (parentRel.data) {
        parentId = parentRel.data?.id ?? null;
      } else if (typeof parentRel === "object" && parentRel.id != null) {
        parentId = parentRel.id;
      }
    }

    return {
      // Relational id from Strapi – used for relations & in-memory tree
      id: item.id,

      // Document id – used for PATCH/DELETE endpoints
      documentId: item.documentId ?? attrs.documentId ?? null,

      name: attrs.name ?? "Untitled activity",
      weight:
        typeof attrs.weight === "number" && !Number.isNaN(attrs.weight)
          ? attrs.weight
          : 1,

      parentId,
      children: [],
    };
  });

  // Second pass: wire up parent/child using the *relational* id
  const byId = new Map(flatNodes.map((n) => [n.id, n]));

  flatNodes.forEach((node) => {
    if (node.parentId != null) {
      const parent = byId.get(node.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  // Roots are those without a parentId
  const roots = flatNodes.filter((n) => n.parentId == null);

  console.log("TREE FROM STRAPI:", JSON.stringify(roots, null, 2));
  return roots;
}
