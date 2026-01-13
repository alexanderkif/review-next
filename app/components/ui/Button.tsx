'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className = '', size = 'md', children, ...props }: ButtonProps,
  ref,
) {
  return (
    <button
      className={cn(
        'btn',
        {
          sm: 'btn-sm',
          md: 'btn-md',
          lg: 'btn-lg',
        }[size],
        className,
      )}
      ref={ref}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
