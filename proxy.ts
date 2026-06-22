import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/cookies";

// 🔓 Public pages jahan baghair login ke jaa sakte hain
const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/blog", "/posts"];

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Next.js internal files, assets aur static images ko bypass karein
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/static/') ||
    pathname.match(/\.(.*)$/) // Har qism ki file extensions (.jpg, .png, .css, etc.)
  ) {
    return NextResponse.next();
  }

  // Auth internal APIs ko bypass karo taake login/signup block na ho
  if (pathname.startsWith('/api/auth/login') || pathname.startsWith('/api/auth/signup')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  // 2. Check karein ke current path public route hai ya nahi
  const isPublicRoute = PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // 3. API route check
  const isApiRoute = pathname.startsWith("/api/");

  // ─── LOGIN/SIGNUP REDIRECT LOGIC ───
  if (token && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ─── PROTECTED ROUTES ACCESS VALIDATION ───
  if (!isPublicRoute) {
    // Agar token nahi hai to foran login par bhejo
    if (!token) {
      if (isApiRoute) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Token missing" },
          { status: 401 }
        );
      }
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname); // 🔑 reload dynamic parameter tracking
      return NextResponse.redirect(loginUrl);
    }

    // Token verify karein
    const user = await verifyToken(token);

    if (!user) {
      if (isApiRoute) {
        const response = NextResponse.json(
          { success: false, error: "Unauthorized: Invalid or expired token" },
          { status: 401 }
        );
        response.cookies.delete(COOKIE_NAME);
        return response;
      }
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Admin access check
    if (pathname.startsWith("/admin") && user.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // 🔑 Secure Headers Injection for APIs (Aapki existing working logic)
    if (isApiRoute) {
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set("x-user-id", user.userId);
      requestHeaders.set("x-user-email", user.email || "");
      requestHeaders.set("x-user-role", user.role || "user");

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }
  }

  // Agar user authenticated hai aur protected route par hi reload kar raha hai, to use wahin rehne do!
  return NextResponse.next();
}

// Next.js Optimized Matcher Configuration
export const config = {
  matcher: [
    "/((?!api/public|_next/static|_next/image|favicon.ico|public|assets).*)",
  ],
};