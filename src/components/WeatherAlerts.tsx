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

const defaultWeatherData: WeatherData = {
  location: "Loading...",
  temp: 0,
  humidity: 0,
  wind: 0,
  soilTemp: 0,
  conditions: "Loading...",
  feelsLike: 0,
};

const alerts = [
  {
    id: 1,
    type: "disease",
    title: "Brown Patch Risk: HIGH",
    message:
      "Current humidity and temperatures create ideal conditions for fungal growth. Consider preventative fungicide application.",
    time: "2 hours ago",
    severity: "high",
  },
  {
    id: 2,
    type: "insect",
    title: "Grub Activity Increasing",
    message:
      "Soil temperatures are optimal for grub feeding. Monitor for spongy turf areas.",
    time: "Today",
    severity: "medium",
  },
  {
    id: 3,
    type: "action",
    title: "Pre-emergent Application Due",
    message:
      "Soil temp reaching 55°F — ideal time for crabgrass pre-emergent in your area.",
    time: "Tomorrow",
    severity: "info",
  },
];

const severityStyles = {
  high: "border-l-alert bg-alert/5",
  medium: "border-l-warning bg-warning/5",
  info: "border-l-sky bg-sky/5",
};

export function WeatherAlerts() {
  const [weatherData, setWeatherData] = useState<WeatherData>(defaultWeatherData);
  const [soilTempData, setSoilTempData] = useState<SoilTempData>({ temps: [], loading: true });
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [manageDialogOpen, setManageDialogOpen] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    diseaseAlerts: true,
    insectAlerts: true,
    weatherAlerts: true,
    treatmentReminders: true,
  });
  const { toast } = useToast();

  // Fetch real weather data based on user's location
  useEffect(() => {
    const fetchWeatherData = async (lat: number, lon: number) => {
      try {
        // Using Open-Meteo API (free, no API key required)
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&hourly=soil_temperature_6cm&past_days=7&forecast_days=1&temperature_unit=fahrenheit&wind_speed_unit=mph`
        );
        const data = await response.json();
        
        // Get location name using reverse geocoding
        const geoResponse = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m`
        );
        
        // Simple location display
        const locationName = await getLocationName(lat, lon);
        
        const weatherCode = data.current.weather_code;
        const conditions = getWeatherCondition(weatherCode);
        
        // Get soil temperature (average of last value)
        const soilTemps = data.hourly.soil_temperature_6cm.slice(-168); // Last 7 days (24 * 7)
        const dailySoilTemps: number[] = [];
        for (let i = 0; i < 7; i++) {
          const dayTemps = soilTemps.slice(i * 24, (i + 1) * 24);
          const avgTemp = Math.round(dayTemps.reduce((a: number, b: number) => a + b, 0) / dayTemps.length);
          dailySoilTemps.push(avgTemp);
        }
        
        setWeatherData({
          location: locationName,
          temp: Math.round(data.current.temperature_2m),
          humidity: Math.round(data.current.relative_humidity_2m),
          wind: Math.round(data.current.wind_speed_10m),
          soilTemp: dailySoilTemps[dailySoilTemps.length - 1] || 0,
          conditions,
          feelsLike: Math.round(data.current.apparent_temperature),
        });
        
        setSoilTempData({ temps: dailySoilTemps, loading: false });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching weather data:", error);
        setLoading(false);
        setSoilTempData({ temps: [58, 62, 68, 72, 74, 73, 70], loading: false });
      }
    };

    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Geolocation error:", error);
          // Default to Austin, TX if location access denied
          fetchWeatherData(30.2672, -97.7431);
        }
      );
    } else {
      // Fallback location
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

  const displaySoilTemps = soilTempData.loading ? [58, 62, 68, 72, 74, 73, 70] : soilTempData.temps;
  const minTemp = Math.min(...displaySoilTemps);
  const maxTemp = Math.max(...displaySoilTemps);

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
                      <p className="text-sm opacity-80">
                        {loading ? "Detecting location..." : weatherData.location}
                      </p>
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
                  <div className="flex items-end justify-between h-20 gap-1">
                    {displaySoilTemps.map((temp, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <span className="text-xs text-muted-foreground mb-1 font-medium">
                          {temp}°
                        </span>
                        <div
                          className="w-full rounded-t-md gradient-lawn transition-all duration-300 hover:opacity-80"
                          style={{ height: `${((temp - minTemp + 5) / (maxTemp - minTemp + 10)) * 100}%`, minHeight: '20%' }}
                          title={`Day ${i + 1}: ${temp}°F`}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    <span>7 days ago</span>
                    <span>Today</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alerts & Notifications */}
          <div id="alerts">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-heading text-3xl font-bold text-foreground">
                Alerts & Forecasts
              </h2>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setManageDialogOpen(true)}
              >
                <Settings className="w-4 h-4 mr-1" />
                Manage
              </Button>
            </div>

            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card
                  key={alert.id}
                  className={`border-l-4 ${
                    severityStyles[alert.severity as keyof typeof severityStyles]
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-card flex items-center justify-center shadow-sm shrink-0">
                        <AlertCircle
                          className={`w-5 h-5 ${
                            alert.severity === "high"
                              ? "text-alert"
                              : alert.severity === "medium"
                              ? "text-warning"
                              : "text-sky"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-semibold text-foreground">
                            {alert.title}
                          </h3>
                          <span className="text-xs text-muted-foreground shrink-0">
                            {alert.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.message}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

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
        <DialogContent aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Manage Notifications</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
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
          <div className="flex justify-end gap-3">
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
