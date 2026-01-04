import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free Plan",
    price: "Free",
    period: "",
    icon: Sparkles,
    color: "bg-muted/50",
    iconColor: "text-muted-foreground",
    features: [
      "1 photo scan per month",
      "1 diagnosis per month",
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "One-Time Option",
    price: "$9.99",
    period: "each time",
    icon: Zap,
    color: "bg-sun/10",
    iconColor: "text-sun",
    features: [
      "1 photo scan",
      "1 diagnosis",
      "1 treatment plan with prevention tips",
    ],
    buttonText: "Purchase",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Monthly Plan",
    price: "$4.99",
    period: "/month",
    icon: Check,
    color: "bg-primary/10",
    iconColor: "text-primary",
    features: [
      "Unlimited photo scans",
      "Unlimited diagnoses",
      "Unlimited treatment plans",
      "Access to all features",
      "Cancel anytime",
    ],
    buttonText: "Subscribe",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Annual Plan",
    price: "$39.99",
    period: "/year",
    icon: Crown,
    color: "bg-lawn-600/10",
    iconColor: "text-lawn-600",
    features: [
      "Unlimited photo scans",
      "Unlimited diagnoses", 
      "Unlimited treatment plans",
      "Access to all features",
      "Best value - save 33%",
    ],
    buttonText: "Subscribe",
    buttonVariant: "default" as const,
    popular: false,
  },
];

export function Plans() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary text-sm mb-4 hover:underline"
        >
          ← Back
        </button>
        
        <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground mb-6">
          Select the plan that works best for you
        </p>

        <div className="space-y-4">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              variant="elevated" 
              className={`relative overflow-hidden ${plan.popular ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-bl-lg">
                  Most Popular
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl ${plan.color} flex items-center justify-center`}>
                    <plan.icon className={`w-6 h-6 ${plan.iconColor}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground">{plan.period}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.buttonVariant} 
                  className="w-full"
                  disabled={plan.name === "Free Plan"}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
