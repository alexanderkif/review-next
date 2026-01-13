/**
 * Image utilities for handling base64 images with size validation
 * Best practices for image storage in database
 */

// Maximum file sizes in MB for different image types
// Note: Base64 encoding increases size by ~33%, so these limits account for that
export const IMAGE_SIZE_LIMITS = {
  AVATAR: 0.8, // ~800KB for profile avatars (becomes ~1MB in base64)
  PROJECT: 2.5, // ~2.5MB for project screenshots (becomes ~3.3MB in base64)
  GENERAL: 1.5, // ~1.5MB for general images (becomes ~2MB in base64)
} as const;

// Supported image formats
export const SUPPORTED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

/**
 * Validates image file before processing
 */
export function validateImageFile(file: File, maxSizeMB: number): string | null {
  // Check file type
  if (!SUPPORTED_FORMATS.includes(file.type as (typeof SUPPORTED_FORMATS)[number])) {
    return 'Unsupported file format. Please use JPEG, PNG, WebP, or GIF.';
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return `File size must be less than ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`;
  }

  return null; // No errors
}

/**
 * Converts file to base64 with compression if needed
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Compresses image if it's too large
 * Uses HTML5 Canvas API for client-side compression
 */
export function compressImage(
  file: File,
  maxSizeMB: number,
  quality: number = 0.8,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      const maxWidth = 1920; // Full HD width
      const maxHeight = 1080; // Full HD height

      let { width, height } = img;

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Check if compression was successful
        const compressedSizeBytes = (compressedDataUrl.length * 3) / 4;
        const maxSizeBytes = maxSizeMB * 1024 * 1024;

        if (compressedSizeBytes > maxSizeBytes && quality > 0.1) {
          // Try with lower quality
          return resolve(compressImage(file, maxSizeMB, quality - 0.1));
        }

        resolve(compressedDataUrl);
      } else {
        reject(new Error('Canvas context not available'));
      }
    };

    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Gets the size of a base64 string in bytes
 */
export function getBase64Size(base64: string): number {
  // Remove data:image/... prefix if present
  const base64Data = base64.split(',')[1] || base64;

  // Calculate size: each base64 character represents 6 bits
  // Padding characters (=) don't count
  const padding = (base64Data.match(/=/g) || []).length;
  return (base64Data.length * 3) / 4 - padding;
}

/**
 * Gets human-readable file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validates base64 image string
 */
export function validateBase64Image(base64: string, maxSizeMB: number): string | null {
  if (!base64.startsWith('data:image/')) {
    return 'Invalid image format';
  }

  const size = getBase64Size(base64);
  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (size > maxSizeBytes) {
    return `Image too large: ${formatFileSize(size)}. Maximum allowed: ${maxSizeMB}MB`;
  }

  return null; // No errors
}

/**
 * Process image file with all validations and compression
 */
export async function processImageFile(
  file: File,
  maxSizeMB: number,
): Promise<{ success: true; base64: string } | { success: false; error: string }> {
  try {
    // First validation
    const validationError = validateImageFile(file, maxSizeMB);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Try simple conversion first
    let base64 = await fileToBase64(file);

    // Check if compression is needed
    const base64Error = validateBase64Image(base64, maxSizeMB);
    if (base64Error) {
      // Compress the image
      base64 = await compressImage(file, maxSizeMB);

      // Final validation
      const finalError = validateBase64Image(base64, maxSizeMB);
      if (finalError) {
        return { success: false, error: finalError };
      }
    }

    return { success: true, base64 };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process image',
    };
  }
}
