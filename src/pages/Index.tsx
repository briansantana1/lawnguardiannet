import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ScanUpload } from "@/components/ScanUpload";
import { WeatherAlerts } from "@/components/WeatherAlerts";
import { TreatmentCalendar } from "@/components/TreatmentCalendar";
import { BottomNavigation } from "@/components/BottomNavigation";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-32">
      <Navigation />
      <main>
        <HeroSection />
        <ScanUpload />
        <WeatherAlerts />
        <TreatmentCalendar />
        
        {/* Footer Links */}
        <footer className="container mx-auto px-4 py-8 mt-8 border-t border-lawn-200/30">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <Link to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <span className="text-muted-foreground/50">•</span>
              <Link to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Use
              </Link>
            </div>
            <p className="text-xs text-muted-foreground/70">
              © {new Date().getFullYear()} Lawn Guardian™. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Index;
