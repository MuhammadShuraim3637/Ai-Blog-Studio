import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db'; 
import Post from '@/models/Post'; 

// 🔑 Dynamic API routing ensure karne ke liye rule set kiya
export const dynamic = 'force-dynamic';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, 
      { returnDocument: 'after' }
    );

    if (!updatedPost) {
      return NextResponse.json({ success: false, error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { views: updatedPost.views } });
  } catch (error: any) {
    console.error("🔥 [Views API Error]:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}