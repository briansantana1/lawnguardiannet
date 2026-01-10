/**
 * Image utilities for resizing and compression
 */

export interface ResizeOptions {
  maxWidth: number;
  maxHeight: number;
  quality: number; // 0-1
}

const DEFAULT_OPTIONS: ResizeOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.8,
};

/**
 * Resize and compress an image from base64 or data URL
 * Returns a compressed base64 data URL
 */
export async function resizeImage(
  imageDataUrl: string,
  options: Partial<ResizeOptions> = {}
): Promise<string> {
  const { maxWidth, maxHeight, quality } = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Use better quality settings
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG
      const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(resizedDataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageDataUrl;
  });
}

/**
 * Convert base64 data URL to Blob for upload
 */
export function dataUrlToBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const base64 = parts[1];
  const binary = atob(base64);
  const array = new Uint8Array(binary.length);
  
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  
  return new Blob([array], { type: mime });
}

/**
 * Generate a unique filename for the image
 */
export function generateImageFilename(userId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${userId}/${timestamp}-${random}.jpg`;
}

/**
 * Get the approximate size of a base64 string in bytes
 */
export function getBase64Size(base64String: string): number {
  // Remove data URL prefix if present
  const base64 = base64String.includes(',') 
    ? base64String.split(',')[1] 
    : base64String;
  
  // Base64 encodes 3 bytes into 4 characters
  const padding = (base64.match(/=/g) || []).length;
  return Math.floor((base64.length * 3) / 4) - padding;
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
