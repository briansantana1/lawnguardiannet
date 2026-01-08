import { forwardRef } from "react";
import { Home, Camera, Scale, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Picture", icon: Camera, href: "#scan" },
  { label: "Legal", icon: Scale, href: "/legal" },
  { label: "Profile", icon: User, href: "/profile" },
];

export const BottomNavigation = forwardRef<HTMLElement>((_, ref) => {
  const location = useLocation();

  return (
    <nav ref={ref} className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-lawn-200/30 bg-background/95 backdrop-blur-lg safe-area-inset-bottom">
      <div className="flex items-center justify-around h-16 px-4">
        {navItems.map((item) => {
          const isActive = item.href === "/" 
            ? location.pathname === "/" 
            : location.pathname === item.href;
          const isHashLink = item.href.startsWith("#");

          if (isHashLink) {
            return (
              <a
                key={item.label}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-200",
                  "text-muted-foreground hover:text-primary"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </a>
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
