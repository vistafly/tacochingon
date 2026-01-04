'use client';

import { forwardRef, ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'cta' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          {
            // Variants
            'bg-rojo text-white hover:bg-rojo/90 focus:ring-rojo': variant === 'primary',
            'bg-transparent border-2 border-amarillo text-amarillo hover:bg-amarillo hover:text-negro focus:ring-amarillo': variant === 'secondary',
            'bg-verde text-white font-bold hover:bg-verde/90 shadow-lg focus:ring-verde': variant === 'cta',
            'bg-transparent text-gray-400 hover:text-white hover:bg-gray-700 focus:ring-gray-500': variant === 'ghost',

            // Sizes
            'px-4 py-2 text-sm': size === 'sm',
            'px-6 py-3 text-base': size === 'md',
            'px-8 py-4 text-lg': size === 'lg',

            // Disabled
            'opacity-50 cursor-not-allowed': disabled,
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
