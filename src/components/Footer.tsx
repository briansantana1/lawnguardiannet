import { Leaf, Mail, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Footer() {
  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);

  const handleContact = () => {
    window.location.href = "mailto:info.lawnguardian@yahoo.com";
  };

  return (
    <footer className="bg-lawn-900 text-lawn-100">
      {/* Newsletter Section */}
      <div className="border-b border-lawn-800">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="font-heading text-2xl font-bold text-lawn-50 mb-3">
              Stay Ahead of Lawn Problems
            </h3>
            <p className="text-lawn-300 mb-6">
              Get seasonal tips, disease forecasts, and treatment reminders
              delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-xl bg-lawn-800 border border-lawn-700 text-lawn-100 placeholder:text-lawn-500 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button variant="scan">Subscribe</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-lawn flex items-center justify-center">
                <Leaf className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-heading font-bold text-lg text-lawn-50">
                Lawn Guardian
              </span>
            </div>
            <p className="text-lawn-400 text-sm leading-relaxed">
              AI-powered lawn care diagnosis and treatment. Get outside and
              touch grass again.
            </p>
            <div className="flex gap-3 mt-6">
              {[Twitter, Instagram, Youtube, Mail].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-lawn-800 flex items-center justify-center hover:bg-lawn-700 transition-colors"
                >
                  <Icon className="w-5 h-5 text-lawn-400" />
                </a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-heading font-bold text-lawn-50 mb-4">
              Features
            </h4>
            <ul className="space-y-3">
              {[
                "AI Lawn Scanner",
                "Disease Database",
                "Treatment Plans",
                "Weather Forecasts",
                "Soil Temperature",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-heading font-bold text-lawn-50 mb-4">
              Resources
            </h4>
            <ul className="space-y-3">
              {[
                "Lawn Care Guide",
                "Grass Types",
                "Seasonal Calendar",
                "Product Reviews",
                "Community Forum",
              ].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-heading font-bold text-lawn-50 mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                >
                  About Us
                </a>
              </li>
              <li>
                <button
                  onClick={() => setPrivacyOpen(true)}
                  className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => setTermsOpen(true)}
                  className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                >
                  Terms of Use
                </button>
              </li>
              <li>
                <button
                  onClick={handleContact}
                  className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-lawn-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-lawn-500 text-sm">
            © 2024 Lawn Guardian. All rights reserved.
          </p>
          <p className="text-lawn-500 text-sm">
            Made with 💚 for lawn enthusiasts everywhere
          </p>
        </div>
      </div>

      {/* Privacy Policy Dialog */}
      <Dialog open={privacyOpen} onOpenChange={setPrivacyOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Privacy Policy</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">Last updated: January 2024</p>
              
              <h3 className="text-foreground font-semibold text-base">1. Information We Collect</h3>
              <p>
                We collect information you provide directly to us, such as when you create an account, 
                upload lawn images for analysis, save treatment plans, or contact us for support. 
                This may include your email address, location data for weather services, and lawn images.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">2. How We Use Your Information</h3>
              <p>
                We use the information we collect to provide, maintain, and improve our services, 
                including AI-powered lawn analysis, personalized treatment recommendations, 
                and location-based weather alerts.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">3. Information Sharing</h3>
              <p>
                We do not sell, trade, or otherwise transfer your personal information to outside parties. 
                This does not include trusted third parties who assist us in operating our service, 
                conducting our business, or serving you.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">4. Data Security</h3>
              <p>
                We implement appropriate security measures to protect your personal information. 
                However, no method of transmission over the Internet is 100% secure.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">5. Your Rights</h3>
              <p>
                You have the right to access, update, or delete your personal information at any time 
                by accessing your account settings or contacting us directly.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">6. Contact Us</h3>
              <p>
                If you have any questions about this Privacy Policy, please contact us at:{" "}
                <a href="mailto:info.lawnguardian@yahoo.com" className="text-primary hover:underline">
                  info.lawnguardian@yahoo.com
                </a>
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Terms of Use Dialog */}
      <Dialog open={termsOpen} onOpenChange={setTermsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Terms of Use</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm text-muted-foreground">
              <p className="text-foreground font-medium">Last updated: January 2024</p>
              
              <h3 className="text-foreground font-semibold text-base">1. Acceptance of Terms</h3>
              <p>
                By accessing and using Lawn Guardian, you accept and agree to be bound by the terms 
                and provisions of this agreement. If you do not agree to these terms, please do not use our service.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">2. Description of Service</h3>
              <p>
                Lawn Guardian provides AI-powered lawn care diagnosis and treatment recommendations. 
                Our service analyzes lawn images to identify diseases, insects, and weeds, 
                and provides treatment suggestions based on best practices.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">3. Disclaimer</h3>
              <p>
                The information provided by Lawn Guardian is for educational and informational purposes only. 
                While we strive for accuracy, we cannot guarantee that our AI diagnosis will be 100% correct. 
                Always consult with a local lawn care professional for serious lawn issues.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">4. User Responsibilities</h3>
              <p>
                Users are responsible for following all applicable local, state, and federal regulations 
                regarding the use of lawn care products, including pesticides and fertilizers. 
                Always read and follow product labels carefully.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">5. Intellectual Property</h3>
              <p>
                All content, features, and functionality of Lawn Guardian are owned by us and are protected 
                by international copyright, trademark, and other intellectual property laws.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">6. Limitation of Liability</h3>
              <p>
                Lawn Guardian shall not be liable for any indirect, incidental, special, consequential, 
                or punitive damages resulting from your use of or inability to use the service.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">7. Changes to Terms</h3>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any 
                material changes by posting the new terms on this page.
              </p>
              
              <h3 className="text-foreground font-semibold text-base">8. Contact</h3>
              <p>
                For questions about these Terms of Use, contact us at:{" "}
                <a href="mailto:info.lawnguardian@yahoo.com" className="text-primary hover:underline">
                  info.lawnguardian@yahoo.com
                </a>
              </p>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </footer>
  );
}
