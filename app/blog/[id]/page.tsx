// app/blog/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    _id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  status: string;
  categories: string[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  views: number;
  likes: number;
  shares: number;
  readingTime: number;
  aiGenerated: boolean;
  publishedAt: string;
  createdAt: string;
}

export default function PublicBlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);

  const postId = params.id as string;

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/posts/${postId}`);
        const data = await response.json();

        if (!data.success) {
          if (data.error === 'Post not found') {
            router.push('/404');
          } else {
            setError(data.error || 'Failed to load post');
          }
          return;
        }

        setPost(data.data);
        setLikesCount(data.data.likes || 0);
        
        // Fetch related posts
        if (data.data.tags && data.data.tags.length > 0) {
          const relatedResponse = await fetch(
            `/api/posts?tags=${data.data.tags[0]}&limit=3&status=published`
          );
          const relatedData = await relatedResponse.json();
          if (relatedData.success) {
            const filtered = relatedData.data.filter((p: BlogPost) => p._id !== postId);
            setRelatedPosts(filtered.slice(0, 3));
          }
        }
      } catch (err) {
        setError('Something went wrong. Please try again later.');
        console.error('Error fetching post:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) {
      fetchPost();
    }
  }, [postId, router]);

  // Handle like
  const handleLike = async () => {
    if (isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLikesCount(data.likes);
        setIsLiked(data.liked);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  // Handle share
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
        
        // Increment share count
        await fetch(`/api/posts/${postId}/share`, { method: 'POST' });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Not Found</h1>
          <p className="text-gray-600 mb-6">
            {error || "The article you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <Head>
        <title>{post.seoTitle || post.title} | AI Blog Studio</title>
        <meta name="description" content={post.seoDescription || post.excerpt} />
        <meta name="keywords" content={post.tags?.join(', ')} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.featuredImage && <meta property="og:image" content={post.featuredImage} />}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://aiblogstudio.com/blog/${post._id}`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.excerpt} />
        {post.featuredImage && <meta name="twitter:image" content={post.featuredImage} />}
        <link rel="canonical" href={`https://aiblogstudio.com/blog/${post._id}`} />
      </Head>

      {/* Blog Post Container */}
      <article className="min-h-screen bg-white">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-blue-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 py-16 md:py-24">
            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {post.categories.map((category, index) => (
                  <Link
                    key={index}
                    href={`/category/${category.toLowerCase()}`}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm hover:bg-white/30 transition-colors"
                  >
                    {category}
                  </Link>
                ))}
              </div>
            )}
            
            {/* Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>
            
            {/* Excerpt */}
            <p className="text-xl text-blue-100 mb-8 max-w-2xl">
              {post.excerpt}
            </p>
            
            {/* Author Info */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-lg">
                  {post.author?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div>
                  <p className="font-semibold">{post.author?.name || 'Anonymous'}</p>
                  <div className="flex items-center space-x-2 text-sm text-blue-200">
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                    <span>•</span>
                    <span>{post.readingTime} min read</span>
                  </div>
                </div>
              </div>
              
              {/* AI Badge */}
              {post.aiGenerated && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span className="text-sm">AI Generated</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative -mt-16 max-w-4xl mx-auto px-4">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto object-cover"
                loading="eager"
              />
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          {/* Table of Contents (Auto-generated) */}
          <div className="bg-gray-50 rounded-xl p-6 mb-8 sticky top-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <span>Table of Contents</span>
            </h3>
            <div className="text-sm text-gray-600 space-y-1" id="table-of-contents">
              {/* Auto-generated by JS */}
            </div>
          </div>

          {/* Main Content */}
          <div 
            className="prose prose-lg prose-blue max-w-none
              prose-headings:font-bold prose-headings:text-gray-900
              prose-h1:text-4xl prose-h1:mt-8 prose-h1:mb-4
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
              prose-p:text-gray-700 prose-p:leading-relaxed
              prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              prose-strong:text-gray-900 prose-strong:font-semibold
              prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl
              prose-img:rounded-xl prose-img:shadow-lg
              prose-ul:list-disc prose-ul:pl-6
              prose-ol:list-decimal prose-ol:pl-6
              prose-li:my-2"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="border-t border-gray-200 pt-8 mt-8">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <Link
                    key={index}
                    href={`/tag/${tag.toLowerCase()}`}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Engagement Section */}
          <div className="border-t border-gray-200 pt-8 mt-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center space-x-4">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={isLiking}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{likesCount} Likes</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>

              {/* Views Count */}
              <div className="flex items-center space-x-2 text-gray-500">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{post.views?.toLocaleString() || 0} views</span>
              </div>
            </div>
          </div>

          {/* Author Bio */}
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 mt-8">
            <div className="flex items-start space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
                {post.author?.name?.charAt(0).toUpperCase() || 'A'}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  Written by {post.author?.name || 'Anonymous'}
                </h3>
                <p className="text-gray-600 text-sm mb-3">
                  Passionate writer and content creator at AI Blog Studio. 
                  Exploring the intersection of technology and creativity.
                </p>
                <Link
                  href={`/author/${post.author?._id}`}
                  className="text-blue-600 text-sm hover:text-blue-700"
                >
                  View all posts by this author →
                </Link>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost._id}
                    href={`/blog/${relatedPost._id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300"
                  >
                    {relatedPost.featuredImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={relatedPost.featuredImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span>{new Date(relatedPost.publishedAt).toLocaleDateString()}</span>
                        <span>{relatedPost.readingTime} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Comments Section (Optional) */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>
            <div className="bg-gray-50 rounded-xl p-6 text-center">
              <p className="text-gray-600">
                No comments yet. Be the first to share your thoughts!
              </p>
              <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Leave a Comment
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Newsletter Signup (Optional) */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 py-12">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold text-white mb-4">
            Never Miss a Post
          </h2>
          <p className="text-blue-100 mb-6">
            Get the latest articles delivered straight to your inbox
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              required
            />
            <button
              type="submit"
              className="px-6 py-2 bg-white text-blue-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

// Helper component for Head meta tags
function Head({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}