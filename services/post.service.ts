// services/post.service.ts
import { IPost, IPostCreate, IPostUpdate, IPostFilter, IPostsResponse, IPostResponse } from '@/types/post';
import { apiClient } from '@/lib/api-client';

class PostService {
  private baseUrl = '/api/posts';

  /**
   * Get all posts with filtering and pagination
   */
  async getPosts(filters?: IPostFilter): Promise<IPostsResponse> {
    try {
      const queryParams = new URLSearchParams();
      
      // 🔑 FORCE CACHE BUSTING: Hamesha unique timestamp bhein taake Next.js RSC router cache bypass ho sake
      queryParams.append('_t', Date.now().toString());

      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.baseUrl}?${queryParams.toString()}`;
      
      // ApiClient configuration default dynamic fetch rules bypass layer
      const response = await apiClient.get<IPostsResponse>(url);
      return response;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
        message: error.message || 'Failed to fetch posts',
      };
    }
  }

  /**
   * Get single post by slug or ID
   */
  async getPost(identifier: string): Promise<IPostResponse> {
    try {
      // Single item view par bhi timestamp pass kar rahay hain fresh fetch k liye
      const response = await apiClient.get<IPostResponse>(`${this.baseUrl}/${identifier}?_t=${Date.now()}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        data: {} as IPost,
        message: error.message || 'Failed to fetch post',
      };
    }
  }

  /**
   * Create new post
   */
  async createPost(postData: IPostCreate): Promise<IPostResponse> {
    try {
      const response = await apiClient.post<IPostResponse>(this.baseUrl, postData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        data: {} as IPost,
        message: error.message || 'Failed to create post',
      };
    }
  }

  /**
   * Update post
   */
  async updatePost(id: string, postData: IPostUpdate): Promise<IPostResponse> {
    try {
      const response = await apiClient.put<IPostResponse>(`${this.baseUrl}/${id}`, postData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        data: {} as IPost,
        message: error.message || 'Failed to update post',
      };
    }
  }

  /**
   * Delete post
   */
  async deletePost(id: string): Promise<IPostResponse> {
    try {
      const response = await apiClient.delete<IPostResponse>(`${this.baseUrl}/${id}`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        data: {} as IPost,
        message: error.message || 'Failed to delete post',
      };
    }
  }

  /**
   * Toggle like on post
   */
  async toggleLike(id: string): Promise<{ success: boolean; liked: boolean; likes: number }> {
    try {
      const response = await apiClient.post<{ success: boolean; liked: boolean; likes: number }>(
        `${this.baseUrl}/${id}/like`,
        {}
      );
      return response;
    } catch (error: any) {
      return {
        success: false,
        liked: false,
        likes: 0,
      };
    }
  }

  /**
   * Increment post views
   */
  async incrementViews(id: string): Promise<void> {
    try {
      await apiClient.post(`${this.baseUrl}/${id}/view`, {});
    } catch (error) {
      console.error('Failed to increment views:', error);
    }
  }

  /**
   * Get posts by author
   */
  async getPostsByAuthor(authorId: string, page?: number, limit?: number): Promise<IPostsResponse> {
    return this.getPosts({
      author: authorId,
      page,
      limit,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Get featured posts
   */
  async getFeaturedPosts(limit: number = 5): Promise<IPostsResponse> {
    return this.getPosts({
      isFeatured: true,
      status: 'published',
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Get popular posts
   */
  async getPopularPosts(limit: number = 10): Promise<IPostsResponse> {
    return this.getPosts({
      status: 'published',
      limit,
      sortBy: 'views',
      sortOrder: 'desc',
    });
  }

  /**
   * Search posts
   */
  async searchPosts(query: string, page?: number, limit?: number): Promise<IPostsResponse> {
    return this.getPosts({
      search: query,
      status: 'published',
      page,
      limit,
    });
  }

  /**
   * Get posts by category
   */
  async getPostsByCategory(category: string, page?: number, limit?: number): Promise<IPostsResponse> {
    return this.getPosts({
      category,
      status: 'published',
      page,
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Get posts by tag
   */
  async getPostsByTag(tag: string, page?: number, limit?: number): Promise<IPostsResponse> {
    return this.getPosts({
      tag,
      status: 'published',
      page,
      limit,
      sortBy: 'publishedAt',
      sortOrder: 'desc',
    });
  }

  /**
   * Get related posts
   */
  async getRelatedPosts(postId: string, tags: string[], limit: number = 5): Promise<IPostsResponse> {
    try {
      const response = await apiClient.get<IPostsResponse>(`${this.baseUrl}/${postId}/related`, {
        params: { tags: tags.join(','), limit, _t: Date.now() },
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        data: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          pages: 0,
        },
      };
    }
  }

  /**
   * Save post as draft
   */
  async saveDraft(postData: Partial<IPostCreate>): Promise<IPostResponse> {
    return this.createPost({
      ...postData,
      status: 'draft',
    } as IPostCreate);
  }

  /**
   * Publish post
   */
  async publishPost(id: string): Promise<IPostResponse> {
    return this.updatePost(id, { status: 'published' });
  }

  /**
   * Archive post
   */
  async archivePost(id: string): Promise<IPostResponse> {
    return this.updatePost(id, { status: 'archived' });
  }
}

export const postService = new PostService();