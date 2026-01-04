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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WeatherData {
  location: string;
  temp: number;
  humidity: number;
  wind: number;
  soilTemp: number;
  conditions: string;
  feelsLike: number;
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
  conditions: "Loading...",
  feelsLike: 0,
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
  const [notificationSettings, setNotificationSettings] = useState({
    diseaseAlerts: true,
    insectAlerts: true,
    weatherAlerts: true,
    treatmentReminders: true,
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

  useEffect(() => {
    if (user) {
      fetchScheduledNotifications();
    }
  }, [user]);

  // Fetch AI analysis when weather data is loaded
  const fetchAIAnalysis = async (weather: WeatherData) => {
    if (weather.location === "Loading..." || weather.temp === 0) return;
    
    setAiLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-weather", {
        body: { weatherData: weather },
      });

      if (error) {
        console.error("AI analysis error:", error);
        toast({
          title: "AI Analysis Unavailable",
          description: "Using default recommendations. Try refreshing.",
          variant: "destructive",
        });
        return;
      }

      if (data?.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Failed to fetch AI analysis:", error);
    } finally {
      setAiLoading(false);
    }
  };

  // Schedule notifications based on AI analysis
  const handleScheduleNotifications = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to schedule notifications.",
        variant: "destructive",
      });
      return;
    }

    // Verify we have a valid session
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        title: "Session Expired",
        description: "Please sign in again to schedule notifications.",
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
      const { data, error } = await supabase.functions.invoke("schedule-notifications", {
        body: { aiAnalysis, weatherData },
      });

      if (error) {
        console.error("Schedule notifications error details:", error);
        // Check if it's an auth error
        if (error.message?.includes("401") || error.message?.includes("Unauthorized") || error.message?.includes("non-2xx")) {
          toast({
            title: "Authentication Error",
            description: "Please sign in again and try once more.",
            variant: "destructive",
          });
          return;
        }
        throw error;
      }

      toast({
        title: "Notifications Scheduled",
        description: `${data.scheduledCount} smart notifications have been scheduled based on current conditions.`,
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
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=soil_temperature_6cm&past_days=7&forecast_days=1&temperature_unit=fahrenheit&wind_speed_unit=mph`
        );
        const data = await response.json();
        
        const locationName = await getLocationName(lat, lon);
        const weatherCode = data.current.weather_code;
        const conditions = getWeatherCondition(weatherCode);
        
        const soilTemps = data.hourly.soil_temperature_6cm.slice(-168);
        const dailySoilTemps: number[] = [];
        for (let i = 0; i < 7; i++) {
          const dayTemps = soilTemps.slice(i * 24, (i + 1) * 24);
          const avgTemp = Math.round(dayTemps.reduce((a: number, b: number) => a + b, 0) / dayTemps.length);
          dailySoilTemps.push(avgTemp);
        }
        
        const newWeatherData = {
          location: locationName,
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          wind: Math.round(data.current.wind_speed_10m),
          soilTemp: dailySoilTemps[dailySoilTemps.length - 1] || 0,
          conditions,
          feelsLike: Math.round(data.current.apparent_temperature),
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
          fetchWeatherData(30.2672, -97.7431);
        }
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
    fetchAIAnalysis(weatherData);
  };

  const handleEnableNotifications = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setNotificationsEnabled(true);
        toast({
          title: "Notifications Enabled",
          description: "You'll receive alerts when conditions favor disease or pests.",
        });
      } else {
        toast({
          title: "Permission Denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveSettings = () => {
    setManageDialogOpen(false);
    toast({
      title: "Settings Saved",
      description: "Your notification preferences have been updated.",
    });
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
                {/* Weather Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: Droplets,
                      label: "Humidity",
                      value: `${weatherData.humidity}%`,
                    },
                    {
                      icon: Wind,
                      label: "Wind",
                      value: `${weatherData.wind} mph`,
                    },
                    {
                      icon: ThermometerSun,
                      label: "Soil Temp",
                      value: `${weatherData.soilTemp}°F`,
                    },
                    {
                      icon: Thermometer,
                      label: "Feels Like",
                      value: `${weatherData.feelsLike}°F`,
                    },
                  ].map((metric) => (
                    <div
                      key={metric.label}
                      className="flex items-center gap-3 p-3 rounded-xl bg-lawn-50"
                    >
                      <div className="w-10 h-10 rounded-lg bg-lawn-100 flex items-center justify-center">
                        <metric.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="font-semibold text-foreground">
                          {metric.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Soil Temp Timeline */}
                <div className="mt-6 p-4 rounded-xl bg-lawn-50">
                  <p className="text-sm font-semibold text-foreground mb-3">
                    Soil Temperature Trend
                  </p>
                  <div className="flex items-end justify-between h-24 gap-2">
                    {displaySoilTemps.map((temp, i) => {
                      const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
                      const today = new Date();
                      const dayIndex = new Date(today.getTime() - (6 - i) * 24 * 60 * 60 * 1000).getDay();
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center">
                          <span className="text-xs text-muted-foreground mb-1 font-medium">
                            {temp}°
                          </span>
                          <div
                            className="w-full rounded-t-md gradient-lawn transition-all duration-300 hover:opacity-80 cursor-pointer"
                            style={{ height: `${((temp - minTemp + 5) / (maxTemp - minTemp + 10)) * 100}%`, minHeight: "24%" }}
                            title={`${dayLabels[dayIndex]}: ${temp}°F`}
                          />
                          <span className="text-[10px] text-muted-foreground mt-1 font-medium">
                            {dayLabels[dayIndex]}
                          </span>
                        </div>
                      );
                    })}
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
                <CardContent className="p-6 text-center">
                  <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">AI insights will appear once weather data loads</p>
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
            
            <TabsContent value="settings" className="space-y-6 py-4">
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
    </section>
  );
}
