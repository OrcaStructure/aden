"use client";

import React, { useEffect, useMemo, useState } from "react";
import { doc, getDoc, getFirestore, setDoc } from "firebase/firestore";
import { app } from "../../lib/firebaseClient";

const MARKDOWN_DOC = { collection: "planner", id: "markdown" };

function escapeHtml(input) {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMarkdown(markdown) {
  const codeBlocks = [];
  let safe = markdown.replace(/```([\s\S]*?)```/g, (_, code) => {
    const escaped = escapeHtml(code.trim());
    const index = codeBlocks.length;
    codeBlocks.push(`<pre><code>${escaped}</code></pre>`);
    return `@@CODEBLOCK_${index}@@`;
  });

  safe = escapeHtml(safe);
  const lines = safe.split(/\r?\n/);
  const html = [];
  let inList = false;

  const flushList = () => {
    if (inList) {
      html.push("</ul>");
      inList = false;
    }
  };

  const inlineFormat = (text) =>
    text
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>");

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushList();
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const content = inlineFormat(headingMatch[2]);
      html.push(`<h${level}>${content}</h${level}>`);
      continue;
    }

    const listMatch = line.match(/^[-*]\s+(.*)$/);
    if (listMatch) {
      if (!inList) {
        html.push("<ul>");
        inList = true;
      }
      html.push(`<li>${inlineFormat(listMatch[1])}</li>`);
      continue;
    }

    flushList();
    html.push(`<p>${inlineFormat(line)}</p>`);
  }

  flushList();

  return html
    .join("\n")
    .replace(/@@CODEBLOCK_(\d+)@@/g, (_, index) => codeBlocks[Number(index)]);
}

export default function MarkdownPage() {
  const [content, setContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saveStatus, setSaveStatus] = useState("idle");
  const db = useMemo(() => getFirestore(app), []);

  useEffect(() => {
    const fetchMarkdown = async () => {
      try {
        const snapshot = await getDoc(
          doc(db, MARKDOWN_DOC.collection, MARKDOWN_DOC.id)
        );
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (typeof data.content === "string") {
            setContent(data.content);
            setIsEditing(false);
            return;
          }
        }
      } catch (error) {
        console.warn("Failed to load markdown content.", error);
      }
      setContent("# Markdown Notes\n\nStart writing here...");
      setIsEditing(false);
    };
    fetchMarkdown();
  }, [db]);

  const preview = useMemo(() => renderMarkdown(content), [content]);

  const handleSave = async () => {
    setSaveStatus("saving");
    try {
      await setDoc(
        doc(db, MARKDOWN_DOC.collection, MARKDOWN_DOC.id),
        {
          content,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
      setSaveStatus("saved");
      setIsEditing(false);
    } catch (error) {
      console.warn("Failed to save markdown content.", error);
      setSaveStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Markdown Editor</h1>
            <p className="text-sm text-gray-600">
              Use the big buttons to switch between editing and preview.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className={`px-6 py-3 text-lg font-semibold rounded-lg border ${
                isEditing
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-6 py-3 text-lg font-semibold rounded-lg border ${
                !isEditing
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-900 border-gray-300"
              }`}
            >
              Save
            </button>
            <span className="text-xs text-gray-500">
              {saveStatus === "saving" && "Saving..."}
              {saveStatus === "saved" && "Saved"}
              {saveStatus === "error" && "Save failed"}
            </span>
          </div>
        </header>

        <div className="bg-white shadow-lg rounded-xl p-6">
          {isEditing ? (
            <textarea
              className="w-full min-h-[60vh] border border-gray-300 rounded-lg p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-400"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          ) : (
            <div
              className="markdown-preview space-y-4 text-gray-800"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          )}
        </div>
      </div>

      <style jsx global>{`
        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          margin-top: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .markdown-preview p {
          line-height: 1.6;
        }
        .markdown-preview ul {
          list-style: disc;
          padding-left: 1.5rem;
        }
        .markdown-preview code {
          background: #f3f4f6;
          padding: 0.15rem 0.35rem;
          border-radius: 0.25rem;
          font-size: 0.9em;
        }
        .markdown-preview pre {
          background: #111827;
          color: #f9fafb;
          padding: 1rem;
          border-radius: 0.75rem;
          overflow-x: auto;
        }
      `}</style>
    </div>
  );
}
