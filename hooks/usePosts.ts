// hooks/usePosts.ts
import { create } from 'zustand';
import { IPost, IPostFilter, IPostCreate, IPostUpdate } from '@/types/post';
import { postService } from '@/services/post.service';

interface PostsStore {
  posts: IPost[];
  currentPost: IPost | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  
  fetchPosts: (filters?: IPostFilter) => Promise<void>;
  fetchPost: (id: string) => Promise<void>;
  createPost: (data: IPostCreate) => Promise<boolean>;
  updatePost: (id: string, data: IPostUpdate) => Promise<boolean>;
  deletePost: (id: string) => Promise<boolean>;
  toggleLike: (id: string) => Promise<void>;
  clearError: () => void;
  resetPosts: () => void;
}

export const usePosts = create<PostsStore>((set, get) => ({
  posts: [],
  currentPost: null,
  isLoading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  },

  fetchPosts: async (filters?: IPostFilter) => {
    set({ isLoading: true, error: null });
    
    try {
      // 🎯 DYNAMIC OVERRIDE: Agar filters directly pass ho rahe hain, to unhe service layer tak safe bhejein
      // Agar aapka postService internal axios ya fetch query build nahi kar raha, to hum yahan fallback timestamp bhi attach kar dete hain.
      const safeFilters = {
        ...filters,
        _t: Date.now() // Cache busting toggle taake Vercel aggressive caching discard kare
      };

      const response = await postService.getPosts(safeFilters);
      
      if (response.success) {
        set({
          posts: response.data,
          pagination: response.pagination,
          isLoading: false,
        });
      } else {
        set({
          error: response.message || 'Failed to fetch posts',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'An error occurred',
        isLoading: false,
      });
    }
  },

  fetchPost: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postService.getPost(id);
      
      if (response.success) {
        set({
          currentPost: response.data,
          isLoading: false,
        });
        
        // Increment view count in background
        postService.incrementViews(id);
      } else {
        set({
          error: response.message || 'Failed to fetch post',
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        error: error.message || 'An error occurred',
        isLoading: false,
      });
    }
  },

  createPost: async (data: IPostCreate) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postService.createPost(data);
      
      if (response.success) {
        set((state) => ({
          posts: [response.data, ...state.posts],
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || 'Failed to create post',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'An error occurred',
        isLoading: false,
      });
      return false;
    }
  },

  updatePost: async (id: string, data: IPostUpdate) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postService.updatePost(id, data);
      
      if (response.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === id ? response.data : post
          ),
          currentPost: state.currentPost?._id === id ? response.data : state.currentPost,
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || 'Failed to update post',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'An error occurred',
        isLoading: false,
      });
      return false;
    }
  },

  deletePost: async (id: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await postService.deletePost(id);
      
      if (response.success) {
        set((state) => ({
          posts: state.posts.filter((post) => post._id !== id),
          currentPost: state.currentPost?._id === id ? null : state.currentPost,
          isLoading: false,
        }));
        return true;
      } else {
        set({
          error: response.message || 'Failed to delete post',
          isLoading: false,
        });
        return false;
      }
    } catch (error: any) {
      set({
        error: error.message || 'An error occurred',
        isLoading: false,
      });
      return false;
    }
  },

  toggleLike: async (id: string) => {
    try {
      const response = await postService.toggleLike(id);
      
      if (response.success) {
        set((state) => ({
          posts: state.posts.map((post) =>
            post._id === id
              ? { ...post, likes: response.likes, isLiked: response.liked }
              : post
          ),
          currentPost: state.currentPost?._id === id
            ? { ...state.currentPost, likes: response.likes, isLiked: response.liked }
            : state.currentPost,
        }));
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  },

  clearError: () => set({ error: null }),
  
  resetPosts: () => set({
    posts: [],
    currentPost: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 0,
    },
  }),
}));