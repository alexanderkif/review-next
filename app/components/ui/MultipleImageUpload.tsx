'use client';

import { useCallback, useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from './Button';
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
  isAvatar = false
}: MultipleImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (value.length >= maxImages) {
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
              height: img.height
            })
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to upload image');
          }

          const data = await response.json();
          
          // Fetch updated list from server to ensure consistency
          const updatedResponse = await fetch(
            `/api/admin/images?entityType=${entityType}&entityId=${entityId}`
          );
          
          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            const updatedImages = updatedData.map((img: any) => img.id);
            onUpdate?.(updatedImages);
          } else {
            // Fallback to adding the new image ID if fetch fails
            const updatedImages = [...value, data.imageId];
            onUpdate?.(updatedImages);
          }
          
          // Reset file input to allow selecting the same file again
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (error: any) {
          setError(error.message || 'Failed to upload image');
        } finally {
          setUploading(false);
        }
      };
      
      img.onerror = () => {
        setError('Failed to process image');
        setUploading(false);
      };
      
      img.src = result.base64;
    } catch (error: any) {
      setError(error.message || 'Failed to process image');
      setUploading(false);
    }
  }, [entityType, entityId, maxSize, value, onUpdate, maxImages]);

  const handleFileChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  const handleDrop = useCallback((event: DragEvent) => {
    event.preventDefault();
    
    if (disabled || uploading) return;
    
    const files = Array.from(event.dataTransfer.files);
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (imageFile) {
      handleFileSelect(imageFile);
    } else {
      setError('Please drop an image file');
    }
  }, [disabled, uploading, handleFileSelect]);

  const handleDragOver = useCallback((event: DragEvent) => {
    event.preventDefault();
  }, []);

  const handleRemove = useCallback(async (imageId: string, index: number) => {
    try {
      setUploading(true);
      
      const response = await fetch(`/api/admin/images/${imageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove image');
      }

      // Fetch updated list from server to ensure consistency
      const updatedResponse = await fetch(
        `/api/admin/images?entityType=${entityType}&entityId=${entityId}`
      );
      
      if (updatedResponse.ok) {
        const updatedData = await updatedResponse.json();
        const updatedImages = updatedData.map((img: any) => img.id);
        onUpdate?.(updatedImages);
      } else {
        // Fallback to filtering locally if fetch fails
        const updatedImages = value.filter((_, i) => i !== index);
        onUpdate?.(updatedImages);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to remove image');
    } finally {
      setUploading(false);
    }
  }, [value, onUpdate]);

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
          <div className={`grid gap-3 ${isAvatar ? 'grid-cols-2 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-4'}`}>
            {value.map((imageId, index) => (
              <div key={imageId} className="relative">
                <div className={`relative ${isAvatar ? 'w-20 h-20' : 'w-24 h-16'} rounded-xl overflow-hidden shadow-[4px_4px_8px_#c5c5c5,_-2px_-2px_8px_#ffffff] border-2 border-slate-200`}>
                  <img
                    src={`/api/images/${imageId}`}
                    alt={`${isAvatar ? 'Avatar' : 'Image'} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {!disabled && (
                    <Button
                      onClick={() => handleRemove(imageId, index)}
                      variant="ghost"
                      size="sm"
                      className="absolute top-1 right-1 w-6 h-6 p-0 bg-black/50 hover:bg-black/70 text-white"
                    >
                      <X size={12} />
                    </Button>
                  )}
                </div>
                
                {/* Image number indicator */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
                  {index + 1}
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
            className={`
              relative cursor-pointer transition-all duration-200
              ${isAvatar ? 'h-20' : 'h-24'} rounded-xl border-2 border-dashed border-slate-300 
              hover:border-emerald-400 hover:bg-emerald-50/50
              flex items-center justify-center text-center p-4
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              ${uploading ? 'pointer-events-none' : ''}
            `}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-slate-600">Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center">
                  <Plus size={16} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {value.length === 0 ? placeholder : `Add another ${isAvatar ? 'avatar' : 'image'}`}
                  </p>
                  <p className="text-xs text-slate-500">
                    {value.length}/{maxImages} • Max {maxSize}MB
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        {/* Info about rotation */}
        {isAvatar && value.length > 1 && (
          <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
            💡 Multiple avatars will rotate automatically every 3 seconds on the website
          </p>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading || value.length >= maxImages}
      />
    </div>
  );
};

export default MultipleImageUpload;