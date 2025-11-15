// app/deliberate/DeliberateApp.jsx
"use client";

import { useEffect, useState } from "react";
import ActivityDashboard from "./components/ActivityDashboard";
import SessionPlanner from "./components/SessionPlanner";
import SessionSaveBar from "./components/SessionSaveBar";

// ------- Tree helpers (pure JS, no Strapi here) -------

function findNodeByPath(tree, pathIds) {
  if (pathIds.length === 0) return null;
  let currentNodes = tree;
  let currentNode = null;

  for (const id of pathIds) {
    currentNode = currentNodes.find((n) => n.id === id) || null;
    if (!currentNode) break;
    currentNodes = currentNode.children || [];
  }
  return currentNode;
}

function getChildrenAtPath(tree, pathIds) {
  const node = findNodeByPath(tree, pathIds);
  if (!node) return tree; // root level
  return node.children || [];
}

function findNodeById(nodes, id) {
  for (const n of nodes) {
    if (n.id === id) return n;
    if (n.children?.length) {
      const childMatch = findNodeById(n.children, id);
      if (childMatch) return childMatch;
    }
  }
  return null;
}

// Recursively allocate minutes over the tree.
function allocateActivityTree(nodes, totalMinutes, parentPath = []) {
  const activeNodes = (nodes || []).filter((n) => (n.weight ?? 0) > 0);
  if (!activeNodes.length || totalMinutes <= 0) return [];

  const totalWeight = activeNodes.reduce((sum, n) => sum + n.weight, 0);
  let remaining = totalMinutes;

  const result = [];

  activeNodes.forEach((node, index) => {
    let allocated = Math.round((node.weight / totalWeight) * totalMinutes);
    if (index === activeNodes.length - 1) {
      allocated = remaining;
    } else {
      remaining -= allocated;
    }

    const path = [...parentPath, node.name];

    if (node.children && node.children.some((c) => (c.weight ?? 0) > 0)) {
      const childAllocations = allocateActivityTree(
        node.children,
        allocated,
        path
      );
      result.push(...childAllocations);
    } else {
      result.push({
        // NOTE: this uses the *relational* id (tree id)
        activityId: node.id,
        path,
        suggestedMinutes: allocated,
      });
    }
  });

  return result;
}

// ------- Main component -------

export default function DeliberateApp() {
  const [activityTree, setActivityTree] = useState([]);
  const [currentPath, setCurrentPath] = useState([]);

  const [loadingActivities, setLoadingActivities] = useState(false);
  const [activityError, setActivityError] = useState("");

  const [totalMinutes, setTotalMinutes] = useState(60);
  const [plan, setPlan] = useState([]);
  const [actualMinutes, setActualMinutes] = useState({});

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // ---- Load activities from Next API on mount ----

  useEffect(() => {
    const load = async () => {
      try {
        setLoadingActivities(true);
        setActivityError("");
        const res = await fetch("/api/deliberate/activities");
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Activities API response:", res.status, text);
          throw new Error("Failed to load activities");
        }
        const json = await res.json();
        // Expecting json.tree where each node has:
        // { id, documentId, name, weight, parentId, children: [...] }
        setActivityTree(json.tree || []);
      } catch (err) {
        console.error(err);
        setActivityError("Could not load activities");
      } finally {
        setLoadingActivities(false);
      }
    };
    load();
  }, []);

  const currentNode = findNodeByPath(activityTree, currentPath);
  const currentChildren = getChildrenAtPath(activityTree, currentPath);

  // ---- Navigation / breadcrumb ----

  function enterActivity(id) {
    setCurrentPath((prev) => [...prev, id]); // id = relational id
  }

  function goUpOneLevel() {
    setCurrentPath((prev) => prev.slice(0, -1));
  }

  const breadcrumb = (() => {
    if (!activityTree.length || currentPath.length === 0) return [];
    const names = [];
    let nodes = activityTree;
    for (const id of currentPath) {
      const n = nodes.find((x) => x.id === id);
      if (!n) break;
      names.push(n.name);
      nodes = n.children || [];
    }
    return names;
  })();

  // ---- Activity mutations via API ----

  async function refreshTreeFromServer() {
    const res = await fetch("/api/deliberate/activities");
    if (!res.ok) throw new Error("Failed to refresh activities");
    const json = await res.json();
    setActivityTree(json.tree || []);
  }

  async function addActivityAtCurrentLevel(name, weight) {
    try {
      const parentId =
        currentPath.length > 0 ? currentPath[currentPath.length - 1] : null;

      // parentId here is the *relational* id – the API route should
      // translate that into a relation on Strapi (children_activities).
      const res = await fetch("/api/deliberate/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          weight: Number(weight) || 1,
          parentId,
        }),
      });

      if (!res.ok) throw new Error("Failed to create activity");
      const json = await res.json();
      setActivityTree(json.tree || []);
    } catch (err) {
      console.error(err);
      setActivityError("Error saving activity");
    }
  }

  async function updateActivityWeight(id, weight, options = { immediate: true }) {
    const numeric = Number(weight) || 0;

    // 1) Update local state so the UI reflects what you typed (by relational id)
    setActivityTree((prev) => {
      const cloned = structuredClone(prev);

      function walk(nodes) {
        nodes.forEach((n) => {
          if (n.id === id) {
            n.weight = numeric;
          }
          if (n.children?.length) walk(n.children);
        });
      }

      walk(cloned);
      return cloned;
    });

    // 2) If we're not supposed to persist yet (just typing), bail here
    if (!options.immediate) return;

    // 3) Find the node so we can use its documentId for the PATCH URL
    const node = findNodeById(activityTree, id);
    const documentId = node?.documentId;

    if (!documentId) {
      console.error("No documentId found for activity with id=", id, node);
      setActivityError("Internal error: missing documentId for activity");
      return;
    }

    try {
      console.log(
        "updateActivityWeight: relational id=",
        id,
        "documentId=",
        documentId,
        "numeric=",
        numeric,
        "options=",
        options
      );

      const res = await fetch(`/api/deliberate/activities/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: numeric }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        console.error(
          "Failed to update activity. Status:",
          res.status,
          "Body:",
          text
        );
        throw new Error("Failed to update activity");
      }

      const json = await res.json();
      setActivityTree(json.tree || []);
    } catch (err) {
      console.error(err);
      setActivityError("Error updating activity");
    }
  }

  async function deleteActivity(id) {
    // Same pattern: translate relational id → documentId before DELETE
    const node = findNodeById(activityTree, id);
    const documentId = node?.documentId;

    if (!documentId) {
      console.error("No documentId found for delete, id=", id, node);
      setActivityError("Internal error: missing documentId for activity");
      return;
    }

    try {
      const res = await fetch(`/api/deliberate/activities/${documentId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete activity");
      const json = await res.json();
      setActivityTree(json.tree || []);
      setPlan([]);
      setActualMinutes({});
    } catch (err) {
      console.error(err);
      setActivityError("Error deleting activity");
    }
  }

  // ---- Plan building ----

  const buildPlan = () => {
    const allocations = allocateActivityTree(
      activityTree,
      Number(totalMinutes)
    );
    setPlan(allocations);

    const initialActuals = {};
    allocations.forEach((p) => {
      initialActuals[p.activityId] = p.suggestedMinutes;
    });
    setActualMinutes(initialActuals);
  };

  const handleActualChange = (activityId, value) => {
    setActualMinutes((prev) => ({
      ...prev,
      [activityId]: Number(value) || 0,
    }));
  };

  // ---- Save session to Strapi via API route ----

  const saveSession = async () => {
    if (!plan.length) return;

    const payload = {
      totalMinutes: Number(totalMinutes),
      planned: plan.map((p) => ({
        activityId: p.activityId, // relational id
        path: p.path,
        suggestedMinutes: p.suggestedMinutes,
      })),
      actual: plan.map((p) => ({
        activityId: p.activityId, // relational id
        path: p.path,
        actualMinutes: actualMinutes[p.activityId] ?? 0,
      })),
      createdAt: new Date().toISOString(),
    };

    try {
      setSaving(true);
      setMessage("");

      const res = await fetch("/api/deliberate/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save session");

      setMessage("Session saved 🎯");
    } catch (err) {
      console.error(err);
      setMessage("Error saving session");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-10">
      {loadingActivities && (
        <p className="text-xs text-gray-500">Loading activities…</p>
      )}
      {activityError && (
        <p className="text-xs text-red-400">{activityError}</p>
      )}

      <ActivityDashboard
        activities={currentChildren}
        breadcrumb={breadcrumb}
        onAddActivity={addActivityAtCurrentLevel}
        onUpdateWeight={updateActivityWeight}
        onDeleteActivity={deleteActivity}
        onEnterActivity={enterActivity}
        onGoUp={goUpOneLevel}
        showBack={currentPath.length > 0}
      />

      <SessionPlanner
        totalMinutes={totalMinutes}
        onTotalMinutesChange={setTotalMinutes}
        plan={plan}
        actualMinutes={actualMinutes}
        onBuildPlan={buildPlan}
        onActualChange={handleActualChange}
      />

      <SessionSaveBar
        hasPlan={plan.length > 0}
        saving={saving}
        message={message}
        onSave={saveSession}
      />
    </div>
  );
}
