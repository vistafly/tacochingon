import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'menu' | 'featured';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'bg-negro-light rounded-xl overflow-hidden transition-all duration-200 border border-gray-700',
          {
            'hover:border-gray-600': variant === 'default' || variant === 'menu',
            'border-2 border-amarillo hover:border-amarillo/80': variant === 'featured',
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardImage = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('relative aspect-[4/3] overflow-hidden', className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardImage.displayName = 'CardImage';

const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('p-4', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = 'CardContent';

export { Card, CardImage, CardContent };
