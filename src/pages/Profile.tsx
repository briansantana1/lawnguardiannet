import { useState, useEffect } from "react";
import { CreditCard, XCircle, RefreshCw, Mail, ChevronRight, LogOut, User, Save, ArrowLeft, Loader2, MapPin, Leaf, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BottomNavigation } from "@/components/BottomNavigation";
import { useAuth } from "@/hooks/useAuth";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

const grassTypes = [
  { value: "bermuda", label: "Bermuda" },
  { value: "st-augustine", label: "St. Augustine" },
  { value: "zoysia", label: "Zoysia" },
  { value: "kentucky-bluegrass", label: "Kentucky Bluegrass" },
  { value: "tall-fescue", label: "Tall Fescue" },
  { value: "perennial-ryegrass", label: "Perennial Ryegrass" },
  { value: "buffalo", label: "Buffalo" },
  { value: "centipede", label: "Centipede" },
  { value: "bahia", label: "Bahia" },
  { value: "unknown", label: "Not Sure" },
];

interface ProfileData {
  display_name: string;
  location: string;
  grass_type: string;
}

export function Profile() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    display_name: "",
    location: "",
    grass_type: "",
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("display_name, location, grass_type")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setProfile({
          display_name: data.display_name || "",
          location: data.location || "",
          grass_type: data.grass_type || "",
        });
      }
    } catch (error: any) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: profile.display_name.trim(),
          location: profile.location.trim(),
          grass_type: profile.grass_type,
        })
        .eq("user_id", user.id);

      if (error) throw error;
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

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
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {profile.display_name || user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                {!isEditing && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </CardHeader>
            
            {loading ? (
              <CardContent className="flex justify-center py-6">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </CardContent>
            ) : isEditing ? (
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="displayName"
                      placeholder="Your name"
                      value={profile.display_name}
                      onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                      className="pl-10"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="location"
                      placeholder="City, State"
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="pl-10"
                      maxLength={100}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grassType">Grass Type</Label>
                  <Select
                    value={profile.grass_type}
                    onValueChange={(value) => setProfile({ ...profile, grass_type: value })}
                  >
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-muted-foreground" />
                        <SelectValue placeholder="Select your grass type" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      {grassTypes.map((grass) => (
                        <SelectItem key={grass.value} value={grass.value}>
                          {grass.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="hero" 
                    className="flex-1"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            ) : (
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Location</p>
                    <p className="font-medium text-foreground">
                      {profile.location || "Not set"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Grass Type</p>
                    <p className="font-medium text-foreground">
                      {grassTypes.find(g => g.value === profile.grass_type)?.label || "Not set"}
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
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
            <Link
              key={item.label}
              to={item.href}
              state={item.href === "/contact" ? { from: "/profile" } : undefined}
            >
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

        {/* Sign Out & Delete Account */}
        {user && (
          <>
            <Separator className="my-6" />
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              
              <Link to="/delete-account" className="block">
                <Button 
                  variant="ghost" 
                  className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}