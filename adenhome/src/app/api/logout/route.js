// app/api/logout/route.js
import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ status: "logged_out" });

  response.cookies.set({
    name: "session",
    value: "",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return response;
}
