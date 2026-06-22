'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreatePostPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Form States
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('published');
  const [tags, setTags] = useState('');
  const [categories, setCategories] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!title.trim() || !content.trim()) {
      setError('Title and Content are required!');
      setIsLoading(false);
      return;
    }

    // Auto-generate URL-friendly clean slug
    const generatedSlug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') 
      .replace(/[\s_-]+/g, '-') 
      .replace(/^-+|-+$/g, ''); 

    const tagsArray = tags ? tags.split(',').map(t => t.trim()) : [];
    const categoriesArray = categories ? categories.split(',').map(c => c.trim()) : [];

    const postData = {
      title,
      slug: generatedSlug, 
      content,
      excerpt: excerpt || content.substring(0, 150), 
      status,
      tags: tagsArray,
      categories: categoriesArray,
      aiGenerated: false 
    };

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setTitle('');
        setContent('');
        setExcerpt('');
        setTags('');
        setCategories('');
        
        router.push('/dashboard/posts');
        router.refresh(); 
      } else {
        // 🔑 UI alert par poora bad response message render hoga
        setError(result.error || 'Server rejected the request with status 400');
      }
    } catch (err: any) {
      setError(err?.message || 'Something went wrong while connecting to api routes');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/posts"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-2"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Posts</span>
      </Link>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Post</h1>
          <p className="text-gray-600 mt-1">Write and publish your manual blog post to the dashboard</p>
        </div>

        {error && (
          <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm font-semibold shadow-sm">
            ❌ Error Details: {error}
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Post Title *</label>
          <input
            type="text"
            required
            placeholder="Enter a catchy title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Excerpt (Short Description)</label>
          <input
            type="text"
            placeholder="Brief summary of the post..."
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          />
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Categories (Comma separated)</label>
            <input
              type="text"
              placeholder="Tech, Life, Coding"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="nextjs, react, web"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Content *</label>
          <textarea
            rows={12}
            required
            placeholder="Write your main post content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
          />
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 flex items-center space-x-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                <span>Publishing...</span>
              </>
            ) : (
              <span>Publish Post</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}