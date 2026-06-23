// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { verifyToken, verifyRefreshToken } from "@/lib/auth";
import { getAuthTokens } from "@/lib/cookies";
import mongoose from "mongoose";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET - Fetch posts
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

    const query: any = {};
    
    // Auth fallback
    let user: any = null;
    try {
      const tokens = await getAuthTokens();
      if (tokens && tokens.accessToken) {
        user = await verifyToken(tokens.accessToken);
      }
      if (!user && tokens && tokens.refreshToken) {
        user = await verifyRefreshToken(tokens.refreshToken);
      }
    } catch (authErr) {
      console.log("Auth token parsing ignored for isolation logic");
    }
    
    // Strict multi-tenant structure
    if (authorParam && authorParam !== "undefined" && authorParam !== "null") {
      // Fetch specific author's posts
      try { 
        query.author = new mongoose.Types.ObjectId(authorParam); 
      } catch (e) { 
        query.author = authorParam; 
      }
      // For specific author, only show published posts unless status is explicitly specified
      query.status = status || "published";
    } else {
      // For all other cases (logged-in users or anonymous), show only published posts
      query.status = "published";
    }

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
    
    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const response = NextResponse.json({
      success: true,
      data: posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    return response;

  } catch (error: any) {
    console.error("CRITICAL GET POSTS ERROR:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST - Create new post
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { accessToken } = await getAuthTokens();
    if (!accessToken) {
      return NextResponse.json({ success: false, error: "No token found" }, { status: 401 });
    }

    let user: any = null;
    try {
      user = await verifyToken(accessToken);
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid token" }, { status: 401 });
    }

    const authorId = user?.userId;
    if (!authorId) {
      return NextResponse.json({ success: false, error: "Author ID missing" }, { status: 400 });
    }

    let body: any = null;
    try { body = await req.json(); } catch (e) {
      return NextResponse.json({ success: false, error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const cleanAiGeneratedFlag = body.aiGenerated === true || !!body.aiPrompt || !!body.aiModel;

    const post = await Post.create({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      status: body.status || "published",
      tags: body.tags || [],
      categories: body.categories || [],
      aiGenerated: cleanAiGeneratedFlag,
      aiPrompt: body.aiPrompt || undefined,
      aiModel: body.aiModel || undefined,
      aiSettings: body.aiSettings || undefined,
      author: authorId,
    });

    return NextResponse.json({ success: true, data: post, message: "Post created successfully" }, { status: 201 });

  } catch (error: any) {
    console.error("CRITICAL POST CREATION ERROR:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}