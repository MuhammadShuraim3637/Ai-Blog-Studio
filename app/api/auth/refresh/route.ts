import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, generateAccessToken, generateRefreshToken } from "@/lib/auth";
import { getAuthTokensFromRequest, setAuthCookies } from "@/lib/cookies";
import User from "@/models/User";
import { connectDB } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { refreshToken } = getAuthTokensFromRequest(req);
    
    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: "No refresh token" },
        { status: 401 }
      );
    }

    // 🔑 FIX: Added 'await' because verifyRefreshToken is now asynchronous (jose)
    const payload = await verifyRefreshToken(refreshToken);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Invalid refresh token" },
        { status: 401 }
      );
    }

    // Get user from DB
    await connectDB();
    const user = await User.findById(payload.userId);
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "User not found or inactive" },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken(
      user._id.toString(),
      user.email,
      user.role
    );
    const newRefreshToken = generateRefreshToken(user._id.toString());

    const response = NextResponse.json(
      {
        success: true,
        message: "Token refreshed",
      },
      { status: 200 }
    );

    return setAuthCookies(newAccessToken, newRefreshToken, response);
    
  } catch (error) {
    console.error("Refresh error:", error);
    return NextResponse.json(
      { success: false, error: "Token refresh failed" },
      { status: 500 }
    );
  }
}