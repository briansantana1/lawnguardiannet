import {
  CloudSun,
  Thermometer,
  Droplets,
  Wind,
  ThermometerSun,
  Bell,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const weatherData = {
  location: "Austin, TX",
  temp: 78,
  humidity: 65,
  wind: 8,
  soilTemp: 72,
  conditions: "Partly Cloudy",
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
                    <p className="text-sm opacity-80">{weatherData.location}</p>
                    <div className="flex items-end gap-2 mt-1">
                      <span className="text-5xl font-bold">
                        {weatherData.temp}°
                      </span>
                      <span className="text-lg pb-2">F</span>
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
                      value: `${weatherData.temp + 3}°F`,
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
                  <div className="flex items-end justify-between h-16 gap-1">
                    {[58, 62, 68, 72, 74, 73, 70].map((temp, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t-md gradient-lawn transition-all duration-300 hover:opacity-80"
                        style={{ height: `${(temp - 50) * 2.5}%` }}
                        title={`Day ${i + 1}: ${temp}°F`}
                      />
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
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
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
                    <h3 className="font-semibold">Enable Smart Notifications</h3>
                    <p className="text-sm opacity-90">
                      Get alerts when conditions favor disease or pests
                    </p>
                  </div>
                  <Button variant="hero" size="sm">
                    Enable
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
