import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const pathname = request.nextUrl.pathname;
  const role = session.user.role;

  if (pathname.startsWith("/user") && role !== "USER") {
    return NextResponse.redirect(new URL("/producer", request.url));
  }

  if (pathname.startsWith("/producer") && role !== "PRODUCER") {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/producer/:path*"],
};
