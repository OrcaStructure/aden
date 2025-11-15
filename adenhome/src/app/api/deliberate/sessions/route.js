// app/api/deliberate/sessions/route.js
import { NextResponse } from "next/server";
import { strapiFetch } from "@/lib/strapi";

// POST /api/deliberate/sessions
export async function POST(req) {
  const body = await req.json();

  const payload = {
    data: {
      totalMinutes: body.totalMinutes,
      plannedItems: body.planned,
      actualItems: body.actual,
      // If you want, you can also store createdAt or notes:
      // performedAt: body.createdAt,
      // label: body.label,
    },
  };

  const result = await strapiFetch("/api/deliberate-sessions", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return NextResponse.json(result);
}
