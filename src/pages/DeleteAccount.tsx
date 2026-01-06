/**
 * Delete Account Page
 * 
 * Required by Apple App Store and Google Play Store guidelines.
 * Users must be able to delete their account and all associated data.
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BottomNavigation } from "@/components/BottomNavigation";

export function DeleteAccount() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [confirmText, setConfirmText] = useState("");
  const [acknowledged, setAcknowledged] = useState({
    dataLoss: false,
    subscriptionCancel: false,
    irreversible: false,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = 
    confirmText.toLowerCase() === "delete my account" &&
    acknowledged.dataLoss &&
    acknowledged.subscriptionCancel &&
    acknowledged.irreversible;

  const handleDeleteAccount = async () => {
    if (!user || !canDelete) return;

    setIsDeleting(true);

    try {
      // Call the database function to delete the account
      const { error } = await supabase.rpc("delete_user_account", {
        target_user_id: user.id,
      });

      if (error) {
        throw error;
      }

      // Sign out locally
      await signOut();

      toast({
        title: "Account Deleted",
        description: "Your account and all associated data have been permanently deleted.",
      });

      navigate("/");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <Card variant="elevated">
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Please sign in to manage your account.
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
    <div className="min-h-screen bg-gradient-to-b from-background to-red-50/20 dark:to-red-950/10 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground text-sm mb-6 hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <Card variant="elevated" className="border-red-200 dark:border-red-900">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-xl text-red-600">Delete Account</CardTitle>
                <CardDescription>
                  This action cannot be undone
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Warning */}
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Warning: Permanent Deletion
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300">
                Deleting your account will permanently remove:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
                <li>• All your lawn scan history and diagnoses</li>
                <li>• Saved treatment plans and calendars</li>
                <li>• Notification preferences and schedules</li>
                <li>• Profile information and settings</li>
                <li>• All uploaded lawn images</li>
              </ul>
            </div>

            {/* Subscription Notice */}
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
                About Subscriptions
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                If you have an active subscription, it will be marked for cancellation.
                However, you must also cancel it directly through your app store
                (Apple App Store or Google Play Store) to stop future charges.
              </p>
            </div>

            {/* Acknowledgment Checkboxes */}
            <div className="space-y-4">
              <h3 className="font-medium">Please confirm you understand:</h3>
              
              <div className="flex items-start gap-3">
                <Checkbox
                  id="dataLoss"
                  checked={acknowledged.dataLoss}
                  onCheckedChange={(checked) => 
                    setAcknowledged(prev => ({ ...prev, dataLoss: checked as boolean }))
                  }
                />
                <Label htmlFor="dataLoss" className="text-sm leading-relaxed cursor-pointer">
                  All my data will be permanently deleted and cannot be recovered
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="subscriptionCancel"
                  checked={acknowledged.subscriptionCancel}
                  onCheckedChange={(checked) => 
                    setAcknowledged(prev => ({ ...prev, subscriptionCancel: checked as boolean }))
                  }
                />
                <Label htmlFor="subscriptionCancel" className="text-sm leading-relaxed cursor-pointer">
                  I need to separately cancel any active subscriptions in my app store
                </Label>
              </div>

              <div className="flex items-start gap-3">
                <Checkbox
                  id="irreversible"
                  checked={acknowledged.irreversible}
                  onCheckedChange={(checked) => 
                    setAcknowledged(prev => ({ ...prev, irreversible: checked as boolean }))
                  }
                />
                <Label htmlFor="irreversible" className="text-sm leading-relaxed cursor-pointer">
                  This action is immediate and irreversible
                </Label>
              </div>
            </div>

            {/* Confirmation Input */}
            <div className="space-y-2">
              <Label htmlFor="confirmText">
                Type <strong>"delete my account"</strong> to confirm:
              </Label>
              <Input
                id="confirmText"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="delete my account"
                className="font-mono"
              />
            </div>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              onClick={handleDeleteAccount}
              disabled={!canDelete || isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting Account...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Permanently Delete My Account
                </>
              )}
            </Button>

            {/* Alternative */}
            <p className="text-center text-sm text-muted-foreground">
              Changed your mind?{" "}
              <button
                onClick={() => navigate("/profile")}
                className="text-primary hover:underline"
              >
                Go back to profile
              </button>
            </p>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}

export default DeleteAccount;

