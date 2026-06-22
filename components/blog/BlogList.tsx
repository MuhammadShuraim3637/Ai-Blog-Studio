// components/blog/BlogList.tsx
'use client';

import { useState, useEffect } from 'react';
import BlogCard from './BlogCard';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';

interface BlogListProps {
  initialPosts?: any[];
  initialTotal?: number;
  filters?: {
    category?: string;
    tag?: string;
    search?: string;
    author?: string;
  };
}

export default function BlogList({ initialPosts = [], initialTotal = 0, filters = {} }: BlogListProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [loading, setLoading] = useState(!initialPosts.length);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(initialTotal);
  const [selectedCategory, setSelectedCategory] = useState(filters.category || '');
  const [searchQuery, setSearchQuery] = useState(filters.search || '');

  const limit = 9;
  const totalPages = Math.ceil(total / limit);

  useEffect(() => {
    fetchPosts();
  }, [page, selectedCategory, searchQuery]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(selectedCategory && { category: selectedCategory }),
        ...(searchQuery && { search: searchQuery }),
        status: 'published',
      });

      const response = await fetch(`/api/posts?${params}`);
      const data = await response.json();

      if (data.success) {
        setPosts(data.data);
        setTotal(data.pagination.total);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Technology',
    'Business',
    'Marketing',
    'Design',
    'Development',
    'AI',
    'Startup',
    'Lifestyle',
  ];

  if (loading && posts.length === 0) {
    return (
      <div className="flex justify-center py-12">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Featured Post (First post) */}
      {posts.length > 0 && page === 1 && !searchQuery && !selectedCategory && (
        <div className="mb-12">
          <BlogCard post={posts[0]} featured />
        </div>
      )}

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts
            .slice(page === 1 && !searchQuery && !selectedCategory ? 1 : 0)
            .map((post) => (
              <BlogCard key={post._id} post={post} />
            ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No posts found</h3>
          <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 pt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    page === pageNum
                      ? 'bg-blue-600 text-white'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}