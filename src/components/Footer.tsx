import { Leaf, Mail, Twitter, Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="bg-lawn-900 text-lawn-100">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
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
                <Link
                  to="/contact"
                  className="text-lawn-400 hover:text-lawn-200 transition-colors text-sm"
                >
                  Contact
                </Link>
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
