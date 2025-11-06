'use client';

import { ReactNode, CSSProperties } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'clay' | 'glass';
  hover?: boolean;
  style?: CSSProperties;
}

export const Card = ({ 
  children, 
  className, 
  variant = 'clay', 
  hover = true,
  style,
  ...props
}: CardProps) => {
  return (
    <div
      style={style}
      className={cn(
        'rounded-2xl p-6 transition-all duration-200',
        
        // Variants
        {
          // Claymorph style - полный неоморфизм с внешними и внутренними тенями
          'clay': 'bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] shadow-[4.5px_4.5px_9px_#c5c5c5,_-2.25px_-2.25px_9px_#ffffff,_inset_-2px_-2px_1.5px_#8a8a8acc]',
          
          // Glassmorphism style с полными стеклянными эффектами
          'glass': 'glass-panel transition-all duration-300'
        }[variant],
        
        // Hover effects - используем константное увеличение для всех карточек
        hover && {
          'clay': variant === 'clay' && 'hover:from-[#edf2f7] hover:to-[#e5ecf1] hover:shadow-[6px_6px_12px_#c5c5c5,_-3px_-3px_12px_#ffffff,_inset_-2px_-2px_1.5px_#8a8a8acc] transition-all duration-300',
          'glass': variant === 'glass' && 'hover:from-white/30 hover:to-white/20 transition-all duration-300'
        }[variant],
        
        className
      )}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export const CardHeader = ({ children, className }: CardHeaderProps) => (
  <div className={cn('mb-4', className)}>
    {children}
  </div>
);

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export const CardContent = ({ children, className }: CardContentProps) => (
  <div className={className}>
    {children}
  </div>
);

interface CardTitleProps {
  children: ReactNode;
  className?: string;
}

export const CardTitle = ({ children, className }: CardTitleProps) => (
  <h3 className={cn('text-xl font-semibold text-slate-800', className)}>
    {children}
  </h3>
);