// app/api/analytics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { verifyToken } from "@/lib/auth";
import { getToken } from "@/lib/cookies";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Secure route: Check authentication
    const token = await getToken();
    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    // Advanced Pipeline: Boolean aur String "true" dono types ko support karne ke liye modification
    const stats = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          totalViews: { $sum: { $ifNull: ["$views", 0] } },
          totalLikes: { $sum: { $ifNull: ["$likes", 0] } },
          // 🔑 FIX: Handles both true (boolean) and "true" (string) fallbacks
          aiGeneratedCount: {
            $sum: { 
              $cond: [
                { 
                  $or: [
                    { $eq: ["$aiGenerated", true] },
                    { $eq: ["$aiGenerated", "true"] }
                  ] 
                }, 
                1, 
                0
              ] 
            },
          },
          publishedCount: {
            $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
          },
          draftCount: {
            $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
          },
        },
      },
    ]);

    // Fallback metrics if collection is completely empty
    const analyticsData = stats[0] || {
      totalPosts: 0,
      totalViews: 0,
      totalLikes: 0,
      aiGeneratedCount: 0,
      publishedCount: 0,
      draftCount: 0,
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
    });
  } catch (error: any) {
    console.error("🔥 [Analytics API Error]:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}