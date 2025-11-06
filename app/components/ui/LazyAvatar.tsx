'use client';

import { useState, useEffect, useMemo } from 'react';
import LazyImage from './LazyImage';
import { logger } from '../../lib/logger';

const FallbackAvatar = ({ sizeClass, className, letterFallback }: { sizeClass: string; className?: string; letterFallback: string }) => (
  <div className={`bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold rounded-3xl ${sizeClass} ${className}`}>
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
  lg: 'w-48 h-48 text-6xl'
};

const LazyAvatar = ({
  avatarUrl,
  name,
  className = '',
  size = 'md',
  fallbackLetter,
  disableRotation = false
}: LazyAvatarProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const letterFallback = fallbackLetter || name?.[0]?.toUpperCase() || 'A';
  const sizeClass = sizeClasses[size];

  // Convert avatarUrl to array of URLs
  const avatarUrls = useMemo(() => {
    if (!avatarUrl) return [];
    if (Array.isArray(avatarUrl)) return avatarUrl;
    return [avatarUrl];
  }, [avatarUrl]);

  // Preload all avatar images
  useEffect(() => {
    if (avatarUrls.length <= 1) return;

    avatarUrls.forEach((url, index) => {
      if (index === currentImageIndex) return; // Skip current image, it's already loading

      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set([...prev, index]));
      };
      img.onerror = () => {
        console.warn(`Failed to preload avatar image ${index}:`, url);
      };
      
      // Handle different URL formats
      if (url.startsWith('data:') || url.startsWith('http')) {
        img.src = url;
      } else if (!url.startsWith('/') && !url.includes('/')) {
        img.src = `/api/images/${url}`;
      } else {
        img.src = url;
      }
    });
  }, [avatarUrls, currentImageIndex]);

  // Check if all images are loaded
  const allImagesLoaded = loadedImages.size >= Math.min(avatarUrls.length, 3); // Load at least first 3 images

  // Auto-rotate between multiple avatars every 5 seconds (after images load)
  useEffect(() => {
    if (avatarUrls.length <= 1 || !allImagesLoaded || disableRotation || hoveredIndex !== null) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      // Start fade out, then change image after 250ms, then fade in
      setTimeout(() => {
        setCurrentImageIndex(prev => (prev + 1) % avatarUrls.length);
        setIsTransitioning(false);
      }, 250);
    }, 5000);

    return () => clearInterval(interval);
  }, [avatarUrls.length, allImagesLoaded, disableRotation, hoveredIndex]);

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
    return <FallbackAvatar sizeClass={sizeClass} className={className} letterFallback={letterFallback} />;
  }

  const currentAvatarUrl = avatarUrls[currentImageIndex];

  return (
    <div className={`overflow-hidden rounded-3xl ${sizeClass} ${className} relative`}>
      <div className={`transition-opacity duration-500 absolute inset-0 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        <LazyImage
          key={currentImageIndex}
          src={currentAvatarUrl}
          alt={`${name} avatar ${currentImageIndex + 1}`}
          fill
          sizes="(max-width: 768px) 128px, 192px"
          onLoad={() => {
            try {
              // Mark current image as loaded
              setLoadedImages(prev => new Set([...prev, currentImageIndex]));
            } catch (error) {
              logger.error('Error in onLoad handler:', error);
            }
          }}
          onError={() => {
            try {
              console.warn('Avatar image failed to load:', currentAvatarUrl);
              // If this avatar fails, try to move to next one if available
              if (avatarUrls.length > 1) {
                setCurrentImageIndex(prev => (prev + 1) % avatarUrls.length);
              }
            } catch (error) {
              logger.error('Error in onError handler:', error);
            }
          }}
          fallback={
            <div className={`bg-gradient-to-br from-emerald-600 to-blue-600 flex items-center justify-center text-white font-bold ${sizeClass}`}>
              {letterFallback}
            </div>
          }
        />
      </div>
      
      {/* Indicator dots for multiple avatars */}
      {avatarUrls.length > 1 && !disableRotation && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          {avatarUrls.map((_, index) => (
            <div
              key={index}
              onMouseEnter={() => handleIndicatorHover(index)}
              onMouseLeave={handleIndicatorLeave}
              className={`w-2 h-2 rounded-full transition-colors duration-300 cursor-pointer ${
                index === currentImageIndex
                  ? 'bg-white shadow-lg scale-110'
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