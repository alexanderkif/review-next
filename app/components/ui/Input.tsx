'use client';

import { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'clay' | 'glass';
  error?: string;
  label?: string;
  hideLabel?: boolean;
  password?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'clay',
      error,
      label,
      hideLabel = false,
      password = false,
      id,
      type,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const [showPassword, setShowPassword] = useState(false);

    const inputType = password ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'mb-2 block text-sm font-medium',
              variant === 'clay' ? 'text-slate-700' : 'text-white',
              hideLabel && 'sr-only',
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          <input
            id={inputId}
            type={inputType}
            className={cn(
              'w-full rounded-xl border px-4 py-3 transition-all duration-300',
              'placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none',

              // Variants
              {
                clay: 'border-slate-200 bg-white text-slate-800 shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff] focus:shadow-[inset_1px_1px_1px_#d1d1d1,_inset_-1px_-1px_1px_#ffffff]',
                glass:
                  'border-white/20 bg-white/10 text-white backdrop-blur-md placeholder:text-white/80 focus:bg-white/20',
              }[variant],

              error && 'border-red-400',
              password && 'pr-10',

              className,
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={errorId}
            ref={ref}
            {...props}
          />
          {password && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className={cn(
                'absolute top-1/2 right-3 -translate-y-1/2 rounded transition-colors focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none',
                variant === 'glass'
                  ? 'text-white/70 hover:text-white'
                  : 'text-slate-400 hover:text-slate-600',
              )}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          )}
        </div>

        {error && (
          <p id={errorId} className="animate-fade-in mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'clay' | 'glass';
  error?: string;
  label?: string;
  hideLabel?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'clay', error, label, hideLabel = false, id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || `textarea-${generatedId}`;
    const errorId = error ? `${textareaId}-error` : undefined;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className={cn(
              'mb-2 block text-sm font-medium',
              variant === 'clay' ? 'text-slate-700' : 'text-white',
              hideLabel && 'sr-only',
            )}
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            'w-full resize-none rounded-xl border px-4 py-3 transition-all duration-300',
            'placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none',

            // Variants
            {
              clay: 'border-slate-200 bg-white text-slate-800 shadow-[inset_2px_2px_2px_#d1d1d1,_inset_-2px_-2px_2px_#ffffff]',
              glass:
                'border-white/20 bg-white/10 text-white backdrop-blur-md placeholder:text-white/80',
            }[variant],

            error && 'border-red-400',

            className,
          )}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={errorId}
          ref={ref}
          {...props}
        />

        {error && (
          <p id={errorId} className="mt-2 text-sm text-red-500" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Textarea.displayName = 'Textarea';
