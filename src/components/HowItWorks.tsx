import { Camera, Zap, FileCheck, Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: Camera,
    title: "Snap a Photo",
    description:
      "Take a picture of the problem area in your lawn using your phone camera.",
    color: "bg-sky/10 text-sky",
  },
  {
    icon: Zap,
    title: "Instant AI Analysis",
    description:
      "Our AI scans databases of diseases, weeds, and insects matched to your grass type and season.",
    color: "bg-sun/10 text-sun",
  },
  {
    icon: FileCheck,
    title: "Get Treatment Plan",
    description:
      "Receive specific IPM protocols with chemical and cultural recommendations.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Shield,
    title: "Prevent Future Issues",
    description:
      "Forecast potential outbreaks based on weather and get preventative measures.",
    color: "bg-lawn-600/10 text-lawn-600",
  },
];

export function HowItWorks() {
  return (
    <section id="scan" className="py-20 bg-background lawn-pattern">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Lawn Guardian™ Works
          </h2>
          <p className="text-muted-foreground text-lg">
            From problem to solution in under 30 seconds. Our AI does the heavy
            lifting so you can enjoy a healthy lawn.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card
              key={step.title}
              variant="elevated"
              className="relative overflow-hidden group"
            >
              <CardContent className="pt-6">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-lawn-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                </div>

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <step.icon className="w-7 h-7" />
                </div>

                {/* Content */}
                <h3 className="font-heading text-lg font-bold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
