'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

export default function PostPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentPost, fetchPost, deletePost, toggleLike, isLoading } = usePosts();
  const [isLiking, setIsLiking] = useState(false);

  const postId = params.id as string;

  useEffect(() => {
    if (postId) {
      fetchPost(postId);
    }
  }, [postId]);

  const handleLike = async () => {
    if (!postId) return;
    setIsLiking(true);
    await toggleLike(postId);
    setIsLiking(false);
  };

  const handleDelete = async () => {
    if (!postId) return;
    if (confirm('Are you sure you want to delete this post?')) {
      await deletePost(postId);
      router.push('/dashboard/posts');
    }
  };

  if (isLoading || !currentPost) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  const authorId = typeof currentPost.author === 'object' ? currentPost.author?._id : currentPost.author;
  const isAuthor = user?._id === authorId || user?.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <Link
        href="/dashboard/posts"
        className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span>Back to Posts</span>
      </Link>

      {/* Post Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {currentPost.featuredImage && (
          <div className="relative h-64 md:h-96">
            <img
              src={currentPost.featuredImage}
              alt={currentPost.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        <div className="p-6 md:p-8">
          {/* Status Badge */}
          <div className="mb-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              currentPost.status === 'published' ? 'bg-green-100 text-green-800' :
              currentPost.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {currentPost.status.charAt(0).toUpperCase() + currentPost.status.slice(1)}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {currentPost.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-sm font-medium">
                {(typeof currentPost.author === 'object' ? currentPost.author?.name : '')?.charAt(0).toUpperCase() || 'A'}
              </div>
              <span>{typeof currentPost.author === 'object' ? currentPost.author?.name : 'Anonymous'}</span>
            </div>
            <span>•</span>
            <span>{new Date(currentPost.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{currentPost.readingTime} min read</span>
            </span>
            {currentPost.aiGenerated && (
              <>
                <span>•</span>
                <span className="flex items-center space-x-1 text-blue-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>AI Generated</span>
                </span>
              </>
            )}
          </div>

          {/* Content */}
          <div 
            className="prose prose-lg max-w-none mb-8"
            dangerouslySetInnerHTML={{ __html: currentPost.content }}
          />

          {/* Tags & Categories */}
          {(currentPost.tags?.length > 0 || currentPost.categories?.length > 0) && (
            <div className="border-t border-gray-100 pt-6">
              {currentPost.categories?.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Categories</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.categories.map((category, index) => (
                      <Link
                        key={index}
                        href={`/categories/${category}`}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {currentPost.tags?.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {currentPost.tags.map((tag, index) => (
                      <Link
                        key={index}
                        href={`/tags/${tag}`}
                        className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm hover:bg-blue-100 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <svg className="w-6 h-6" fill={currentPost.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{currentPost.likes || 0} likes</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-600">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{currentPost.views || 0} views</span>
              </div>
            </div>

            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Link
                  href={`/dashboard/posts/${postId}/edit`}
                  className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Section */}
      {currentPost.seoTitle && currentPost.seoDescription && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">SEO Preview</h3>
          <div className="space-y-2">
            <p className="text-blue-600 text-lg hover:underline cursor-pointer">
              {currentPost.seoTitle}
            </p>
            <p className="text-green-700 text-sm">
              https://aiblogstudio.com/posts/{currentPost.slug}
            </p>
            <p className="text-gray-600 text-sm">
              {currentPost.seoDescription}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}