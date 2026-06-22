// hooks/useAuth.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IUser, IAuthState } from '@/types/user';
import { authService } from '@/services/auth.service';

interface AuthStore extends IAuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<IUser>) => Promise<boolean>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.login({ email, password });
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              error: response.message || 'Login failed',
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

      signup: async (name: string, email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.signup({ name, email, password });
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              error: response.message || 'Signup failed',
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

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authService.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Logout error:', error);
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateUser: async (userData: Partial<IUser>) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authService.updateProfile(userData);
          
          if (response.success && response.data) {
            set({
              user: response.data,
              isLoading: false,
              error: null,
            });
            return true;
          } else {
            set({
              error: response.message || 'Update failed',
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

      checkAuth: async () => {
        const { isAuthenticated, user } = get();
        
        if (isAuthenticated && user) {
          try {
            const response = await authService.getCurrentUser();
            if (response.success && response.data) {
              set({ user: response.data, isAuthenticated: true });
            } else {
              set({ user: null, isAuthenticated: false });
            }
          } catch {
            set({ user: null, isAuthenticated: false });
          }
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);