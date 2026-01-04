import { useState, useRef } from "react";
import { Camera, Upload, X, Loader2, Sparkles, Plus, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LawnAnalysisResult } from "@/types/lawn-analysis";
import { AnalysisResults } from "@/components/AnalysisResults";
import { useAuth } from "@/hooks/useAuth";

export function ScanUpload() {
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
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
      const newImages: string[] = [];
      const maxFiles = Math.min(files.length, 5 - selectedImages.length);
      
      for (let i = 0; i < maxFiles; i++) {
        const file = files[i];
        const reader = new FileReader();
        reader.onloadend = () => {
          newImages.push(reader.result as string);
          if (newImages.length === maxFiles) {
            setSelectedImages([...selectedImages, ...newImages]);
            setAnalysisResult(null);
          }
        };
        reader.readAsDataURL(file);
      }

      if (files.length > maxFiles) {
        toast.info(`Maximum 5 photos allowed. Added first ${maxFiles} photos.`);
      }
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages(selectedImages.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (selectedImages.length === 0) return;

    setIsAnalyzing(true);
    try {
      // Send primary image for analysis, mention multiple angles in context
      const { data, error } = await supabase.functions.invoke('analyze-lawn', {
        body: {
          imageBase64: selectedImages[0],
          additionalImages: selectedImages.slice(1),
          grassType,
          season: getCurrentSeason(),
          location: "United States",
          multipleAngles: selectedImages.length > 1,
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
        image_url: selectedImages[0] || null,
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

  const clearImages = () => {
    setSelectedImages([]);
    setAnalysisResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (analysisResult) {
    return (
      <AnalysisResults
        result={analysisResult}
        imageUrl={selectedImages[0] || null}
        onSave={handleSavePlan}
        onNewScan={clearImages}
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
              Upload multiple photos from different angles for more accurate AI diagnosis
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
              {selectedImages.length === 0 ? (
                <div className="p-8">
                  {/* Upload Area */}
                  <label
                    htmlFor="lawn-upload"
                    className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-lawn-300 rounded-2xl bg-lawn-50 cursor-pointer hover:bg-lawn-100 hover:border-primary transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-full gradient-lawn flex items-center justify-center mb-4 shadow-glow">
                      <Images className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <p className="font-semibold text-foreground mb-1">
                      Upload up to 5 photos
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Multiple angles help improve diagnosis accuracy
                    </p>
                  </label>
                  <input
                    ref={fileInputRef}
                    id="lawn-upload"
                    type="file"
                    accept="image/*"
                    multiple
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
                      Upload Photos
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
                  {/* Image Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                    {selectedImages.map((img, index) => (
                      <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img
                          src={img}
                          alt={`Lawn photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center hover:bg-card transition-colors shadow-lawn opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4 text-foreground" />
                        </button>
                        {index === 0 && (
                          <span className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                    {selectedImages.length < 5 && (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-lawn-300 flex flex-col items-center justify-center hover:bg-lawn-100 hover:border-primary transition-all duration-300"
                      >
                        <Plus className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="text-xs text-muted-foreground">Add more</span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {selectedImages.length} of 5 photos uploaded
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button
                      variant="secondary"
                      onClick={clearImages}
                      className="flex-1"
                    >
                      Clear All
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              "Capture from multiple angles",
              "Use good natural lighting",
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