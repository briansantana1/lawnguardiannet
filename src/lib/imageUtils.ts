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

export interface ImageQualityIssue {
  type: 'blur' | 'dark' | 'too_close' | 'too_far' | 'low_resolution';
  message: string;
}

export interface ImageQualityResult {
  isGoodQuality: boolean;
  issues: ImageQualityIssue[];
  metrics: {
    brightness: number;
    variance: number;
    greenRatio: number;
    width: number;
    height: number;
    fileSize: number;
  };
}

/**
 * Analyze image quality for lawn diagnosis
 * Returns quality assessment with specific issues
 */
export async function analyzeImageQuality(imageDataUrl: string): Promise<ImageQualityResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      // Use a smaller sample for faster analysis
      const sampleWidth = Math.min(img.width, 400);
      const sampleHeight = Math.min(img.height, 400);
      canvas.width = sampleWidth;
      canvas.height = sampleHeight;
      
      ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
      
      const imageData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
      const pixels = imageData.data;
      
      let totalBrightness = 0;
      let brightnessValues: number[] = [];
      let greenPixels = 0;
      let totalPixels = pixels.length / 4;
      
      // Analyze each pixel
      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Calculate brightness (perceived luminance)
        const brightness = (0.299 * r + 0.587 * g + 0.114 * b);
        totalBrightness += brightness;
        brightnessValues.push(brightness);
        
        // Check if pixel is predominantly green (lawn detection)
        if (g > r * 1.1 && g > b * 1.1 && g > 50) {
          greenPixels++;
        }
      }
      
      const avgBrightness = totalBrightness / totalPixels;
      const greenRatio = greenPixels / totalPixels;
      
      // Calculate variance (indicator of detail/blur)
      let variance = 0;
      for (const brightness of brightnessValues) {
        variance += Math.pow(brightness - avgBrightness, 2);
      }
      variance = variance / totalPixels;
      
      const fileSize = getBase64Size(imageDataUrl);
      
      const issues: ImageQualityIssue[] = [];
      
      // Check for low resolution
      if (img.width < 400 || img.height < 400) {
        issues.push({
          type: 'low_resolution',
          message: 'Image resolution is very low'
        });
      }
      
      // Check for too dark (average brightness below threshold)
      if (avgBrightness < 50) {
        issues.push({
          type: 'dark',
          message: 'Image appears too dark'
        });
      }
      
      // Check for potential blur (low variance indicates lack of detail)
      // Small file size combined with low variance suggests blur
      if (variance < 800 && fileSize < 50000) {
        issues.push({
          type: 'blur',
          message: 'Image may be blurry or out of focus'
        });
      }
      
      // Check if too close (mostly green, high uniformity)
      if (greenRatio > 0.85 && variance < 1500) {
        issues.push({
          type: 'too_close',
          message: 'Image may be too close - no context visible'
        });
      }
      
      // Check if too far (very low green ratio, high variance from mixed content)
      if (greenRatio < 0.1 && variance > 3000) {
        issues.push({
          type: 'too_far',
          message: 'Image may be too far - cannot see lawn detail'
        });
      }
      
      resolve({
        isGoodQuality: issues.length === 0,
        issues,
        metrics: {
          brightness: Math.round(avgBrightness),
          variance: Math.round(variance),
          greenRatio: Math.round(greenRatio * 100) / 100,
          width: img.width,
          height: img.height,
          fileSize
        }
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image for quality analysis'));
    };
    
    img.src = imageDataUrl;
  });
}
