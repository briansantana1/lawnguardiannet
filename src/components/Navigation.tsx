import { Camera, Search, CloudSun, Bell, Leaf, Menu, X, User, LogOut, Crown, CreditCard, RefreshCw, Mail, Save, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { usePurchases } from "@/hooks/usePurchases";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { label: "Scan", icon: Camera, href: "#scan" },
  { label: "Issues", icon: Search, href: "#issues" },
  { label: "Weather", icon: CloudSun, href: "#weather" },
  { label: "Alerts", icon: Bell, href: "#alerts" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isPro } = usePurchases();
  const navigate = useNavigate();

  const handleMenuClick = () => {
    if (user) {
      // When logged in, go directly to Profile page
      navigate('/profile');
    } else {
      // When not logged in, show the menu
      setIsOpen(!isOpen);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-lawn-200/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-lawn flex items-center justify-center shadow-lawn">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-lg text-foreground">
              Lawn Guardian™
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-muted-foreground hover:text-primary hover:bg-lawn-100 transition-all duration-200"
              >
                <item.icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </a>
            ))}
          </div>

          {/* CTA & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <a href="#scan">
              <Button variant="scan" size="sm">
                <Camera className="w-4 h-4" />
                Scan Now
              </Button>
            </a>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <User className="w-4 h-4" />
                    Account
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-muted-foreground">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onSelect={() => window.location.href = '/saved-plans'}>
                    My Saved Plans
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={handleMenuClick}
            className="md:hidden p-2 rounded-lg hover:bg-lawn-100 transition-colors"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-foreground" />
            ) : (
              <Menu className="w-6 h-6 text-foreground" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-lawn-200/30 animate-fade-in max-h-[80vh] overflow-y-auto">
            <div className="flex flex-col gap-2">
              
              {/* User Profile Info - First Thing They See */}
              {user ? (
                <div className="px-4 py-3 mb-2">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-7 h-7 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {isPro ? (
                          <Badge className="bg-lawn-500 hover:bg-lawn-600">PRO Member</Badge>
                        ) : (
                          <Badge variant="outline">Free Plan</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Upgrade Button for Free Users */}
                  {!isPro && (
                    <Link to="/plans" onClick={() => setIsOpen(false)}>
                      <Button variant="hero" className="w-full mt-4">
                        <Crown className="w-4 h-4" />
                        Upgrade to Pro
                      </Button>
                    </Link>
                  )}
                </div>
              ) : (
                <div className="px-4 py-3 mb-2">
                  <p className="text-muted-foreground mb-3">Sign in to access all features</p>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="default" className="w-full">
                      <User className="w-4 h-4" />
                      Sign In
                    </Button>
                  </Link>
                </div>
              )}

              {/* Account Links */}
              {user && (
                <div className="border-t border-lawn-200/30 pt-2 space-y-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-lawn-100 transition-colors"
                  >
                    <User className="w-5 h-5 text-primary" />
                    <span className="font-medium">Edit Profile</span>
                  </Link>
                  
                  <Link
                    to="/plans"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-lawn-100 transition-colors"
                  >
                    <CreditCard className="w-5 h-5 text-primary" />
                    <span className="font-medium">Plans & Pricing</span>
                  </Link>
                  
                  <Link
                    to="/saved-plans"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-lawn-100 transition-colors"
                  >
                    <Save className="w-5 h-5 text-primary" />
                    <span className="font-medium">My Saved Plans</span>
                  </Link>
                  
                  <Link
                    to="/restore-membership"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-lawn-100 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5 text-primary" />
                    <span className="font-medium">Restore Purchases</span>
                  </Link>
                  
                  <Link
                    to="/contact"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground hover:bg-lawn-100 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-primary" />
                    <span className="font-medium">Contact Us</span>
                  </Link>
                </div>
              )}

              {/* Scan Your Lawn Button */}
              <div className="pt-4 border-t border-lawn-200/30">
                <a href="#scan" onClick={() => setIsOpen(false)}>
                  <Button variant="scan" className="w-full">
                    <Camera className="w-4 h-4" />
                    Scan Your Lawn
                  </Button>
                </a>
              </div>

              {/* Sign Out & Delete Account */}
              {user && (
                <div className="pt-4 border-t border-lawn-200/30 space-y-2">
                  <Button variant="outline" className="w-full" onClick={() => { signOut(); setIsOpen(false); }}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                  
                  <Link to="/delete-account" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10">
                      <Trash2 className="w-4 h-4" />
                      Delete Account
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}