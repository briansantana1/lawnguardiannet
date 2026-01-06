/**
 * App Store Landing Page
 * 
 * High-converting landing page for Apple App Store and Google Play Store deployment.
 * Includes phone mockup, app store CTAs, and admin login in footer.
 */

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Apple, Leaf, Shield, Sparkles, Camera, Bell, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

// Google Play icon
const GooglePlayIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
  </svg>
);

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-50 via-background to-lawn-50/50 dark:from-lawn-950 dark:via-background dark:to-lawn-950/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 lawn-pattern opacity-30" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-lawn-400/20 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="container mx-auto px-4 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-14 h-14 bg-gradient-to-br from-lawn-400 to-lawn-600 rounded-2xl flex items-center justify-center shadow-lg shadow-lawn-500/30">
                  <Leaf className="w-7 h-7 text-white" />
                </div>
                <span className="text-2xl font-bold font-display text-lawn-800 dark:text-lawn-200">
                  Lawn Guardian
                </span>
              </div>

              {/* Hero Headline */}
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight text-foreground">
                  Your Lawn's 
                  <span className="text-lawn-600 dark:text-lawn-400"> AI-Powered </span>
                  Personal Expert
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Snap a photo. Get instant diagnosis. Receive personalized treatment plans. 
                  Transform your lawn with AI-powered care recommendations.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0">
                <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50">
                  <Camera className="w-5 h-5 text-lawn-500 shrink-0" />
                  <span className="text-sm font-medium">Instant AI Diagnosis</span>
                </div>
                <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50">
                  <Sparkles className="w-5 h-5 text-lawn-500 shrink-0" />
                  <span className="text-sm font-medium">Smart Recommendations</span>
                </div>
                <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50">
                  <Bell className="w-5 h-5 text-lawn-500 shrink-0" />
                  <span className="text-sm font-medium">Weather-Based Alerts</span>
                </div>
                <div className="flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 border border-border/50">
                  <Calendar className="w-5 h-5 text-lawn-500 shrink-0" />
                  <span className="text-sm font-medium">Treatment Calendar</span>
                </div>
              </div>

              {/* App Store Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="https://apps.apple.com/app/lawn-guardian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                >
                  <Apple className="w-8 h-8" />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Download on the</div>
                    <div className="text-lg font-semibold -mt-1">App Store</div>
                  </div>
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=app.lovable.lawnguardian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 py-4 rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                >
                  <GooglePlayIcon />
                  <div className="text-left">
                    <div className="text-xs opacity-80">Get it on</div>
                    <div className="text-lg font-semibold -mt-1">Google Play</div>
                  </div>
                </a>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 justify-center lg:justify-start text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-lawn-200 border-2 border-background flex items-center justify-center">
                        <span className="text-xs font-medium text-lawn-700">👤</span>
                      </div>
                    ))}
                  </div>
                  <span>10,000+ Users</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★★★★★</span>
                  <span>4.8 Rating</span>
                </div>
              </div>
            </div>

            {/* Right: Phone Mockup */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Glow effect behind phone */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 bg-lawn-400/30 rounded-full blur-[100px]" />
              </div>
              
              {/* Phone Frame */}
              <div className="relative z-10">
                <div className="w-[280px] md:w-[320px] bg-foreground rounded-[3rem] p-3 shadow-2xl">
                  {/* Phone notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-7 bg-foreground rounded-b-2xl z-20" />
                  
                  {/* Screen content */}
                  <div className="bg-background rounded-[2.5rem] overflow-hidden aspect-[9/19.5] relative">
                    {/* Status bar */}
                    <div className="absolute top-0 inset-x-0 h-12 bg-lawn-600 flex items-center justify-center pt-2">
                      <span className="text-white text-xs font-medium">Lawn Guardian</span>
                    </div>
                    
                    {/* App preview content */}
                    <div className="pt-14 px-4 space-y-3">
                      {/* Hero preview */}
                      <div className="bg-gradient-to-br from-lawn-100 to-lawn-200 dark:from-lawn-800 dark:to-lawn-900 rounded-2xl p-4 text-center">
                        <div className="w-12 h-12 bg-lawn-500 rounded-full mx-auto flex items-center justify-center mb-2">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-xs font-medium text-lawn-800 dark:text-lawn-200">Scan Your Lawn</p>
                      </div>
                      
                      {/* Feature cards */}
                      <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-lawn-100 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-4 h-4 text-lawn-600" />
                          </div>
                          <span className="text-xs font-semibold">AI Analysis</span>
                        </div>
                        <div className="h-2 bg-lawn-200 rounded-full w-3/4" />
                      </div>
                      
                      <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                            <Bell className="w-4 h-4 text-sky-600" />
                          </div>
                          <span className="text-xs font-semibold">Weather Alerts</span>
                        </div>
                        <div className="h-2 bg-sky-200 rounded-full w-2/3" />
                      </div>
                      
                      <div className="bg-card rounded-xl p-3 border border-border/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                            <Calendar className="w-4 h-4 text-amber-600" />
                          </div>
                          <span className="text-xs font-semibold">Treatment Plan</span>
                        </div>
                        <div className="h-2 bg-amber-200 rounded-full w-5/6" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4 text-foreground">
              Everything Your Lawn Needs
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional-grade lawn care powered by AI, right in your pocket.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                icon: Camera,
                title: "AI Photo Diagnosis",
                description: "Take a photo of any lawn problem and get instant identification of diseases, weeds, and pests."
              },
              {
                icon: Sparkles,
                title: "Smart Treatment Plans",
                description: "Receive personalized treatment recommendations based on your specific grass type and climate."
              },
              {
                icon: Bell,
                title: "Weather-Based Alerts",
                description: "Get proactive notifications when weather conditions put your lawn at risk."
              },
              {
                icon: Calendar,
                title: "Treatment Calendar",
                description: "Track applications and never miss a treatment with smart scheduling reminders."
              },
              {
                icon: Shield,
                title: "Disease Prevention",
                description: "Stay ahead of problems with predictive alerts based on local conditions."
              },
              {
                icon: CheckCircle2,
                title: "Progress Tracking",
                description: "Monitor your lawn's health over time and see your improvements."
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="bg-card rounded-2xl p-6 border border-border/50 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-lawn-100 dark:bg-lawn-900/50 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-lawn-600 dark:text-lawn-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-lawn-600 to-lawn-700 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold font-display">
                Ready for a Healthier Lawn?
              </h2>
              <p className="text-lg text-white/80 max-w-xl mx-auto">
                Join thousands of homeowners who trust Lawn Guardian for expert lawn care advice.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="https://apps.apple.com/app/lawn-guardian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-white text-lawn-700 px-6 py-3 rounded-xl hover:bg-white/90 transition-colors font-semibold shadow-lg"
                >
                  <Apple className="w-5 h-5" />
                  App Store
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=app.lovable.lawnguardian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 bg-white text-lawn-700 px-6 py-3 rounded-xl hover:bg-white/90 transition-colors font-semibold shadow-lg"
                >
                  <GooglePlayIcon />
                  Google Play
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-lawn-400 to-lawn-600 rounded-xl flex items-center justify-center">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-foreground">Lawn Guardian</span>
            </div>

            {/* Links */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                Terms of Use
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
              <Link 
                to="/admin" 
                className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                Admin Login
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Copyright */}
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Lawn Guardian. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
