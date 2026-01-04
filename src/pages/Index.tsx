import { Navigation } from "@/components/Navigation";
import { HeroSection } from "@/components/HeroSection";
import { ScanUpload } from "@/components/ScanUpload";
import { IssueDatabase } from "@/components/IssueDatabase";
import { WeatherAlerts } from "@/components/WeatherAlerts";
import { TreatmentCalendar } from "@/components/TreatmentCalendar";
import { BottomNavigation } from "@/components/BottomNavigation";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <Navigation />
      <main>
        <HeroSection />
        <ScanUpload />
        <IssueDatabase />
        <WeatherAlerts />
        <TreatmentCalendar />
      </main>
      <BottomNavigation />
    </div>
  );
};

export default Index;
