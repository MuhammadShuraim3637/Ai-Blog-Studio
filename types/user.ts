// types/user.ts
export interface IUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'canceled' | 'past_due' | 'trialing';
  subscriptionEndsAt?: Date;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
}

export interface IUserLogin {
  email: string;
  password: string;
}

export interface IUserUpdate {
  name?: string;
  avatar?: string;
  subscriptionTier?: IUser['subscriptionTier'];
}

export interface IAuthResponse {
  success: boolean;
  message: string;
  data?: IUser;
  error?: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IAuthState {
  user: IUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}