import { forwardRef } from "react";
import { Home, Camera, Scale, User } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  icon: typeof Home;
  href: string;
  scrollTo?: string;
}

const navItems: NavItem[] = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Scan", icon: Camera, href: "/", scrollTo: "scan" },
  { label: "Legal", icon: Scale, href: "/legal" },
  { label: "Profile", icon: User, href: "/profile" },
];

export const BottomNavigation = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (item: NavItem) => {
    if (item.scrollTo) {
      // If we're already on the home page, just scroll
      if (location.pathname === "/") {
        const element = document.getElementById(item.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      } else {
        // Navigate to home first, then scroll after a short delay
        navigate("/");
        setTimeout(() => {
          const element = document.getElementById(item.scrollTo!);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    }
  };

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-lawn-200/30 bg-background/95 backdrop-blur-lg pb-8">
      <div className="flex items-center justify-around h-16 px-4 mb-4">
        {navItems.map((item) => {
          const isActive = item.href === "/" 
            ? location.pathname === "/" && !item.scrollTo
            : location.pathname === item.href;

          // For scroll links, use a button
          if (item.scrollTo) {
            return (
              <button
                key={item.label}
                onClick={() => handleClick(item)}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

BottomNavigation.displayName = "BottomNavigation";
