// app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Post from "@/models/Post";
import { verifyToken } from "@/lib/auth";
import { getToken } from "@/lib/cookies";
import mongoose from "mongoose";

// ==========================================
// GET - Fetch single post (Without Views Loop)
// ==========================================
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    // 🔑 FIX: If frontend hits /api/posts/create as GET, intercept it nicely
    if (id === "create") {
      return NextResponse.json({
        success: true,
        data: null,
        message: "Create route fallback for GET"
      }, { status: 200 });
    }
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const post = await Post.findById(id)
      .populate("author", "name email avatar")
      .lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check if post is published or user is author/admin
    const token = await getToken();
    const user = token ? await verifyToken(token) : null;
    
    if (post.status !== "published" && (!user || (user.userId !== post.author._id.toString() && user.role !== "admin"))) {
      return NextResponse.json(
        { success: false, error: "Post not available" },
        { status: 403 }
      );
    }

    // 🔑 FIXED: Automatic background views increment line removed from here!

    return NextResponse.json({
      success: true,
      data: post,
    });
  } catch (error: any) {
    console.error("Get post error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch post" },
      { status: 500 }
    );
  }
}

// ==========================================
// PUT - Update post
// ==========================================
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (post.author.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();
    
    // Update post
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { 
        ...body,
        lastEditedBy: user.userId,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    ).populate("author", "name email avatar");

    return NextResponse.json({
      success: true,
      data: updatedPost,
      message: "Post updated successfully",
    });
  } catch (error: any) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update post" },
      { status: 500 }
    );
  }
}

// ==========================================
// DELETE - Delete post
// ==========================================
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { id } = await params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid post ID" },
        { status: 400 }
      );
    }

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    // Check authorization
    if (post.author.toString() !== user.userId && user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      );
    }

    if (req.nextUrl.searchParams.get("permanent") === "true" && user.role === "admin") {
      await Post.findByIdAndDelete(id);
      return NextResponse.json({
        success: true,
        message: "Post permanently deleted",
      });
    } else {
      post.status = "archived";
      await post.save();
      return NextResponse.json({
        success: true,
        message: "Post moved to archive",
      });
    }
  } catch (error: any) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete post" },
      { status: 500 }
    );
  }
}

// ==========================================
// PATCH - Toggle like on post
// ==========================================
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid token" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { action } = await req.json();

    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      );
    }

    if (action === "like") {
      const userId = new mongoose.Types.ObjectId(user.userId);
      const alreadyLiked = post.likesBy.includes(userId);
      
      if (alreadyLiked) {
        post.likesBy = post.likesBy.filter((id: any) => id.toString() !== user.userId);
        post.likes = Math.max(0, post.likes - 1);
      } else {
        post.likesBy.push(userId);
        post.likes += 1;
      }
      
      await post.save();
      
      return NextResponse.json({
        success: true,
        liked: !alreadyLiked,
        likes: post.likes,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Like post error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process request" },
      { status: 500 }
    );
  }
}