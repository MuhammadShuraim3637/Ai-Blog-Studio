// services/auth.service.ts
import { IUser, IUserCreate, IUserLogin, IAuthResponse, IUserUpdate } from '@/types/user';
import { apiClient } from '@/lib/api-client';

class AuthService {
  private baseUrl = '/api/auth';

  /**
   * User signup
   */
  async signup(userData: IUserCreate): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/signup`, userData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Signup failed',
        error: error.message,
      };
    }
  }

  /**
   * User login
   */
  async login(credentials: IUserLogin): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/login`, credentials);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Login failed',
        error: error.message,
      };
    }
  }

  /**
   * User logout
   */
  async logout(): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/logout`, {});
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Logout failed',
        error: error.message,
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<IAuthResponse> {
    try {
      const response = await apiClient.get<IAuthResponse>(`${this.baseUrl}/me`);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to get user',
        error: error.message,
      };
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userData: IUserUpdate): Promise<IAuthResponse> {
    try {
      const response = await apiClient.put<IAuthResponse>(`${this.baseUrl}/profile`, userData);
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Update failed',
        error: error.message,
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/change-password`, {
        currentPassword,
        newPassword,
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password change failed',
        error: error.message,
      };
    }
  }

  /**
   * Forgot password - send reset email
   */
  async forgotPassword(email: string): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/forgot-password`, { email });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send reset email',
        error: error.message,
      };
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/reset-password`, {
        token,
        newPassword,
      });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Password reset failed',
        error: error.message,
      };
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/refresh`, {});
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Token refresh failed',
        error: error.message,
      };
    }
  }

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<IAuthResponse> {
    try {
      const response = await apiClient.post<IAuthResponse>(`${this.baseUrl}/verify-email`, { token });
      return response;
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Email verification failed',
        error: error.message,
      };
    }
  }
}

export const authService = new AuthService();