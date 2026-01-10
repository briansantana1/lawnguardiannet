import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    // Authenticate the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('analyze-lawn: No authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('analyze-lawn: Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('analyze-lawn: Authenticated user:', userId);
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI API key is not configured');
    }

    const { imageBase64, additionalImages, grassType, season, location, multipleAngles } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    const totalImages = 1 + (additionalImages?.length || 0);
    console.log('Analyzing lawn with GPT-5-mini...');
    console.log('Total images:', totalImages);
    console.log('Grass type:', grassType || 'Unknown');
    console.log('Season:', season || 'Unknown');
    console.log('Location:', location || 'Unknown');

    const systemPrompt = `You are an expert lawn care diagnostician and agronomist with 20+ years of experience specializing in turfgrass diseases, insects, and weeds. Your identifications guide treatment decisions for paid subscribers and MUST be highly accurate.

${multipleAngles ? `MULTI-ANGLE ANALYSIS: You have been provided with ${totalImages} photos from different angles. Use ALL images together to:
- Cross-reference symptoms visible in different photos
- Confirm or rule out diagnoses based on consistent evidence across images
- Identify issues that may only be visible from certain angles
- Increase confidence when the same symptoms appear in multiple photos
- Note any contradictory evidence between photos` : ''}

CRITICAL IDENTIFICATION RULES:
1. NEVER guess - if you cannot clearly see distinguishing features, mark confidence as "low" or state what's needed
2. Require MULTIPLE confirming symptoms before identifying any issue with "high" confidence
3. Consider the season (${season || 'unknown'}) and location (${location || 'unknown'}) - some issues are impossible in certain conditions
4. If image quality or angle prevents accurate ID, explicitly state what additional views would help

===== SYSTEMATIC WEED IDENTIFICATION PROTOCOL =====

When analyzing potential WEEDS, examine these characteristics systematically:

LEAF CHARACTERISTICS:
- Shape: linear, oval, lobed, compound, heart-shaped, spatulate, lanceolate
- Texture: smooth, hairy, waxy, succulent, powdery, glossy
- Arrangement: opposite, alternate, whorled, basal rosette
- Margins: smooth (entire), serrated, lobed, toothed, wavy

GROWTH HABIT:
- Pattern: upright, prostrate, spreading, clumping, mat-forming, climbing
- Height and spread relative to surrounding turf
- Root system if visible: tap root, fibrous, stolons, rhizomes, bulbs

STEM CHARACTERISTICS:
- Cross-section shape: round, square (mints/deadnettle), triangular (sedges), flat
- Texture: smooth, hairy, succulent, ridged
- Color: green, reddish, purplish, with nodes

DISTINCTIVE FEATURES:
- Flowers: color, shape, arrangement (spikes, clusters, solitary)
- Seed heads or fruits: shape, color, dispersal mechanism
- Unique markings: chevron patterns, spots, variegation
- Sap: milky (spurge, dandelion), clear, colored

COMMON WEED IDENTIFICATION KEYS:
- Crabgrass: wide leaf blades, spreading growth, finger-like seed heads, hairy
- Nutsedge: triangular stem ("sedges have edges"), 3-ranked leaves, glossy
- Dandelion: basal rosette, deeply lobed leaves, milky sap, yellow flowers
- Clover: 3-leaflet compound leaves, white/pink flower heads
- Dollarweed: round coin-shaped leaves, scalloped edges
- Chickweed: opposite leaves, small white star-shaped flowers
- Henbit/Deadnettle: square stems, opposite leaves, purple flowers
- Spurge: opposite leaves, milky sap, prostrate growth

===== DISEASE IDENTIFICATION PROTOCOL =====

For DISEASES, require these specific indicators:

BROWN PATCH (Rhizoctonia):
- Irregular circular patches 6" to several feet
- Smoke ring border (dark gray-green) in early morning
- Tan/brown center with green grass inside
- Leaf lesions with tan centers and brown borders

DOLLAR SPOT (Clarireedia):
- Circular patches 2-6 inches (silver dollar size)
- Straw-colored lesions with reddish-brown borders
- Hourglass-shaped lesions across leaf blade
- Cottony mycelium in morning dew

GRAY LEAF SPOT:
- Diamond/oval lesions with gray centers
- Brown/purple borders on lesions
- Twisted/distorted leaf tips
- Most common on St. Augustine, perennial ryegrass

COMMON MISIDENTIFICATION WARNINGS:
- Dormant grass vs dead grass vs disease - warm-season grasses go brown in winter, this is NORMAL
- Dollar spot vs brown patch vs drought stress - each has specific visual characteristics
- Iron chlorosis vs nitrogen deficiency - check interveinal patterns

===== INSECT DAMAGE IDENTIFICATION PROTOCOL =====

For INSECTS, require specific damage patterns:

WHITE GRUBS:
- Irregular brown patches that lift like carpet (severed roots)
- Visible C-shaped larvae when turf pulled back
- Bird/animal digging activity
- Spongy feel when walking

CHINCH BUGS:
- Expanding patches starting in sunny, dry areas
- Yellow halos around dead patches
- Tiny black/white insects visible at thatch layer
- Most common on St. Augustine

SOD WEBWORMS:
- Small brown patches, chewed grass blades
- Ragged leaf edges
- Green pellet frass
- Moths flying at dusk

ARMYWORMS:
- Rapidly expanding damage overnight
- Clean-cut grass blades
- Visible caterpillars, especially morning/evening

===== CONFIDENCE LEVEL REQUIREMENTS =====

HIGH CONFIDENCE requires:
- 3+ confirming characteristics clearly visible${multipleAngles ? ' OR consistent evidence across multiple photos' : ''}
- Season and region appropriate for the issue
- Clear, quality image showing diagnostic features

MEDIUM CONFIDENCE:
- 1-2 characteristics visible
- Some ambiguity in features
- Must list alternate possibilities

LOW CONFIDENCE:
- Limited visible features
- Image quality issues
- Must explain what additional information/angles would help distinguish

For EACH identified issue, you MUST provide:
- "visual_evidence": specific features you observed in THIS image that led to identification
- "alternate_possibilities": if not high confidence, what else could it be and what would distinguish them

Your responses must be in valid JSON format with the following structure:
{
  "diagnosis": {
    "identified_issues": [
      {
        "type": "disease" | "insect" | "weed" | "nutrient_deficiency" | "environmental",
        "name": "specific name of the issue",
        "confidence": "high" | "medium" | "low",
        "visual_evidence": "specific features observed: e.g., 'observed triangular stem cross-section with 3-ranked leaf arrangement confirming yellow nutsedge'",
        "description": "detailed description of the issue",
        "symptoms": ["list of visible symptoms actually observed in this image"],
        "severity": "mild" | "moderate" | "severe",
        "alternate_possibilities": ["other issues this could be with distinguishing features"]
      }
    ],
    "overall_health": "poor" | "fair" | "good" | "excellent",
    "affected_area_estimate": "percentage or description",
    "identification_notes": "any caveats about the analysis, image quality issues, or what additional angles/information would improve identification"
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
        "active_ingredients": ["list of recommended active ingredients like Azoxystrobin, Propiconazole, Quinclorac, Sulfentrazone, etc."],
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
Be specific with chemical recommendations including exact active ingredients, application rates (e.g., 0.2-0.4 oz per 1,000 sq ft for herbicides, 2-4 lbs per 1,000 sq ft for granular products), and frequencies (e.g., every 14-28 days).`;

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
                text: multipleAngles 
                  ? `Please analyze these ${totalImages} lawn photos from different angles and provide a comprehensive diagnosis, treatment plan, and forecast. Use all images together to cross-reference symptoms and strengthen your diagnosis. The lawn is ${grassType || 'unknown grass type'} in ${location || 'an unknown location'} during ${season || 'an unknown season'}. Respond ONLY with the JSON object, no additional text.`
                  : `Please analyze this lawn image and provide a comprehensive diagnosis, treatment plan, and forecast. The lawn is ${grassType || 'unknown grass type'} in ${location || 'an unknown location'} during ${season || 'an unknown season'}. Respond ONLY with the JSON object, no additional text.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              },
              // Include additional images if provided
              ...(additionalImages || []).map((img: string) => ({
                type: 'image_url',
                image_url: {
                  url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`
                }
              }))
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
