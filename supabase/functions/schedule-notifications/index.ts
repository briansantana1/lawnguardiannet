import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AIRecommendation {
  category: string;
  title: string;
  description: string;
  priority: string;
}

interface AIAnalysis {
  riskLevel: string;
  summary: string;
  recommendations: AIRecommendation[];
  alerts: Array<{ type: string; message: string }>;
}

interface WeatherData {
  location: string;
  temp: number;
  humidity: number;
  wind: number;
  soilTemp: number;
  conditions: string;
  feelsLike: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    const { aiAnalysis, weatherData } = await req.json() as { 
      aiAnalysis: AIAnalysis; 
      weatherData: WeatherData;
    };

    if (!aiAnalysis || !aiAnalysis.recommendations) {
      throw new Error("Invalid AI analysis data");
    }

    const now = new Date();
    const notifications: Array<{
      user_id: string;
      title: string;
      message: string;
      category: string;
      priority: string;
      scheduled_for: string;
      weather_context: object;
    }> = [];

    // Schedule notifications based on recommendations
    aiAnalysis.recommendations.forEach((rec, index) => {
      // Schedule high priority items for immediate/today
      // Medium priority for tomorrow
      // Low priority for 2-3 days out
      let scheduledDate = new Date(now);
      
      if (rec.priority === "high") {
        // Schedule for 2 hours from now
        scheduledDate.setHours(scheduledDate.getHours() + 2);
      } else if (rec.priority === "medium") {
        // Schedule for tomorrow morning at 8 AM
        scheduledDate.setDate(scheduledDate.getDate() + 1);
        scheduledDate.setHours(8, 0, 0, 0);
      } else {
        // Schedule for 2-3 days out at 9 AM
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
        },
      });
    });

    // Also schedule alert notifications
    if (aiAnalysis.alerts && aiAnalysis.alerts.length > 0) {
      aiAnalysis.alerts.forEach((alert, index) => {
        const scheduledDate = new Date(now);
        // Warnings are urgent - schedule for 1 hour from now
        // Cautions for 4 hours
        // Tips for next day
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
          },
        });
      });
    }

    // Insert notifications into database
    const { data: insertedNotifications, error: insertError } = await supabase
      .from("notification_schedules")
      .insert(notifications)
      .select();

    if (insertError) {
      console.error("Error inserting notifications:", insertError);
      throw new Error("Failed to schedule notifications");
    }

    console.log(`Scheduled ${notifications.length} notifications for user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        scheduledCount: notifications.length,
        notifications: insertedNotifications 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("schedule-notifications error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { 
        status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
