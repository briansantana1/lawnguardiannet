import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
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
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
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
            <p className="text-muted-foreground">
              Upload a clear, well-lit photo of the affected area for accurate AI diagnosis
            </p>
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
                  {/* Selected Image Preview */}
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-6 group">
                    <img
                      src={selectedImage}
                      alt="Lawn photo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lawn"
                    >
                      <X className="w-5 h-5 text-foreground" />
                    </button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  {/* Action Buttons */}
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
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Analyze with AI
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Save reminder for logged-in users */}
                  {user && (
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
