import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });

  if (!session) {
    return NextResponse.redirect(new URL("/auth/sign-in", request.url));
  }

  const pathname = request.nextUrl.pathname;
  const role = session.user.role;

  const routeAccess = {
    USER: /^\/user(\/|$)/,
    PRODUCER: /^\/producer(\/|$)/,
    ADMIN: /^\/admin(\/|$)/,
  };

  if (
    (role === "USER" && !routeAccess.USER.test(pathname)) ||
    (role === "PRODUCER" && !routeAccess.PRODUCER.test(pathname)) ||
    (role === "ADMIN" && !routeAccess.ADMIN.test(pathname))
  ) {
    const redirectPath =
      role === "USER" ? "/user" : role === "PRODUCER" ? "/producer" : "/admin";
    return NextResponse.redirect(new URL(redirectPath, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/user/:path*", "/producer/:path*", "/admin/:path*"],
};
