import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, Loader2, Shield, Lock, Leaf, Apple, Smartphone, ExternalLink, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { usePurchases } from "@/hooks/usePurchases";
import { Capacitor } from "@capacitor/core";

/**
 * Purchase Page
 * 
 * For App Store / Play Store deployment:
 * - iOS: Purchases handled via StoreKit through RevenueCat
 * - Android: Purchases handled via Google Play Billing through RevenueCat
 * - Web: Shows instructions to download the app
 * 
 * In-app purchases MUST go through the native store APIs per Apple/Google guidelines.
 */

const planDetails: Record<string, { 
  name: string; 
  price: string; 
  priceValue: number; 
  period: string; 
  features: string[]; 
  badge?: string;
  type: 'weekly' | 'annual';
}> = {
  weekly: {
    name: "Pro Weekly",
    price: "$5.99",
    priceValue: 5.99,
    period: "/week",
    type: 'weekly',
    features: [
      "Unlimited photo scans",
      "AI-powered lawn diagnosis",
      "Detailed diagnosis reports",
      "Treatment recommendations",
      "Organic & chemical options",
      "Prevention strategies",
      "Full history & tracking",
      "Ad-free experience",
      "Cancel anytime - keep access until period ends",
    ],
    badge: "MOST POPULAR",
  },
  annual: {
    name: "Pro Annual",
    price: "$79.99",
    priceValue: 79.99,
    period: "/year",
    type: 'annual',
    features: [
      "Everything in Pro Weekly",
      "Unlimited photo scans",
      "AI-powered lawn diagnosis",
      "Detailed diagnosis reports",
      "Treatment recommendations",
      "Organic & chemical options",
      "Prevention strategies",
      "Full history & tracking",
      "Ad-free experience",
      "Priority support",
    ],
    badge: "SAVE 74%",
  },
};

export function Purchase() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "weekly";
  const plan = planDetails[planId] || planDetails.weekly;
  
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    isInitialized,
    isLoading,
    isPro,
    isNative,
    isPurchaseAvailable,
    offerings,
    weeklyPackage,
    annualPackage,
    error,
    purchaseWeekly,
    purchaseAnnual,
    restore,
    refresh,
    formatPrice,
    subscriptionDetails,
  } = usePurchases();

  const [isProcessing, setIsProcessing] = useState(false);
  const platform = Capacitor.getPlatform();

  // Get the appropriate package based on selected plan
  const selectedPackage = plan.type === 'weekly' ? weeklyPackage : annualPackage;
  
  // Get real price from RevenueCat if available
  const displayPrice = selectedPackage?.product?.priceString || plan.price;

  // Handle purchase
  const handlePurchase = async () => {
    if (!selectedPackage) {
      toast({
        title: "Product Not Available",
        description: "This subscription plan is not currently available. Please try again later.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const result = plan.type === 'weekly' 
        ? await purchaseWeekly()
        : await purchaseAnnual();

      if (result.success) {
        toast({
          title: "Purchase Successful! 🎉",
          description: `Welcome to ${plan.name}! Enjoy unlimited AI-powered lawn diagnostics.`,
        });
        navigate('/');
      } else if (result.error === 'Purchase cancelled') {
        // User cancelled - no toast needed
      } else if (result.error) {
        toast({
          title: "Purchase Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("Purchase error:", error);
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to complete purchase. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle restore purchases
  const handleRestore = async () => {
    setIsProcessing(true);
    
    try {
      const result = await restore();

      if (result.success) {
        toast({
          title: "Purchases Restored! 🎉",
          description: "Your subscription has been restored successfully.",
        });
        navigate('/');
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

  // If already subscribed, show success state
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
              <p className="text-muted-foreground mb-4">
                You have an active Pro subscription
                {subscriptionDetails.expirationDate && (
                  <> until {subscriptionDetails.expirationDate}</>
                )}
              </p>
              <Button onClick={() => navigate('/')}>
                Continue to App
              </Button>
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
                Please sign in to make a purchase.
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
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-lawn-50/30 dark:to-lawn-950/20 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
          Complete Your Purchase
        </h1>
        <p className="text-muted-foreground mb-6">
          Unlock unlimited AI-powered lawn diagnostics
        </p>

        {/* Error State */}
        {error && (
          <Card variant="elevated" className="mb-4 border-destructive">
            <CardContent className="py-4">
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={refresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Plan Summary */}
        <Card variant="elevated" className={`mb-6 relative overflow-hidden ${
          planId === 'weekly' 
            ? 'ring-2 ring-lawn-500' 
            : 'ring-2 ring-amber-400'
        }`}>
          {plan.badge && (
            <div className={`absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl ${
              planId === 'weekly' 
                ? 'bg-gradient-to-r from-lawn-500 to-lawn-600' 
                : 'bg-gradient-to-r from-amber-400 to-amber-500'
            }`}>
              {plan.badge}
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                planId === 'weekly' 
                  ? 'bg-gradient-to-br from-lawn-500 to-lawn-600' 
                  : 'bg-gradient-to-br from-amber-400 to-amber-500'
              }`}>
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-foreground">{displayPrice}</span>
                  <span className="text-sm text-muted-foreground font-medium">{plan.period}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {plan.features.slice(0, 5).map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-sm text-foreground">
                  <div className="w-5 h-5 rounded-full bg-lawn-100 dark:bg-lawn-900 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-lawn-600" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Purchase Options Based on Platform */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {platform === 'ios' && <Apple className="w-5 h-5" />}
              {platform === 'android' && <Smartphone className="w-5 h-5" />}
              {platform === 'web' && <ExternalLink className="w-5 h-5" />}
              {platform === 'ios' ? 'Apple App Store' : platform === 'android' ? 'Google Play' : 'Get the App'}
            </CardTitle>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Lock className="w-3 h-3" />
              {platform === 'web' 
                ? 'Subscriptions available in mobile app'
                : 'Secured by ' + (platform === 'ios' ? 'Apple' : 'Google')
              }
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {platform === 'web' ? (
              // Web - show download options
              <>
                <p className="text-sm text-muted-foreground text-center mb-4">
                  Subscriptions are managed through the Lawn Guardian™ mobile app.
                  Download the app to subscribe:
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
              </>
            ) : (
              // Native - show purchase button
              <>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Loading products...</span>
                  </div>
                ) : !isPurchaseAvailable ? (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Products are not available at the moment.
                    </p>
                    <Button variant="outline" size="sm" onClick={refresh}>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button 
                      size="lg" 
                      className={`w-full font-semibold ${
                        planId === 'weekly'
                          ? 'bg-gradient-to-r from-lawn-500 to-lawn-600 hover:from-lawn-600 hover:to-lawn-700 text-white shadow-md'
                          : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md'
                      }`}
                      disabled={isProcessing || !selectedPackage}
                      onClick={handlePurchase}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {platform === 'ios' ? <Apple className="w-4 h-4 mr-2" /> : <Smartphone className="w-4 h-4 mr-2" />}
                          Subscribe for {displayPrice}{plan.period}
                        </>
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      disabled={isProcessing}
                      onClick={handleRestore}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Restore Purchases
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      {platform === 'ios' 
                        ? 'Payment will be charged to your Apple ID account'
                        : 'Payment will be charged to your Google Play account'
                      }
                    </p>
                  </>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Subscription Terms */}
        <div className="mt-6 space-y-4">
          <div className="text-xs text-muted-foreground text-center space-y-2">
            <p>
              Subscription automatically renews unless cancelled at least 24 hours before the end of the current period.
            </p>
            <p>
              Cancel anytime in your {platform === 'ios' ? 'Apple ID settings' : platform === 'android' ? 'Google Play subscription settings' : 'app store settings'}. You'll keep full access until the end of your current billing period.
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Lock className="w-4 h-4" />
              <span>Privacy Protected</span>
            </div>
          </div>

          {/* Legal Links */}
          <div className="text-center text-xs text-muted-foreground">
            By subscribing, you agree to our{' '}
            <button onClick={() => navigate('/terms')} className="text-primary hover:underline">
              Terms of Use
            </button>{' '}
            and{' '}
            <button onClick={() => navigate('/privacy')} className="text-primary hover:underline">
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
