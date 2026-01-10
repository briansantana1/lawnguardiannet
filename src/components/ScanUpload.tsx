import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Sparkles, CheckCircle2, AlertCircle, Leaf, Bug, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LawnAnalysisResult } from "@/types/lawn-analysis";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useAuth } from "@/hooks/useAuth";
import { diagnoseLawn } from "@/services/lawnDiagnosisService";
import { resizeImage, dataUrlToBlob, generateImageFilename } from "@/lib/imageUtils";

export function ScanUpload() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<LawnAnalysisResult | null>(null);
  const [grassType, setGrassType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      // Check if grass type is selected
      if (!grassType) {
        toast.error('Please select your grass type before uploading a photo.');
        e.target.value = '';
        return;
      }
      
      const file = files[0];
      
      // Reset input value immediately to allow re-selection of same file
      // and prevent caching issues
      if (e.target) {
        e.target.value = '';
      }
      
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        try {
          const originalImage = reader.result as string;
          
          // Log image fingerprint to verify different images
          const imageFingerprint = originalImage.length + '-' + originalImage.substring(originalImage.length - 50);
          console.log('New image loaded, fingerprint:', imageFingerprint);
          
          // Clear previous results first
          setAnalysisResult(null);
          setSelectedImage(null);
          
          // Resize image for faster upload and analysis
          toast.info('Preparing image...', { duration: 1500 });
          const resizedImage = await resizeImage(originalImage, {
            maxWidth: 1024,
            maxHeight: 1024,
            quality: 0.85,
          });
          
          // Log resized image fingerprint
          const resizedFingerprint = resizedImage.length + '-' + resizedImage.substring(resizedImage.length - 50);
          console.log('Resized image fingerprint:', resizedFingerprint);
          
          setSelectedImage(resizedImage);
          
          // Automatically start analysis when photo is uploaded
          handleAnalyzeImage(resizedImage);
        } catch (error) {
          console.error('Image processing error:', error);
          toast.error('Failed to process image. Please try again.');
        }
      };
      
      reader.onerror = () => {
        toast.error('Failed to read image file.');
      };
      
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async (imageData: string) => {
    if (!imageData) return;

    setIsAnalyzing(true);
    toast.info('Analyzing your lawn photo...', { duration: 2000 });
    console.log('Starting lawn analysis...');
    
    try {
      // Try Plant.id powered diagnosis first
      console.log('Calling diagnoseLawn service...');
      const result = await diagnoseLawn({
        imageBase64: imageData,
        grassType,
        season: getCurrentSeason(),
        location: "United States",
      });

      console.log('Diagnosis result:', result);
      
      if (!result) {
        console.error('No result returned from diagnosis');
        toast.error('Analysis returned no results. Please try again.');
        return;
      }

      setAnalysisResult(result);
      toast.success('Analysis complete!');
    } catch (error: any) {
      console.error('Diagnosis failed:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Show user-friendly error message
      const errorMessage = error?.message || 'Unknown error';
      if (errorMessage.includes('API key')) {
        toast.error('API configuration error. Please contact support.');
      } else if (errorMessage.includes('rate limit')) {
        toast.error('Too many requests. Please wait a moment and try again.');
      } else {
        toast.error(`Analysis failed: ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
      console.log('Analysis complete, isAnalyzing set to false');
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      handleAnalyzeImage(selectedImage);
    }
  };

  const handleSavePlan = async () => {
    // Check auth status first
    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData?.session;
    
    if (!session) {
      toast.error('Not logged in. Please sign in first.', { duration: 5000 });
      return;
    }

    if (!analysisResult) {
      toast.error('No analysis to save.');
      return;
    }

    toast.info('Saving treatment plan...', { duration: 3000 });

    try {
      let imageUrl: string | null = null;

      // Upload image to Supabase Storage if available
      if (selectedImage) {
        try {
          const filename = generateImageFilename(session.user.id);
          const imageBlob = dataUrlToBlob(selectedImage);
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('lawn-images')
            .upload(filename, imageBlob, {
              contentType: 'image/jpeg',
              cacheControl: '3600',
            });

          if (uploadError) {
            console.error('Image upload error:', uploadError);
            // Continue without image - don't fail the whole save
          } else if (uploadData) {
            // Get public URL for the uploaded image
            const { data: urlData } = supabase.storage
              .from('lawn-images')
              .getPublicUrl(uploadData.path);
            
            imageUrl = urlData.publicUrl;
          }
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
          // Continue without image
        }
      }

      // Save the treatment plan - cast to Json for Supabase compatibility
      const planData = {
        user_id: session.user.id,
        image_url: imageUrl,
        diagnosis: analysisResult.diagnosis as unknown as import('@/integrations/supabase/types').Json,
        treatment_plan: analysisResult.treatment_plan as unknown as import('@/integrations/supabase/types').Json,
        forecast: analysisResult.forecast as unknown as import('@/integrations/supabase/types').Json,
        grass_type: grassType,
        season: getCurrentSeason(),
      };

      const { error } = await supabase
        .from('saved_treatment_plans')
        .insert(planData)
        .select()
        .single();

      if (error) {
        toast.error(`Save failed: ${error.message}`, { duration: 8000 });
        return;
      }

      toast.success('Treatment plan saved!', { duration: 3000 });
    } catch (error: any) {
      toast.error(`Error: ${error.message}`, { duration: 8000 });
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    // Reset both file inputs to allow re-selection
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  if (analysisResult) {
    return (
      <AnalysisResults
        result={analysisResult}
        imageUrl={selectedImage}
        onSave={handleSavePlan}
        onNewScan={clearImage}
        isLoggedIn={!!user}
      />
    );
  }

  const photoTips = [
    { icon: CheckCircle2, text: "Get close to the problem area (2-3 feet away)", good: true },
    { icon: CheckCircle2, text: "Use natural daylight for best results", good: true },
    { icon: CheckCircle2, text: "Hold your phone steady and focus clearly", good: true },
    { icon: CheckCircle2, text: "Include both affected and healthy grass if possible", good: true },
    { icon: AlertCircle, text: "Avoid shadows falling across the problem area", good: false },
    { icon: AlertCircle, text: "Don't use flash - it washes out colors", good: false },
  ];

  return (
    <section id="scan" className="py-20 bg-lawn-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Scan Your Lawn Problem
            </h2>
            <p className="text-muted-foreground mb-4">
              Upload a clear, well-lit photo of the affected area for accurate AI diagnosis
            </p>
            {/* Powered By Badge */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lawn-100 dark:bg-lawn-900 text-xs font-medium text-lawn-700 dark:text-lawn-300">
                <Leaf className="w-3.5 h-3.5" />
                AI-Powered
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900 text-xs font-medium text-amber-700 dark:text-amber-300">
                <Bug className="w-3.5 h-3.5" />
                Pest Detection
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-medium text-blue-700 dark:text-blue-300">
                <FlaskConical className="w-3.5 h-3.5" />
                Expert Treatments
              </div>
            </div>
          </div>

          {/* Photo Tips Card */}
          <Card className="mb-6 border-lawn-200 bg-lawn-50/50">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                Tips for the Best Photo
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {photoTips.map((tip, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <tip.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tip.good ? 'text-primary' : 'text-amber-500'}`} />
                    <span className="text-sm text-muted-foreground">{tip.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Grass Type Selector */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-foreground mb-2">
              Select Your Grass Type <span className="text-red-500">*</span>
            </label>
            <select
              value={grassType}
              onChange={(e) => setGrassType(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${
                grassType ? 'border-lawn-200' : 'border-amber-400'
              }`}
              required
            >
              <option value="" disabled>-- Select Your Grass Type --</option>
              <option value="cool-season">Cool-Season (Kentucky Bluegrass, Fescue, Ryegrass)</option>
              <option value="warm-season">Warm-Season (Bermuda, Zoysia, St. Augustine)</option>
              <option value="transition-zone">Transition Zone Mix</option>
            </select>
            {!grassType && (
              <p className="text-amber-600 text-xs mt-1">Please select your grass type for accurate diagnosis</p>
            )}
          </div>

          {/* Hidden file inputs - placed outside conditional to avoid ref issues */}
          <input
            ref={fileInputRef}
            id="lawn-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />
          <input
            ref={cameraInputRef}
            id="lawn-camera"
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Upload Card */}
          <Card variant="elevated" className="overflow-hidden">
            <CardContent className="p-0">
              {!selectedImage ? (
                <div className="p-8">
                  {/* Upload Area */}
                  <label
                    htmlFor="lawn-upload"
                    className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-lawn-300 rounded-2xl bg-lawn-50 cursor-pointer hover:bg-lawn-100 hover:border-primary transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-full gradient-lawn flex items-center justify-center mb-4 shadow-glow">
                      <Camera className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">
                      Upload a photo of your lawn problem
                    </p>
                    <p className="text-sm text-muted-foreground text-center px-4">
                      A clear, focused photo helps our AI provide an accurate diagnosis
                    </p>
                  </label>
                  {/* Alternative Buttons */}
                  <div className="flex gap-4 mt-6">
                    <Button
                      variant="secondary"
                      className="flex-1"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4" />
                      Upload Photo
                    </Button>
                    <Button
                      variant="scan"
                      className="flex-1"
                      onClick={() => cameraInputRef.current?.click()}
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
                      className={`w-full h-full object-cover transition-all duration-300 ${isAnalyzing ? 'scale-105 blur-sm' : ''}`}
                    />
                    
                    {/* Analyzing Overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-gradient-to-b from-lawn-900/80 via-lawn-800/70 to-lawn-900/80 flex flex-col items-center justify-center">
                        <div className="relative">
                          {/* Pulsing rings */}
                          <div className="absolute inset-0 w-20 h-20 rounded-full bg-lawn-400/30 animate-ping" />
                          <div className="absolute inset-2 w-16 h-16 rounded-full bg-lawn-400/40 animate-ping" style={{ animationDelay: '0.2s' }} />
                          <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-lawn-400 to-lawn-600 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-10 h-10 text-white animate-pulse" />
                          </div>
                        </div>
                        <p className="mt-6 text-white font-semibold text-lg">Analyzing your lawn...</p>
                        <p className="text-lawn-200 text-sm mt-1">Powered by OpenAI</p>
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

                  {/* Action Buttons - show different states */}
                  {isAnalyzing ? (
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 text-muted-foreground">
                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        <span>This usually takes 5-10 seconds...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="secondary"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1"
                      >
                        <Upload className="w-4 h-4" />
                        Change Photo
                      </Button>
                      <Button
                        variant="scan"
                        size="lg"
                        className="flex-[2]"
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                      >
                        <Sparkles className="w-5 h-5" />
                        Re-analyze
                      </Button>
                    </div>
                  )}

                  {/* Save reminder for logged-in users */}
                  {user && !isAnalyzing && (
                    <p className="text-sm text-muted-foreground text-center mt-4">
                      After analysis, you can save your diagnosis and treatment plan to <strong>My Saved Plans</strong>
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Login prompt for guests */}
          {!user && (
            <div className="mt-6 p-4 rounded-xl bg-card border border-lawn-200 text-center">
              <p className="text-sm text-muted-foreground">
                <strong>Want to save your results?</strong> Sign in to save your photos, diagnoses, and treatment plans to access anytime.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
