// components/ui/Card.tsx
import { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const cardVariants = cva(
  "bg-white rounded-2xl transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border border-gray-100 shadow-sm hover:shadow-md",
        elevated: "shadow-lg hover:shadow-xl",
        outline: "border-2 border-gray-200",
        ghost: "border-none shadow-none",
        gradient: "bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  children: ReactNode;
  header?: ReactNode;
  footer?: ReactNode;
  headerClassName?: string;
  footerClassName?: string;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    className,
    variant,
    padding,
    header,
    footer,
    headerClassName,
    footerClassName,
    children,
    ...props 
  }, ref) => {
    return (
      <div
        className={cn(cardVariants({ variant, padding, className }))}
        ref={ref}
        {...props}
      >
        {header && (
          <div className={cn("border-b border-gray-100 pb-4 mb-4", headerClassName)}>
            {header}
          </div>
        )}
        
        {children}
        
        {footer && (
          <div className={cn("border-t border-gray-100 pt-4 mt-4", footerClassName)}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

// Card Components
interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("mb-4", className)} ref={ref} {...props}>
      {children}
    </div>
  )
);
CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h3 className={cn("text-lg font-semibold text-gray-900", className)} ref={ref} {...props}>
      {children}
    </h3>
  )
);
CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, children, ...props }, ref) => (
    <p className={cn("text-sm text-gray-500 mt-1", className)} ref={ref} {...props}>
      {children}
    </p>
  )
);
CardDescription.displayName = 'CardDescription';

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("", className)} ref={ref} {...props}>
      {children}
    </div>
  )
);
CardContent.displayName = 'CardContent';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...props }, ref) => (
    <div className={cn("mt-4 pt-4 border-t border-gray-100", className)} ref={ref} {...props}>
      {children}
    </div>
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };