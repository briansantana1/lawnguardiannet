import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY is not configured');
      throw new Error('OpenAI API key is not configured');
    }

    const { imageBase64, grassType, season, location } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing lawn image with OpenAI Vision...');
    console.log('Grass type:', grassType || 'Unknown');
    console.log('Season:', season || 'Unknown');
    console.log('Location:', location || 'Unknown');

    const systemPrompt = `You are an expert lawn care diagnostician and agronomist specializing in turfgrass diseases, insects, and weeds. Analyze lawn images to identify problems and provide detailed, actionable treatment recommendations.

Your responses must be in valid JSON format with the following structure:
{
  "diagnosis": {
    "identified_issues": [
      {
        "type": "disease" | "insect" | "weed" | "nutrient_deficiency" | "environmental",
        "name": "specific name of the issue",
        "confidence": "high" | "medium" | "low",
        "description": "detailed description of the issue",
        "symptoms": ["list of visible symptoms"],
        "severity": "mild" | "moderate" | "severe"
      }
    ],
    "overall_health": "poor" | "fair" | "good" | "excellent",
    "affected_area_estimate": "percentage or description"
  },
  "treatment_plan": {
    "cultural_practices": [
      {
        "action": "specific action to take",
        "timing": "when to perform",
        "details": "additional details"
      }
    ],
    "chemical_treatments": [
      {
        "product_type": "fungicide" | "insecticide" | "herbicide" | "fertilizer",
        "active_ingredients": ["list of recommended active ingredients like Azoxystrobin, Propiconazole, etc."],
        "application_rate": "specific rate per 1,000 sq ft",
        "application_frequency": "how often to apply",
        "timing": "best time to apply",
        "precautions": ["safety precautions"]
      }
    ],
    "prevention_tips": ["list of preventive measures"]
  },
  "forecast": {
    "risk_level": "low" | "medium" | "high",
    "potential_outbreaks": [
      {
        "issue": "name of potential problem",
        "likelihood": "percentage or description",
        "conditions": "environmental conditions that increase risk"
      }
    ],
    "preventive_measures": [
      {
        "action": "preventive action",
        "timing": "when to implement",
        "reason": "why this helps"
      }
    ]
  }
}

Consider the grass type (${grassType || 'cool-season grass'}), current season (${season || 'unknown'}), and location (${location || 'unknown'}) when making recommendations. Be specific with chemical recommendations including exact active ingredients, application rates (e.g., 0.2-0.4 oz per 1,000 sq ft), and frequencies (e.g., every 14-28 days).`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: `Please analyze this lawn image and provide a comprehensive diagnosis, treatment plan, and forecast. The lawn is ${grassType || 'unknown grass type'} in ${location || 'an unknown location'} during ${season || 'an unknown season'}.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received');

    const content = data.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse analysis results');
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in analyze-lawn function:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to analyze lawn image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
