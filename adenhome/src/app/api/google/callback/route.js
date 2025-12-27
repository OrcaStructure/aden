import { NextResponse } from "next/server";

export async function GET(request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      { error: "Missing Google OAuth env vars" },
      { status: 500 }
    );
  }

  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Failed to exchange code", details: tokenData },
      { status: 500 }
    );
  }

  const refreshToken = tokenData.refresh_token;
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Google Calendar Connected</title>
    <style>
      body { font-family: ui-sans-serif, system-ui; padding: 24px; }
      code { display: block; padding: 12px; background: #111; color: #fff; }
    </style>
  </head>
  <body>
    <h2>Google Calendar Connected</h2>
    <p>Add this to <code>adenhome/.env.local</code>:</p>
    <code>GOOGLE_REFRESH_TOKEN=${refreshToken || ""}</code>
    <p>Then restart the dev server.</p>
  </body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}
