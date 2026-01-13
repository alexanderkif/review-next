'use client';

import { useState, ReactNode } from 'react';
import Image from 'next/image';

// Global cache for loaded images
const imageCache = new Set<string>();

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  objectFit?: 'cover' | 'contain';
  fallback?: ReactNode;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  fetchPriority?: 'high' | 'low' | 'auto';
  sizes?: string;
}

const LazyImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  fill = false,
  objectFit = 'contain',
  fallback,
  onLoad,
  onError,
  priority = false,
  fetchPriority = 'auto',
  sizes,
}: LazyImageProps) => {
  const [hasError, setHasError] = useState(false);

  // Construct proper image URL
  const imageSrc = (() => {
    // Data URLs and external URLs - use as-is
    if (src.startsWith('data:') || src.startsWith('http')) {
      return src;
    }

    // UUID format - construct API path
    if (!src.startsWith('/') && !src.includes('/')) {
      return `/api/images/${src}`;
    }

    // Already a path
    return src;
  })();

  const handleImageLoad = () => {
    imageCache.add(src);
    imageCache.add(imageSrc);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    onError?.();
  };

  if (hasError || !imageSrc) {
    return (
      <div
        className={`${fill ? 'h-full w-full' : ''} border border-white/20 bg-white/10 ${className}`}
      >
        {fallback || (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center text-white/60">
              <svg className="mx-auto h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="mt-1 block text-xs">Failed to load</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return fill ? (
    <Image
      src={imageSrc}
      alt={alt}
      fill
      className={className}
      style={{ objectFit }}
      onLoad={handleImageLoad}
      onError={handleImageError}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      fetchPriority={fetchPriority}
      sizes={sizes}
      placeholder="empty"
    />
  ) : (
    <Image
      src={imageSrc}
      alt={alt}
      width={width || 400}
      height={height || 300}
      className={className}
      style={{ width: 'auto', height: 'auto' }}
      onLoad={handleImageLoad}
      onError={handleImageError}
      priority={priority}
      loading={priority ? undefined : 'lazy'}
      fetchPriority={fetchPriority}
      sizes={sizes}
      placeholder="empty"
    />
  );
};

export default LazyImage;
