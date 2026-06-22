import { NextRequest, NextResponse } from "next/server";
import { clearAuthCookies } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  try {
    const response = NextResponse.json(
      {
        success: true,
        message: "Logged out successfully",
      },
      { status: 200 }
    );

    return clearAuthCookies(response);
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "Logout failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}