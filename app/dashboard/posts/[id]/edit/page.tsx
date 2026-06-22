'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('draft');
  const [loading, setLoading] = useState(true);

  // Next.js 15+ compatibility for unwrapping params safely
  useEffect(() => {
    if (params?.id) {
      setId(Array.isArray(params.id) ? params.id[0] : params.id);
    }
  }, [params]);

  useEffect(() => {
    if (!id) return;

    // Post ka data fetch karein edit form me populating ke liye
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${id}`);
        const result = await res.json();
        if (res.ok && result.success) {
          setTitle(result.data.title);
          setContent(result.data.content);
          setStatus(result.data.status || 'draft');
        }
      } catch (err) {
        console.error("Error fetching post:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'PUT', // ya PATCH jo bhi aapka update route ho
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, status }),
      });

      if (res.ok) {
        alert("Post updated successfully!");
        router.push(`/dashboard/posts/${id}`);
        router.refresh();
      } else {
        alert("Failed to update post.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6">Loading post data...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold mb-6">Edit Blog Post</h1>
      <form onSubmit={handleUpdate} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea 
            rows={10}
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select 
            value={status} 
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border border-gray-300 rounded-lg"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </form>
    </div>
  );
}