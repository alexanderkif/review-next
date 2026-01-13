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
  isAvatar = false,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    async (file: File) => {
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
    },
    [maxSize, onChange],
  );

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      if (disabled || uploading) return;

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFileSelect(files[0]);
      }
    },
    [disabled, uploading, handleFileSelect],
  );

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
        <div className="group relative">
          <div
            className={`relative ${isAvatar ? 'h-32 w-32 rounded-3xl' : 'h-48 w-full rounded-xl'} overflow-hidden border-2 shadow-[4px_4px_8px_#c5c5c5,_-2px_-2px_8px_#ffffff] ${isAvatar ? 'border-white/80' : 'border-slate-200'}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Preview" className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
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
          className={` ${isAvatar ? 'h-32 w-32 rounded-3xl' : 'h-48 w-full rounded-xl'} flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-slate-300 shadow-[inset_2px_2px_4px_#d1d1d1,_inset_-2px_-2px_4px_#ffffff] transition-all duration-200 hover:border-emerald-400 hover:bg-emerald-50/50 ${disabled ? 'cursor-not-allowed opacity-50' : ''} ${uploading ? 'animate-pulse' : ''} `}
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
              <div className="text-center">
                <p className={`${isAvatar ? 'text-xs' : 'text-sm'} font-medium text-slate-700`}>
                  {isAvatar ? 'Upload Photo' : placeholder}
                </p>
                {!isAvatar && (
                  <>
                    <p className="mt-1 text-xs text-slate-500">Drag & drop or click to browse</p>
                    <p className="mt-1 text-xs text-slate-400">Max size: {maxSize}MB</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="mt-2 flex items-center gap-1 text-sm text-red-600">
          <X size={14} />
          {error}
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
