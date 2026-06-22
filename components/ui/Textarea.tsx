// components/ui/Textarea.tsx
import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  rows?: number;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className,
    label,
    error,
    helperText,
    required,
    rows = 4,
    disabled,
    ...props 
  }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <textarea
          rows={rows}
          className={cn(
            "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
            "disabled:bg-gray-100 disabled:cursor-not-allowed",
            "resize-y",
            error && "border-red-500 focus:ring-red-500 focus:border-red-500",
            className
          )}
          ref={ref}
          disabled={disabled}
          {...props}
        />
        
        {error && (
          <p className="mt-1.5 text-sm text-red-600">{error}</p>
        )}
        
        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };