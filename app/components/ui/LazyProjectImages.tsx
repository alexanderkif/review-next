'use client';

import { useState } from 'react';
import LazyImage from './LazyImage';

interface LazyProjectImagesProps {
  imageUrls: string[]; // Direct array of image URLs
  title: string;
  className?: string;
  currentIndex?: number;
  onImageChange?: (index: number) => void;
  onImageClick?: () => void;
  priority?: boolean;
  sizes?: string;
}

const LazyProjectImages = ({
  imageUrls = [] as string[],
  title,
  className = '',
  currentIndex = 0,
  onImageChange,
  onImageClick,
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
}: LazyProjectImagesProps) => {
  const [imageIndex, setImageIndex] = useState(currentIndex);

  // If no images, show placeholder
  if (imageUrls.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-emerald-100 via-blue-100 to-purple-100 flex items-center justify-center ${className}`}>
        <div className="text-slate-500 text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-emerald-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">Project</p>
          <p className="text-xs text-slate-400 mt-1">Add images to showcase this project</p>
        </div>
      </div>
    );
  }

  const handlePreviousImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = imageIndex > 0 ? imageIndex - 1 : imageUrls.length - 1;
    setImageIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newIndex = imageIndex < imageUrls.length - 1 ? imageIndex + 1 : 0;
    setImageIndex(newIndex);
    onImageChange?.(newIndex);
  };

  const handleImageClick = () => {
    onImageClick?.();
  };

  const currentImageUrl = imageUrls[imageIndex];

  return (
    <div className={`relative ${className} ${onImageClick ? 'cursor-pointer' : ''}`} onClick={handleImageClick}>
      <LazyImage
        src={currentImageUrl}
        alt={`${title} - Image ${imageIndex + 1}`}
        className="w-full h-full object-contain"
        width={320}
        height={240}
        priority={priority && imageIndex === 0}
        fetchPriority={priority && imageIndex === 0 ? 'high' : 'auto'}
        sizes={sizes}
        fallback={
          <div className="bg-white/10 flex items-center justify-center w-full h-full">
            <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        }
      />

      {/* Navigation arrows - only show if multiple images */}
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={handlePreviousImage}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Previous image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={handleNextImage}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            aria-label="Next image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Image counter */}
          <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
            {imageIndex + 1} / {imageUrls.length}
          </div>
        </>
      )}
    </div>
  );
};

export default LazyProjectImages;