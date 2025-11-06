'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'clay' | 'glass';
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'clay', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-300',
            'placeholder:text-slate-400 focus:outline-none focus:ring-2',
            
            // Variants
            {
              'clay': 'bg-white shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff] border-slate-200 text-slate-800 focus:ring-blue-500/50 focus:shadow-[inset_1px_1px_1px_#d1d1d1,_inset_-1px_-1px_1px_#ffffff]',
              'glass': 'bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/70 focus:ring-white/50 focus:bg-white/20'
            }[variant],
            
            error && 'border-red-400 focus:ring-red-500/50',
            
            className
          )}
          ref={ref}
          {...props}
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'clay' | 'glass';
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'clay', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            'w-full px-4 py-3 rounded-xl border transition-all duration-300 resize-none',
            'placeholder:text-slate-400 focus:outline-none focus:ring-2',
            
            // Variants
            {
              'clay': 'bg-white shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff] border-slate-200 text-slate-800 focus:ring-blue-500/50',
              'glass': 'bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/70 focus:ring-white/50'
            }[variant],
            
            error && 'border-red-400 focus:ring-red-500/50',
            
            className
          )}
          ref={ref}
          {...props}
        />
        
        {error && (
          <p className="mt-2 text-sm text-red-500">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';