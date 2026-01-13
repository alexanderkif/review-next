'use client';

import { useCallback, useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { processImageFile } from '../../lib/image-utils';

interface MultipleImageUploadProps {
  entityType: 'avatar' | 'project' | 'user';
  entityId: string;
  value?: string[]; // Array of image IDs
  onUpdate?: (imageIds: string[]) => void;
  maxImages?: number;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  accept?: string;
  placeholder?: string;
  isAvatar?: boolean;
}

const MultipleImageUpload = ({
  entityType,
  entityId,
  value = [] as string[],
  onUpdate,
  maxImages = 5,
  maxSize = 2,
  className = '',
  disabled = false,
  accept = 'image/*',
  placeholder = 'Click to upload images',
  isAvatar = false,
}: MultipleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (files: File[]) => {
      if (value.length + files.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`);
        return;
      }

      if (uploading) {
        setError('Please wait for the current upload to finish');
        return;
      }

      setError('');
      setUploading(true);

      try {
        // Process all files
        for (const file of files) {
          // Process image file
          const result = await processImageFile(file, maxSize);

          if (!result.success) {
            setError(result.error);
            continue;
          }

          // Get image dimensions
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = result.base64;
          });

          // Save to server
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

          // Server should return updated list of image IDs
          if (data.imageIds && Array.isArray(data.imageIds)) {
            onUpdate?.(data.imageIds);
          }
        }

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    },
    [entityType, entityId, maxSize, value, onUpdate, maxImages, uploading],
  );

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (files && files.length > 0) {
        handleFileSelect(Array.from(files));
      }
    },
    [handleFileSelect],
  );

  const handleDrop = useCallback(
    (event: DragEvent) => {
      event.preventDefault();

      if (disabled || uploading) return;

      const files = Array.from(event.dataTransfer.files);
      const imageFiles = files.filter((file) => file.type.startsWith('image/'));

      if (imageFiles.length > 0) {
        handleFileSelect(imageFiles);
      } else {
        setError('Please drop image files');
      }
    },
    [disabled, uploading, handleFileSelect],
  );

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const handleRemove = useCallback(
    async (imageId: string) => {
      if (uploading) return;

      try {
        setUploading(true);
        setError('');

        // Delete from server
        const response = await fetch(`/api/admin/images/${imageId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete image');
        }

        const data = await response.json();

        // Server should return updated list of image IDs
        if (data.imageIds && Array.isArray(data.imageIds)) {
          onUpdate?.(data.imageIds);
        } else {
          throw new Error('Invalid response from server');
        }
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : 'Failed to delete image');
      } finally {
        setUploading(false);
      }
    },
    [onUpdate, uploading],
  );

  const handleClick = () => {
    if (!disabled && !uploading && value.length < maxImages) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Existing Images */}
        {value.length > 0 && (
          <div className={`flex flex-wrap gap-6`}>
            {value.map((imageId, index) => (
              <div key={imageId} className="relative px-2">
                {/* Image container with controls inside */}
                <div
                  className={`relative ${
                    isAvatar ? 'h-20 w-20' : 'h-16 w-24'
                  } rounded-xl border-2 border-slate-200 shadow-[4px_4px_8px_#c5c5c5,_-2px_-2px_8px_#ffffff]`}
                >
                  <div className="relative h-full w-full overflow-hidden rounded-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`/api/images/${imageId}`}
                      alt={`${isAvatar ? 'Avatar' : 'Image'} ${index + 1}`}
                      className="h-full w-full object-contain object-center"
                    />
                  </div>

                  {/* Delete button - top right corner outside of image but inside container */}
                  {!disabled && (
                    <button
                      onClick={() => handleRemove(imageId)}
                      aria-label={`Remove image ${index + 1}`}
                      className="group absolute -top-2 -right-5 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc] transition-all duration-200 hover:[background:linear-gradient(135deg,#edf2f7_0%,#e5ecf1_100%)] focus:outline-none"
                    >
                      <Trash2
                        size={12}
                        className="icon-danger -translate-x-[0.5px] -translate-y-[0.5px]"
                      />
                    </button>
                  )}

                  {/* Image number indicator - bottom right corner outside of image but inside container */}
                  <button
                    disabled
                    aria-label={`Image ${index + 1}`}
                    className="absolute -right-5 -bottom-2 flex h-6 w-6 cursor-default items-center justify-center rounded-full bg-gradient-to-br from-[#e8edf2] to-[#dfe7ed] text-sm font-bold text-slate-700 shadow-[3px_3px_6px_#c5c5c5,_-1.5px_-1.5px_6px_#ffffff,_inset_-2px_-2px_1px_#8a8a8acc]"
                  >
                    <span className="-translate-x-[0.5px] -translate-y-[0.5px]">{index + 1}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        {value.length < maxImages && (
          <div
            onClick={handleClick}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className={`relative cursor-pointer transition-all duration-200 ${
              isAvatar ? 'h-20' : 'h-24'
            } flex items-center justify-center rounded-xl border-2 border-dashed border-slate-300 p-4 text-center hover:border-emerald-400 hover:bg-emerald-50/50 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${uploading ? 'pointer-events-none' : ''} `}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent"></div>
                <span className="text-sm text-slate-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-blue-100">
                  <Plus size={16} className="icon-success text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {value.length === 0
                      ? placeholder
                      : `Add another ${isAvatar ? 'avatar' : 'image'}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {value.length}/{maxImages} • Max {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        multiple
        className="hidden"
        disabled={disabled || uploading || value.length >= maxImages}
      />
    </div>
  );
};

export default MultipleImageUpload;
