import { NextResponse } from "next/server";

export function middleware(request) {
  void request;
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
