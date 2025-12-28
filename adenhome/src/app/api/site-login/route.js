import { NextResponse } from "next/server";

const AUTH_COOKIE = "site_auth";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 45;

export async function POST(request) {
  const { password, nextPath } = await request.json();
  const sitePassword = process.env.SITE_PASSWORD;

  if (!sitePassword) {
    return NextResponse.json(
      { error: "SITE_PASSWORD is not set." },
      { status: 500 }
    );
  }

  if (!password || password !== sitePassword) {
    return NextResponse.json(
      { error: "Invalid password." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    redirect: nextPath || "/",
  });

  response.cookies.set({
    name: AUTH_COOKIE,
    value: "ok",
    maxAge: MAX_AGE_SECONDS,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
