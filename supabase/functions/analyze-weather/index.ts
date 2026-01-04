import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const { weatherData } = await req.json() as { weatherData: WeatherData };
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert lawn care advisor analyzing current weather conditions. Based on the weather data provided, give practical, actionable lawn care recommendations.

Your response should be a JSON object with the following structure:
{
  "riskLevel": "low" | "medium" | "high",
  "summary": "A brief 1-sentence summary of current conditions for lawn health",
  "recommendations": [
    {
      "category": "watering" | "mowing" | "disease" | "fertilizing" | "general",
      "title": "Brief action title",
      "description": "Detailed recommendation (1-2 sentences)",
      "priority": "low" | "medium" | "high"
    }
  ],
  "alerts": [
    {
      "type": "warning" | "caution" | "tip",
      "message": "Important alert message"
    }
  ]
}

Provide 3-4 specific recommendations based on the current conditions. Focus on:
- Disease risk based on humidity and temperature combinations
- Watering needs based on temperature and humidity
- Mowing recommendations based on conditions
- Any urgent actions needed

Be specific about soil temperature implications for pre-emergent applications, grub activity, and root health.`;

    const userPrompt = `Analyze these current weather conditions for lawn care:

Location: ${weatherData.location}
Current Temperature: ${weatherData.temp}°F
Feels Like: ${weatherData.feelsLike}°F
Humidity: ${weatherData.humidity}%
Wind Speed: ${weatherData.wind} mph
Soil Temperature: ${weatherData.soilTemp}°F
Conditions: ${weatherData.conditions}

Provide lawn care recommendations based on these conditions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response from the AI
    let analysis;
    try {
      // Extract JSON from the response (in case there's markdown formatting)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return a fallback response
      analysis = {
        riskLevel: "medium",
        summary: "Unable to fully analyze conditions. Monitor your lawn closely.",
        recommendations: [
          {
            category: "general",
            title: "Monitor Conditions",
            description: "Keep an eye on your lawn and water as needed based on visual cues.",
            priority: "medium"
          }
        ],
        alerts: []
      };
    }

    return new Response(JSON.stringify({ analysis }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-weather error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
