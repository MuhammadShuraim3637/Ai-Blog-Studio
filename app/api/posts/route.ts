// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { verifyToken, verifyRefreshToken } from "@/lib/auth";
import { getAuthTokens } from "@/lib/cookies";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';

// GET - Fetch posts (Strict multi-tenant isolation for logged-in user dashboard)
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const tag = searchParams.get("tag");
    const search = searchParams.get("search");
    const authorParam = searchParams.get("author");

    // Clear and explicit query database object
    const query: any = {};
    
    // 🔑 Securely fetch access and refresh tokens from system cookies
    const { accessToken, refreshToken } = await getAuthTokens();
    
    let user: any = null;
    if (accessToken) {
      user = await verifyToken(accessToken);
    } 
    
    // Fallback if access token is temporarily expired
    if (!user && refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        user = refreshPayload;
      }
    }
    
    // 🎯 CONTROL VISIBILITY LAYER
    if (!user) {
      // 1. Guest User: Sirf published data dikhao
      query.status = "published";
      if (authorParam) {
        try { query.author = new mongoose.Types.ObjectId(authorParam); } catch (e) { query.author = authorParam; }
      }
    } else {
      // 2. Logged-in Dashboard User: Enforce strict identity filters
      const loggedInUserId = user.userId || user.id || user._id;
      
      if (loggedInUserId) {
        // Enforce ownership control: Isolate dashboard records to current profile
        query.author = new mongoose.Types.ObjectId(loggedInUserId);
        
        // Status explicitly checked from user dashboard panel views (draft vs published)
        if (status) {
          query.status = status;
        }
      } else {
        query.status = "published";
      }
    }

    // Common extra search parameters filtering
    if (category) query.categories = category;
    if (tag) query.tags = tag;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;
    
    // Fetch count and document payload simultaneously
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email avatar")
        .sort({ createdAt: -1 }) // Sort cleanly by latest creation order
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("CRITICAL GET POSTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: "Internal Server Error occurred fetching records" },
      { status: 500 }
    );
  }
}