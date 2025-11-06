'use client';

import { useState, useEffect, ReactNode } from 'react';
import Image from 'next/image';
import { logger } from '../../lib/logger';

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
  sizes
}: LazyImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState<string>('');

  useEffect(() => {
    let mounted = true;

    const loadImage = async () => {
      try {
        // Check if image is already cached
        const isCached = imageCache.has(src);
        setIsLoading(!isCached);
        setHasError(false);

        // If it's already a data URL or external URL, use it directly
        if (src.startsWith('data:') || src.startsWith('http')) {
          if (mounted) {
            setImageSrc(src);
            setIsLoading(false);
            imageCache.add(src);
          }
          return;
        }

        // For API URLs or UUIDs, construct proper URL if needed
        let imageUrl = src;
        if (!src.startsWith('/') && !src.includes('/')) {
          // Looks like a UUID, prepend API path with optimization params
          const w = width ? `?w=${width}` : '';
          const q = priority ? '&q=85' : '&q=75'; // Higher quality for priority images
          imageUrl = `/api/images/${src}${w}${q}`;
        }
        
        // Check cache again with constructed URL
        if (imageCache.has(imageUrl)) {
          if (mounted) {
            setImageSrc(imageUrl);
            setIsLoading(false);
          }
          return;
        }

        const response = await fetch(imageUrl);
        if (!response.ok) {
          throw new Error(`Failed to load image: ${response.status}`);
        }

        if (mounted) {
          setImageSrc(imageUrl);
          setIsLoading(false);
          imageCache.add(src);
          imageCache.add(imageUrl);
        }
      } catch (error) {
        logger.error('Error loading image:', error);
        if (mounted) {
          setHasError(true);
          setIsLoading(false);
          onError?.();
        }
      }
    };

    loadImage();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, onError]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (isLoading) {
    return (
      <div className={`${fill ? 'w-full h-full' : ''} ${className}`}>
        {fallback || (
          <div className="w-full h-full bg-white/10 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
          </div>
        )}
      </div>
    );
  }

  if (hasError || !imageSrc) {
    return (
      <div className={`${fill ? 'w-full h-full' : ''} bg-white/10 border border-white/20 ${className}`}>
        {fallback || (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white/60">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-xs mt-1 block">Failed to load</span>
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