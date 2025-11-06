'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';

interface ProjectImageCarouselProps {
  images: string[];
  title: string;
}

export default function ProjectImageCarousel({ images, title }: ProjectImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Минимальная дистанция свайпа (в пикселях)
  const minSwipeDistance = 50;

  const nextImage = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    // Блокируем скролл при открытом полноэкранном режиме
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    // Очистка при размонтировании
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  useEffect(() => {
    // Обработка клавиш Escape и стрелок
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return;

      switch (e.key) {
        case 'Escape':
          setIsFullscreen(false);
          break;
        case 'ArrowLeft':
          prevImage();
          break;
        case 'ArrowRight':
          nextImage();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, currentIndex, nextImage, prevImage]);

  if (!images || images.length === 0) return null;

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const renderImageContent = () => {
    const imageUrl = images[currentIndex];
    
    // Validate URL
    if (!imageUrl || typeof imageUrl !== 'string') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
          <div className="text-gray-500">No image available</div>
        </div>
      );
    }
    
    try {
      // Check if it's a valid URL by trying to create URL object for external URLs
      if (imageUrl.startsWith('http')) {
        new URL(imageUrl);
      }
      
      return (
        <Image
          src={imageUrl}
          alt={`${title} - image ${currentIndex + 1}`}
          fill
          className="object-contain transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
          priority={currentIndex === 0}
          fetchPriority={currentIndex === 0 ? "high" : "auto"}
          onError={() => console.warn('Image failed to load:', imageUrl)}
        />
      );
    } catch (error) {
      console.warn('Invalid image URL:', imageUrl, error);
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
          <div className="text-gray-500">Invalid image</div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Основная карусель */}
      <div className="relative group">
        {/* Main image */}
        <div 
          ref={imageContainerRef}
          className="aspect-video relative overflow-hidden rounded-lg bg-gradient-to-br from-white/5 to-white/20 cursor-pointer"
          onClick={toggleFullscreen}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {renderImageContent()}
          
          {/* Иконка полноэкранного режима - дополнительный способ для desktop */}
          <button
            className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-all bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            title="Fullscreen"
            aria-label="Fullscreen"
          >
            <Maximize2 size={20} />
          </button>
        
          {/* Навигационные стрелки */}
          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                title="Previous image"
                aria-label="Previous image"
              >
                <ChevronLeft size={20} />
              </button>
              
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all bg-black/50 hover:bg-black/70 text-white p-2 rounded-full z-10 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                title="Next image"
                aria-label="Next image"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Индикатор количества изображений */}
          {images.length > 1 && (
            <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full text-white text-sm pointer-events-none">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Миниатюры */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 px-1 py-1">
            {images.map((image, index) => {
              // Validate each thumbnail URL
              const isValidUrl = (() => {
                if (!image || typeof image !== 'string') return false;
                try {
                  if (image.startsWith('http')) {
                    new URL(image);
                  }
                  return true;
                } catch {
                  return false;
                }
              })();
              
              return (
                <button
                  key={index}
                  onClick={() => goToImage(index)}
                  className={`flex-shrink-0 relative w-20 h-12 rounded-lg overflow-hidden transition-all cursor-pointer ${
                    index === currentIndex
                      ? 'ring-2 ring-white/50 opacity-100'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  {isValidUrl ? (
                    <Image
                      src={image}
                      alt={`Миниатюра ${index + 1}`}
                      fill
                      className="object-contain"
                      sizes="80px"
                      onError={() => console.warn('Thumbnail failed to load:', image)}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-xs text-gray-500">?</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Полноэкранный режим через Portal */}
      {isFullscreen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-sm flex items-center justify-center"
        >
          {/* Кнопка закрытия */}
          <button
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white hover:text-white p-3 rounded-full transition-all cursor-pointer z-[10000]"
            onClick={toggleFullscreen}
            title="Close"
            aria-label="Close fullscreen"
          >
            <X size={24} />
          </button>

          {/* Изображение в полноэкранном режиме */}
          <div 
            className="relative w-full h-full"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {renderImageContent()}
            
            {/* Навигационные стрелки в полноэкранном режиме */}
            {images.length > 1 && (
              <>
                <button
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-[10000] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  title="Previous image"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={28} />
                </button>
                
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-[10000] cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  title="Next image"
                  aria-label="Next image"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}

            {/* Счетчик изображений в полноэкранном режиме */}
            {images.length > 1 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 backdrop-blur-sm rounded-full text-white text-lg pointer-events-none z-[10000]">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}