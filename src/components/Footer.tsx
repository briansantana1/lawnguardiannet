import { Leaf, Mail, Twitter, Instagram, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function Footer() {
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
                <Link
                  to="/privacy"
                  className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                >
                  Terms of Use
                </Link>
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
    </footer>
  );
}
