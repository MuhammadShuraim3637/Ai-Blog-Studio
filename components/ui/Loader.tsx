// components/ui/Loader.tsx
import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const loaderVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        xs: "h-4 w-4 border-2",
        sm: "h-6 w-6 border-2",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-4",
      },
      variant: {
        primary: "text-blue-600",
        secondary: "text-gray-600",
        white: "text-white",
        success: "text-green-600",
        danger: "text-red-600",
        warning: "text-yellow-600",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);

export interface LoaderProps extends VariantProps<typeof loaderVariants> {
  className?: string;
  label?: string;
}

export function Loader({ size, variant, className, label }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={cn(loaderVariants({ size, variant, className }))} />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}

// Skeleton Loader Components
export interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string | number;
  width?: string | number;
  circle?: boolean;
}

export function Skeleton({ className, count = 1, height, width, circle }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "animate-pulse bg-gray-200 rounded",
            circle ? "rounded-full" : "",
            className
          )}
          style={{
            height: height || (circle ? width : 'auto'),
            width: width || (circle ? height : '100%'),
          }}
        />
      ))}
    </>
  );
}

// Page Loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <Loader size="lg" label="Loading..." />
    </div>
  );
}

// Full Screen Loader
export function FullScreenLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader size="xl" />
    </div>
  );
}

// Button Loader
export function ButtonLoader() {
  return (
    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}

// Card Loader
export function CardLoader() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <Skeleton className="h-48 w-full mb-4" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

// Post Loader
export function PostLoader() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6">
        <div className="flex items-start space-x-4">
          <Skeleton circle height={48} width={48} />
          <div className="flex-1">
            <Skeleton height={20} width="60%" className="mb-2" />
            <Skeleton height={16} width="40%" />
          </div>
        </div>
        <Skeleton height={100} width="100%" className="mt-4" />
      </div>
    </div>
  );
}

// Table Loader
export function TableLoader({ rows = 5, columns = 4 }) {
  return (
    <div className="overflow-hidden">
      <div className="divide-y divide-gray-100">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="flex-1 h-6" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Inline Loader
export function InlineLoader() {
  return (
    <div className="inline-block">
      <Loader size="sm" />
    </div>
  );
}

export default Loader;