import { NextResponse, type NextRequest } from "next/server";

const publicPaths = new Set(["/", "/login", "/privacy", "/terms", "/public"]);
const protectedPrefixes = [
  "/dashboard",
  "/transactions",
  "/accounts",
  "/activity",
  "/reports",
  "/settings",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session =
    request.cookies.get("authjs.session-token") ||
    request.cookies.get("__Secure-authjs.session-token");
  const authenticated = !!session;

  if (publicPaths.has(pathname)) {
    if (authenticated && (pathname === "/" || pathname === "/login"))
      return NextResponse.redirect(new URL("/dashboard", request.url));
    return withSecurityHeaders(NextResponse.next());
  }

  if (pathname.startsWith("/invite/") || pathname === "/onboarding")
    return withSecurityHeaders(NextResponse.next());

  if (
    protectedPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )
  ) {
    if (!authenticated) {
      const login = new URL("/login", request.url);
      login.searchParams.set(
        "callbackUrl",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      return NextResponse.redirect(login);
    }
    return withSecurityHeaders(NextResponse.next());
  }

  return withSecurityHeaders(NextResponse.next());
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return response;
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
