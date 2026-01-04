import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function RestoreMembership() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRestore = async () => {
    setIsProcessing(true);
    // Simulated restoration - would integrate with payment provider
    setTimeout(() => {
      toast({
        title: "Membership Restored",
        description: "Your membership has been successfully restored!",
      });
      setIsProcessing(false);
      navigate("/profile");
    }, 1500);
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
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Please sign in to restore your membership.
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
          Restore Membership
        </h1>

        <Card variant="elevated" className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <RefreshCw className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">Welcome Back!</h2>
                <p className="text-sm text-muted-foreground">Restore your previous subscription</p>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-muted-foreground text-sm">
                By restoring your membership, you will regain access to your previous scans, diagnoses, and treatment plans.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                onClick={handleRestore}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Restore Membership"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/plans")}
              >
                View All Plans
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}
