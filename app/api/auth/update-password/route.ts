// app/api/auth/update-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyToken } from "@/lib/auth";
import { getToken } from "@/lib/cookies";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken();
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, error: "User profile not found" }, { status: 404 });
    }

    // Compare stored bcrypt hash
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ success: false, error: "Incorrect current password" }, { status: 400 });
    }

    // Salt and hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("🔥 [Update Password API Error]:", error);
    return NextResponse.json({ success: false, error: "Internal server update error" }, { status: 500 });
  }
}