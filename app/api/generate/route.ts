// app/api/generate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/services/ai.service";
import { verifyToken } from "@/lib/auth";
import { getToken } from "@/lib/cookies";

export async function POST(req: NextRequest) {
  try {
    // 1. Authentication check
    const token = await getToken();
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: No token found" },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid token verification" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, data, provider } = body;

    // Optional provider dynamic switching selector
    if (provider) {
      aiService.setProvider(provider);
    }

    let result;

    switch (action) {
      case 'generate_post':
        if (!data || !data.prompt) {
          return NextResponse.json({ success: false, error: "Missing required prompt text" }, { status: 400 });
        }
        result = await aiService.generateCompletePost({
          prompt: data.prompt,
          includeImage: data.includeImage || false,
          model: data.model,
          maxTokens: data.maxTokens,
          temperature: data.temperature,
        });

        // 🔑 WATERPROOF FIX: String aur Object dono response structures ko handle karne ke liye modification
        if (result && result.success) {
          const rawContent = result.data || result.content;

          if (typeof rawContent === 'object' && rawContent !== null) {
            // Agar pehle se object hai (jaise title, content fields alag hain)
            result.data = {
              ...rawContent,
              aiGenerated: true,
              aiPrompt: data.prompt,
              aiModel: data.model || "default",
              aiSettings: {
                temperature: data.temperature || 0.7,
                maxTokens: data.maxTokens || 2000,
                creativity: data.temperature || 0.7
              }
            };
          } else if (typeof rawContent === 'string') {
            // 💡 Fallback: Agar AI direct single markdown text context return kar raha hai
            result.data = {
              content: rawContent,
              aiGenerated: true,
              aiPrompt: data.prompt,
              aiModel: data.model || "default",
              aiSettings: {
                temperature: data.temperature || 0.7,
                maxTokens: data.maxTokens || 2000,
                creativity: data.temperature || 0.7
              }
            };
          }
        }
        break;

      case 'generate_outline':
        result = await aiService.generateOutline(data.topic);
        break;

      case 'generate_seo':
        result = await aiService.generateSEO(data.content, data.title);
        break;

      case 'improve_content':
        result = await aiService.improveContent(data.content, data.instructions);
        break;

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action routing endpoint" },
          { status: 400 }
        );
    }

    // Return uniform interface output schema object
    return NextResponse.json({
      success: result.success,
      data: result.data || result.content,
      error: result.error,
    });

  } catch (error: any) {
    console.error("🔥 Generation backend operational catch exception:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server core context failure" },
      { status: 500 }
    );
  }
}