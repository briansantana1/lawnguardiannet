/**
 * Admin Settings Page
 * 
 * Allows admins to edit site content including URLs and text.
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Leaf, 
  ArrowLeft, 
  Save, 
  Loader2,
  Link as LinkIcon,
  Type,
  Sparkles,
  MessageSquare,
  Shield
} from "lucide-react";
import { toast } from "sonner";

interface SiteSetting {
  id: string;
  key: string;
  value: string | null;
  label: string;
  category: string;
  description: string | null;
}

const categoryInfo: Record<string, { icon: React.ElementType; label: string; description: string }> = {
  app_links: { 
    icon: LinkIcon, 
    label: "App Store Links", 
    description: "URLs for the App Store and Google Play buttons" 
  },
  hero: { 
    icon: Type, 
    label: "Hero Section", 
    description: "Main landing page headline and subheadline" 
  },
  features: { 
    icon: Sparkles, 
    label: "Features", 
    description: "Feature cards displayed on the landing page" 
  },
  cta: { 
    icon: MessageSquare, 
    label: "Call to Action", 
    description: "CTA section at the bottom of the landing page" 
  },
  footer: { 
    icon: Type, 
    label: "Footer", 
    description: "Footer content and copyright text" 
  },
};

const AdminSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [settings, setSettings] = useState<SiteSetting[]>([]);
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  const checkAdminAndLoad = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate("/admin");
        return;
      }

      const { data: adminCheck } = await supabase.rpc('is_admin', { 
        _user_id: session.user.id 
      });

      if (!adminCheck) {
        toast.error("Access denied. Admin privileges required.");
        navigate("/admin");
        return;
      }

      setIsAdmin(true);
      await loadSettings();
    } catch (error) {
      console.error("Admin check error:", error);
      navigate("/admin");
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("category")
      .order("key");

    if (error) {
      toast.error("Failed to load settings");
      return;
    }

    setSettings(data || []);
    
    // Initialize edited values
    const values: Record<string, string> = {};
    data?.forEach((s: SiteSetting) => {
      values[s.key] = s.value || "";
    });
    setEditedValues(values);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Update each changed setting
      const updates = settings.map(async (setting) => {
        const newValue = editedValues[setting.key];
        if (newValue !== setting.value) {
          const { error } = await supabase
            .from("site_settings")
            .update({ value: newValue, updated_at: new Date().toISOString() })
            .eq("key", setting.key);
          
          if (error) throw error;
        }
      });

      await Promise.all(updates);
      
      toast.success("Settings saved successfully!");
      await loadSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleValueChange = (key: string, value: string) => {
    setEditedValues(prev => ({ ...prev, [key]: value }));
  };

  const hasChanges = settings.some(s => editedValues[s.key] !== (s.value || ""));

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SiteSetting[]>);

  const categories = Object.keys(groupedSettings);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-lawn-950 to-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lawn-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-lawn-50 to-background dark:from-lawn-950 dark:to-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/admin/dashboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-lawn-400 to-lawn-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
                    Site Settings
                    <Shield className="w-4 h-4 text-lawn-500" />
                  </h1>
                  <p className="text-xs text-muted-foreground">Edit site content and URLs</p>
                </div>
              </div>
            </div>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || saving}
              className="gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {hasChanges && (
          <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              You have unsaved changes. Don't forget to save before leaving!
            </p>
          </div>
        )}

        <Tabs defaultValue={categories[0] || "app_links"} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto gap-2 bg-transparent p-0">
            {categories.map((category) => {
              const info = categoryInfo[category] || { 
                icon: Type, 
                label: category, 
                description: "" 
              };
              const Icon = info.icon;
              
              return (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="data-[state=active]:bg-lawn-500 data-[state=active]:text-white px-4 py-2 rounded-lg border border-border"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {info.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => {
            const info = categoryInfo[category] || { 
              icon: Type, 
              label: category, 
              description: "Category settings" 
            };
            
            return (
              <TabsContent key={category} value={category} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <info.icon className="w-5 h-5 text-lawn-500" />
                      {info.label}
                    </CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {groupedSettings[category]?.map((setting) => (
                      <div key={setting.key} className="space-y-2">
                        <Label htmlFor={setting.key} className="text-sm font-medium">
                          {setting.label}
                        </Label>
                        {setting.description && (
                          <p className="text-xs text-muted-foreground">{setting.description}</p>
                        )}
                        {setting.key.includes("url") || setting.key.includes("_title") ? (
                          <Input
                            id={setting.key}
                            value={editedValues[setting.key] || ""}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            placeholder={`Enter ${setting.label.toLowerCase()}`}
                            className={editedValues[setting.key] !== (setting.value || "") ? "border-amber-400" : ""}
                          />
                        ) : (
                          <Textarea
                            id={setting.key}
                            value={editedValues[setting.key] || ""}
                            onChange={(e) => handleValueChange(setting.key, e.target.value)}
                            placeholder={`Enter ${setting.label.toLowerCase()}`}
                            rows={3}
                            className={editedValues[setting.key] !== (setting.value || "") ? "border-amber-400" : ""}
                          />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            );
          })}
        </Tabs>
      </main>
    </div>
  );
};

export default AdminSettings;
