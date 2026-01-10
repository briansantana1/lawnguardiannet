import { useState, useRef, useCallback } from "react";
import { Camera, Upload, X, Loader2, Sparkles, Leaf, Bug, FlaskConical, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { resizeImage } from "@/lib/imageUtils";
import { useAuth } from "@/hooks/useAuth";

type ProblemType = 'weed' | 'disease' | 'pest';

interface IdentificationResult {
  success: boolean;
  problemType: ProblemType;
  primaryId: string;
  confidence: 'high' | 'medium' | 'low';
  identification: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  alternates: string[];
  treatments: {
    cultural: string[];
    chemical: {
      product: string;
      activeIngredients: string[];
      timing: string;
    }[];
    prevention: string[];
  };
}

interface LawnScannerProps {
  onResultReceived?: (result: IdentificationResult) => void;
}

export function LawnScanner({ onResultReceived }: LawnScannerProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [problemType, setProblemType] = useState<ProblemType | null>(null);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

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

        console.log('LawnScanner: New image loaded');

        toast.info('Preparing image...', { duration: 1500 });

        // Resize image for faster upload and analysis
        const resizedImage = await resizeImage(originalImage, {
          maxWidth: 1024,
          maxHeight: 1024,
          quality: 0.85,
        });

        // Extract base64 data (remove data URL prefix)
        const base64Data = resizedImage.split(',')[1];
        
        setSelectedImage(resizedImage);
        setImageBase64(base64Data);
        setProblemType(null);
        setResult(null);
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
  }, []);

  const identifyProblem = async (type: ProblemType) => {
    if (!imageBase64) {
      toast.error('Please upload an image first');
      return;
    }

    if (!user) {
      toast.error('Please sign in to use AI identification', {
        description: 'Create a free account to analyze lawn problems'
      });
      return;
    }

    setProblemType(type);
    setIsAnalyzing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Session expired. Please sign in again.');
        setIsAnalyzing(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('identify-lawn-problem', {
        body: {
          imageBase64: imageBase64,
          problemType: type,
          context: {
            region: 'United States',
            season: getCurrentSeason(),
          }
        }
      });

      if (error) throw error;

      if (data.success) {
        setResult(data);
        onResultReceived?.(data);
        toast.success('Problem identified!');
      } else {
        toast.error(data.error || 'Failed to identify problem');
      }
    } catch (error) {
      console.error('LawnScanner: Identification error:', error);
      toast.error('Failed to identify problem: ' + (error as Error).message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  };

  const clearImage = useCallback(() => {
    setSelectedImage(null);
    setImageBase64(null);
    setProblemType(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  }, []);

  const openFileSelector = useCallback(() => {
    if (!isProcessing && !isAnalyzing) {
      fileInputRef.current?.click();
    }
  }, [isProcessing, isAnalyzing]);

  const openCamera = useCallback(() => {
    if (!isProcessing && !isAnalyzing) {
      cameraInputRef.current?.click();
    }
  }, [isProcessing, isAnalyzing]);

  const isDisabled = isProcessing || isAnalyzing;

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
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
          {/* Image Preview */}
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage}
                alt="Lawn problem"
                className={`w-full h-64 object-cover transition-all duration-300 ${
                  isAnalyzing ? 'blur-sm scale-105' : ''
                }`}
              />
              {!isAnalyzing && !result && (
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lg"
                >
                  <X className="w-5 h-5 text-foreground" />
                </button>
              )}
              
              {/* Analyzing Overlay */}
              {isAnalyzing && (
                <div className="absolute inset-0 bg-gradient-to-b from-lawn-900/80 via-lawn-800/70 to-lawn-900/80 flex flex-col items-center justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 w-20 h-20 rounded-full bg-lawn-400/30 animate-ping" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-lawn-400 to-lawn-600 flex items-center justify-center shadow-lg">
                      <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                  </div>
                  <p className="mt-6 text-white font-semibold text-lg">Analyzing your lawn problem...</p>
                  <p className="text-lawn-200 text-sm mt-1">This may take a few seconds</p>
                </div>
              )}
            </div>
          )}

          {/* Camera Input - No Image */}
          {!selectedImage && (
            <div className="p-8">
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
                      Take Photo of Lawn Problem
                    </p>
                    <p className="text-sm text-muted-foreground text-center px-4">
                      Tap to use camera or upload a photo
                    </p>
                  </>
                )}
              </button>

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
          )}

          {/* Problem Type Selection */}
          {selectedImage && !isAnalyzing && !result && (
            <div className="p-6 space-y-4">
              <h3 className="text-lg font-semibold text-foreground text-center">
                What type of problem is this?
              </h3>
              <div className="grid gap-3">
                <Button
                  onClick={() => identifyProblem('weed')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white p-4 h-auto"
                  disabled={isDisabled}
                >
                  <Leaf className="w-5 h-5 mr-2" />
                  🌿 Weed
                </Button>
                <Button
                  onClick={() => identifyProblem('disease')}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-white p-4 h-auto"
                  disabled={isDisabled}
                >
                  <FlaskConical className="w-5 h-5 mr-2" />
                  🦠 Disease
                </Button>
                <Button
                  onClick={() => identifyProblem('pest')}
                  className="w-full bg-red-600 hover:bg-red-700 text-white p-4 h-auto"
                  disabled={isDisabled}
                >
                  <Bug className="w-5 h-5 mr-2" />
                  🐛 Pest/Insect
                </Button>
                <Button
                  variant="outline"
                  onClick={clearImage}
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="p-6">
              <div className="bg-gradient-to-br from-lawn-50 to-lawn-100 dark:from-lawn-900/50 dark:to-lawn-800/50 rounded-xl p-6 space-y-4">
                {/* Confidence Badge */}
                <div className="flex justify-end">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getConfidenceColor(result.confidence)}`}>
                    {result.confidence} Confidence
                  </span>
                </div>

                {/* Primary Identification */}
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-foreground">
                    {result.primaryId}
                  </h3>
                </div>

                {/* Full Analysis */}
                <div className="bg-card/80 rounded-lg p-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {result.identification}
                  </p>
                </div>

                {/* Symptoms */}
                {result.symptoms && result.symptoms.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold text-foreground">Observed Symptoms:</h4>
                    <ul className="space-y-1">
                      {result.symptoms.map((symptom, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          {symptom}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Treatments */}
                {result.treatments && (
                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Recommended Treatment:</h4>
                    
                    {result.treatments.cultural && result.treatments.cultural.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Cultural Practices:</p>
                        <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                          {result.treatments.cultural.map((practice, index) => (
                            <li key={index}>{practice}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.treatments.chemical && result.treatments.chemical.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">Chemical Treatments:</p>
                        {result.treatments.chemical.map((chem, index) => (
                          <div key={index} className="bg-muted/50 rounded p-2 text-sm mb-2">
                            <p className="font-medium">{chem.product}</p>
                            {chem.activeIngredients && (
                              <p className="text-xs text-muted-foreground">
                                Active ingredients: {chem.activeIngredients.join(', ')}
                              </p>
                            )}
                            {chem.timing && (
                              <p className="text-xs text-muted-foreground">Timing: {chem.timing}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-3 pt-4">
                  <Button
                    onClick={clearImage}
                    className="w-full"
                  >
                    Scan Another Problem
                  </Button>
                  
                  {/* Feedback buttons */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => toast.success('Thanks for your feedback!')}
                    >
                      👍 Correct
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => toast.info('Thanks for letting us know. We\'ll improve our AI!')}
                    >
                      👎 Incorrect
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default LawnScanner;
