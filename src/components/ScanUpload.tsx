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

export function ScanUpload() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<LawnAnalysisResult | null>(null);
  const [grassType, setGrassType] = useState("cool-season");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const getCurrentSeason = () => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageData = reader.result as string;
        setSelectedImage(imageData);
        setAnalysisResult(null);
        // Automatically start analysis when photo is uploaded
        handleAnalyzeImage(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async (imageData: string) => {
    if (!imageData) return;

    setIsAnalyzing(true);
    toast.info('Analyzing your lawn photo...', { duration: 2000 });
    
    try {
      // Try the new unified diagnosis service first (Plant.id + Treatment DB)
      const result = await diagnoseLawn({
        imageBase64: imageData,
        grassType,
        season: getCurrentSeason(),
        location: "United States",
      });

      setAnalysisResult(result);
      toast.success('Analysis complete! Powered by Plant.id API');
    } catch (diagnosisError) {
      console.log('Using fallback analysis...', diagnosisError);
      
      // Fallback to the original AI analysis
      try {
        const { data, error } = await supabase.functions.invoke('analyze-lawn', {
          body: {
            imageBase64: imageData,
            grassType,
            season: getCurrentSeason(),
            location: "United States",
          },
        });

        if (error) {
          console.error('Analysis error:', error);
          toast.error('Failed to analyze image. Please try again.');
          return;
        }

        if (data.error) {
          console.error('API error:', data.error);
          toast.error(data.error);
          return;
        }

        setAnalysisResult(data);
        toast.success('Analysis complete!');
      } catch (fallbackError) {
        console.error('Error:', fallbackError);
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      handleAnalyzeImage(selectedImage);
    }
  };

  const handleSavePlan = async () => {
    if (!user) {
      toast.error('Please sign in to save your treatment plan.');
      return;
    }

    if (!analysisResult) return;

    try {
      const { error } = await supabase.from('saved_treatment_plans').insert([{
        user_id: user.id,
        image_url: selectedImage || null,
        diagnosis: JSON.parse(JSON.stringify(analysisResult.diagnosis)),
        treatment_plan: JSON.parse(JSON.stringify(analysisResult.treatment_plan)),
        forecast: JSON.parse(JSON.stringify(analysisResult.forecast)),
        grass_type: grassType,
        season: getCurrentSeason(),
      }]);

      if (error) throw error;

      toast.success('Treatment plan saved to My Saved Plans!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save treatment plan.');
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
                Plant.id API
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
              Your Grass Type
            </label>
            <select
              value={grassType}
              onChange={(e) => setGrassType(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-lawn-200 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="cool-season">Cool-Season (Kentucky Bluegrass, Fescue, Ryegrass)</option>
              <option value="warm-season">Warm-Season (Bermuda, Zoysia, St. Augustine)</option>
              <option value="transition-zone">Transition Zone Mix</option>
            </select>
          </div>

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
                  <input
                    ref={fileInputRef}
                    id="lawn-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

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
                      onClick={() => fileInputRef.current?.click()}
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
                        <p className="text-lawn-200 text-sm mt-1">Powered by Plant.id API</p>
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

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

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
