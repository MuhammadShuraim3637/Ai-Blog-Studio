// components/editor/Preview.tsx
'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';

interface PreviewProps {
  content: string;
  title?: string;
  author?: {
    name: string;
    avatar?: string;
  };
  createdAt?: Date | string;
  readingTime?: number;
  featuredImage?: string;
}

export default function Preview({ 
  content, 
  title, 
  author, 
  createdAt, 
  readingTime,
  featuredImage 
}: PreviewProps) {
  const [wordCount, setWordCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Calculate word count
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const estimatedReadingTime = readingTime || Math.ceil(wordCount / 200);

  // Generate table of contents from headings
  useEffect(() => {
    const generateTOC = () => {
      const container = document.getElementById('preview-content');
      if (!container) return;
      
      const headings = container.querySelectorAll('h2, h3');
      const tocContainer = document.getElementById('table-of-contents-preview');
      if (tocContainer && headings.length > 0) {
        tocContainer.innerHTML = Array.from(headings)
          .map((heading, index) => {
            const id = heading.id || `heading-${index}`;
            heading.id = id;
            const level = heading.tagName === 'H3' ? 'ml-4' : '';
            return `
              <a href="#${id}" class="block ${level} text-gray-600 hover:text-blue-600 py-1 text-sm transition-colors">
                ${heading.textContent}
              </a>
            `;
          })
          .join('');
      }
    };

    setTimeout(generateTOC, 100);
  }, [content]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Preview Header */}
      <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <h3 className="font-semibold text-gray-900">Live Preview</h3>
          </div>
          
          {/* Mobile TOC Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Preview Body */}
      <div className="flex">
        {/* Table of Contents (Desktop) */}
        <div className="hidden lg:block w-64 border-r border-gray-100 p-4">
          <div className="sticky top-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">On this page</h4>
            <div id="table-of-contents-preview" className="space-y-1" />
          </div>
        </div>

        {/* Mobile TOC Sidebar */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold">Table of Contents</h4>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-1">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div id="table-of-contents-preview-mobile" />
            </div>
          </div>
        )}

        {/* Preview Content */}
        <div className="flex-1 p-6">
          {/* Featured Image Preview */}
          {featuredImage && (
            <div className="mb-8 rounded-xl overflow-hidden shadow-md">
              <img 
                src={featuredImage} 
                alt={title || "Preview"} 
                className="w-full h-auto object-cover"
              />
            </div>
          )}

          {/* Title Preview */}
          {title && (
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {title}
            </h1>
          )}

          {/* Meta Info Preview */}
          {(author || createdAt) && (
            <div className="flex items-center space-x-4 pb-6 mb-6 border-b border-gray-100">
              {author && (
                <div className="flex items-center space-x-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-semibold">
                    {author.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{author.name}</p>
                    <p className="text-xs text-gray-500">Author</p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {createdAt && (
                  <>
                    <span>{formatDate(createdAt)}</span>
                    <span>•</span>
                  </>
                )}
                <span>{estimatedReadingTime} min read</span>
                <span>•</span>
                <span>{wordCount} words</span>
              </div>
            </div>
          )}

          {/* Content Preview */}
          <div 
            id="preview-content"
            className="prose prose-lg prose-blue max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-3xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
              prose-h3:text-xl prose-h3:mt-4 prose-h3:mb-2
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
              prose-img:rounded-xl prose-img:shadow-lg
              prose-ul:list-disc prose-ul:pl-6
              prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-2
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:p-4 prose-blockquote:rounded-lg"
            dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-400 italic">Nothing to preview yet. Start writing...</p>' }}
          />
        </div>
      </div>
    </div>
  );
}