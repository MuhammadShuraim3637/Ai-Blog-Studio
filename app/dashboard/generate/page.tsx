'use client';

import { useState } from 'react';
import { useGenerateBlog } from '@/hooks/useGenerateBlog';
import { useRouter } from 'next/navigation';

export default function GeneratePage() {
  const router = useRouter();
  const { state, generatePost, isGenerating } = useGenerateBlog();
  const [prompt, setPrompt] = useState('');
  const [includeImage, setIncludeImage] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLocalError(null);

    try {
      // 1. Gemini AI se post generate karwao via Hook
      const result = await generatePost({
        prompt,
        includeImage,
        temperature,
      });

      console.log("🔍 [FRONTEND] Gemini Hook Raw Result:", result);

      if (result) {
        // 2. Extract and Normalize the actual payload safely
        let rawData = result;
        if (result.success && result.data) {
          rawData = result.data;
        } else if (result.data) {
          rawData = result.data;
        }

        // 🔑 MongoDB Schema Verification / Data Cleansing Blueprint
        const sanitizedPayload = {
          title: rawData.title || "Untitled AI Blog Post",
          content: rawData.content || rawData.body || rawData.text || "",
          // Agar AI custom slug na de to title se generator dynamic slug design karega
          slug: rawData.slug || (rawData.title 
            ? rawData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') 
            : `post-${Date.now()}`),
          excerpt: rawData.excerpt || rawData.summary || "",
          readingTime: rawData.readingTime || 1,
          wordCount: rawData.wordCount || 0,
          tags: rawData.tags || [],
          status: 'draft',
          
          // 🎯 THE GOLDEN FIX: Yeh lines database mein 'aiGenerated: true' aur metadata bheingi!
          aiGenerated: true,
          aiPrompt: prompt,
          aiModel: "gemini",
          aiSettings: {
            temperature: temperature,
            maxTokens: 2000
          }
        };

        console.log("🚀 [FRONTEND] Sending clean schema payload to DB:", sanitizedPayload);

        // 3. Database route par clean normalized data POST karein
        const saveResponse = await fetch('/api/posts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitizedPayload),
        });

        const savedData = await saveResponse.json();
        console.log("📥 [FRONTEND] DB Save Response Status:", saveResponse.status, savedData);

        if (saveResponse.ok && savedData.success) {
          const targetId = savedData.data?._id || savedData._id;
          if (targetId) {
            router.push(`/dashboard/posts/${targetId}`);
            router.refresh();
          } else {
            throw new Error("Post saved but no valid ID returned from database.");
          }
        } else {
          const errMsg = savedData.error || "Failed to save post data structure to MongoDB.";
          setLocalError(errMsg);
          console.error("🔥 DB Save Operation Error:", errMsg);
        }
      } else {
        setLocalError("AI Core completed execution but returned an empty context flow.");
      }
    } catch (err: any) {
      console.error("🔥 Critical Runtime Client Framework Exception:", err);
      setLocalError(err.message || "An unexpected system failure occurred.");
    }
  };

  const examples = [
    'The future of artificial intelligence in healthcare',
    '10 proven strategies to boost your productivity',
    'How to start a successful online business in 2024',
    'The ultimate guide to sustainable living',
    'Top 5 emerging technologies to watch',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Generate Blog Post</h1>
        <p className="text-gray-600">
          Let AI create high-quality, SEO-optimized content for you
        </p>
      </div>

      {/* Error Alert Box */}
      {localError && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm flex items-start space-x-2">
          <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <span className="font-semibold">Database Schema Sync Alert:</span> {localError}
          </div>
        </div>
      )}

      {/* Input Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you want to write about?
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., Write a comprehensive guide about the impact of machine learning on modern business operations..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[120px]"
          disabled={isGenerating}
        />

        {/* Example Prompts */}
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => setPrompt(example)}
                className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                disabled={isGenerating}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="mt-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>Advanced Options</span>
            <svg className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Include AI-generated Image
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={isGenerating}
                  />
                  <span className="text-sm text-gray-600">
                    Generate a featured image for your blog post
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Creativity Level: {temperature}
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className="w-full"
                  disabled={isGenerating}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Conservative</span>
                  <span>Balanced</span>
                  <span>Creative</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <div className="mt-6">
          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Generating your blog post...</span>
              </div>
            ) : (
              'Generate Blog Post'
            )}
          </button>
        </div>
      </div>

      {/* Progress Section */}
      {isGenerating && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">{state?.message || "Running core model sequences..."}</span>
              <span className="text-gray-500">{state?.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${state?.progress || 0}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 text-center">
            This may take a few seconds. Please don't close this window.
          </p>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Be specific with your prompt for better results</li>
          <li>• Include keywords you want to target</li>
          <li>• Specify the tone (professional, casual, humorous)</li>
          <li>• Mention your target audience for tailored content</li>
        </ul>
      </div>
    </div>
  );
}