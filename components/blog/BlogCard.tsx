// components/blog/BlogCard.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { formatDate, formatRelativeTime, truncateText } from '@/lib/utils';

interface BlogCardProps {
  post: {
    _id: string;
    title: string;
    excerpt: string;
    content?: string;
    featuredImage?: string;
    author: {
      name: string;
      avatar?: string;
    };
    createdAt: string;
    publishedAt?: string;
    readingTime: number;
    views: number;
    likes: number;
    categories: string[];
    tags: string[];
  };
  variant?: 'horizontal' | 'vertical';
  featured?: boolean;
}

export default function BlogCard({ post, variant = 'vertical', featured = false }: BlogCardProps) {
  if (variant === 'horizontal') {
    return (
      <Link href={`/blog/${post._id}`} className="group block">
        <div className="flex gap-6">
          {post.featuredImage && (
            <div className="relative w-48 h-32 flex-shrink-0 overflow-hidden rounded-lg">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <span>{formatRelativeTime(post.publishedAt || post.createdAt)}</span>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {post.title}
            </h3>
            <p className="text-gray-600 line-clamp-2">{truncateText(post.excerpt, 120)}</p>
            <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views?.toLocaleString() || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes?.toLocaleString() || 0}</span>
              </span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  if (featured) {
    return (
      <Link href={`/blog/${post._id}`} className="group block">
        <div className="relative rounded-2xl overflow-hidden shadow-lg">
          {post.featuredImage && (
            <div className="relative h-96">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            </div>
          )}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="flex items-center space-x-2 text-sm mb-3">
              {post.categories?.slice(0, 2).map((category, index) => (
                <span key={index} className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                  {category}
                </span>
              ))}
            </div>
            <h2 className="text-3xl font-bold mb-2 group-hover:text-blue-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-gray-200 line-clamp-2 mb-4">{post.excerpt}</p>
            <div className="flex items-center space-x-4 text-sm">
              <span>{post.author.name}</span>
              <span>•</span>
              <span>{formatDate(post.publishedAt || post.createdAt)}</span>
              <span>•</span>
              <span>{post.readingTime} min read</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default vertical card
  return (
    <Link href={`/blog/${post._id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
        {post.featuredImage && (
          <div className="relative h-48 overflow-hidden">
            <img
              src={post.featuredImage}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
            <span>{formatRelativeTime(post.publishedAt || post.createdAt)}</span>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-gray-600 line-clamp-2 mb-4">{truncateText(post.excerpt, 100)}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-semibold">
                {post.author.name?.charAt(0).toUpperCase()}
              </div>
              <span className="text-sm text-gray-700">{post.author.name}</span>
            </div>
            <div className="flex items-center space-x-3 text-gray-400">
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views?.toLocaleString() || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>{post.likes?.toLocaleString() || 0}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}