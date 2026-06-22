// app/api/posts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { verifyToken, verifyRefreshToken } from "@/lib/auth";
import { getAuthTokens } from "@/lib/cookies";

export const dynamic = 'force-dynamic';

// GET - Fetch posts (Private for logged-in user dashboard, Public for home feed)
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
    
    // 🔑 Securely fetch access and refresh tokens from system cookies
    const { accessToken, refreshToken } = await getAuthTokens();
    
    let user: any = null;
    if (accessToken) {
      user = await verifyToken(accessToken);
    } 
    
    // Fallback: Agar access token expire ho chuka ho, to refresh token validation check karein
    if (!user && refreshToken) {
      const refreshPayload = await verifyRefreshToken(refreshToken);
      if (refreshPayload) {
        user = refreshPayload;
      }
    }
    
    if (!user) {
      // 1. Guest User: Sirf publicly published posts nazar aayengi
      query.status = "published";
      if (authorParam) query.author = authorParam;
    } else {
      // 2. Logged-in User: Strict isolation logic enforce karein
      const loggedInUserId = user.userId || user.id || user._id;
      
      if (loggedInUserId) {
        // Hamein har haal mein logged-in user ka data dikhana hai dashboard par
        query.author = loggedInUserId;
      }
      
      if (status) {
        query.status = status;
      }
    }

    // Common global URL parameters filtering
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
    
    // Yahan hum strict cookie extraction process follow kar rahe hain
    const { accessToken } = await getAuthTokens();
    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: "Auth Error: No access token found in cookies" },
        { status: 401 }
      );
    }

    let user: any = null;
    try {
      user = await verifyToken(accessToken);
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
        aiGenerated: cleanAiGeneratedFlag,
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