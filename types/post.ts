// types/post.ts
export interface IPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  author: string | IAuthor;
  status: 'draft' | 'published' | 'archived' | 'scheduled';
  scheduleDate?: Date;
  categories: string[];
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
  views: number;
  likes: number;
  shares: number;
  readingTime: number;
  aiGenerated: boolean;
  aiPrompt?: string;
  wordCount: number;
  isFeatured: boolean;
  publishedAt?: Date;
  isLiked?: boolean;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAuthor {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface IPostCreate {
  title: string;
  content: string;
  excerpt?: string;
  featuredImage?: string;
  status?: IPost['status'];
  categories?: string[];
  tags?: string[];
  aiGenerated?: boolean;
  aiPrompt?: string;
}

export interface IPostUpdate {
  title?: string;
  content?: string;
  excerpt?: string;
  featuredImage?: string;
  status?: IPost['status'];
  categories?: string[];
  tags?: string[];
  seoTitle?: string;
  seoDescription?: string;
}

export interface IPostFilter {
  status?: IPost['status'];
  author?: string;
  category?: string;
  tag?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'views' | 'likes' | 'publishedAt';
  sortOrder?: 'asc' | 'desc';
  isFeatured?: boolean;
}

export interface IPostsResponse {
  success: boolean;
  data: IPost[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  error?: string;
}

export interface IPostResponse {
  success: boolean;
  data: IPost;
  message?: string;
}