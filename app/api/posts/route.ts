// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { verifyToken } from "@/lib/auth";
import { getToken } from "@/lib/cookies";

// GET - Fetch all posts (public)
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
    const author = searchParams.get("author");

    const query: any = {};
    
    const token = await getToken();
    const user = token ? await verifyToken(token) : null;
    
    if (!user) {
      query.status = "published";
    } else if (status) {
      query.status = status;
    }

    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    
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
        .sort({ publishedAt: -1, createdAt: -1 })
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
    console.error("Get posts error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch posts" },
      { status: 500 }
    );
  }
}

// POST - Create new post (authenticated)
export async function POST(req: NextRequest) {
  try {
    console.log("=== [1] POST API HIT STARTED ===");
    await connectDB();
    
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Auth Error: No cookies/token found in request" },
        { status: 401 }
      );
    }

    let user: any = null;
    try {
      user = await verifyToken(token);
      console.log("=== [4] DECODED USER OBJECT ==:", user);
    } catch (tokenErr: any) {
      console.error("=== Token Verification Failed ==:", tokenErr);
      return NextResponse.json(
        { success: false, error: `JWT Verify Error: ${tokenErr.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Auth Error: Token verification returned null" },
        { status: 401 }
      );
    }

    const authorId = user.userId || user.id || user._id;
    if (!authorId) {
      return NextResponse.json(
        { success: false, error: `Context Error: Author ID keys are missing in decoded token.` },
        { status: 400 }
      );
    }

    let body: any = null;
    try {
      body = await req.json();
    } catch (jsonErr: any) {
      return NextResponse.json(
        { success: false, error: "Payload Error: Invalid JSON body received" },
        { status: 400 }
      );
    }

    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json(
        { success: false, error: "Validation Error: Title, Content, and Slug check failed" },
        { status: 400 }
      );
    }

    // 🔑 THE BACKEND PROTECTION CHECK:
    // Agar body mein explicitly `aiGenerated` true ho ya metadata bhej rahe ho tabhi true hoga,
    // manually likhi hui generic post hamesha false save hogi.
    const cleanAiGeneratedFlag = body.aiGenerated === true || !!body.aiPrompt || !!body.aiModel;

    try {
      const post = await Post.create({
        title: body.title,
        slug: body.slug,
        content: body.content,
        excerpt: body.excerpt,
        status: body.status || "published",
        tags: body.tags || [],
        categories: body.categories || [],
        aiGenerated: cleanAiGeneratedFlag, // 👈 Strict evaluation dynamic flag apply ho gaya!
        aiPrompt: body.aiPrompt || undefined,
        aiModel: body.aiModel || undefined,
        aiSettings: body.aiSettings || undefined,
        author: authorId,
      });

      console.log("=== [7] MONGOOSE SUCCESS ===");
      return NextResponse.json({
        success: true,
        data: post,
        message: "Post created successfully",
      }, { status: 201 });

    } catch (dbErr: any) {
      console.error("❌ SCHEMA VALIDATION ERROR:", dbErr);
      return NextResponse.json(
        { success: false, error: `Mongoose Schema Error: ${dbErr.message}` },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error("❌ GLOBAL EXCEPTION:", error);
    return NextResponse.json(
      { success: false, error: `Global Exception Catch: ${error.message}` },
      { status: 400 }
    );
  }
}