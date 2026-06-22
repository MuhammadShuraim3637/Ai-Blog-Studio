// app/dashboard/analytics/page.tsx
'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  totalPosts: number;
  totalViews: number;
  totalLikes: number;
  aiGeneratedCount: number;
  publishedCount: number;
  draftCount: number;
}

export default function AnalyticsPage() {
  const [metrics, setMetrics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/analytics', { method: 'GET' });
        const result = await response.json();

        if (result.success) {
          setMetrics(result.data);
        } else {
          setError(result.error || 'Failed to fetch metrics');
        }
      } catch (err) {
        console.error('Frontend Analytics fetch error:', err);
        setError('Network error loading analytics data');
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  }, []); // 🔑 FIXED: Brackets aur hooks spacing ekdum perfect thik kar di hain!

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Gathering platform insights...</p>
        </div>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 max-w-2xl mx-auto mt-10">
        <h3 className="font-bold text-lg mb-1">Analytics Generation Failure</h3>
        <p className="text-sm">{error || "Something went wrong while retrieving system metrics."}</p>
      </div>
    );
  }

  // Calculate safe percentages for visual indicators
  const aiPercentage = metrics.totalPosts > 0 
    ? Math.round((metrics.aiGeneratedCount / metrics.totalPosts) * 100) 
    : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Studio Performance</h1>
        <p className="text-gray-500 text-sm mt-1">Deep dive analytics and automated metrics tracking for AI Blog Studio.</p>
      </div>

      {/* Grid of Key Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Total Views Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Accumulated Engagement</p>
            <h3 className="text-3xl font-bold text-gray-900">{metrics.totalViews.toLocaleString()}</h3>
            <p className="text-xs text-green-600 font-medium">Total Post Views</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
        </div>

        {/* Total Likes Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Audience Approval</p>
            <h3 className="text-3xl font-bold text-gray-900">{metrics.totalLikes.toLocaleString()}</h3>
            <p className="text-xs text-red-600 font-medium">Total System Endorsements</p>
          </div>
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
        </div>

        {/* Total Posts Card */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between sm:col-span-2 lg:col-span-1
        ">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-500">Content Index</p>
            <h3 className="text-3xl font-bold text-gray-900">{metrics.totalPosts.toLocaleString()}</h3>
            <p className="text-xs text-indigo-600 font-medium">{metrics.publishedCount} Published · {metrics.draftCount} Drafts</p>
          </div>
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Breakdowns section */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-2xl">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Automation Matrix</h3>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 font-medium">AI Generated Articles</span>
              <span className="text-blue-600 font-bold">{aiPercentage}%</span>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500" 
                style={{ width: `${aiPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 mt-1">{metrics.aiGeneratedCount} out of {metrics.totalPosts} posts created via automation.</p>
          </div>
        </div>
      </div>
    </div>
  );
}