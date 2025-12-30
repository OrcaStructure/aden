import { NextResponse } from "next/server";

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return NextResponse.json(
      { error: "Missing Google OAuth env vars" },
      { status: 500 }
    );
  }

  const url = new URL(request.url);
  const dateKey = url.searchParams.get("date");
  const baseDate = dateKey ? new Date(`${dateKey}T00:00:00`) : new Date();
  const startOfDay = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    0,
    0,
    0
  );
  const endOfDay = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    23,
    59,
    59
  );

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Failed to refresh token", details: tokenData },
      { status: 500 }
    );
  }

  const eventsResponse = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events?${new URLSearchParams(
      {
        timeMin: startOfDay.toISOString(),
        timeMax: endOfDay.toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
      }
    ).toString()}`,
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    }
  );

  const eventsData = await eventsResponse.json();
  if (!eventsResponse.ok) {
    return NextResponse.json(
      { error: "Failed to fetch events", details: eventsData },
      { status: 500 }
    );
  }

  const events = (eventsData.items || []).map((event) => {
    const start = event.start?.dateTime || event.start?.date || null;
    const end = event.end?.dateTime || event.end?.date || null;
    if (!start || !end) {
      return null;
    }
    return {
      id: event.id,
      title: event.summary || "Calendar event",
      start,
      end,
      allDay: Boolean(event.start?.date),
    };
  });

  return NextResponse.json({ events: events.filter(Boolean) });
}
