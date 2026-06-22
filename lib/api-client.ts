export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  body?: any;
}

class ApiClient {
  private async request<T>(url: string, method: string, options: RequestOptions = {}): Promise<T> {
    let finalUrl = url;
    
    // Append params if present
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
      const queryString = queryParams.toString();
      if (queryString) {
        finalUrl += (finalUrl.includes('?') ? '&' : '?') + queryString;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const config: RequestInit = {
      method,
      headers,
      // 🔑 CRITICAL FIX: explicitely include credentials (cookies) for all fetch requests
      credentials: 'include', 
    };

    if (options.body !== undefined) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(finalUrl, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || errorData.error || `HTTP error! Status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async get<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'GET', options);
  }

  async post<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'POST', { ...options, body });
  }

  async put<T>(url: string, body?: any, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'PUT', { ...options, body });
  }

  async delete<T>(url: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(url, 'DELETE', options);
  }
}

export const apiClient = new ApiClient();