import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LawnAnalysisResult } from "@/types/lawn-analysis";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useAuth } from "@/hooks/useAuth";

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
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-lawn', {
        body: {
          imageBase64: selectedImage,
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
    } catch (error) {
      console.error('Error:', error);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsAnalyzing(false);
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
        image_url: selectedImage,
        diagnosis: JSON.parse(JSON.stringify(analysisResult.diagnosis)),
        treatment_plan: JSON.parse(JSON.stringify(analysisResult.treatment_plan)),
        forecast: JSON.parse(JSON.stringify(analysisResult.forecast)),
        grass_type: grassType,
        season: getCurrentSeason(),
      }]);

      if (error) throw error;

      toast.success('Treatment plan saved to your account!');
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

  return (
    <section id="scan" className="py-20 bg-lawn-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Scan Your Lawn Problem
            </h2>
            <p className="text-muted-foreground">
              Upload or take a photo of the affected area for instant AI
              diagnosis
            </p>
          </div>

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
                      Take or upload a photo
                    </p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG up to 10MB
                    </p>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="lawn-upload"
                    type="file"
                    accept="image/*"
                    capture="environment"
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
                <div className="relative">
                  {/* Preview Image */}
                  <img
                    src={selectedImage}
                    alt="Lawn problem"
                    className="w-full h-80 object-cover"
                  />

                  {/* Clear Button */}
                  <button
                    onClick={clearImage}
                    className="absolute top-4 right-4 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lawn"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>

                  {/* Analyze Button */}
                  <div className="p-6">
                    <Button
                      variant="scan"
                      size="lg"
                      className="w-full"
                      onClick={handleAnalyze}
                      disabled={isAnalyzing}
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing your lawn...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              "Get close to the problem area",
              "Use good lighting",
              "Include healthy grass for comparison",
            ].map((tip, i) => (
              <div
                key={i}
                className="text-center p-3 rounded-xl bg-card shadow-sm"
              >
                <p className="text-xs text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}