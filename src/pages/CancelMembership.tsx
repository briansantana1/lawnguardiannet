import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export function CancelMembership() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCancel = async () => {
    setIsProcessing(true);
    // Simulated cancellation - would integrate with payment provider
    setTimeout(() => {
      toast({
        title: "Membership Cancelled",
        description: "Your membership has been cancelled. You'll retain access until the end of your billing period.",
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
                Please sign in to manage your membership.
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
          Cancel Membership
        </h1>

        <Card variant="elevated" className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <div>
                <h2 className="font-medium text-foreground">Are you sure?</h2>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-muted-foreground text-sm">
                By cancelling your membership, you will:
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Lose access to unlimited scans and diagnoses
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Lose access to treatment plans
                </li>
                <li className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-destructive" />
                  Be downgraded to the Free Plan
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleCancel}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Confirm Cancellation"}
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/profile")}
              >
                Keep My Membership
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}
