import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";
export const COOKIE_NAME = ACCESS_TOKEN_COOKIE;

// Helper to get access token server-side
export async function getToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null;
  } catch (error) {
    return null;
  }
}

const isProduction = process.env.NODE_ENV === "production";

// Cookie options for maximum security
const getCookieOptions = (maxAge: number) => ({
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  maxAge,
  path: "/",
  // domain: isProduction ? ".yourdomain.com" : undefined, // Uncomment in production
});

// Set both tokens
export function setAuthCookies(
  accessToken: string,
  refreshToken: string,
  response: NextResponse
) {
  response.cookies.set(
    ACCESS_TOKEN_COOKIE,
    accessToken,
    getCookieOptions(15 * 60) // 15 minutes
  );
  response.cookies.set(
    REFRESH_TOKEN_COOKIE,
    refreshToken,
    getCookieOptions(7 * 24 * 60 * 60) // 7 days
  );
  return response;
}

// Clear both tokens (logout)
export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

// Get tokens from server components
export async function getAuthTokens() {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get(ACCESS_TOKEN_COOKIE)?.value || null,
    refreshToken: cookieStore.get(REFRESH_TOKEN_COOKIE)?.value || null,
  };
}

// Get tokens from middleware/API routes
export function getAuthTokensFromRequest(request: NextRequest) {
  return {
    accessToken: request.cookies.get(ACCESS_TOKEN_COOKIE)?.value || null,
    refreshToken: request.cookies.get(REFRESH_TOKEN_COOKIE)?.value || null,
  };
}

// Set tokens in server component redirect (rare use case)
export async function setAuthCookiesServer(
  accessToken: string,
  refreshToken: string
) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, getCookieOptions(15 * 60));
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, getCookieOptions(7 * 24 * 60 * 60));
}