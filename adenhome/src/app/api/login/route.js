// app/api/login/route.js
import { NextResponse } from "next/server";
import { adminAuth } from "../../../lib/firebaseAdmin";

export async function POST(request) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: "Missing idToken" },
        { status: 400 }
      );
    }

    // Session expiry: 5 days (in milliseconds)
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const response = NextResponse.json({ status: "success" });

    response.cookies.set({
      name: "session",
      value: sessionCookie,
      maxAge: expiresIn / 1000, // seconds
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Error creating session cookie:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
