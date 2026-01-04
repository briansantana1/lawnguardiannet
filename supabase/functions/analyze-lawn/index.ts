import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI API key is not configured');
    }

    const { imageBase64, grassType, season, location } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    console.log('Analyzing lawn image with GPT-5-mini...');
    console.log('Grass type:', grassType || 'Unknown');
    console.log('Season:', season || 'Unknown');
    console.log('Location:', location || 'Unknown');

    const systemPrompt = `You are an expert lawn care diagnostician and agronomist with 20+ years of experience specializing in turfgrass diseases, insects, and weeds. You are CONSERVATIVE and PRECISE in your identifications.

CRITICAL IDENTIFICATION RULES:
1. NEVER guess - if you cannot clearly see distinguishing features, mark confidence as "low" or don't include the issue
2. Require MULTIPLE confirming symptoms before identifying any issue with "high" confidence
3. For weeds: You must see clear leaf shape, growth pattern, and ideally seed heads or flowers to confirm species
4. For diseases: Look for characteristic patterns (rings, patches, lesion shapes) - a brown area alone is NOT sufficient
5. For insects: Require visible damage patterns specific to that pest, or visible insects/larvae
6. Consider the season and location - some issues are impossible in certain conditions

COMMON MISIDENTIFICATION WARNINGS:
- Dormant grass vs dead grass vs disease - warm-season grasses go brown in winter, this is NORMAL
- Clover vs other broadleaf weeds - check leaf pattern carefully (3-leaflet pattern for clover)
- Dollar spot vs brown patch vs drought stress - each has specific visual characteristics
- Grubs vs drought vs fungus damage - require multiple indicators

For EACH identified issue, you MUST provide:
- "visual_evidence": specific features you observed in THIS image that led to the identification
- Only mark "high" confidence if you see 3+ confirming characteristics
- Mark "medium" if you see 1-2 characteristics
- Mark "low" or omit if you're uncertain

Your responses must be in valid JSON format with the following structure:
{
  "diagnosis": {
    "identified_issues": [
      {
        "type": "disease" | "insect" | "weed" | "nutrient_deficiency" | "environmental",
        "name": "specific name of the issue",
        "confidence": "high" | "medium" | "low",
        "visual_evidence": "specific features observed: e.g., 'saw distinct 3-leaflet pattern with white flower heads typical of white clover'",
        "description": "detailed description of the issue",
        "symptoms": ["list of visible symptoms actually observed in this image"],
        "severity": "mild" | "moderate" | "severe",
        "alternate_possibilities": ["other issues this could be if identification is uncertain"]
      }
    ],
    "overall_health": "poor" | "fair" | "good" | "excellent",
    "affected_area_estimate": "percentage or description",
    "identification_notes": "any caveats about the analysis, image quality issues, or why certain identifications are uncertain"
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

Context: Grass type is ${grassType || 'unknown'}, season is ${season || 'unknown'}, location is ${location || 'unknown'}.
If analyzing warm-season grass in winter - brown/dormant appearance is NORMAL and should NOT be diagnosed as disease.
Be specific with chemical recommendations including exact active ingredients, application rates (e.g., 0.2-0.4 oz per 1,000 sq ft), and frequencies (e.g., every 14-28 days).`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
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
                text: `Please analyze this lawn image and provide a comprehensive diagnosis, treatment plan, and forecast. The lawn is ${grassType || 'unknown grass type'} in ${location || 'an unknown location'} during ${season || 'an unknown season'}. Respond ONLY with the JSON object, no additional text.`
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
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonString.trim());
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
