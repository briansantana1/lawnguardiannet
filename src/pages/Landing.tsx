/**
 * App Store Landing Page
 * 
 * High-converting landing page for Apple App Store and Google Play Store deployment.
 * Features 3D phone animation, glassmorphism, and Apple-native styling.
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Leaf, Shield, Sparkles, Camera, Bell, Calendar, ArrowRight, CheckCircle2 } from "lucide-react";

// Apple App Store badge - Official style
const AppStoreBadge = () => (
  <div className="inline-flex items-center gap-2.5 bg-black text-white px-4 py-2.5 rounded-lg min-w-[140px] hover:bg-gray-900 transition-colors">
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
    </svg>
    <div className="text-left">
      <div className="text-[10px] leading-tight opacity-80">Download on the</div>
      <div className="text-base font-semibold leading-tight">App Store</div>
    </div>
  </div>
);

// Google Play badge - Official style
const GooglePlayBadge = () => (
  <div className="inline-flex items-center gap-2.5 bg-black text-white px-4 py-2.5 rounded-lg min-w-[140px] hover:bg-gray-900 transition-colors">
    <svg className="w-6 h-6" viewBox="0 0 24 24">
      <path fill="#EA4335" d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92z"/>
      <path fill="#FBBC05" d="M16.296 15.193L3.61 22.186c.29.18.65.18.94 0l14.15-8.19-2.404-2.803z"/>
      <path fill="#4285F4" d="M21.6 11.5c0-.56-.29-1.08-.76-1.37l-2.14-1.24-2.9 3.11 2.9 3.11 2.14-1.24c.47-.29.76-.81.76-1.37z"/>
      <path fill="#34A853" d="M3.609 1.814c-.29-.18-.65-.18-.94 0l14.15 8.186 2.404-2.803L4.549 1.814z"/>
    </svg>
    <div className="text-left">
      <div className="text-[10px] leading-tight opacity-80">GET IT ON</div>
      <div className="text-base font-semibold leading-tight">Google Play</div>
    </div>
  </div>
);

const Landing = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // Continuous 3D floating animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      const time = Date.now() / 1500;
      setRotation({
        x: Math.cos(time) * 4,
        y: Math.sin(time) * 6,
      });
      animationId = requestAnimationFrame(animate);
    };
    
    if (!isHovering) {
      animate();
    }
    
    return () => cancelAnimationFrame(animationId);
  }, [isHovering]);

  // Track mouse for 3D phone effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-50 via-background to-lawn-50/50 dark:from-lawn-950 dark:via-background dark:to-lawn-950/50 overflow-hidden">
      {/* Hero Section */}
      <section className="relative">
        {/* Background decoration */}
        <div className="absolute inset-0 lawn-pattern opacity-20" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-lawn-400/20 to-transparent rounded-full blur-3xl -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-tr from-lawn-500/10 to-transparent rounded-full blur-3xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="container mx-auto px-4 py-12 lg:py-16 relative">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            {/* Left: Text Content */}
            <div className="space-y-6 text-center lg:text-left">
              {/* Logo & Brand */}
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <div className="w-12 h-12 bg-gradient-to-br from-lawn-400 to-lawn-600 rounded-2xl flex items-center justify-center shadow-lg shadow-lawn-500/30">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold font-display text-lawn-800 dark:text-lawn-200">
                  Lawn Guardian
                </span>
              </div>

              {/* Hero Headline */}
              <div className="space-y-3">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display leading-tight text-foreground">
                  Your Lawn's 
                  <span className="text-lawn-600 dark:text-lawn-400"> AI-Powered </span>
                  Personal Expert
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
                  Snap a photo. Get instant diagnosis. Receive personalized treatment plans. 
                  Transform your lawn with AI-powered care.
                </p>
              </div>

              {/* Key Benefits - Liquid Glass Cards */}
              <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto lg:mx-0">
                {[
                  { icon: Camera, label: "AI Diagnosis" },
                  { icon: Sparkles, label: "Smart Plans" },
                  { icon: Bell, label: "Weather Alerts" },
                  { icon: Calendar, label: "Treatment Calendar" },
                ].map((item, i) => (
                  <div 
                    key={i}
                    className="flex items-center gap-2.5 px-4 py-3 rounded-2xl
                      bg-white/60 dark:bg-white/10 backdrop-blur-xl 
                      border border-white/40 dark:border-white/20
                      shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_16px_rgba(0,0,0,0.08)]
                      dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_4px_16px_rgba(0,0,0,0.3)]
                      transition-all duration-300 hover:scale-[1.02] hover:shadow-lg"
                  >
                    <item.icon className="w-4 h-4 text-lawn-600 dark:text-lawn-400 shrink-0" />
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                ))}
              </div>

              {/* App Store Buttons - Apple Native Style */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a 
                  href="https://apps.apple.com/app/lawn-guardian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <AppStoreBadge />
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=app.lovable.lawnguardian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <GooglePlayBadge />
                </a>
              </div>

            </div>

            {/* Right: 3D Phone Mockup */}
            <div 
              className="relative flex justify-center lg:justify-end perspective-1000"
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 bg-lawn-400/40 rounded-full blur-[80px] animate-pulse" />
              </div>
              
              {/* 3D Phone Frame */}
              <div 
                className="relative z-10 transition-transform duration-200 ease-out"
                style={{
                  transform: `
                    perspective(1000px) 
                    rotateY(${isHovering ? mousePosition.x * 0.6 : rotation.y}deg) 
                    rotateX(${isHovering ? -mousePosition.y * 0.4 : rotation.x}deg)
                    translateZ(30px)
                  `,
                }}
              >
                {/* Phone outer shell - Liquid Glass effect */}
                <div className="w-[260px] md:w-[280px] rounded-[2.8rem] p-2 
                  bg-gradient-to-b from-gray-800 via-gray-900 to-black
                  shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5),0_30px_60px_-30px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.1)]
                  relative overflow-hidden"
                >
                  {/* Glass reflection */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none rounded-[2.8rem]" />
                  
                  {/* Dynamic Island */}
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-black rounded-full z-30 flex items-center justify-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-gray-800 border border-gray-700" />
                    <div className="w-3 h-3 rounded-full bg-gray-800 border border-gray-700" />
                  </div>
                  
                  {/* Screen - Liquid Glass */}
                  <div className="bg-gradient-to-b from-lawn-50 to-white dark:from-lawn-950 dark:to-gray-900 rounded-[2.4rem] overflow-hidden aspect-[9/19] relative
                    shadow-[inset_0_0_20px_rgba(0,0,0,0.1)]"
                  >
                    {/* Status bar */}
                    <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-lawn-600 to-lawn-700 flex items-end justify-center pb-2 pt-8">
                      <span className="text-white text-xs font-semibold tracking-wide">Lawn Guardian</span>
                    </div>
                    
                    {/* App content preview */}
                    <div className="pt-16 px-3 space-y-2.5">
                      {/* Scan button - Glass effect */}
                      <div className="bg-gradient-to-br from-white/80 to-white/40 dark:from-white/20 dark:to-white/5 
                        backdrop-blur-xl rounded-2xl p-4 text-center
                        border border-white/50 dark:border-white/10
                        shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),0_8px_32px_rgba(34,197,94,0.2)]"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-lawn-400 to-lawn-600 rounded-full mx-auto flex items-center justify-center mb-2 shadow-lg shadow-lawn-500/40">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-[10px] font-semibold text-lawn-800 dark:text-lawn-200">Scan Your Lawn</p>
                      </div>
                      
                      {/* Feature cards - Glass morphism */}
                      {[
                        { icon: Sparkles, label: "AI Analysis", color: "lawn", progress: 75 },
                        { icon: Bell, label: "Weather Alerts", color: "sky", progress: 60 },
                        { icon: Calendar, label: "Treatment Plan", color: "amber", progress: 85 },
                      ].map((item, i) => (
                        <div 
                          key={i}
                          className="bg-white/70 dark:bg-white/10 backdrop-blur-lg rounded-xl p-2.5 
                            border border-white/50 dark:border-white/10
                            shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
                        >
                          <div className="flex items-center gap-2 mb-1.5">
                            <div className={`w-6 h-6 bg-${item.color}-100 dark:bg-${item.color}-900/50 rounded-lg flex items-center justify-center`}>
                              <item.icon className={`w-3 h-3 text-${item.color}-600 dark:text-${item.color}-400`} />
                            </div>
                            <span className="text-[10px] font-semibold text-foreground">{item.label}</span>
                          </div>
                          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-full`}
                              style={{ width: `${item.progress}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating reflection */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[200px] h-[60px] bg-gradient-to-t from-lawn-500/20 to-transparent rounded-full blur-xl" />
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
                  className="inline-block transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <AppStoreBadge />
                </a>
                <a 
                  href="https://play.google.com/store/apps/details?id=app.lovable.lawnguardian" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block transform transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <GooglePlayBadge />
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
