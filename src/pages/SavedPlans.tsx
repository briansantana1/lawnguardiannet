import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Trash2, Loader2, ImageIcon, Pencil, X, Save, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface SavedPlan {
  id: string;
  diagnosis: any;
  treatment_plan: any;
  forecast: any;
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
  const [editingPlan, setEditingPlan] = useState<SavedPlan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  
  // Edit form state
  const [editGrassType, setEditGrassType] = useState("");
  const [editSeason, setEditSeason] = useState("");
  const [editNotes, setEditNotes] = useState("");

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

  const handleEdit = (plan: SavedPlan) => {
    setEditingPlan(plan);
    setEditGrassType(plan.grass_type || "");
    setEditSeason(plan.season || "");
    setEditNotes(plan.diagnosis?.notes || "");
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingPlan) return;
    
    setIsSaving(true);
    try {
      const updatedDiagnosis = {
        ...editingPlan.diagnosis,
        notes: editNotes,
      };

      const { error } = await supabase
        .from("saved_treatment_plans")
        .update({
          grass_type: editGrassType,
          season: editSeason,
          diagnosis: updatedDiagnosis,
        })
        .eq("id", editingPlan.id);

      if (error) throw error;

      // Update local state
      setPlans(plans.map(p => 
        p.id === editingPlan.id 
          ? { ...p, grass_type: editGrassType, season: editSeason, diagnosis: updatedDiagnosis }
          : p
      ));
      
      setIsEditDialogOpen(false);
      setEditingPlan(null);
      toast({
        title: "Plan Updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Failed to update plan:", error);
      toast({
        title: "Error",
        description: "Failed to update plan.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  const toggleExpanded = (planId: string) => {
    setExpandedPlanId(expandedPlanId === planId ? null : planId);
  };

  const getPrimaryIssueName = (plan: SavedPlan) => {
    if (plan.diagnosis?.identified_issues?.[0]?.name) {
      return plan.diagnosis.identified_issues[0].name;
    }
    if (plan.diagnosis?.primary_issue) {
      return plan.diagnosis.primary_issue;
    }
    return "Lawn Diagnosis";
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
              <Card key={plan.id} variant="elevated" className="overflow-hidden">
                <CardContent className="py-4">
                  <div className="flex items-start gap-4">
                    {/* Photo Thumbnail */}
                    <div 
                      className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-lawn-100 border border-lawn-200 cursor-pointer"
                      onClick={() => toggleExpanded(plan.id)}
                    >
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
                    <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleExpanded(plan.id)}>
                      <h3 className="font-medium text-foreground truncate">
                        {getPrimaryIssueName(plan)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(plan.created_at), "MMM d, yyyy")}
                      </p>
                      {plan.grass_type && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Grass: {plan.grass_type}
                        </p>
                      )}
                      {plan.diagnosis?.notes && (
                        <p className="text-xs text-primary mt-1 truncate">
                          📝 {plan.diagnosis.notes}
                        </p>
                      )}
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-primary hover:text-primary hover:bg-primary/10"
                        onClick={() => handleEdit(plan)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Expand/Collapse Indicator */}
                  <button 
                    className="w-full flex items-center justify-center mt-2 pt-2 border-t border-border/50 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => toggleExpanded(plan.id)}
                  >
                    {expandedPlanId === plan.id ? (
                      <>
                        <span className="text-xs mr-1">Hide Details</span>
                        <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        <span className="text-xs mr-1">View Details</span>
                        <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                  
                  {/* Expanded Details */}
                  {expandedPlanId === plan.id && (
                    <div className="mt-4 pt-4 border-t border-border space-y-4">
                      {/* Full Image */}
                      {plan.image_url && (
                        <div className="rounded-lg overflow-hidden">
                          <img
                            src={plan.image_url}
                            alt="Lawn photo"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Diagnosis Info */}
                      {plan.diagnosis?.identified_issues?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Identified Issues</h4>
                          <div className="space-y-2">
                            {plan.diagnosis.identified_issues.map((issue: any, idx: number) => (
                              <div key={idx} className="p-2 rounded-lg bg-muted/50">
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-sm">{issue.name}</span>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    issue.severity === 'severe' ? 'bg-red-100 text-red-700' :
                                    issue.severity === 'moderate' ? 'bg-amber-100 text-amber-700' :
                                    'bg-green-100 text-green-700'
                                  }`}>
                                    {issue.severity}
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{issue.description}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Treatment Plan Summary */}
                      {plan.treatment_plan?.prevention_tips?.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Prevention Tips</h4>
                          <ul className="text-xs text-muted-foreground space-y-1">
                            {plan.treatment_plan.prevention_tips.slice(0, 3).map((tip: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-primary">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {/* Notes */}
                      {plan.diagnosis?.notes && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-2">Your Notes</h4>
                          <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {plan.diagnosis.notes}
                          </p>
                        </div>
                      )}
                      
                      {/* Edit Button */}
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleEdit(plan)}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit This Plan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Saved Plan</DialogTitle>
            </DialogHeader>
            
            {editingPlan && (
              <div className="space-y-4 py-4">
                {/* Preview Image */}
                {editingPlan.image_url && (
                  <div className="rounded-lg overflow-hidden">
                    <img
                      src={editingPlan.image_url}
                      alt="Lawn photo"
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}
                
                {/* Issue Name (read-only) */}
                <div>
                  <Label className="text-muted-foreground">Identified Issue</Label>
                  <p className="font-medium text-foreground">
                    {getPrimaryIssueName(editingPlan)}
                  </p>
                </div>
                
                {/* Grass Type */}
                <div className="space-y-2">
                  <Label htmlFor="grassType">Grass Type</Label>
                  <select
                    id="grassType"
                    value={editGrassType}
                    onChange={(e) => setEditGrassType(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select grass type</option>
                    <option value="cool-season">Cool-Season (Kentucky Bluegrass, Fescue, Ryegrass)</option>
                    <option value="warm-season">Warm-Season (Bermuda, Zoysia, St. Augustine)</option>
                    <option value="transition-zone">Transition Zone Mix</option>
                  </select>
                </div>
                
                {/* Season */}
                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <select
                    id="season"
                    value={editSeason}
                    onChange={(e) => setEditSeason(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">Select season</option>
                    <option value="spring">Spring</option>
                    <option value="summer">Summer</option>
                    <option value="fall">Fall</option>
                    <option value="winter">Winter</option>
                  </select>
                </div>
                
                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Your Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add notes about treatment progress, observations, etc."
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
            )}
            
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <BottomNavigation />
    </div>
  );
}
