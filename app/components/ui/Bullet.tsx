'use client';

import { cn } from '../../lib/utils';

interface BulletProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Bullet = ({ className = '', size = 'md' }: BulletProps) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div
      className={cn(
        'flex-shrink-0 rounded-full bg-gradient-to-br from-emerald-600 to-blue-600',
        'shadow-[2px_2px_4px_#c5c5c5,_-1px_-1px_4px_#ffffff,_inset_-1px_-1px_1px_rgba(0,0,0,0.3),_inset_1px_1px_1px_rgba(255,255,255,0.2)]',
        'transition-colors duration-300',
        sizeClasses[size],
        className,
      )}
    />
  );
};

export default Bullet;
