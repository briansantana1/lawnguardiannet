import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { ScanUpload } from "@/components/ScanUpload";
import { IssueDatabase } from "@/components/IssueDatabase";
import { WeatherAlerts } from "@/components/WeatherAlerts";
import { TreatmentCalendar } from "@/components/TreatmentCalendar";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main>
        <HeroSection />
        <HowItWorks />
        <ScanUpload />
        <IssueDatabase />
        <WeatherAlerts />
        <TreatmentCalendar />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
