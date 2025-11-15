// app/api/deliberate/activities/[id]/route.js
import { NextResponse } from "next/server";
import { fetchPracticeActivityTree, strapiFetch } from "@/lib/strapi";

// For debugging only
export async function GET(req, context) {
  const { id } = (await context.params) || {};

  if (!id) {
    return NextResponse.json(
      { error: "Missing id param in URL" },
      { status: 400 }
    );
  }

  const res = await strapiFetch(`/api/practice-activities/${id}`, {
    method: "GET",
  });
  console.log("GET REQUEST TESTED");

  return NextResponse.json(res);
}

// PATCH /api/deliberate/activities/:id
// Body: { weight?: number, name?: string }
export async function PATCH(req, context) {
  const { id } = (await context.params) || {};

  if (!id) {
    return NextResponse.json(
      { error: "Missing id param in URL" },
      { status: 400 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch (e) {
    console.error("PATCH parse body error:", e);
    return NextResponse.json(
      { error: "Invalid JSON body", details: String(e) },
      { status: 400 }
    );
  }

  console.log("🔵 PATCH /activities incoming", { id, body });

  // 1) Fetch the existing entry WITH relations so we can preserve them
  let existing;
  try {
    existing = await strapiFetch(
      `/api/practice-activities/${id}?populate[children_activities]=true&populate[parent_activity]=true`,
      { method: "GET" }
    );
  } catch (err) {
    console.error("Failed to fetch existing activity before PATCH:", err);
    return NextResponse.json(
      { error: "Failed to load existing activity", details: String(err) },
      { status: 500 }
    );
  }

  const existingData = existing?.data;

  // Your strapiFetch appears to flatten attributes onto `data`,
  // but we also support the raw Strapi `.attributes` shape just in case.
  const attrs =
    existingData?.attributes != null
      ? existingData.attributes
      : existingData || {};

  console.log("🟡 Existing before update", {
    id: existingData?.id,
    name: attrs.name,
    weight: attrs.weight,
    parent_activity_raw: attrs.parent_activity,
    children_activities_raw: attrs.children_activities,
  });

  // 2) Scalars you actually want to change
  const data = {};
  if (body.weight !== undefined) data.weight = body.weight;
  if (body.name !== undefined) data.name = body.name;

  // 3) Relations to PRESERVE exactly as they are now
  const relations = {};

  // children_activities may be:
  // - an array of objects: [{ id, ... }, ...]
  // - an array of ids: [1, 2, 3]
  // - a Strapi relation object: { data: [{ id, ... }, ...] }
  const childrenRel = attrs.children_activities;
  if (childrenRel) {
    if (Array.isArray(childrenRel)) {
      relations.children_activities = childrenRel.map((child) =>
        typeof child === "number" ? child : child.id
      );
    } else if (Array.isArray(childrenRel.data)) {
      relations.children_activities = childrenRel.data.map((child) => child.id);
    }
  }

  // parent_activity may be:
  // - a number: 58
  // - an object with id: { id: 58, ... }
  // - Strapi shape: { data: { id: 58, ... } }
  const parentRel = attrs.parent_activity;
  if (parentRel) {
    if (typeof parentRel === "number") {
      relations.parent_activity = parentRel;
    } else if (parentRel.id) {
      relations.parent_activity = parentRel.id;
    } else if (parentRel.data?.id) {
      relations.parent_activity = parentRel.data.id;
    }
  }

  const payload = { ...data, ...relations };

  console.log("🧾 Payload to Strapi", { id, payload });

  try {
    const strapiRes = await strapiFetch(`/api/practice-activities/${id}`, {
      // Strapi in your setup only allows PUT here
      method: "PUT",
      body: JSON.stringify({ data: payload }),
    });

    if (!strapiRes || !strapiRes.data) {
      console.error("Strapi update returned no data:", strapiRes);
      return NextResponse.json(
        { error: "Strapi update returned no data" },
        { status: 500 }
      );
    }

    console.log("🟢 Strapi response after update (id, name, weight)", {
      id: strapiRes?.data?.id,
      name:
        strapiRes?.data?.attributes?.name ?? strapiRes?.data?.name,
      weight:
        strapiRes?.data?.attributes?.weight ?? strapiRes?.data?.weight,
    });

    const tree = await fetchPracticeActivityTree();
    console.log(
      "🌲 Node in tree matching updated numeric id",
      tree.find((n) => n.id === existingData?.id)
    );

    return NextResponse.json({ tree });
  } catch (err) {
    console.error("PATCH /api/deliberate/activities/:id error:", err);
    return NextResponse.json(
      {
        error: "Failed to update activity (server error)",
        details: String(err),
      },
      { status: 500 }
    );
  }
}
