'use client';

import { useCallback, useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from './Button';
import { processImageFile } from '../../lib/image-utils';

interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  maxSize?: number; // in MB
  className?: string;
  disabled?: boolean;
  accept?: string;
  placeholder?: string;
  isAvatar?: boolean; // для круглого аватара как в резюме
}

const ImageUpload = ({
  value,
  onChange,
  onRemove,
  maxSize = 2, // 2MB default
  className = '',
  disabled = false,
  accept = 'image/*',
  placeholder = 'Click to upload image',
  isAvatar = false
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setError('');
    setUploading(true);

    try {
      const result = await processImageFile(file, maxSize);
      
      if (result.success) {
        onChange(result.base64);
      } else {
        setError(result.error);
      }
    } catch {
      setError('Failed to process image');
    } finally {
      setUploading(false);
    }
  }, [maxSize, onChange]);

  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [disabled, uploading, handleFileSelect]);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleClick = () => {
    if (disabled || uploading) return;
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled}
      />

      {value ? (
        <div className="relative group">
          <div className={`relative ${isAvatar ? 'w-32 h-32 rounded-3xl' : 'w-full h-48 rounded-xl'} overflow-hidden shadow-[4px_4px_8px_#c5c5c5,_-2px_-2px_8px_#ffffff] border-2 ${isAvatar ? 'border-white/80' : 'border-slate-200'}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleClick}
                  disabled={disabled || uploading}
                  className="bg-white/90 text-slate-700 hover:bg-white"
                >
                  <Upload size={16} />
                  Replace
                </Button>
                <Button
                  size="sm"
                  onClick={onRemove}
                  disabled={disabled}
                  className="bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <X size={16} />
                  Remove
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`
            ${isAvatar ? 'w-32 h-32 rounded-3xl' : 'w-full h-48 rounded-xl'} border-2 border-dashed border-slate-300 
            shadow-[inset_2px_2px_4px_#d1d1d1,_inset_-2px_-2px_4px_#ffffff]
            flex flex-col items-center justify-center cursor-pointer
            transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/50
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            ${uploading ? 'animate-pulse' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <div className={`${isAvatar ? 'w-6 h-6' : 'w-8 h-8'} border-2 border-emerald-600 border-t-transparent rounded-full animate-spin`}></div>
              {!isAvatar && <span className="text-sm text-slate-600">Uploading...</span>}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className={`${isAvatar ? 'w-8 h-8' : 'w-12 h-12'} rounded-full bg-gradient-to-br from-emerald-100 to-blue-100 flex items-center justify-center`}>
                <ImageIcon size={isAvatar ? 16 : 24} className="text-emerald-600" />
              </div>
              <div className="text-center">
                <p className={`${isAvatar ? 'text-xs' : 'text-sm'} font-medium text-slate-700`}>
                  {isAvatar ? 'Upload Photo' : placeholder}
                </p>
                {!isAvatar && (
                  <>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Max size: {maxSize}MB
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
          <X size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;