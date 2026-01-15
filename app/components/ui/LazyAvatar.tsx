'use client';

import { useState, useEffect, useMemo } from 'react';
import LazyImage from './LazyImage';
import { logger } from '../../lib/logger';

const FallbackAvatar = ({
  sizeClass,
  className,
  letterFallback,
}: {
  sizeClass: string;
  className?: string;
  letterFallback: string;
}) => (
  <div
    className={`flex items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-600 to-blue-600 font-bold text-white ${sizeClass} ${className}`}
  >
    {letterFallback}
  </div>
);

interface LazyAvatarProps {
  avatarUrl?: string | string[]; // Direct URL or array of URLs for avatar images
  name: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  fallbackLetter?: string;
  disableRotation?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-32 h-32 text-4xl',
  lg: 'w-48 h-48 text-6xl',
};

const LazyAvatar = ({
  avatarUrl,
  name,
  className = '',
  size = 'md',
  fallbackLetter,
  disableRotation = false,
}: LazyAvatarProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const letterFallback = fallbackLetter || name?.[0]?.toUpperCase() || 'A';
  const sizeClass = sizeClasses[size];

  // Convert avatarUrl to array of URLs
  const avatarUrls = useMemo(() => {
    if (!avatarUrl) return [];
    if (Array.isArray(avatarUrl)) return avatarUrl;
    return [avatarUrl];
  }, [avatarUrl]);

  // Auto-rotate between multiple avatars every 5 seconds
  useEffect(() => {
    if (avatarUrls.length <= 1 || disableRotation || hoveredIndex !== null) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);

      // Start fade out, then change image after 250ms, then fade in
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % avatarUrls.length);
        setIsTransitioning(false);
      }, 250);
    }, 5000);

    return () => clearInterval(interval);
  }, [avatarUrls.length, disableRotation, hoveredIndex]);

  // Handle indicator hover
  const handleIndicatorHover = (index: number) => {
    setHoveredIndex(index);
    setCurrentImageIndex(index);
  };

  // Handle leaving indicator area
  const handleIndicatorLeave = () => {
    setHoveredIndex(null);
    // Resume rotation will happen automatically in useEffect
  };

  // If no avatar URLs provided, show fallback
  if (avatarUrls.length === 0) {
    return (
      <FallbackAvatar sizeClass={sizeClass} className={className} letterFallback={letterFallback} />
    );
  }

  return (
    <div className={`overflow-hidden rounded-3xl ${sizeClass} ${className} relative`}>
      {/* Render all images but hide inactive ones */}
      {avatarUrls.map((url, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentImageIndex && !isTransitioning ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ pointerEvents: index === currentImageIndex ? 'auto' : 'none' }}
        >
          <LazyImage
            src={url}
            alt=""
            fill
            sizes="(max-width: 768px) 128px, 192px"
            priority={index === currentImageIndex}
            fetchPriority={index === currentImageIndex ? 'high' : 'low'}
            onError={() => {
              try {
                console.warn('Avatar image failed to load:', url);
                if (avatarUrls.length > 1 && index === currentImageIndex) {
                  setCurrentImageIndex((prev) => (prev + 1) % avatarUrls.length);
                }
              } catch (error) {
                logger.error('Error in onError handler:', error);
              }
            }}
            fallback={
              <div
                className={`flex items-center justify-center bg-gradient-to-br from-emerald-600 to-blue-600 font-bold text-white ${sizeClass}`}
              >
                {letterFallback}
              </div>
            }
          />
        </div>
      ))}

      {/* Indicator dots for multiple avatars */}
      {avatarUrls.length > 1 && !disableRotation && (
        <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
          {avatarUrls.map((_, index) => (
            <div
              key={index}
              onMouseEnter={() => handleIndicatorHover(index)}
              onMouseLeave={handleIndicatorLeave}
              className={`h-2 w-2 cursor-pointer rounded-full transition-colors duration-300 ${
                index === currentImageIndex
                  ? 'scale-110 bg-white shadow-lg'
                  : 'bg-white/60 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LazyAvatar;
