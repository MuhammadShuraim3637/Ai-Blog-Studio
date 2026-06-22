import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Validate email (RFC 5322 compliant)
export function isValidEmail(email: string): boolean {
  const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return emailRegex.test(email);
}

// Validate password strength
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("At least one lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least one number");
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) errors.push("At least one special character");
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

// Sanitize user data (remove sensitive info)
export function sanitizeUser(user: any) {
  const { password, __v, ...sanitized } = user.toObject?.() || user;
  return sanitized;
}

// Generate secure random token
export function generateSecureToken(length: number = 32): string {
  const crypto = require("crypto");
  return crypto.randomBytes(length).toString("hex");
}

// Hash token for storage
export function hashToken(token: string): string {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Rate limiting helper
export function getRateLimitKey(identifier: string, action: string): string {
  return `ratelimit:${action}:${identifier}`;
}

// Parse error messages safely
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "An unknown error occurred";
}

// Merge class names with tailwind-merge and clsx
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date to readable string
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// Format relative time (e.g. "2h ago")
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) return `${diffInDays}d ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths}mo ago`;
  
  return formatDate(d);
}

// Truncate text to limit size with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}