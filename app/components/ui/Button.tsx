'use client';

import { ButtonHTMLAttributes, ReactNode, forwardRef } from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'clay' | 'glass' | 'secondary' | 'ghost' | 'primary' | 'primary-glass';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'clay', size = 'md', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors duration-200 cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/80',
          
          // Variants
          {
            // Claymorph style - full neomorphism with external and internal shadows
            'clay': 'bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] text-slate-800 shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc] hover:from-[#edf2f7] hover:to-[#e5ecf1] hover:text-slate-900 font-medium',
            
            // Primary - neomorphic style with green-blue gradient and darker shadows like Save as PDF
            'primary': 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-500 hover:to-blue-500 hover:text-white font-medium shadow-[3px_3px_6px_#9ca3af,_-1.5px_-1.5px_6px_rgba(255,255,255,0.1),_inset_-2px_-2px_1px_rgba(0,0,0,0.3)]',
            
            // Primary-glass - glass style primary without external shadows
            'primary-glass': 'bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-500 hover:to-blue-500 hover:text-white font-medium shadow-[inset_-2px_-2px_1px_rgba(0,0,0,0.3)]',
            
            // Glassmorphism style for projects - pure glass effect without external shadows
            'glass': 'bg-gradient-to-br from-white/25 to-white/15 backdrop-blur-md border border-white/40 text-white hover:from-white/30 hover:to-white/20 hover:text-white transition-colors',
            
            // Secondary for navigation - neomorphic style matching clay variant
            'secondary': 'bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] text-slate-800 shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc] hover:from-[#edf2f7] hover:to-[#e5ecf1] hover:text-slate-900 font-medium transition-colors',
            
            // Ghost для второстепенных действий
            'ghost': 'bg-transparent hover:bg-[#e8edf2]/50 text-slate-600 hover:text-slate-800 transition-colors'
          }[variant],
          
          // Sizes
          {
            'sm': 'px-4 py-2.5 text-sm',
            'md': 'px-6 py-3 text-base',
            'lg': 'px-8 py-4 text-lg'
          }[size],
          
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';