import { useState, useEffect } from "react";
import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  ThermometerSun,
  Bell,
  AlertCircle,
  MapPin,
  Settings,
  Loader2,
  Sparkles,
  RefreshCw,
  Droplet,
  Scissors,
  Bug,
  Leaf,
  AlertTriangle,
  Lightbulb,
  Info,
  Calendar,
  Check,
  Clock,
  Sun,
  CloudRain,
  Gauge,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Capacitor } from "@capacitor/core";

interface WeatherData {
  location: string;
  temp: number;
  humidity: number;
  wind: number;
  soilTemp: number;
  soilTempSurface: number;
  conditions: string;
  feelsLike: number;
  uvIndex: number;
  precipitation: number;
  pressure: number;
  dewPoint: number;
  lastUpdated: string;
}

interface SoilTempData {
  temps: number[];
  loading: boolean;
}

interface AIRecommendation {
  category: "watering" | "mowing" | "disease" | "fertilizing" | "general";
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
}

interface AIAlert {
  type: "warning" | "caution" | "tip";
  message: string;
}

interface AIAnalysis {
  riskLevel: "low" | "medium" | "high";
  summary: string;
  recommendations: AIRecommendation[];
  alerts: AIAlert[];
}

interface ScheduledNotification {
  id: string;
  title: string;
  message: string;
  category: string;
  priority: string;
  scheduled_for: string;
  sent_at: string | null;
  is_read: boolean;
  created_at: string;
}

const defaultWeatherData: WeatherData = {
  location: "Loading...",
  temp: 0,
  humidity: 0,
  wind: 0,
  soilTemp: 0,
  soilTempSurface: 0,
  conditions: "Loading...",
  feelsLike: 0,
  uvIndex: 0,
  precipitation: 0,
  pressure: 0,
  dewPoint: 0,
  lastUpdated: "",
};

const severityStyles = {
  high: "border-l-alert bg-alert/5",
  medium: "border-l-warning bg-warning/5",
  info: "border-l-sky bg-sky/5",
  low: "border-l-lawn-500 bg-lawn-50",
};

const categoryIcons: Record<string, React.ElementType> = {
  watering: Droplet,
  mowing: Scissors,
  disease: Bug,
  fertilizing: Leaf,
  general: Info,
  warning: AlertTriangle,
  caution: AlertCircle,
  tip: Lightbulb,
};

const alertTypeStyles = {
  warning: { color: "text-alert", bg: "bg-alert/10", border: "border-alert/20" },
  caution: { color: "text-warning", bg: "bg-warning/10", border: "border-warning/20" },
  tip: { color: "text-sky", bg: "bg-sky/10", border: "border-sky/20" },
};

const alertTypeIcons = {
  warning: AlertTriangle,
  caution: AlertCircle,
  tip: Lightbulb,
};

export function WeatherAlerts() {
  const [weatherData, setWeatherData] = useState<WeatherData>(defaultWeatherData);
  const [soilTempData, setSoilTempData] = useState<SoilTempData>({ temps: [], loading: true });
  const [loading, setLoading] = useState(true);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);
  const [schedulingNotifications, setSchedulingNotifications] = useState(false);
  const [notificationHelpOpen, setNotificationHelpOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    diseaseAlerts: true,
    insectAlerts: true,
    weatherAlerts: true,
    treatmentReminders: true,
    dailyDigest: false,
    weeklyReport: true,
    preferredTime: "08:00",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch scheduled notifications
  const fetchScheduledNotifications = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from("notification_schedules")
      .select("*")
      .eq("user_id", user.id)
      .order("scheduled_for", { ascending: true })
      .limit(20);

    if (!error && data) {
      setScheduledNotifications(data);
    }
  };

  // Fetch notification preferences from localStorage
  const fetchNotificationPreferences = async () => {
    if (!user) return;
    
    try {
      const stored = localStorage.getItem(`notification_prefs_${user.id}`);
      if (stored) {
        const data = JSON.parse(stored);
        setNotificationSettings({
          diseaseAlerts: data.diseaseAlerts ?? true,
          insectAlerts: data.insectAlerts ?? true,
          weatherAlerts: data.weatherAlerts ?? true,
          treatmentReminders: data.treatmentReminders ?? true,
          dailyDigest: data.dailyDigest ?? false,
          weeklyReport: data.weeklyReport ?? true,
          preferredTime: data.preferredTime || "08:00",
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
        });
        setNotificationsEnabled(data.browserNotificationsEnabled ?? false);
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    }
  };

  // Save notification preferences to localStorage
  const saveNotificationPreferences = async () => {
    if (!user) return false;

    try {
      const prefs = {
        ...notificationSettings,
        browserNotificationsEnabled: notificationsEnabled,
      };
      localStorage.setItem(`notification_prefs_${user.id}`, JSON.stringify(prefs));
      return true;
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchScheduledNotifications();
      fetchNotificationPreferences();
      // Trigger AI analysis when user logs in and weather data is available
      if (weatherData.location !== "Loading..." && weatherData.temp !== 0 && !aiAnalysis) {
        fetchAIAnalysis(weatherData);
      }
    }
  }, [user]);

  // Fetch AI analysis when weather data is loaded (requires authentication)
  const fetchAIAnalysis = async (weather: WeatherData) => {
    if (weather.location === "Loading..." || weather.temp === 0) return;
    if (!user) {
      // User not logged in - skip AI analysis, will show fallback UI
      console.log("AI analysis skipped: user not authenticated");
      return;
    }
    
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-weather", {
        body: { weatherData: weather },
      });

      if (error) {
        console.error("AI analysis error:", error);
        // Don't show error toast - just use fallback UI
        return;
      }

      if (data?.error) {
        console.error("AI analysis returned error:", data.error);
        // Don't show error toast - just use fallback UI
        return;
      }

      if (data?.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
      // Don't show error toast - just use fallback UI
    } finally {
      setAiLoading(false);
    }
  };

  // Schedule notifications based on AI analysis - saves directly to Supabase
  const handleScheduleNotifications = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to schedule notifications.",
        variant: "destructive",
      });
      return;
    }

    if (!aiAnalysis) {
      toast({
        title: "No Analysis Available",
        description: "Wait for AI analysis to complete first.",
        variant: "destructive",
      });
      return;
    }

    setSchedulingNotifications(true);
    try {
      const now = new Date();
      const notifications: Array<{
        user_id: string;
        title: string;
        message: string;
        category: string;
        priority: string;
        scheduled_for: string;
        weather_context: Json;
      }> = [];

      // Schedule notifications based on recommendations
      aiAnalysis.recommendations.forEach((rec, index) => {
        const scheduledDate = new Date(now);
        
        if (rec.priority === "high") {
          scheduledDate.setHours(scheduledDate.getHours() + 2);
        } else if (rec.priority === "medium") {
          scheduledDate.setDate(scheduledDate.getDate() + 1);
          scheduledDate.setHours(8, 0, 0, 0);
        } else {
          scheduledDate.setDate(scheduledDate.getDate() + 2 + index);
          scheduledDate.setHours(9, 0, 0, 0);
        }

        notifications.push({
          user_id: user.id,
          title: rec.title,
          message: rec.description,
          category: rec.category,
          priority: rec.priority,
          scheduled_for: scheduledDate.toISOString(),
          weather_context: {
            temp: weatherData.temp,
            humidity: weatherData.humidity,
            soilTemp: weatherData.soilTemp,
            conditions: weatherData.conditions,
            location: weatherData.location,
            analyzedAt: now.toISOString(),
          } as Json,
        });
      });

      // Also schedule alert notifications
      if (aiAnalysis.alerts && aiAnalysis.alerts.length > 0) {
        aiAnalysis.alerts.forEach((alert) => {
          const scheduledDate = new Date(now);
          if (alert.type === "warning") {
            scheduledDate.setHours(scheduledDate.getHours() + 1);
          } else if (alert.type === "caution") {
            scheduledDate.setHours(scheduledDate.getHours() + 4);
          } else {
            scheduledDate.setDate(scheduledDate.getDate() + 1);
            scheduledDate.setHours(10, 0, 0, 0);
          }

          notifications.push({
            user_id: user.id,
            title: alert.type === "warning" ? "⚠️ Urgent Alert" : 
                   alert.type === "caution" ? "⚡ Caution" : "💡 Lawn Tip",
            message: alert.message,
            category: alert.type,
            priority: alert.type === "warning" ? "high" : 
                     alert.type === "caution" ? "medium" : "low",
            scheduled_for: scheduledDate.toISOString(),
            weather_context: {
              temp: weatherData.temp,
              humidity: weatherData.humidity,
              soilTemp: weatherData.soilTemp,
              conditions: weatherData.conditions,
              location: weatherData.location,
              analyzedAt: now.toISOString(),
            } as Json,
          });
        });
      }

      // Insert directly into Supabase
      const { error: insertError } = await supabase
        .from("notification_schedules")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
        throw new Error(insertError.message);
      }

      toast({
        title: "Notifications Scheduled! 🎉",
        description: `${notifications.length} smart notifications have been scheduled based on current conditions.`,
      });

      // Refresh the notifications list
      fetchScheduledNotifications();
    } catch (error: any) {
      console.error("Failed to schedule notifications:", error);
      toast({
        title: "Scheduling Failed",
        description: error?.message || "Could not schedule notifications. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSchedulingNotifications(false);
    }
  };

  // Fetch real weather data based on user's location
  useEffect(() => {
    const fetchWeatherData = async (lat: number, lon: number) => {
      try {
        // Enhanced API call with more parameters for accurate real-time data
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,surface_pressure,uv_index,precipitation,dew_point_2m&hourly=soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_moisture_0_to_1cm&past_days=7&forecast_days=1&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
        );
        const data = await response.json();
        
        const locationName = await getLocationName(lat, lon);
        const weatherCode = data.current.weather_code;
        const conditions = getWeatherCondition(weatherCode);
        
        // Get soil temperatures at 6cm depth (most relevant for lawn root zone)
        const soilTemps6cm = data.hourly.soil_temperature_6cm.slice(-168); // Last 7 days
        const soilTempsSurface = data.hourly.soil_temperature_0cm.slice(-168);
        
        // Calculate daily averages for the chart
        const dailySoilTemps: number[] = [];
        for (let i = 0; i < 7; i++) {
          const dayTemps = soilTemps6cm.slice(i * 24, (i + 1) * 24);
          const avgTemp = Math.round(dayTemps.reduce((a: number, b: number) => a + b, 0) / dayTemps.length);
          dailySoilTemps.push(avgTemp);
        }
        
        // Get current soil temps (most recent reading)
        const currentSoilTemp6cm = soilTemps6cm[soilTemps6cm.length - 1] || 0;
        const currentSoilTempSurface = soilTempsSurface[soilTempsSurface.length - 1] || 0;
        
        const newWeatherData: WeatherData = {
          location: locationName,
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          wind: Math.round(data.current.wind_speed_10m),
          soilTemp: Math.round(currentSoilTemp6cm),
          soilTempSurface: Math.round(currentSoilTempSurface),
          conditions,
          feelsLike: Math.round(data.current.apparent_temperature),
          uvIndex: Math.round(data.current.uv_index || 0),
          precipitation: data.current.precipitation || 0,
          pressure: Math.round(data.current.surface_pressure || 0),
          dewPoint: Math.round(data.current.dew_point_2m || 0),
          lastUpdated: new Date().toLocaleTimeString(),
        };
        
        setWeatherData(newWeatherData);
        setSoilTempData({ temps: dailySoilTemps, loading: false });
        setLoading(false);
        
        fetchAIAnalysis(newWeatherData);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoading(false);
        setSoilTempData({ temps: [58, 62, 68, 72, 74, 73, 70], loading: false });
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to Austin, TX
          fetchWeatherData(30.2672, -97.7431);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
      );
    } else {
      fetchWeatherData(30.2672, -97.7431);
    }
  }, []);

  const getLocationName = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      const city = data.address.city || data.address.town || data.address.village || data.address.county;
      const state = data.address.state;
      return `${city}, ${state}`;
    } catch {
      return "Your Location";
    }
  };

  const getWeatherCondition = (code: number): string => {
    if (code === 0) return "Clear Sky";
    if (code === 1) return "Mainly Clear";
    if (code === 2) return "Partly Cloudy";
    if (code === 3) return "Overcast";
    if (code >= 45 && code <= 48) return "Foggy";
    if (code >= 51 && code <= 55) return "Drizzle";
    if (code >= 61 && code <= 65) return "Rain";
    if (code >= 66 && code <= 67) return "Freezing Rain";
    if (code >= 71 && code <= 77) return "Snow";
    if (code >= 80 && code <= 82) return "Rain Showers";
    if (code >= 95 && code <= 99) return "Thunderstorm";
    return "Partly Cloudy";
  };

  const handleRefreshAnalysis = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to get AI-powered lawn care recommendations.",
        variant: "destructive",
      });
      return;
    }
    fetchAIAnalysis(weatherData);
  };

  const handleEnableNotifications = async () => {
    // Check if running on native mobile platform
    if (Capacitor.isNativePlatform()) {
      toast({
        title: "Coming Soon! 🔔",
        description: "Push notifications for mobile are coming in a future update. We'll notify you when it's available!",
      });
      return;
    }

    if (!("Notification" in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support notifications. Try using Chrome, Firefox, or Edge.",
        variant: "destructive",
      });
      return;
    }

    // Check current permission state
    const currentPermission = Notification.permission;
    
    if (currentPermission === "denied") {
      // Permission was previously denied - show help dialog
      setNotificationHelpOpen(true);
      return;
    }
    
    if (currentPermission === "granted") {
      // Already granted
      setNotificationsEnabled(true);
      toast({
        title: "Notifications Already Enabled",
        description: "You're all set to receive lawn care alerts!",
      });
      return;
    }
    
    // Permission is "default" - request it
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        
        // Save the preference to localStorage if user is logged in
        if (user) {
          const prefs = {
            ...notificationSettings,
            browserNotificationsEnabled: true,
          };
          localStorage.setItem(`notification_prefs_${user.id}`, JSON.stringify(prefs));
        }
        
        toast({
          title: "Notifications Enabled",
          description: "You'll receive alerts when conditions favor disease or pests.",
        });
        
        // Show a test notification
        new Notification("Lawn Guardian™", {
          body: "Smart notifications are now enabled! You'll receive alerts about lawn conditions.",
          icon: "/favicon.ico",
        });
      } else {
        // User denied the permission prompt
        setNotificationHelpOpen(true);
      }
    } catch (error) {
      console.error("Notification permission error:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSaveSettings = async () => {
    if (user) {
      const success = await saveNotificationPreferences();
      if (success) {
        toast({
          title: "Settings Saved",
          description: "Your notification preferences have been updated.",
        });
      } else {
        toast({
          title: "Error Saving Settings",
          description: "Could not save your preferences. Please try again.",
          variant: "destructive",
        });
      }
    }
    setManageDialogOpen(false);
  };

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notification_schedules")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (!error) {
      setScheduledNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    }
  };

  const formatScheduledTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMs < 0) {
      return "Past due";
    } else if (diffHours < 1) {
      return "Less than 1 hour";
    } else if (diffHours < 24) {
      return `In ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
  };

  const displaySoilTemps = soilTempData.loading ? [58, 62, 68, 72, 74, 73, 70] : soilTempData.temps;
  const minTemp = Math.min(...displaySoilTemps);
  const maxTemp = Math.max(...displaySoilTemps);

  const riskLevelColors = {
    low: "bg-lawn-500",
    medium: "bg-warning",
    high: "bg-alert",
  };

  const upcomingNotifications = scheduledNotifications.filter(n => !n.sent_at && new Date(n.scheduled_for) > new Date());

  return (
    <section id="weather" className="py-20 bg-lawn-50 lawn-pattern">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Weather Widget */}
          <div>
            <h2 className="font-heading text-3xl font-bold text-foreground mb-6">
              Local Conditions
            </h2>

            <Card variant="elevated" className="overflow-hidden">
              {/* Weather Header */}
              <div className="gradient-lawn p-6 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 opacity-80" />
                      <div>
                        <p className="text-sm opacity-80">
                          {loading ? "Detecting location..." : weatherData.location}
                        </p>
                        {!loading && weatherData.location === "Your Location" && (
                          <p className="text-xs opacity-60">Enable location for local data</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-end gap-2 mt-1">
                      {loading ? (
                        <Loader2 className="w-10 h-10 animate-spin" />
                      ) : (
                        <>
                          <span className="text-5xl font-bold">
                            {weatherData.temp}°
                          </span>
                          <span className="text-lg pb-2">F</span>
                        </>
                      )}
                    </div>
                    <p className="mt-1 opacity-90">{weatherData.conditions}</p>
                  </div>
                  <CloudSun className="w-20 h-20 opacity-80" />
                </div>
              </div>

              <CardContent className="pt-6">
                {/* Last Updated Time */}
                {weatherData.lastUpdated && (
                  <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Last updated: {weatherData.lastUpdated}
                    </span>
                    <span className="text-lawn-600 font-medium">Live Data</span>
                  </div>
                )}
                
                {/* Primary Weather Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: Droplets,
                      label: "Humidity",
                      value: `${weatherData.humidity}%`,
                      subtext: weatherData.humidity > 70 ? "High - Disease risk" : weatherData.humidity < 30 ? "Low - Water needed" : "Optimal",
                    },
                    {
                      icon: Wind,
                      label: "Wind",
                      value: `${weatherData.wind} mph`,
                      subtext: weatherData.wind > 15 ? "Don't spray" : "Good for spraying",
                    },
                    {
                      icon: ThermometerSun,
                      label: "Soil (6\" depth)",
                      value: `${weatherData.soilTemp}°F`,
                      subtext: weatherData.soilTemp > 70 ? "Grub active" : weatherData.soilTemp > 55 ? "Pre-emergent time" : "Dormant",
                    },
                    {
                      icon: Thermometer,
                      label: "Feels Like",
                      value: `${weatherData.feelsLike}°F`,
                      subtext: weatherData.feelsLike > 85 ? "Heat stress risk" : "Comfortable",
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-lawn-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-lawn-100 flex items-center justify-center shrink-0">
                        <metric.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="font-semibold text-foreground">
                          {metric.value}
                        </p>
                        <p className="text-[10px] text-muted-foreground truncate">
                          {metric.subtext}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Secondary Metrics Row */}
                <div className="grid grid-cols-3 gap-2 mt-3">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-lawn-50/50 text-center">
                    <Sun className="w-4 h-4 text-warning" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">UV Index</p>
                      <p className="text-sm font-medium">{weatherData.uvIndex}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-lawn-50/50 text-center">
                    <CloudRain className="w-4 h-4 text-sky" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Precip</p>
                      <p className="text-sm font-medium">{weatherData.precipitation}″</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-lawn-50/50 text-center">
                    <Gauge className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] text-muted-foreground">Pressure</p>
                      <p className="text-sm font-medium">{weatherData.pressure}</p>
                    </div>
                  </div>
                </div>

                {/* Soil Temp Timeline */}
                <div className="mt-4 p-4 rounded-xl bg-lawn-50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-semibold text-foreground">
                      Soil Temperature Trend (7 Days)
                    </p>
                    {displaySoilTemps.length >= 2 && (
                      <div className="flex items-center gap-1">
                        {displaySoilTemps[displaySoilTemps.length - 1] > displaySoilTemps[displaySoilTemps.length - 2] ? (
                          <>
                            <TrendingUp className="w-4 h-4 text-alert" />
                            <span className="text-xs text-alert font-medium">Rising</span>
                          </>
                        ) : displaySoilTemps[displaySoilTemps.length - 1] < displaySoilTemps[displaySoilTemps.length - 2] ? (
                          <>
                            <TrendingDown className="w-4 h-4 text-sky" />
                            <span className="text-xs text-sky font-medium">Cooling</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground font-medium">Stable</span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Temperature threshold indicators */}
                  <div className="flex gap-2 mb-3 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-alert/10 text-alert">70°+ Grub Active</span>
                    <span className="px-2 py-0.5 rounded bg-warning/10 text-warning">55-70° Pre-emergent</span>
                    <span className="px-2 py-0.5 rounded bg-sky/10 text-sky">&lt;55° Dormant</span>
                  </div>
                  
                  <div className="flex items-end justify-between h-28 gap-2">
                    {displaySoilTemps.map((temp, i) => {
                      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const today = new Date();
                      const dateForDay = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
                      const dayIndex = dateForDay.getDay();
                      const month = dateForDay.getMonth() + 1;
                      const day = dateForDay.getDate();
                      const isToday = i === displaySoilTemps.length - 1;
                      
                      // Color based on temperature threshold
                      const barColor = temp >= 70 
                        ? "bg-gradient-to-t from-alert/80 to-alert" 
                        : temp >= 55 
                        ? "bg-gradient-to-t from-warning/80 to-warning" 
                        : "bg-gradient-to-t from-sky/80 to-sky";
                      
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <span className={`text-xs mb-1 font-medium ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
                            {temp}°
                          </span>
                          <div
                            className={`w-full rounded-t-md transition-all duration-300 hover:opacity-80 cursor-pointer ${barColor} ${isToday ? "ring-2 ring-primary ring-offset-1" : ""}`}
                            style={{ height: `${((temp - minTemp + 5) / (maxTemp - minTemp + 10)) * 100}%`, minHeight: "24%" }}
                            title={`${dayLabels[dayIndex]}: ${temp}°F at 6" depth`}
                          />
                          <span className={`text-[10px] mt-1 font-medium ${isToday ? "text-foreground" : "text-muted-foreground"}`}>
                            {isToday ? "Today" : dayLabels[dayIndex]}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-medium">
                            {month}/{day}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Lawn care insight based on soil temp */}
                  <div className="mt-3 p-2 rounded-lg bg-card border border-lawn-200">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Insight:</span>{" "}
                      {weatherData.soilTemp >= 70 
                        ? "Soil is warm - grubs are active in root zone. Good time for grub treatment if you see damage."
                        : weatherData.soilTemp >= 55 
                        ? "Prime time for pre-emergent herbicide application before weed seeds germinate."
                        : "Soil is cool - grass is dormant or slow growing. Avoid fertilizing until temperatures rise."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI-Powered Insights */}
          <div id="alerts">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-3xl font-bold text-foreground">
                  AI Lawn Insights
                </h2>
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleRefreshAnalysis}
                  disabled={aiLoading}
                >
                  <RefreshCw className={`w-4 h-4 mr-1 ${aiLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setManageDialogOpen(true)}
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Manage
                </Button>
              </div>
            </div>

            {/* AI Summary Card */}
            {aiLoading ? (
              <Card className="mb-4">
                <CardContent className="p-6 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mr-3" />
                  <span className="text-muted-foreground">Analyzing conditions...</span>
                </CardContent>
              </Card>
            ) : aiAnalysis ? (
              <>
                {/* Risk Level & Summary */}
                <Card className="mb-4 overflow-hidden">
                  <div className={`h-2 ${riskLevelColors[aiAnalysis.riskLevel]}`} />
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${riskLevelColors[aiAnalysis.riskLevel]}`}>
                        {aiAnalysis.riskLevel.toUpperCase()} RISK
                      </span>
                      <span className="text-xs text-muted-foreground">AI-powered analysis</span>
                    </div>
                    <p className="text-foreground">{aiAnalysis.summary}</p>
                  </CardContent>
                </Card>

                {/* AI Alerts */}
                {aiAnalysis.alerts && aiAnalysis.alerts.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {aiAnalysis.alerts.map((alert, index) => {
                      const AlertIcon = alertTypeIcons[alert.type];
                      const styles = alertTypeStyles[alert.type];
                      return (
                        <div
                          key={index}
                          className={`flex items-start gap-3 p-3 rounded-xl border ${styles.bg} ${styles.border}`}
                        >
                          <AlertIcon className={`w-5 h-5 shrink-0 mt-0.5 ${styles.color}`} />
                          <p className="text-sm text-foreground">{alert.message}</p>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Recommendations */}
                <div className="space-y-3">
                  {aiAnalysis.recommendations.slice(0, 3).map((rec, index) => {
                    const CategoryIcon = categoryIcons[rec.category] || Info;
                    return (
                      <Card
                        key={index}
                        className={`border-l-4 ${severityStyles[rec.priority]}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex gap-4">
                            <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm shrink-0">
                              <CategoryIcon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h3 className="font-semibold text-foreground">
                                  {rec.title}
                                </h3>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  rec.priority === "high" 
                                    ? "bg-alert/10 text-alert" 
                                    : rec.priority === "medium"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-lawn-100 text-lawn-700"
                                }`}>
                                  {rec.priority}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {rec.description}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Schedule Notifications Button */}
                {user && (
                  <Button
                    className="w-full mt-4"
                    onClick={handleScheduleNotifications}
                    disabled={schedulingNotifications}
                  >
                    {schedulingNotifications ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <Calendar className="w-4 h-4 mr-2" />
                        Schedule Smart Notifications
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <Card className="mb-4">
                <CardContent className="p-6">
                  <div className="text-center mb-4">
                    <Sparkles className="w-10 h-10 text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      {weatherData.location === "Loading..." 
                        ? "Loading weather data..."
                        : "Sign in to get AI lawn insights"}
                    </p>
                  </div>
                  
                  {/* Default recommendations while AI loads */}
                  <div className="space-y-3 mt-4">
                    <div className="p-3 rounded-xl bg-lawn-50 border border-lawn-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Droplet className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">General Tip</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Water deeply but infrequently to encourage deep root growth.
                      </p>
                    </div>
                    <div className="p-3 rounded-xl bg-lawn-50 border border-lawn-200">
                      <div className="flex items-center gap-2 mb-1">
                        <Scissors className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">Mowing</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Never remove more than 1/3 of the grass blade at once.
                      </p>
                    </div>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full mt-4"
                    onClick={() => fetchAIAnalysis(weatherData)}
                    disabled={aiLoading || weatherData.location === "Loading..."}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${aiLoading ? 'animate-spin' : ''}`} />
                    {aiLoading ? "Analyzing..." : "Get AI Insights"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Enable Notifications CTA */}
            <Card className="mt-6 gradient-lawn text-primary-foreground">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {notificationsEnabled ? "Smart Notifications Active" : "Enable Smart Notifications"}
                    </h3>
                    <p className="text-sm opacity-90">
                      {notificationsEnabled 
                        ? "You're receiving alerts for lawn conditions" 
                        : "Get alerts when conditions favor disease or pests"}
                    </p>
                  </div>
                  <Button 
                    variant="hero" 
                    size="sm"
                    onClick={handleEnableNotifications}
                    disabled={notificationsEnabled}
                  >
                    {notificationsEnabled ? "Enabled" : "Enable"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Manage Notifications Dialog */}
      <Dialog open={manageDialogOpen} onOpenChange={setManageDialogOpen}>
        <DialogContent className="max-w-lg" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Manage Notifications</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="settings" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="scheduled">
                Scheduled ({upcomingNotifications.length})
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="settings" className="space-y-4 py-4">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Alert Types</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="disease-alerts" className="flex flex-col gap-1">
                    <span>Disease Alerts</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Get notified when conditions favor disease outbreaks
                    </span>
                  </Label>
                  <Switch
                    id="disease-alerts"
                    checked={notificationSettings.diseaseAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, diseaseAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="insect-alerts" className="flex flex-col gap-1">
                    <span>Insect Alerts</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Get notified about pest activity in your area
                    </span>
                  </Label>
                  <Switch
                    id="insect-alerts"
                    checked={notificationSettings.insectAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, insectAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="weather-alerts" className="flex flex-col gap-1">
                    <span>Weather Alerts</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Get notified about weather changes affecting your lawn
                    </span>
                  </Label>
                  <Switch
                    id="weather-alerts"
                    checked={notificationSettings.weatherAlerts}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, weatherAlerts: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="treatment-reminders" className="flex flex-col gap-1">
                    <span>Treatment Reminders</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Get reminded when treatments are due
                    </span>
                  </Label>
                  <Switch
                    id="treatment-reminders"
                    checked={notificationSettings.treatmentReminders}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, treatmentReminders: checked }))
                    }
                  />
                </div>
              </div>
              
              <div className="border-t border-lawn-100 pt-4 space-y-4">
                <h4 className="text-sm font-semibold text-foreground">Scheduling</h4>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="daily-digest" className="flex flex-col gap-1">
                    <span>Daily Digest</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Receive a daily summary of conditions and tasks
                    </span>
                  </Label>
                  <Switch
                    id="daily-digest"
                    checked={notificationSettings.dailyDigest}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, dailyDigest: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="weekly-report" className="flex flex-col gap-1">
                    <span>Weekly Report</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Get a weekly lawn health summary every Sunday
                    </span>
                  </Label>
                  <Switch
                    id="weekly-report"
                    checked={notificationSettings.weeklyReport}
                    onCheckedChange={(checked) =>
                      setNotificationSettings((prev) => ({ ...prev, weeklyReport: checked }))
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="preferred-time" className="flex flex-col gap-1">
                    <span>Preferred Time</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      When to receive scheduled notifications
                    </span>
                  </Label>
                  <select
                    id="preferred-time"
                    value={notificationSettings.preferredTime}
                    onChange={(e) =>
                      setNotificationSettings((prev) => ({ ...prev, preferredTime: e.target.value }))
                    }
                    className="px-3 py-1.5 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="06:00">6:00 AM</option>
                    <option value="07:00">7:00 AM</option>
                    <option value="08:00">8:00 AM</option>
                    <option value="09:00">9:00 AM</option>
                    <option value="10:00">10:00 AM</option>
                    <option value="17:00">5:00 PM</option>
                    <option value="18:00">6:00 PM</option>
                    <option value="19:00">7:00 PM</option>
                  </select>
                </div>
                
                <div className="p-3 rounded-lg bg-lawn-50 border border-lawn-100">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Your timezone:</span>{" "}
                    {notificationSettings.timezone}
                  </p>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduled" className="py-4">
              {!user ? (
                <div className="text-center py-8">
                  <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">Sign in to see scheduled notifications</p>
                </div>
              ) : upcomingNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No scheduled notifications</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Click "Schedule Smart Notifications" to get started
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {upcomingNotifications.map((notification) => {
                      const CategoryIcon = categoryIcons[notification.category] || Bell;
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 rounded-xl border ${notification.is_read ? 'bg-muted/50' : 'bg-card'}`}
                        >
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-lawn-100 flex items-center justify-center shrink-0">
                              <CategoryIcon className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="font-medium text-sm text-foreground">
                                  {notification.title}
                                </h4>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                                  <Clock className="w-3 h-3" />
                                  {formatScheduledTime(notification.scheduled_for)}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                            </div>
                            {!notification.is_read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="shrink-0 h-8 w-8 p-0"
                                onClick={() => markNotificationAsRead(notification.id)}
                              >
                                <Check className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </TabsContent>
          </Tabs>
          
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setManageDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Help Dialog */}
      <Dialog open={notificationHelpOpen} onOpenChange={setNotificationHelpOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-primary" />
              Enable Browser Notifications
            </DialogTitle>
            <DialogDescription>
              Notifications were blocked. Follow these steps to enable them:
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-xl bg-lawn-50 border border-lawn-100">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
                Click the lock/info icon
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                Look for the 🔒 or ℹ️ icon in your browser's address bar (left side of the URL).
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-lawn-50 border border-lawn-100">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
                Find "Notifications"
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                In the site settings popup, look for "Notifications" and change it from "Block" to "Allow".
              </p>
            </div>
            
            <div className="p-4 rounded-xl bg-lawn-50 border border-lawn-100">
              <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
                Refresh the page
              </h4>
              <p className="text-sm text-muted-foreground ml-8">
                After enabling notifications, refresh this page and click "Enable" again.
              </p>
            </div>
            
            <div className="p-3 rounded-lg bg-muted/50 border">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Tip:</span> On mobile devices, you may need to add this site to your home screen first to enable notifications.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-2 pt-2">
            <Button 
              onClick={() => {
                setNotificationHelpOpen(false);
                window.location.reload();
              }}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Page
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setNotificationHelpOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
