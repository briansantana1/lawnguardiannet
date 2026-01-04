import { CreditCard, XCircle, RefreshCw, Mail, ChevronRight, LogOut, User, Save, ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";

const menuItems = [
  {
    label: "Plans",
    icon: CreditCard,
    href: "/plans",
    description: "View and manage your subscription",
  },
  {
    label: "Cancel Membership",
    icon: XCircle,
    href: "/cancel-membership",
    description: "Cancel your current subscription",
  },
  {
    label: "Restore Membership",
    icon: RefreshCw,
    href: "/restore-membership",
    description: "Restore a previous subscription",
  },
  {
    label: "Contact Us",
    icon: Mail,
    href: "/contact",
    description: "Get help or share feedback",
  },
];

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8 max-w-lg">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-primary text-sm mb-4 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        
        <h1 className="font-heading text-2xl font-bold text-foreground mb-6">
          Profile
        </h1>

        {/* User Info */}
        {user ? (
          <Card variant="elevated" className="mb-6">
            <CardContent className="flex items-center gap-4 py-4">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">{user.email}</p>
                <p className="text-sm text-muted-foreground">Free Plan</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card variant="elevated" className="mb-6">
            <CardContent className="py-6 text-center">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Sign in to access your profile</p>
              <Link to="/auth">
                <Button variant="default">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item) => (
            <Link key={item.label} to={item.href}>
              <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{item.label}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Saved Plans Link */}
        {user && (
          <>
            <Separator className="my-6" />
            <Link to="/saved-plans">
              <Card variant="elevated" className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Save className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">My Saved Plans</h3>
                    <p className="text-sm text-muted-foreground">View your saved diagnoses and treatments</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </Link>
          </>
        )}

        {/* Sign Out */}
        {user && (
          <>
            <Separator className="my-6" />
            <Button 
              variant="outline" 
              className="w-full text-destructive hover:text-destructive"
              onClick={signOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}
