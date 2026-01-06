import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Check, Loader2, Shield, Lock, Leaf } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const planDetails: Record<string, { name: string; price: string; priceValue: number; period: string; features: string[]; badge?: string }> = {
  monthly: {
    name: "Pro Monthly",
    price: "$9.99",
    priceValue: 9.99,
    period: "/month",
    features: [
      "Unlimited photo scans",
      "AI-powered Plant.id identification",
      "Detailed diagnosis reports",
      "Treatment recommendations",
      "Organic & chemical options",
      "Prevention strategies",
      "Full history & tracking",
      "Ad-free experience",
      "Cancel anytime",
    ],
    badge: "MOST POPULAR",
  },
  annual: {
    name: "Pro Annual",
    price: "$79.99",
    priceValue: 79.99,
    period: "/year",
    features: [
      "Everything in Pro Monthly",
      "Unlimited photo scans",
      "AI-powered Plant.id identification",
      "Detailed diagnosis reports",
      "Treatment recommendations",
      "Organic & chemical options",
      "Prevention strategies",
      "Full history & tracking",
      "Ad-free experience",
      "Priority support",
    ],
    badge: "SAVE 33%",
  },
};

export function Purchase() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get("plan") || "monthly";
  const plan = planDetails[planId] || planDetails.monthly;
  
  const { user } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulated purchase - would integrate with payment provider
    setTimeout(() => {
      toast({
        title: "Purchase Successful!",
        description: `You've successfully purchased the ${plan.name}.`,
      });
      setIsProcessing(false);
      navigate("/profile");
    }, 2000);
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

        {/* Plan Summary */}
        <Card variant="elevated" className={`mb-6 relative overflow-hidden ${
          planId === 'monthly' 
            ? 'ring-2 ring-lawn-500' 
            : 'ring-2 ring-amber-400'
        }`}>
          {plan.badge && (
            <div className={`absolute top-0 right-0 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl ${
              planId === 'monthly' 
                ? 'bg-gradient-to-r from-lawn-500 to-lawn-600' 
                : 'bg-gradient-to-r from-amber-400 to-amber-500'
            }`}>
              {plan.badge}
            </div>
          )}
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                planId === 'monthly' 
                  ? 'bg-gradient-to-br from-lawn-500 to-lawn-600' 
                  : 'bg-gradient-to-br from-amber-400 to-amber-500'
              }`}>
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
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

        {/* Payment Form */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="w-5 h-5 text-lawn-600" />
              Payment Details
            </CardTitle>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Lock className="w-3 h-3" />
              Secured with 256-bit encryption
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePurchase} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardName">Name on Card</Label>
                <Input id="cardName" placeholder="John Doe" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <Input id="expiry" placeholder="MM/YY" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" placeholder="123" required />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className={`w-full font-semibold ${
                  planId === 'monthly'
                    ? 'bg-gradient-to-r from-lawn-500 to-lawn-600 hover:from-lawn-600 hover:to-lawn-700 text-white shadow-md'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md'
                }`}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Subscribe for ${plan.price}${plan.period}`
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Cancel anytime
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Trust Badges */}
        <div className="mt-6 text-center">
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
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
