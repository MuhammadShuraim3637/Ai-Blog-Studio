// app/(dashboard)/posts/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/hooks/useAuth';

export default function PostsPage() {
  const { user } = useAuth();
  const { posts, fetchPosts, deletePost, isLoading } = usePosts();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts({ limit: 20 });
  }, []);

  const filteredPosts = posts.filter(post => {
    if (filter !== 'all' && post.status !== filter) return false;
    if (search && !post.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      setDeletingId(id);
      await deletePost(id);
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      archived: 'bg-gray-100 text-gray-800',
      scheduled: 'bg-blue-100 text-blue-800',
    };
    return badges[status as keyof typeof badges] || badges.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Posts</h1>
          <p className="text-gray-600 mt-1">Manage all your blog posts</p>
        </div>
        <Link
          href="/dashboard/posts/create"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>New Post</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {['all', 'published', 'draft', 'archived'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                  filter === status
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts List */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredPosts.map((post) => (
              <div key={post._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <Link href={`/dashboard/posts/${post._id}`} className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {post.excerpt || post.content?.substring(0, 150)}...
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(post.status)}`}>
                        {post.status}
                      </span>
                      <span className="flex items-center space-x-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{post.views || 0} views</span>
                      </span>
                      <span className="flex items-center space-x-1 text-gray-500">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{post.likes || 0} likes</span>
                      </span>
                      <span className="text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link
                      href={`/dashboard/posts/${post._id}/edit`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </Link>
                    <button
                      onClick={() => handleDelete(post._id)}
                      disabled={deletingId === post._id}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors disabled:opacity-50"
                    >
                      {deletingId === post._id ? (
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500 mb-4">
            {search || filter !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'Get started by creating your first blog post'}
          </p>
          {(search || filter !== 'all') ? (
            <button
              onClick={() => { setSearch(''); setFilter('all'); }}
              className="text-blue-600 hover:text-blue-700"
            >
              Clear filters
            </button>
          ) : (
            <Link
              href="/dashboard/generate"
              className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
            >
              <span>Create your first post</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}