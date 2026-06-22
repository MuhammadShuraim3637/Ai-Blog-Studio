// lib/auth.ts
import jwt from "jsonwebtoken";
import { jwtVerify } from "jose"; // 🔑 Import jose for Edge runtime verification

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET || JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = "15m"; // 15 minutes
const REFRESH_TOKEN_EXPIRY = "7d"; // 7 days

// 🔑 SAFE ENVIRONMENT VERIFICATION:
// Throw error tabhi karein jab hum actual runtime par kaam kar rahe hon, taake build time par Next.js crash na ho.
if (!JWT_SECRET) {
  console.warn("⚠️ CRITICAL WARNING: JWT_SECRET is missing in environment variables (.env.local)");
}

export interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  type: "access";
}

export interface RefreshTokenPayload {
  userId: string;
  type: "refresh";
}

// Generate access token (short-lived) - Node.js backend par chalta hai
export function generateAccessToken(userId: string, email: string, role: string): string {
  const payload: AccessTokenPayload = {
    userId,
    email,
    role,
    type: "access",
  };
  
  return jwt.sign(payload, JWT_SECRET || "fallback_secret_key_if_missing", {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

// Generate refresh token (long-lived)
export function generateRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = {
    userId,
    type: "refresh",
  };
  
  return jwt.sign(payload, REFRESH_SECRET || "fallback_secret_key_if_missing", {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
}

// 🔑 FIXED: Async verification compatible with Next.js Edge Runtime
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    if (!token) return null;
    
    // Secret ko TextEncoder ke zariye byte array mein convert karna lazmi hai jose ke liye
    const secretKey = new TextEncoder().encode(JWT_SECRET || "fallback_secret_key_if_missing");
    const { payload } = await jwtVerify(token, secretKey);
    
    const decoded = payload as unknown as AccessTokenPayload;
    if (decoded.type !== "access") return null;
    return decoded;
  } catch (error) {
    console.error("❌ JWT Verification Error in Middleware/Proxy:", error);
    return null;
  }
}

// Alias for general token verification
export async function verifyToken(token: string): Promise<AccessTokenPayload | null> {
  return await verifyAccessToken(token);
}

// Verify refresh token (Node.js/Edge dual compatible safely)
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    if (!token) return null;
    const secretKey = new TextEncoder().encode(REFRESH_SECRET || "fallback_secret_key_if_missing");
    const { payload } = await jwtVerify(token, secretKey);
    
    const decoded = payload as unknown as RefreshTokenPayload;
    if (decoded.type !== "refresh") return null;
    return decoded;
  } catch (error) {
    return null;
  }
}

// Refresh access token using refresh token (with database user context or token encoding fallback)
// 💡 TIP: Ideally naya token banate waqt User database fetch karke email aur role nikaalna chahiye,
// ya phir payload ke andar basic role context pehle se pass karwana chahiye.
export async function refreshAccessToken(
  refreshToken: string, 
  userContext?: { email: string; role: string }
): Promise<{ accessToken: string } | null> {
  const payload = await verifyRefreshToken(refreshToken);
  if (!payload) return null;
  
  // Empty strings ke bajaye passed context, ya default safety values use karein
  const email = userContext?.email || "";
  const role = userContext?.role || "user";
  
  const accessToken = generateAccessToken(payload.userId, email, role);
  return { accessToken };
}