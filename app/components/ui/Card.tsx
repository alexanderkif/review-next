import { ReactNode, CSSProperties } from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Card = ({ children, className, style }: CardProps) => {
  return (
    <div style={style} className={cn('card', className)}>
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