import { Camera, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroLawn from "@/assets/hero-lawn.jpg";

export function HeroSection() {
  return (
    <section className="relative min-h-screen pt-16 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={heroLawn}
          alt="Lush green lawn"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4 pt-20 pb-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lawn-100 text-primary font-medium text-sm mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            AI-Powered Lawn Care
          </div>


          {/* Headline */}
          <h1 className="font-heading text-4xl md:text-6xl font-bold text-foreground mb-6 animate-slide-up">
            Get Outside and Touch{" "}
            <span className="text-gradient">Grass Again</span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            Scan, diagnose, and fix lawn problems in seconds. Our AI identifies
            diseases, weeds, and pests — then gives you the perfect treatment
            plan.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button variant="scan" size="xl">
              <Camera className="w-5 h-5" />
              Scan Your Lawn
            </Button>
            <Button variant="outline" size="lg">
              See How It Works
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Trust Badge */}
          <p
            className="mt-8 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "0.4s" }}
          >
            Works with all grass types
          </p>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
