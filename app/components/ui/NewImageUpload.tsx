'use client';

import { useCallback, useState, useRef, DragEvent, ChangeEvent } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { processImageFile } from '../../lib/image-utils';

interface NewImageUploadProps {
  entityType: 'avatar' | 'project' | 'user';
  entityId: string;
  value?: string; // Image ID or URL for display
  onSuccess?: (imageId: string, url: string) => void;
  onRemove?: () => void;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  accept?: string;
  placeholder?: string;
  isAvatar?: boolean;
}

const NewImageUpload = ({
  entityType,
  entityId,
  value,
  onSuccess,
  onRemove,
  maxSize = 2,
  className = '',
  disabled = false,
  accept = 'image/*',
  placeholder = 'Click to upload image',
  isAvatar = false,
}: NewImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
      setError('');
      setUploading(true);

      try {
        // Process image file
        const result = await processImageFile(file, maxSize);

        if (!result.success) {
          setError(result.error);
          setUploading(false);
          return;
        }

        // Get image dimensions
        const img = new Image();
        img.onload = async () => {
          try {
            // Save to new images system
            const response = await fetch('/api/admin/images', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                entityType,
                entityId,
                imageData: result.base64,
                mimeType: file.type,
                width: img.width,
                height: img.height,
              }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload image');
            }

            const data = await response.json();
            onSuccess?.(data.imageId, data.url);
          } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'Failed to upload image');
          } finally {
            setUploading(false);
          }
        };

        img.onerror = () => {
          setError('Failed to process image');
          setUploading(false);
        };

        img.src = result.base64;
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to process image');
        setUploading(false);
      }
    },
    [entityType, entityId, maxSize, onSuccess],
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (disabled || uploading) return;

      const files = Array.from(event.dataTransfer.files);
      const imageFile = files.find((file) => file.type.startsWith('image/'));

      if (imageFile) {
        handleFileSelect(imageFile);
      } else {
        setError('Please drop an image file');
      }
    },
    [disabled, uploading, handleFileSelect],
  );

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const handleRemove = useCallback(async () => {
    if (!entityId) return;

    try {
      setUploading(true);

      const response = await fetch(
        `/api/admin/images?entityType=${entityType}&entityId=${entityId}`,
        {
          method: 'DELETE',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to remove image');
      }

      onRemove?.();
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  }, [entityType, entityId, onRemove]);

  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  // Show uploaded image
  if (value && !uploading) {
    return (
      <div className={`relative ${className}`}>
        <div
          className={`relative ${isAvatar ? 'h-32 w-32 rounded-3xl' : 'h-48 w-full rounded-xl'} overflow-hidden border-2 shadow-[4px_4px_8px_#c5c5c5,_-2px_-2px_8px_#ffffff] ${isAvatar ? 'border-white/80' : 'border-slate-200'}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value.startsWith('/api/') ? value : `/api/images/${value}`}
            alt={isAvatar ? 'Profile avatar' : 'Uploaded image'}
            className="h-full w-full object-cover"
          />

          {!disabled && (
            <Button
              onClick={handleRemove}
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 bg-black/50 p-0 text-white hover:bg-black/70"
            >
              <X size={16} />
            </Button>
          )}
        </div>

        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>
    );
  }

  // Show upload area
  return (
    <div className={className}>
      <div
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`relative cursor-pointer transition-all duration-200 ${isAvatar ? 'h-32 w-32 rounded-3xl' : 'h-48 w-full rounded-xl'} flex flex-col items-center justify-center border-2 border-dashed border-slate-300 p-4 text-center hover:border-emerald-400 hover:bg-emerald-50/50 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${uploading ? 'pointer-events-none' : ''} `}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`${isAvatar ? 'h-6 w-6' : 'h-8 w-8'} animate-spin rounded-full border-2 border-emerald-600 border-t-transparent`}
            ></div>
            {!isAvatar && <span className="text-sm text-slate-600">Uploading...</span>}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div
              className={`${isAvatar ? 'h-8 w-8' : 'h-12 w-12'} flex items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-blue-100`}
            >
              <ImageIcon size={isAvatar ? 16 : 24} className="text-emerald-600" />
            </div>
            <div>
              <p className={`${isAvatar ? 'text-xs' : 'text-sm'} font-medium text-slate-700`}>
                {isAvatar ? 'Upload Photo' : placeholder}
              </p>
              {!isAvatar && (
                <p className="mt-1 text-xs text-slate-500">Max {maxSize}MB • PNG, JPG, WEBP</p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />
    </div>
  );
};

export default NewImageUpload;
