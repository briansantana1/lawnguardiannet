import { Check, Sparkles, Crown, Shield, Leaf, Bug, FlaskConical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "Free",
    period: "",
    icon: Sparkles,
    color: "bg-slate-100 dark:bg-slate-800",
    iconColor: "text-slate-500",
    borderColor: "border-slate-200 dark:border-slate-700",
    features: [
      { text: "3 photo scans per month", included: true },
      { text: "Basic problem identification", included: true },
      { text: "Confidence scores", included: true },
      { text: "Detailed diagnosis", included: false },
      { text: "Treatment recommendations", included: false },
      { text: "Organic & chemical options", included: false },
      { text: "Prevention strategies", included: false },
      { text: "History & tracking", included: false },
    ],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
    savings: null,
  },
  {
    name: "Pro Monthly",
    price: "$9.99",
    period: "/month",
    icon: Shield,
    color: "bg-gradient-to-br from-lawn-500 to-lawn-600",
    iconColor: "text-white",
    borderColor: "ring-2 ring-lawn-500",
    features: [
      { text: "Unlimited photo scans", included: true },
      { text: "AI-powered identification", included: true },
      { text: "High-accuracy AI diagnosis", included: true },
      { text: "Detailed diagnosis reports", included: true },
      { text: "Treatment recommendations", included: true },
      { text: "Organic & chemical options", included: true },
      { text: "Prevention strategies", included: true },
      { text: "Full history & tracking", included: true },
      { text: "Regional timing advice", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Priority support", included: true },
    ],
    buttonText: "Start Pro Monthly",
    buttonVariant: "default" as const,
    popular: true,
    savings: null,
  },
  {
    name: "Pro Annual",
    price: "$79.99",
    period: "/year",
    icon: Crown,
    color: "bg-gradient-to-br from-amber-400 to-amber-500",
    iconColor: "text-white",
    borderColor: "ring-2 ring-amber-400",
    features: [
      { text: "Everything in Pro Monthly", included: true },
      { text: "Unlimited photo scans", included: true },
      { text: "AI-powered identification", included: true },
      { text: "High-accuracy AI diagnosis", included: true },
      { text: "Detailed diagnosis reports", included: true },
      { text: "Treatment recommendations", included: true },
      { text: "Organic & chemical options", included: true },
      { text: "Prevention strategies", included: true },
      { text: "Full history & tracking", included: true },
      { text: "Regional timing advice", included: true },
      { text: "Ad-free experience", included: true },
      { text: "Priority support", included: true },
    ],
    buttonText: "Start Pro Annual",
    buttonVariant: "default" as const,
    popular: false,
    savings: "Save 33% ($40/year)",
  },
];

const poweredByFeatures = [
  { icon: Leaf, text: "OpenAI Vision", description: "Expert lawn disease & pest identification" },
  { icon: Bug, text: "Pest Detection", description: "Identifies insects & lawn pests" },
  { icon: FlaskConical, text: "Treatment Database", description: "Expert-curated organic & chemical solutions" },
];

export function Plans() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-lawn-50/30 dark:to-lawn-950/20 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button 
          onClick={() => navigate(-1)}
          className="text-primary text-sm mb-4 hover:underline flex items-center gap-1"
        >
          ← Back
        </button>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground mb-2">
            Choose Your Plan
          </h1>
          <p className="text-muted-foreground">
            Unlock the full power of AI lawn diagnostics
          </p>
        </div>

        {/* Powered By Section */}
        <Card className="mb-6 bg-gradient-to-r from-lawn-50 to-emerald-50 dark:from-lawn-950/50 dark:to-emerald-950/50 border-lawn-200 dark:border-lawn-800">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-medium text-lawn-700 dark:text-lawn-300 mb-3 text-center uppercase tracking-wider">
              Powered by Industry-Leading Technology
            </p>
            <div className="grid grid-cols-3 gap-2">
              {poweredByFeatures.map((feature) => (
                <div key={feature.text} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-white dark:bg-lawn-900 shadow-sm flex items-center justify-center mx-auto mb-1">
                    <feature.icon className="w-5 h-5 text-lawn-600" />
                  </div>
                  <p className="text-xs font-semibold text-foreground">{feature.text}</p>
                  <p className="text-[10px] text-muted-foreground leading-tight">{feature.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Plans */}
        <div className="space-y-4">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              variant="elevated" 
              className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${plan.popular ? plan.borderColor : 'hover:ring-1 hover:ring-lawn-200'}`}
            >
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-lawn-500 to-lawn-600 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                  RECOMMENDED
                </div>
              )}
              {plan.savings && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-400 to-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl shadow-sm">
                  {plan.savings}
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${plan.color} flex items-center justify-center shadow-sm`}>
                    <plan.icon className={`w-7 h-7 ${plan.iconColor}`} />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                      {plan.period && (
                        <span className="text-sm text-muted-foreground font-medium">{plan.period}</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2.5 mb-5">
                  {plan.features.slice(0, plan.name === "Free" ? 8 : 6).map((feature) => (
                    <li 
                      key={feature.text} 
                      className={`flex items-center gap-2.5 text-sm ${
                        feature.included 
                          ? 'text-foreground' 
                          : 'text-muted-foreground/50 line-through'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.included 
                          ? 'bg-lawn-100 dark:bg-lawn-900' 
                          : 'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <Check className={`w-3 h-3 ${
                          feature.included 
                            ? 'text-lawn-600' 
                            : 'text-slate-400'
                        }`} />
                      </div>
                      {feature.text}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={plan.buttonVariant} 
                  size="lg"
                  className={`w-full font-semibold ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-lawn-500 to-lawn-600 hover:from-lawn-600 hover:to-lawn-700 text-white shadow-md' 
                      : plan.name === "Pro Annual"
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white shadow-md'
                        : ''
                  }`}
                  disabled={plan.name === "Free"}
                  onClick={() => {
                    if (plan.name === "Pro Monthly") {
                      navigate("/purchase?plan=monthly");
                    } else if (plan.name === "Pro Annual") {
                      navigate("/purchase?plan=annual");
                    }
                  }}
                >
                  {plan.buttonText}
                </Button>
                {plan.name !== "Free" && (
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Cancel anytime. Keep access until period ends.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 text-center">
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}
