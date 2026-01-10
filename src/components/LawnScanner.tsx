import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, Sparkles, Leaf, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { resizeImage } from "@/lib/imageUtils";

interface LawnScannerProps {
  onImageCaptured: (imageData: string) => void;
  isAnalyzing?: boolean;
  disabled?: boolean;
}

export function LawnScanner({ 
  onImageCaptured, 
  isAnalyzing = false,
  disabled = false 
}: LawnScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Reset input value to allow re-selection of same file
    if (e.target) {
      e.target.value = '';
    }

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        setIsProcessing(true);
        const originalImage = reader.result as string;

        // Log image fingerprint for debugging
        const imageFingerprint = originalImage.length + '-' + originalImage.substring(originalImage.length - 50);
        console.log('LawnScanner: New image loaded, fingerprint:', imageFingerprint);

        toast.info('Preparing image...', { duration: 1500 });

        // Resize image for faster upload and analysis
        const resizedImage = await resizeImage(originalImage, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.85,
        });

        const resizedFingerprint = resizedImage.length + '-' + resizedImage.substring(resizedImage.length - 50);
        console.log('LawnScanner: Resized image fingerprint:', resizedFingerprint);

        setSelectedImage(resizedImage);
        onImageCaptured(resizedImage);
      } catch (error) {
        console.error('LawnScanner: Image processing error:', error);
        toast.error('Failed to process image. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      toast.error('Failed to read image file.');
      setIsProcessing(false);
    };

    reader.readAsDataURL(file);
  }, [onImageCaptured]);

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  }, []);

  const openFileSelector = useCallback(() => {
    if (!disabled && !isProcessing && !isAnalyzing) {
      fileInputRef.current?.click();
    }
  }, [disabled, isProcessing, isAnalyzing]);

  const openCamera = useCallback(() => {
    if (!disabled && !isProcessing && !isAnalyzing) {
      cameraInputRef.current?.click();
    }
  }, [disabled, isProcessing, isAnalyzing]);

  const isDisabled = disabled || isProcessing || isAnalyzing;

  return (
    <div className="w-full">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isDisabled}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileSelect}
        disabled={isDisabled}
      />

      <Card variant="elevated" className="overflow-hidden">
        <CardContent className="p-0">
          {!selectedImage ? (
            <div className="p-8">
              {/* Upload Area */}
              <button
                onClick={openFileSelector}
                disabled={isDisabled}
                className={`w-full flex flex-col items-center justify-center h-64 border-2 border-dashed border-lawn-300 rounded-2xl bg-lawn-50 transition-all duration-300 ${
                  isDisabled 
                    ? 'cursor-not-allowed opacity-50' 
                    : 'cursor-pointer hover:bg-lawn-100 hover:border-primary'
                }`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="font-semibold text-foreground">Processing image...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full gradient-lawn flex items-center justify-center mb-4 shadow-glow">
                      <Camera className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">
                      Upload a photo of your lawn problem
                    </p>
                    <p className="text-sm text-muted-foreground text-center px-4">
                      A clear, focused photo helps our AI provide an accurate diagnosis
                    </p>
                  </>
                )}
              </button>

              {/* Alternative Buttons */}
              <div className="flex gap-4 mt-6">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={openFileSelector}
                  disabled={isDisabled}
                >
                  <Upload className="w-4 h-4" />
                  Upload Photo
                </Button>
                <Button
                  variant="scan"
                  className="flex-1"
                  onClick={openCamera}
                  disabled={isDisabled}
                >
                  <Camera className="w-4 h-4" />
                  Use Camera
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Selected Image Preview with Analyzing Overlay */}
              <div className="relative aspect-video rounded-xl overflow-hidden mb-6 group">
                <img
                  src={selectedImage}
                  alt="Lawn photo"
                  className={`w-full h-full object-cover transition-all duration-300 ${
                    isAnalyzing ? 'scale-105 blur-sm' : ''
                  }`}
                />

                {/* Analyzing Overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-gradient-to-b from-lawn-900/80 via-lawn-800/70 to-lawn-900/80 flex flex-col items-center justify-center">
                    <div className="relative">
                      {/* Pulsing rings */}
                      <div className="absolute inset-0 w-20 h-20 rounded-full bg-lawn-400/30 animate-ping" />
                      <div 
                        className="absolute inset-2 w-16 h-16 rounded-full bg-lawn-400/40 animate-ping" 
                        style={{ animationDelay: '0.2s' }} 
                      />
                      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-lawn-400 to-lawn-600 flex items-center justify-center shadow-lg">
                        <Sparkles className="w-10 h-10 text-white animate-pulse" />
                      </div>
                    </div>
                    <p className="mt-6 text-white font-semibold text-lg">Analyzing your lawn...</p>
                    <p className="text-lawn-200 text-sm mt-1">AI-Powered Analysis</p>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white">
                        <Leaf className="w-3 h-3" />
                        Identifying plants
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-xs text-white">
                        <Bug className="w-3 h-3" />
                        Detecting issues
                      </div>
                    </div>
                  </div>
                )}

                {/* Close button - only show when not analyzing */}
                {!isAnalyzing && (
                  <button
                    onClick={clearImage}
                    className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lawn"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              {!isAnalyzing && (
                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={clearImage}
                  >
                    <X className="w-4 h-4" />
                    Clear Photo
                  </Button>
                  <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={openFileSelector}
                  >
                    <Upload className="w-4 h-4" />
                    New Photo
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LawnScanner;
