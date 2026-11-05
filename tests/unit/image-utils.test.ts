import { describe, expect, it, vi } from 'vitest';
import {
  compressImage,
  fileToBase64,
  formatFileSize,
  getBase64Size,
  processImageFile,
  validateBase64Image,
  validateImageFile,
} from '@/lib/image-utils';

function createMockCanvasContext(drawImage = vi.fn()): CanvasRenderingContext2D {
  return { drawImage } as unknown as CanvasRenderingContext2D;
}

describe('image validation helpers', () => {
  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])(
    'allows supported MIME type %s',
    (type) => {
      expect(validateImageFile(new File(['image'], 'image', { type }), 1)).toBeNull();
    },
  );

  it('rejects unsupported MIME types and oversized files', () => {
    expect(validateImageFile(new File(['x'], 'image.svg', { type: 'image/svg+xml' }), 1)).toContain(
      'Unsupported',
    );
    expect(
      validateImageFile(new File(['x'.repeat(20)], 'image.png', { type: 'image/png' }), 0.00001),
    ).toContain('File size');
  });

  it('accepts a file exactly at the size limit', () => {
    const file = new File(['x'.repeat(1024)], 'image.png', { type: 'image/png' });
    expect(validateImageFile(file, 1 / 1024)).toBeNull();
  });

  it.each([
    ['data:image/png;base64,AAAA', 3],
    ['data:image/png;base64,AAA=', 2],
    ['data:image/png;base64,AA==', 1],
    ['AQID', 3],
  ])('computes base64 payload size for %s', (input, expected) => {
    expect(getBase64Size(input)).toBe(expected);
  });

  it('validates image data URL format and size', () => {
    expect(validateBase64Image('not-an-image', 1)).toBe('Invalid image format');
    expect(validateBase64Image('data:image/png;base64,AA==', 1)).toBeNull();
    expect(validateBase64Image(`data:image/png;base64,${'A'.repeat(100)}`, 0.00001)).toContain(
      'Image too large',
    );
  });

  it.each([
    [0, '0 Bytes'],
    [1024, '1 KB'],
    [1024 * 1024, '1 MB'],
  ])('formats file size %i', (bytes, expected) => {
    expect(formatFileSize(bytes)).toBe(expected);
  });

  it('converts an image file to a data URL', async () => {
    const result = await fileToBase64(new File(['image'], 'image.png', { type: 'image/png' }));

    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it('returns a validation error before reading unsupported files', async () => {
    const result = await processImageFile(
      new File(['image'], 'image.svg', { type: 'image/svg+xml' }),
      1,
    );

    expect(result).toMatchObject({ success: false, error: expect.stringContaining('Unsupported') });
  });

  it('processes a small image without compression', async () => {
    const result = await processImageFile(
      new File(['small'], 'image.png', { type: 'image/png' }),
      1,
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.base64).toMatch(/^data:image\/png;base64,/);
    }
  });

  it('returns a readable error if the browser file reader fails', async () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      this.onerror?.call(this, new ProgressEvent('error') as ProgressEvent<FileReader>);
    });

    const result = await processImageFile(
      new File(['image'], 'image.png', { type: 'image/png' }),
      1,
    );

    expect(result).toEqual({ success: false, error: 'Failed to process image' });
  });

  it('compresses oversized data URLs and rejects images if canvas is unavailable', async () => {
    const drawImage = vi.fn();
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(
      createMockCanvasContext(drawImage),
    );
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/jpeg;base64,AA==',
    );
    vi.stubGlobal(
      'Image',
      class {
        width = 4000;
        height = 2000;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:test-image'),
    });

    const compressed = await compressImage(
      new File(['image'], 'image.png', { type: 'image/png' }),
      1,
    );
    expect(compressed).toBe('data:image/jpeg;base64,AA==');
    expect(drawImage).toHaveBeenCalledWith(expect.anything(), 0, 0, 1920, 960);
  });

  it('retries compression at lower quality and handles portrait dimensions', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValueOnce(`data:image/jpeg;base64,${'A'.repeat(200)}`)
      .mockReturnValue('data:image/jpeg;base64,AA==');
    vi.stubGlobal(
      'Image',
      class {
        width = 1000;
        height = 2000;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:test-image'),
    });

    await expect(
      compressImage(new File(['image'], 'image.png', { type: 'image/png' }), 0.0001),
    ).resolves.toBe('data:image/jpeg;base64,AA==');
    expect(HTMLCanvasElement.prototype.toDataURL).toHaveBeenCalledTimes(2);
  });

  it('returns a failure if image compression cannot create a canvas context', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    vi.stubGlobal(
      'Image',
      class {
        width = 100;
        height = 100;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:test-image'),
    });

    await expect(
      compressImage(new File(['image'], 'image.png', { type: 'image/png' }), 1),
    ).rejects.toThrow('Canvas context not available');
  });

  it('rejects when the browser cannot decode an image', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          this.onerror?.();
        }
      },
    );
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:test-image'),
    });

    await expect(
      compressImage(new File(['image'], 'image.png', { type: 'image/png' }), 1),
    ).rejects.toBeUndefined();
  });

  it('rejects compressed output that still exceeds the configured size', async () => {
    vi.spyOn(FileReader.prototype, 'readAsDataURL').mockImplementation(function (this: FileReader) {
      Object.defineProperty(this, 'result', {
        configurable: true,
        value: `data:image/png;base64,${'A'.repeat(200)}`,
      });
      this.onload?.call(this, new ProgressEvent('load') as ProgressEvent<FileReader>);
    });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(createMockCanvasContext());
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      `data:image/jpeg;base64,${'A'.repeat(200)}`,
    );
    vi.stubGlobal(
      'Image',
      class {
        width = 100;
        height = 100;
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('URL', {
      ...URL,
      createObjectURL: vi.fn(() => 'blob:test-image'),
    });

    const result = await processImageFile(
      new File(['x'.repeat(100)], 'image.png', { type: 'image/png' }),
      0.0001,
    );

    expect(result).toMatchObject({
      success: false,
      error: expect.stringContaining('Image too large'),
    });
  });
});
