// components/blog/BlogContent.tsx
'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

interface BlogContentProps {
  post: {
    _id: string;
    title: string;
    content: string;
    excerpt: string;
    featuredImage?: string;
    author: {
      name: string;
      avatar?: string;
      bio?: string;
    };
    createdAt: string;
    publishedAt?: string;
    readingTime: number;
    views: number;
    likes: number;
    shares?: number;
    categories: string[];
    tags: string[];
    seoTitle?: string;
    seoDescription?: string;
  };
  onLike?: () => void;
  onShare?: () => void;
}

export default function BlogContent({ post, onLike, onShare }: BlogContentProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes);
  const [showShareMenu, setShowShareMenu] = useState(false);

  useEffect(() => {
    // Check if user has liked this post (from localStorage or API)
    const liked = localStorage.getItem(`liked_${post._id}`);
    if (liked) setIsLiked(true);
  }, [post._id]);

  const handleLike = async () => {
    if (isLiked) return;
    
    setIsLiked(true);
    setLikesCount(prev => prev + 1);
    localStorage.setItem(`liked_${post._id}`, 'true');
    
    // Call API to record like
    try {
      await fetch(`/api/posts/${post._id}/like`, { method: 'POST' });
      onLike?.();
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
        onShare?.();
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
      onShare?.();
    }
    setShowShareMenu(false);
  };

  // Generate table of contents from headings
  const getTableOfContents = () => {
    const headings = document.querySelectorAll('h2, h3');
    return Array.from(headings).map((heading, index) => ({
      id: heading.id || `heading-${index}`,
      text: heading.textContent || '',
      level: heading.tagName.toLowerCase(),
    }));
  };

  return (
    <article className="max-w-4xl mx-auto">
      {/* Hero Section */}
      <header className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
          {post.categories?.map((category, index) => (
            <span key={index} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {category}
            </span>
          ))}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          {post.excerpt}
        </p>
        
        <div className="flex items-center justify-between flex-wrap gap-4 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
              {post.author.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{post.author.name}</div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                <span>•</span>
                <span>{post.readingTime} min read</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              disabled={isLiked}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-50 text-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{likesCount.toLocaleString()}</span>
            </button>
            
            {/* Share Button */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                <span>Share</span>
              </button>
              
              {showShareMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      setShowShareMenu(false);
                      alert('Link copied!');
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Copy link
                  </button>
                  <button
                    onClick={() => {
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`);
                      setShowShareMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Share on Twitter
                  </button>
                  <button
                    onClick={() => {
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
                      setShowShareMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Share on Facebook
                  </button>
                  <button
                    onClick={() => {
                      window.open(`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(window.location.href)}&title=${encodeURIComponent(post.title)}`);
                      setShowShareMenu(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Share on LinkedIn
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.featuredImage && (
        <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
          <img
            src={post.featuredImage}
            alt={post.title}
            className="w-full h-auto object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex gap-8">
        {/* Table of Contents (Desktop) */}
        <div className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-24">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3">Table of Contents</h4>
              <div id="table-of-contents" className="space-y-2 text-sm" />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div
            className="prose prose-lg prose-blue max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-3xl prose-h1:mt-8
              prose-h2:text-2xl prose-h2:mt-6
              prose-h3:text-xl prose-h3:mt-4
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
              prose-img:rounded-xl prose-img:shadow-lg
              prose-ul:list-disc prose-ul:pl-6
              prose-ol:list-decimal prose-ol:pl-6"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Author Bio */}
      {post.author.bio && (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
          <div className="flex items-start space-x-4">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
              {post.author.name?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                Written by {post.author.name}
              </h3>
              <p className="text-gray-600 text-sm">{post.author.bio}</p>
            </div>
          </div>
        </div>
      )}

      {/* Views Counter */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <span className="flex items-center justify-center space-x-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>{post.views?.toLocaleString() || 0} views</span>
        </span>
      </div>

      {/* Generate Table of Contents on mount */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            setTimeout(() => {
              const headings = document.querySelectorAll('.prose h2, .prose h3');
              const toc = document.getElementById('table-of-contents');
              if (toc && headings.length > 0) {
                toc.innerHTML = headings.map((h, i) => {
                  const id = h.id || \`heading-\${i}\`;
                  h.id = id;
                  const indent = h.tagName === 'H3' ? 'ml-4' : '';
                  return \`<a href="#\${id}" class="block \${indent} text-gray-600 hover:text-blue-600 py-1">\${h.textContent}</a>\`;
                }).join('');
              }
            }, 100);
          `,
        }}
      />
    </article>
  );
}