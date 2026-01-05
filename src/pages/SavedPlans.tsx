import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Trash2, Loader2, ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SavedPlan {
  id: string;
  diagnosis: any;
  treatment_plan: any;
  grass_type: string | null;
  season: string | null;
  created_at: string;
  image_url: string | null;
}

export function SavedPlans() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPlans();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_treatment_plans")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error("Failed to load plans:", error);
      toast({
        title: "Error",
        description: "Failed to load saved plans.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("saved_treatment_plans")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setPlans(plans.filter((p) => p.id !== id));
      toast({
        title: "Plan Deleted",
        description: "Your saved plan has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete plan.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
            My Saved Plans
          </h1>
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Please sign in to view your saved plans.
              </p>
              <Button className="mt-4" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
          My Saved Plans
        </h1>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">No Saved Plans</h3>
              <p className="text-muted-foreground text-sm">
                Your saved diagnoses and treatment plans will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {plans.map((plan) => (
              <Card key={plan.id} variant="elevated">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Photo Thumbnail */}
                    <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-lawn-100 border border-lawn-200">
                      {plan.image_url ? (
                        <img
                          src={plan.image_url}
                          alt="Lawn photo"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                      )}
                    </div>
                    
                    {/* Plan Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-foreground truncate">
                        {plan.diagnosis?.primary_issue || "Lawn Diagnosis"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(plan.created_at), "MMM d, yyyy")}
                      </p>
                      {plan.grass_type && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Grass: {plan.grass_type}
                        </p>
                      )}
                    </div>
                    
                    {/* Delete Button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive flex-shrink-0"
                      onClick={() => handleDelete(plan.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
