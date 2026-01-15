'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, Maximize2 } from 'lucide-react';
import Tooltip from './ui/Tooltip';

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
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
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
          fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
          onError={() => console.warn('Image failed to load:', imageUrl)}
        />
      );
    } catch (error) {
      console.warn('Invalid image URL:', imageUrl, error);
      return (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
          <div className="text-gray-500">Invalid image</div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Основная карусель */}
      <div className="group relative">
        {/* Main image */}
        <div
          ref={imageContainerRef}
          className="relative aspect-video cursor-pointer overflow-hidden rounded-lg bg-gradient-to-br from-white/5 to-white/20"
          onClick={toggleFullscreen}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {renderImageContent()}

          {/* Иконка полноэкранного режима - дополнительный способ для desktop */}
          <Tooltip content="Fullscreen" position="left">
            <button
              className="absolute top-4 right-4 z-20 cursor-pointer rounded-full bg-black/50 p-2 text-white transition-all hover:bg-black/70 hover:text-white focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              aria-label="Fullscreen"
            >
              <Maximize2 size={20} />
            </button>
          </Tooltip>

          {/* Навигационные стрелки */}
          {images.length > 1 && (
            <>
              <Tooltip content="Previous image" position="right">
                <button
                  className="absolute top-1/2 left-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/70 focus:opacity-100 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  aria-label="Previous image"
                >
                  <ChevronLeft size={20} />
                </button>
              </Tooltip>

              <Tooltip content="Next image" position="left">
                <button
                  className="absolute top-1/2 right-4 z-10 -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-2 text-white opacity-0 transition-all group-hover:opacity-100 hover:bg-black/70 focus:opacity-100 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  aria-label="Next image"
                >
                  <ChevronRight size={20} />
                </button>
              </Tooltip>
            </>
          )}

          {/* Индикатор количества изображений */}
          {images.length > 1 && (
            <div className="pointer-events-none absolute top-4 right-4 rounded-full bg-black/50 px-3 py-1 text-sm text-white backdrop-blur-sm">
              {currentIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Миниатюры */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto px-1 py-1 pb-2">
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
                  className={`relative h-12 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-lg transition-all focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none ${
                    index === currentIndex
                      ? 'opacity-100 ring-2 ring-emerald-600'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === currentIndex ? 'true' : undefined}
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
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
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
      {isFullscreen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm">
            {/* Кнопка закрытия */}
            <Tooltip content="Close" position="left">
              <button
                className="absolute top-4 right-4 z-[10000] cursor-pointer rounded-full bg-black/50 p-3 text-white transition-all hover:bg-black/70 hover:text-white focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                onClick={toggleFullscreen}
                aria-label="Close fullscreen"
              >
                <X size={24} />
              </button>
            </Tooltip>

            {/* Изображение в полноэкранном режиме */}
            <div
              className="relative h-full w-full"
              onClick={(e) => e.stopPropagation()}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {renderImageContent()}

              {/* Навигационные стрелки в полноэкранном режиме */}
              {images.length > 1 && (
                <>
                  <Tooltip content="Previous image" position="right">
                    <button
                      className="absolute top-1/2 left-4 z-[10000] -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevImage();
                      }}
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={28} />
                    </button>
                  </Tooltip>

                  <Tooltip content="Next image" position="left">
                    <button
                      className="absolute top-1/2 right-4 z-[10000] -translate-y-1/2 cursor-pointer rounded-full bg-black/50 p-3 text-white transition-colors hover:bg-black/70 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextImage();
                      }}
                      aria-label="Next image"
                    >
                      <ChevronRight size={28} />
                    </button>
                  </Tooltip>
                </>
              )}

              {/* Счетчик изображений в полноэкранном режиме */}
              {images.length > 1 && (
                <div className="pointer-events-none absolute bottom-8 left-1/2 z-[10000] -translate-x-1/2 rounded-full bg-black/50 px-4 py-2 text-lg text-white backdrop-blur-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
