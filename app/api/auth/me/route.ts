import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { COOKIE_NAME } from "@/lib/cookies";
import { sanitizeUser } from "@/lib/utils";

export async function GET(request: NextRequest) {
  try {
    // 1. Pehle check karo agar middleware ne headers mein user details already inject kardi hain
    const headerUserId = request.headers.get("x-user-id");

    let userId = headerUserId;

    // 2. Agar headers mein nahi mila, to cookie se fallback verify karo
    if (!userId) {
      const token = request.cookies.get(COOKIE_NAME)?.value;

      if (!token) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Token missing" },
          { status: 401 }
        );
      }

      // 🔑 FIX: Added 'await' because verifyToken is now asynchronous (jose fix)
      const payload = await verifyToken(token);

      if (!payload) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: Invalid token" },
          { status: 401 }
        );
      }

      userId = payload.userId;
    }

    // 3. Database se user profile fetch karo
    await connectDB();
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return NextResponse.json(
        { success: false, error: "User not found or disabled" },
        { status: 404 }
      );
    }

    // 4. Return successful logged in user profile
    return NextResponse.json({
      success: true,
      data: sanitizeUser(user),
    });

  } catch (error) {
    console.error("❌ [ME API ERROR]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}