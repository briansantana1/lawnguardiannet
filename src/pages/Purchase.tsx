import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Check, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const planDetails: Record<string, { name: string; price: string; features: string[] }> = {
  "one-time": {
    name: "One-Time Option",
    price: "$9.99",
    features: ["1 photo scan", "1 diagnosis", "1 treatment plan with prevention tips"],
  },
  monthly: {
    name: "Monthly Plan",
    price: "$4.99/month",
    features: ["Unlimited photo scans", "Unlimited diagnoses", "Unlimited treatment plans", "Access to all features", "Cancel anytime"],
  },
  annual: {
    name: "Annual Plan",
    price: "$39.99/year",
    features: ["Unlimited photo scans", "Unlimited diagnoses", "Unlimited treatment plans", "Access to all features", "Best value - save 33%"],
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
          Complete Purchase
        </h1>

        {/* Plan Summary */}
        <Card variant="elevated" className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <p className="text-2xl font-bold text-primary">{plan.price}</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-4 h-4 text-primary flex-shrink-0" />
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
              <CreditCard className="w-5 h-5" />
              Payment Details
            </CardTitle>
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

              <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay ${plan.price}`
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <BottomNavigation />
    </div>
  );
}
