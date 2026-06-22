// types/api.ts
export interface IApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface IApiError {
  status: number;
  message: string;
  errors?: Record<string, string[]>;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface IApiState {
  isLoading: boolean;
  error: string | null;
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface IRequestOptions {
  method?: HttpMethod;
  body?: any;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}