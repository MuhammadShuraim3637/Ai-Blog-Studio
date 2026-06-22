// lib/gemini.ts - Complete Gemini Implementation
import { GoogleGenAI } from "@google/genai";

const GEMINI_API_KEY = process.env.GOOGLE_GEMINI_API_KEY!;
// Purani line: const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash-exp";
// Nayi Line:
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

if (!GEMINI_API_KEY) {
  throw new Error("GOOGLE_GEMINI_API_KEY is required in .env.local");
}

export const gemini = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
});

// Helper to safely parse JSON text
function safeJsonParse(text: string | undefined) {
  if (!text) throw new Error("No content returned from AI model.");
  // JSON mode me backticks nahi aate, par safety ke liye clean kar dete hain
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
}

// Generate blog post
export async function generateBlogPostWithGemini(prompt: string, options?: any) {
  try {
    const fullPrompt = `You are an expert blog writer. Write a comprehensive blog post about: ${prompt}
    
    Return in JSON format:
    {
      "title": "Engaging title",
      "content": "HTML formatted content with <h1>, <h2>, <p>, <ul>, <li> tags",
      "excerpt": "150-160 character summary",
      "seoTitle": "50-60 character SEO title",
      "seoDescription": "150-160 character meta description",
      "seoKeywords": ["keyword1", "keyword2", "keyword3"],
      "tags": ["tag1", "tag2"],
      "categories": ["category1"]
    }`;

    const response = await gemini.models.generateContent({
      model: options?.model || GEMINI_MODEL,
      contents: fullPrompt,
      config: {
        temperature: options?.temperature || 0.7,
        maxOutputTokens: options?.maxTokens || 4000,
        responseMimeType: "application/json",
      },
    });

    const parsed = safeJsonParse(response.text);
    const wordCount = parsed.content ? parsed.content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length : 0;
    
    return {
      success: true,
      data: { ...parsed, wordCount, readingTime: Math.ceil(wordCount / 200) }
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate outline
export async function generateOutlineWithGemini(topic: string) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Create a detailed outline for: ${topic}. Return JSON format with keys like "title" and "sections".`,
      config: { temperature: 0.5, responseMimeType: "application/json" },
    });
    return { success: true, data: safeJsonParse(response.text) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate SEO
export async function generateSEOWithGemini(content: string, title?: string) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate SEO metadata for title: "${title || 'Untitled'}" based on this content:\n\n${content.substring(0, 2000)}. Return JSON with keys "seoTitle", "seoDescription", "keywords".`,
      config: { temperature: 0.3, responseMimeType: "application/json" },
    });
    return { success: true, data: safeJsonParse(response.text) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate image prompt
export async function generateImagePromptWithGemini(topic: string, title: string) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Create a detailed DALL-E prompt for a high-quality blog featured image about: ${topic} - ${title}`,
      config: { temperature: 0.7 },
    });
    return { success: true, prompt: response.text || "" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate social media tags
export async function generateSocialMediaTagsWithGemini(title: string, excerpt: string) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate social media tags and hashtags for: ${title}\n\n${excerpt}. Return JSON with "hashtags" array and "platforms" object.`,
      config: { temperature: 0.5, responseMimeType: "application/json" },
    });
    return { success: true, data: safeJsonParse(response.text) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate meta description
export async function generateMetaDescriptionWithGemini(content: string, length: number = 160) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Create a ${length}-character meta description for:\n\n${content.substring(0, 2000)}`,
      config: { temperature: 0.4, maxOutputTokens: 200 },
    });
    // Service file calls directly, matching data object mapping
    return { success: true, data: { description: response.text || "" } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Generate tags
export async function generateTagsWithGemini(title: string, content: string, count: number = 5) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate a list of ${count} relevant tags for: ${title}\n\n${content.substring(0, 1000)}. Return as JSON array of strings under key "tags".`,
      config: { temperature: 0.4, responseMimeType: "application/json" },
    });
    return { success: true, data: safeJsonParse(response.text) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Improve content
export async function improveContentWithGemini(content: string, instructions: string) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Improve this content following these instructions: ${instructions}\n\nContent:\n${content}`,
      config: { temperature: 0.6, maxOutputTokens: 4000 },
    });
    return { success: true, content: response.text || "" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Summarize content
export async function summarizeContentWithGemini(content: string, maxLength: number = 500) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Summarize this in under ${maxLength} characters:\n\n${content}`,
      config: { temperature: 0.3, maxOutputTokens: 600 },
    });
    return { success: true, data: { summary: response.text || "" } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Translate content
export async function translateContentWithGemini(content: string, targetLanguage: string) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Translate the following text to ${targetLanguage}:\n\n${content}`,
      config: { temperature: 0.3, maxOutputTokens: 4000 },
    });
    return { success: true, data: { translated: response.text || "" } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Check grammar
export async function checkGrammarWithGemini(content: string) {
  try {
    const response = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Check and fix grammar, spelling, and punctuation for this text. Return the corrected text only:\n\n${content}`,
      config: { temperature: 0.2, maxOutputTokens: 4000 },
    });
    return { success: true, data: { corrected: response.text || "" } };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}