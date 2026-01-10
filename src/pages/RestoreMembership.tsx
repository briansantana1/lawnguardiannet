import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RefreshCw, Check, Loader2, Apple, Smartphone, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePurchases } from "@/hooks/usePurchases";
import { Capacitor } from "@capacitor/core";

export function RestoreMembership() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isLoading,
    isPro,
    isNative,
    subscriptionDetails,
    restore,
    refresh,
    getManageUrl,
  } = usePurchases();

  const [isProcessing, setIsProcessing] = useState(false);
  const platform = Capacitor.getPlatform();

  const handleRestore = async () => {
    setIsProcessing(true);
    
    try {
      const result = await restore();

      if (result.success) {
        toast({
          title: "Purchases Restored! 🎉",
          description: "Your subscription has been successfully restored.",
        });
        navigate("/profile");
      } else if (result.error) {
        toast({
          title: "No Purchases Found",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Restore error:", error);
      toast({
        title: "Restore Failed",
        description: error.message || "Unable to restore purchases. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleManageSubscription = () => {
    const url = getManageUrl();
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Already subscribed state
  if (isPro && subscriptionDetails) {
    return (
      <div className="min-h-screen bg-background pb-32">
        <div className="container mx-auto px-4 py-8 max-w-lg">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <Card variant="elevated" className="text-center">
            <CardContent className="py-12">
              <div className="w-16 h-16 rounded-full bg-lawn-100 dark:bg-lawn-900 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-lawn-600" />
              </div>
              <h2 className="text-xl font-bold mb-2">You're Already Subscribed!</h2>
              <p className="text-muted-foreground mb-2">
                You have an active Pro subscription
              </p>
              {subscriptionDetails.expirationDate && (
                <p className="text-sm text-muted-foreground mb-4">
                  Valid until {subscriptionDetails.expirationDate}
                </p>
              )}
              <div className="space-y-3">
                <Button onClick={() => navigate('/app')}>
                  Continue to App
                </Button>
                {isNative && (
                  <Button variant="outline" onClick={handleManageSubscription}>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Manage Subscription
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background pb-32">
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
    <div className="min-h-screen bg-background pb-32">
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
                If you've previously purchased a subscription on this device or with your{' '}
                {platform === 'ios' ? 'Apple ID' : platform === 'android' ? 'Google account' : 'app store account'}
                , you can restore it here.
              </p>
            </div>

            {platform === 'web' ? (
              // Web users need to use the mobile app
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  To restore purchases, please use the Lawn Guardian™ mobile app:
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-auto py-3"
                    onClick={() => window.open('https://apps.apple.com/app/lawn-guardian/id000000000', '_blank')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Apple className="w-6 h-6" />
                      <span className="text-xs">App Store</span>
                    </div>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-auto py-3"
                    onClick={() => window.open('https://play.google.com/store/apps/details?id=com.lawnguardian.app', '_blank')}
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Smartphone className="w-6 h-6" />
                      <span className="text-xs">Play Store</span>
                    </div>
                  </Button>
                </div>
              </div>
            ) : (
              // Native app - show restore button
              <div className="space-y-3">
                <Button
                  className="w-full"
                  onClick={handleRestore}
                  disabled={isProcessing || isLoading}
                >
                  {isProcessing || isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {isProcessing ? "Restoring..." : "Loading..."}
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restore Purchases
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  This will check for any active subscriptions linked to your{' '}
                  {platform === 'ios' ? 'Apple ID' : 'Google account'}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card variant="elevated">
          <CardContent className="py-6">
            <h3 className="font-medium text-foreground mb-2">Don't have a subscription?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              View our available plans and get unlimited AI-powered lawn diagnostics.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/plans")}
            >
              View All Plans
            </Button>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground mb-2">
            Having trouble restoring your purchase?
          </p>
          <Button variant="link" size="sm" onClick={() => navigate('/contact')}>
            Contact Support
          </Button>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
