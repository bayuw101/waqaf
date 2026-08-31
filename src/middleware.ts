import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");

  if (session) return NextResponse.next();

  const login = new URL("/login", request.url);
  login.searchParams.set("callbackUrl", request.nextUrl.href);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: [
    "/((?!api/auth|login|onboarding|public|_next/static|_next/image|favicon.ico).*)",
  ],
};
