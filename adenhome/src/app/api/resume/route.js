import { NextResponse } from "next/server";
import {
  buildFallbackResume,
  createInventoryPreview,
  loadResumeInventory,
  materializeResumeSelection,
} from "@/lib/resumeContent";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const DEFAULT_MODEL = "openai/gpt-4o-mini";

function extractJson(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced) {
    return fenced[1].trim();
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return "";
}

async function selectWithOpenRouter(prompt, inventoryPreview) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return null;
  }

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL;
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:3000",
      "X-Title": process.env.OPENROUTER_SITE_NAME || "adenhome",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are selecting resume items for Aden Power. Do not write or rewrite any resume text. Return JSON only with keys experienceIds, projectIds, publicationIds, educationIds, skillIds, awardIds. Use only ids present in the inventory.",
        },
        {
          role: "user",
          content: JSON.stringify({
            userRequest: prompt,
            inventory: inventoryPreview,
          }),
        },
      ],
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with ${response.status}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (typeof text !== "string") {
    throw new Error("OpenRouter returned no message content");
  }

  const parsed = JSON.parse(extractJson(text));
  return {
    ...parsed,
    _model: model,
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";

    if (!prompt) {
      return NextResponse.json(
        { error: "A prompt is required to generate a resume." },
        { status: 400 }
      );
    }

    const inventory = await loadResumeInventory();
    const inventoryPreview = createInventoryPreview(inventory);

    try {
      const selection = await selectWithOpenRouter(prompt, inventoryPreview);
      if (selection) {
        const resume = materializeResumeSelection(inventory, selection, prompt, {
          source: selection._model || "openrouter",
        });
        return NextResponse.json({ resume });
      }
    } catch (error) {
      console.warn("AI resume selection failed, using fallback.", error);
    }

    const resume = buildFallbackResume(inventory, prompt);
    return NextResponse.json({ resume });
  } catch (error) {
    console.error("Failed to generate resume.", error);
    return NextResponse.json(
      { error: "Unable to generate resume right now." },
      { status: 500 }
    );
  }
}
