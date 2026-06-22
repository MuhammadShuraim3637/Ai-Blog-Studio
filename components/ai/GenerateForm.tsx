'use client';

import { useState } from 'react';
import { useGenerateBlog } from '@/hooks/useGenerateBlog';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Loader } from '@/components/ui/Loader';

interface GenerateFormProps {
  onGenerated?: (data: any) => void;
  onSave?: (data: any) => void;
  initialPrompt?: string;
}

export default function GenerateForm({ onGenerated, onSave, initialPrompt = '' }: GenerateFormProps) {
  // 🎯 THE FIX: useGenerateBlog hook se 'isGenerating' ko directly nikal liya hai
  const { state, generatePost, reset, isGenerating } = useGenerateBlog();
  const [prompt, setPrompt] = useState(initialPrompt);
  const [includeImage, setIncludeImage] = useState(false);
  const [tone, setTone] = useState<'professional' | 'casual' | 'humorous' | 'educational'>('professional');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null);

  const lengthSettings = {
    short: { maxTokens: 1500, description: '~500 words' },
    medium: { maxTokens: 3000, description: '~1000 words' },
    long: { maxTokens: 6000, description: '~2000 words' },
  };

  const tonePrompts = {
    professional: 'Write in a professional, authoritative tone suitable for business readers.',
    casual: 'Write in a friendly, conversational tone as if talking to a friend.',
    humorous: 'Add appropriate humor and wit while maintaining professionalism.',
    educational: 'Write in an informative, educational tone with clear explanations.',
  };

  const examplePrompts = [
    'The future of artificial intelligence in healthcare',
    '10 proven strategies to boost your productivity',
    'How to start a successful online business in 2024',
    'The ultimate guide to sustainable living',
    'Top 5 emerging technologies to watch',
    'Why meditation is essential for mental health',
    'The complete guide to remote work success',
    'Digital marketing trends for small businesses',
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    const fullPrompt = `${tonePrompts[tone]} ${prompt}`;
    const result = await generatePost({
      prompt: fullPrompt,
      includeImage,
      maxTokens: lengthSettings[length].maxTokens,
      temperature: tone === 'professional' ? 0.5 : 0.8,
    });

    console.log("🔍 [GenerateForm] Raw hook result:", result);

    if (result) {
      let cleanPostData = null;

      if (result.data && typeof result.data === 'object') {
        cleanPostData = result.data;
      } else if (result.content) {
        cleanPostData = result;
      } else if (result.title) {
        cleanPostData = result;
      } else {
        cleanPostData = result;
      }
      
      console.log("🎯 [GenerateForm] Parsed Clean Data:", cleanPostData);

      if (cleanPostData && (cleanPostData.title || cleanPostData.content)) {
        setGeneratedData(cleanPostData);
        if (onGenerated) {
          onGenerated(cleanPostData);
        }
      } else {
        console.error("❌ Data structure mismatched fields:", cleanPostData);
        alert("AI responded, but fields (title/content) are missing. Check browser console.");
      }
    }
  };

  const handleSave = async () => {
    if (generatedData && onSave) {
      onSave(generatedData);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setIncludeImage(false);
    setTone('professional');
    setLength('medium');
    setGeneratedData(null);
    reset();
  };

  return (
    <div className="space-y-6">
      {/* Main Form */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Generate Blog Post with AI</span>
          </CardTitle>
          <CardDescription>
            Enter your topic and let our AI create high-quality, SEO-optimized content for you
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What do you want to write about? <span className="text-red-500">*</span>
            </label>
            <Textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., Write a comprehensive guide about the impact of machine learning on modern business operations..."
              rows={4}
              className="text-base"
              disabled={isGenerating} // Fixed from state.isGenerating
            />
            <div className="mt-2 flex justify-between text-sm">
              <span className="text-gray-500">{prompt.length} characters</span>
              <span className="text-gray-500">Minimum 10 characters recommended</span>
            </div>
          </div>

          {/* Example Prompts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💡 Try these examples:
            </label>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setPrompt(example)}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-full transition-colors disabled:opacity-50"
                  disabled={isGenerating} // Fixed from state.isGenerating
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
            disabled={isGenerating} // Fixed from state.isGenerating
          >
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{showAdvanced ? 'Hide' : 'Show'} Advanced Options</span>
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              {/* Tone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Writing Tone
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(['professional', 'casual', 'humorous', 'educational'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        tone === t
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                      disabled={isGenerating} // Fixed from state.isGenerating
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content Length
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['short', 'medium', 'long'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      onClick={() => setLength(l)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                        length === l
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                      }`}
                      disabled={isGenerating} // Fixed from state.isGenerating
                    >
                      {l}
                      <span className="block text-xs opacity-75 font-normal">
                        {lengthSettings[l].description}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Image Generation */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Generate Featured Image
                  </label>
                  <p className="text-xs text-gray-500">
                    AI will create a custom image for your post
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="sr-only peer"
                    disabled={isGenerating} // Fixed from state.isGenerating
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || prompt.length < 10} // Fixed from state.isGenerating
            className="flex-1 min-w-[150px]"
            loading={isGenerating} // Fixed from state.isGenerating
          >
            {isGenerating ? 'Generating...' : '🚀 Generate Blog Post'}
          </Button>
          
          {generatedData && (
            <Button
              variant="success"
              onClick={handleSave}
              className="min-w-[120px]"
            >
              💾 Save Post
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={isGenerating} // Fixed from state.isGenerating
            className="min-w-[100px]"
          >
            Clear
          </Button>
        </CardFooter>
      </Card>

      {/* Progress Indicator */}
      {isGenerating && ( // Fixed from state.isGenerating
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-700 flex items-center space-x-2">
                  <Loader size="sm" />
                  <span>{state.status || 'AI model workflow analyzing...'}</span>
                </span>
                <span className="text-gray-500">{state.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${state.progress || 0}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 text-center">
                This may take a few seconds. Please don't close this window.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Content Preview */}
      {generatedData && !isGenerating && ( // Fixed from state.isGenerating
        <Card variant="gradient">
          <CardHeader>
            <CardTitle className="text-lg">📄 Generated Content</CardTitle>
            <CardDescription>
              Your AI-generated blog post is ready. Review and save it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Title</h3>
                <p className="text-lg font-semibold text-gray-900">{generatedData.title}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Excerpt</h3>
                <p className="text-gray-600">{generatedData.excerpt}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Preview</h3>
                <div className="prose prose-sm max-h-60 overflow-y-auto p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div dangerouslySetInnerHTML={{ __html: generatedData.content ? (generatedData.content.substring(0, 500) + '...') : '' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2 border-t border-gray-100">
                <div>
                  <span className="text-gray-500 block">Reading Time:</span>
                  <span className="font-medium text-gray-900">{generatedData.readingTime || 1} min</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Word Count:</span>
                  <span className="font-medium text-gray-900">{generatedData.wordCount || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Tags:</span>
                  <span className="font-medium text-gray-900">{generatedData.tags?.join(', ') || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 block">AI Model:</span>
                  <span className="font-medium text-gray-900">{generatedData.aiModel || 'Gemini 2.0'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Display */}
      {state.error && (
        <Card variant="outline" className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="font-semibold text-red-800 mb-1">Generation Failed</h4>
                <p className="text-sm text-red-700">{state.error}</p>
                <button
                  type="button"
                  onClick={() => reset()}
                  className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium underline"
                >
                  Try Again →
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}