// app/api/posts/[id]/view/route.ts
import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db'; 
import Post from '@/models/Post'; 

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // 🔑 Next.js 15+ Type definition
) {
  try {
    await connectDB();
    
    // 🔑 Fix 1: params ko await kar ke unwrap karein
    const { id } = await params;

    // 🔑 Fix 2: 'Posl' typo thik kiya aur modern query options lagayein
    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } }, 
      { returnDocument: 'after' } // Mongoose warning fix karne ke liye
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