// src/lib/auth.js
import { cookies } from "next/headers";
import { adminAuth } from "./firebaseAdmin";

export async function getCurrentUser() {
  // In Next.js 16, cookies() is async
  const cookieStore = await cookies();

  const sessionCookieObj = cookieStore.get("session");
  const sessionCookie = sessionCookieObj?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decoded; // uid, email, etc.
  } catch (error) {
    console.error("verifySessionCookie error:", error);
    return null;
  }
}
