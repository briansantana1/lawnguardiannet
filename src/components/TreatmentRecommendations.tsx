import { useState } from "react";
import { Check, Sparkles, Shield, Clock, MapPin, Bookmark, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const treatmentExample = {
  issue: "Brown Patch Fungus",
  confidence: 94,
  grassType: "Tall Fescue",
  severity: "Moderate",
  cultural: [
    "Reduce irrigation frequency — water deeply but infrequently",
    "Mow at higher height (3.5-4 inches) to reduce stress",
    "Improve air circulation by pruning nearby shrubs",
    "Avoid nitrogen fertilization during active disease",
  ],
  chemical: [
    {
      name: "Azoxystrobin (Heritage)",
      rate: "0.2-0.4 oz per 1,000 sq ft",
      interval: "Apply every 14-28 days",
    },
    {
      name: "Propiconazole (Banner Maxx)",
      rate: "1-2 oz per 1,000 sq ft",
      interval: "Apply every 14-21 days",
    },
  ],
  prevention: [
    "Apply preventative fungicide when nighttime temps exceed 65°F",
    "Core aerate in fall to improve drainage",
    "Maintain proper soil pH (6.0-7.0)",
  ],
};

export function TreatmentRecommendations() {
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const [mapsUrl, setMapsUrl] = useState("https://www.google.com/maps/search/Home+Depot+Lowes+garden+center+nursery+lawn+care+near+me");

  // Get user location for maps URL
  const updateMapsUrl = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const searchQuery = encodeURIComponent("Home Depot Lowes garden center nursery lawn care");
          setMapsUrl(`https://www.google.com/maps/search/${searchQuery}/@${latitude},${longitude},14z`);
        },
        () => {
          // Keep default URL if location denied
        }
      );
    }
  };

  // Try to get location on mount
  useState(() => {
    updateMapsUrl();
  });

  const handleSaveTreatmentPlan = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save treatment plans.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.from("saved_treatment_plans").insert({
        user_id: user.id,
        diagnosis: {
          issue: treatmentExample.issue,
          confidence: treatmentExample.confidence,
          severity: treatmentExample.severity,
        },
        treatment_plan: {
          cultural: treatmentExample.cultural,
          chemical: treatmentExample.chemical,
          prevention: treatmentExample.prevention,
        },
        grass_type: treatmentExample.grassType,
        season: getCurrentSeason(),
      });

      if (error) throw error;

      toast({
        title: "Treatment Plan Saved",
        description: "Your treatment plan has been saved to your account.",
      });
    } catch (error) {
      console.error("Error saving treatment plan:", error);
      toast({
        title: "Error",
        description: "Failed to save treatment plan. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCurrentSeason = (): string => {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "Spring";
    if (month >= 5 && month <= 7) return "Summer";
    if (month >= 8 && month <= 10) return "Fall";
    return "Winter";
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Treatment Recommendations
          </h2>
          <p className="text-muted-foreground text-lg">
            IPM-based protocols combining cultural practices and targeted
            chemical treatments for optimal results.
          </p>
        </div>

        {/* Treatment Card Example */}
        <div className="max-w-4xl mx-auto">
          <Card variant="treatment" className="overflow-hidden">
            {/* Header */}
            <div className="gradient-lawn p-6 text-primary-foreground">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-medium opacity-90">
                      AI Diagnosis Result
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold">{treatmentExample.issue}</h3>
                  <p className="opacity-90 mt-1">
                    Detected in {treatmentExample.grassType}
                  </p>
                </div>
                <div className="flex gap-4">
                  <div className="text-center px-4 py-2 rounded-xl bg-primary-foreground/20">
                    <p className="text-2xl font-bold">
                      {treatmentExample.confidence}%
                    </p>
                    <p className="text-xs opacity-80">Confidence</p>
                  </div>
                  <div className="text-center px-4 py-2 rounded-xl bg-primary-foreground/20">
                    <p className="text-lg font-bold">
                      {treatmentExample.severity}
                    </p>
                    <p className="text-xs opacity-80">Severity</p>
                  </div>
                </div>
              </div>
            </div>

            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-8">
                {/* Cultural Practices */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-lawn-100 flex items-center justify-center">
                      <Shield className="w-4 h-4 text-primary" />
                    </div>
                    <h4 className="font-heading font-bold text-foreground">
                      Cultural Practices
                    </h4>
                  </div>
                  <ul className="space-y-3">
                    {treatmentExample.cultural.map((practice, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="w-5 h-5 rounded-full bg-lawn-100 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {practice}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Chemical Treatments */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-sky/10 flex items-center justify-center">
                      <Clock className="w-4 h-4 text-sky" />
                    </div>
                    <h4 className="font-heading font-bold text-foreground">
                      Chemical Treatments
                    </h4>
                  </div>
                  <div className="space-y-4">
                    {treatmentExample.chemical.map((treatment, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-xl bg-lawn-50 border border-lawn-100"
                      >
                        <p className="font-semibold text-foreground text-sm">
                          {treatment.name}
                        </p>
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Rate:</span>{" "}
                            {treatment.rate}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            <span className="font-medium">Interval:</span>{" "}
                            {treatment.interval}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prevention Tips */}
              <div className="mt-8 p-6 rounded-2xl bg-lawn-50 border border-lawn-100">
                <h4 className="font-heading font-bold text-foreground mb-4">
                  Prevention Tips
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {treatmentExample.prevention.map((tip, i) => (
                    <div
                      key={i}
                      className="flex gap-3 items-start p-3 rounded-xl bg-card"
                    >
                      <div className="w-6 h-6 rounded-full gradient-lawn flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-primary-foreground">
                          {i + 1}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Button 
                  variant="scan" 
                  size="lg" 
                  className="flex-1"
                  asChild
                >
                  <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                    <MapPin className="w-4 h-4 mr-2" />
                    Find Products Near Me
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="flex-1"
                  onClick={handleSaveTreatmentPlan}
                  disabled={saving}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  {saving ? "Saving..." : "Save Treatment Plan"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
