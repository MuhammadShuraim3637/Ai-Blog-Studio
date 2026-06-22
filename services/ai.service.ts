// services/ai.service.ts - Complete Gemini AI Service
import { 
  generateBlogPostWithGemini,
  generateOutlineWithGemini,
  generateSEOWithGemini,
  improveContentWithGemini,
  generateImagePromptWithGemini,
  generateSocialMediaTagsWithGemini,
  generateMetaDescriptionWithGemini,
  generateTagsWithGemini,
  summarizeContentWithGemini,
  translateContentWithGemini,
  checkGrammarWithGemini
} from '@/lib/gemini';

export interface GeneratePostOptions {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  includeImage?: boolean;
}

export interface AIGenerationResult {
  success: boolean;
  data?: any;
  error?: string;
  imageUrl?: string;
  content?: string;
}

class AIService {
  private defaultModel: string = 'gemini-2.5-flash';
  private maxRetries: number = 3;
  private provider: string = 'gemini';

  setProvider(provider: string) {
    this.provider = provider;
  }

  /**
   * Generate complete blog post with Gemini
   */
  async generateCompletePost(options: GeneratePostOptions): Promise<AIGenerationResult> {
    try {
      console.log(`🤖 Generating blog post with Gemini: "${options.prompt.substring(0, 50)}..."`);
      
      const postResult = await generateBlogPostWithGemini(options.prompt, {
        model: options.model || this.defaultModel,
        maxTokens: options.maxTokens || 4000,
        temperature: options.temperature || 0.7,
      });

      if (!postResult.success) {
        return { 
          success: false, 
          error: postResult.error || "Generation failed" 
        };
      }

      // Generate image prompt if requested (Gemini text se prompt banayega, image generation ke liye)
      let imagePrompt = null;
      if (options.includeImage) {
        const imagePromptResult = await generateImagePromptWithGemini(
          options.prompt,
          postResult.data.title
        );
        
        if (imagePromptResult.success) {
          imagePrompt = imagePromptResult.prompt;
        }
      }

      // Generate social media tags
      const socialTags = await generateSocialMediaTagsWithGemini(
        postResult.data.title,
        postResult.data.excerpt
      );

      return {
        success: true,
        data: {
          ...postResult.data,
          imagePrompt: imagePrompt,
          socialMedia: socialTags.success ? socialTags.data : null,
          generatedBy: 'gemini',
          generatedAt: new Date().toISOString(),
        },
      };
    } catch (error: any) {
      console.error("Gemini generation error:", error);
      return {
        success: false,
        error: error.message || "Failed to generate blog post",
      };
    }
  }

  /**
   * Generate only blog outline
   */
  async generateOutline(topic: string): Promise<AIGenerationResult> {
    try {
      console.log(`📝 Generating outline for: "${topic}"`);
      
      const result = await generateOutlineWithGemini(topic);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        data: {
          ...result.data,
          generatedBy: 'gemini',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate SEO metadata for existing content
   */
  async generateSEO(content: string, title?: string): Promise<AIGenerationResult> {
    try {
      console.log(`🔍 Generating SEO for: "${title || 'Untitled'}"`);
      
      const result = await generateSEOWithGemini(content, title);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        data: {
          ...result.data,
          generatedBy: 'gemini',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate meta description
   */
  async generateMetaDescription(content: string, length: number = 160): Promise<AIGenerationResult> {
    try {
      const result = await generateMetaDescriptionWithGemini(content, length);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate tags for blog post
   */
  async generateTags(title: string, content: string, count: number = 5): Promise<AIGenerationResult> {
    try {
      const result = await generateTagsWithGemini(title, content, count);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Improve existing blog content
   */
  async improveContent(content: string, instructions: string): Promise<AIGenerationResult> {
    try {
      console.log(`✨ Improving content with instructions: "${instructions.substring(0, 50)}..."`);
      
      const result = await improveContentWithGemini(content, instructions);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        data: {
          content: result.content,
          improvedBy: 'gemini',
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Summarize long content
   */
  async summarizeContent(content: string, maxLength: number = 500): Promise<AIGenerationResult> {
    try {
      const result = await summarizeContentWithGemini(content, maxLength);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Translate content to different language
   */
  async translateContent(content: string, targetLanguage: string): Promise<AIGenerationResult> {
    try {
      const result = await translateContentWithGemini(content, targetLanguage);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check and fix grammar
   */
  async checkGrammar(content: string): Promise<AIGenerationResult> {
    try {
      const result = await checkGrammarWithGemini(content);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate social media tags
   */
  async generateSocialTags(title: string, excerpt: string): Promise<AIGenerationResult> {
    try {
      console.log(`📱 Generating social media tags for: "${title}"`);
      
      const result = await generateSocialMediaTagsWithGemini(title, excerpt);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }
      
      return {
        success: true,
        data: result.data,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Bulk generate multiple posts
   */
  async bulkGenerate(topics: string[]): Promise<AIGenerationResult[]> {
    console.log(`📚 Bulk generating ${topics.length} posts...`);
    
    const results: AIGenerationResult[] = [];
    
    for (let i = 0; i < topics.length; i++) {
      console.log(`Processing ${i + 1}/${topics.length}: "${topics[i]}"`);
      
      const result = await this.generateCompletePost({ 
        prompt: topics[i], 
        includeImage: false 
      });
      
      results.push(result);
      
      // Rate limiting - Gemini ke limits mein adjust karein
      if (i < topics.length - 1) {
        await this.delay(1000); // 1 second delay between requests
      }
    }
    
    return results;
  }

  /**
   * Generate post variations with different tones
   */
  async generateVariations(prompt: string, count: number = 3): Promise<AIGenerationResult> {
    try {
      console.log(`🎨 Generating ${count} variations for: "${prompt}"`);
      
      const tones = ['professional', 'casual', 'humorous', 'educational', 'inspirational'];
      const variations = [];
      
      for (let i = 0; i < Math.min(count, tones.length); i++) {
        const tonePrompt = `${prompt}\n\nWrite in a ${tones[i]} tone. Make it engaging and ${tones[i]}.`;
        
        const result = await generateBlogPostWithGemini(tonePrompt, {
          temperature: 0.8, // Higher temperature for more variation
        });
        
        if (result.success) {
          variations.push({
            ...result.data,
            tone: tones[i],
          });
        }
        
        // Delay between variations
        if (i < count - 1) {
          await this.delay(500);
        }
      }
      
      return {
        success: true,
        data: variations,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Optimize content for specific audience
   */
  async optimizeForAudience(
    content: string, 
    audience: 'beginner' | 'intermediate' | 'expert'
  ): Promise<AIGenerationResult> {
    const instructions = {
      beginner: "Simplify the content drastically. Explain basic concepts, use simple language, add more examples, avoid jargon.",
      intermediate: "Balance depth and accessibility. Add practical examples, include best practices, explain moderately complex concepts.",
      expert: "Add advanced concepts, include technical details, assume prior knowledge, use industry terminology, add deep insights.",
    };
    
    console.log(`👥 Optimizing content for ${audience} audience`);
    
    return this.improveContent(content, instructions[audience]);
  }

  /**
   * Generate FAQ from content
   */
  async generateFAQ(content: string, count: number = 5): Promise<AIGenerationResult> {
    try {
      const prompt = `Based on this content, generate ${count} frequently asked questions and their answers:
      
      Content: ${content.substring(0, 3000)}
      
      Return JSON format:
      {
        "faqs": [
          {
            "question": "FAQ question",
            "answer": "Detailed answer"
          }
        ]
      }`;
      
      const result = await generateBlogPostWithGemini(prompt, {
        temperature: 0.5,
        maxTokens: 2000,
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate content ideas related to niche
   */
  async generateContentIdeas(niche: string, count: number = 10): Promise<AIGenerationResult> {
    try {
      const prompt = `Generate ${count} unique and trending blog post ideas for the niche: ${niche}
      
      Each idea should include:
      - Main title
      - Brief description (50 words)
      - Target keywords
      - Suggested content type (listicle, how-to, guide, case study, etc.)
      
      Return JSON array.`;
      
      const result = await generateBlogPostWithGemini(prompt, {
        temperature: 0.8,
        maxTokens: 3000,
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check content quality score
   */
  async checkQualityScore(content: string): Promise<AIGenerationResult> {
    try {
      const prompt = `Analyze this content and provide a quality score:
      
      Content: ${content.substring(0, 3000)}
      
      Rate on scale of 1-10 for:
      - Readability
      - Engagement
      - SEO Optimization
      - Value to reader
      - Structure and flow
      
      Return JSON:
      {
        "overallScore": number,
        "readability": number,
        "engagement": number,
        "seoScore": number,
        "valueScore": number,
        "structureScore": number,
        "suggestions": ["suggestion1", "suggestion2"],
        "strengths": ["strength1", "strength2"]
      }`;
      
      const result = await generateBlogPostWithGemini(prompt, {
        temperature: 0.3,
        maxTokens: 2000,
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate YouTube script from blog content
   */
  async generateYouTubeScript(content: string): Promise<AIGenerationResult> {
    try {
      const prompt = `Convert this blog post into a YouTube video script:
      
      Content: ${content.substring(0, 3000)}
      
      Include:
      - Hook (first 10 seconds)
      - Introduction
      - Main points with timestamps
      - Visual cues
      - Call to action
      - Outro
      
      Format the script professionally.`;
      
      const result = await generateBlogPostWithGemini(prompt, {
        temperature: 0.6,
        maxTokens: 3000,
      });
      
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Helper function to add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      provider: 'Google Gemini',
      model: this.defaultModel,
      features: [
        'Blog Post Generation',
        'Outline Generation',
        'SEO Optimization',
        'Content Improvement',
        'Grammar Check',
        'Translation',
        'Summarization',
        'Social Media Tags',
        'FAQ Generation',
        'Content Ideas',
        'Quality Scoring',
        'YouTube Scripts'
      ],
      status: 'active',
    };
  }
}

// Export singleton instance
export const aiService = new AIService();
