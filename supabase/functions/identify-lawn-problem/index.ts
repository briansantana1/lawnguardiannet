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
      console.error('identify-lawn-problem: No authorization header');
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
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
      console.error('identify-lawn-problem: Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('identify-lawn-problem: Authenticated user:', userId);

    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageBase64, problemType, context } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!problemType || !['weed', 'disease', 'pest'].includes(problemType)) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid problem type. Must be: weed, disease, or pest' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('identify-lawn-problem: Analyzing', problemType, 'with context:', context);

    const systemPrompt = getSystemPrompt(problemType, context);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Identify this ${problemType} in the lawn image. Provide your analysis in the specified JSON format.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
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
        return new Response(
          JSON.stringify({ success: false, error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI service quota exceeded.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from AI');
    }

    console.log('identify-lawn-problem: AI response received');

    // Parse the JSON response
    let parsedResult;
    try {
      // Extract JSON from potential markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonString = jsonMatch[1].trim();
      parsedResult = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.log('Raw content:', content);
      
      // Return a simplified response if parsing fails
      return new Response(
        JSON.stringify({
          success: true,
          problemType,
          primaryId: 'Analysis Complete',
          confidence: 'medium',
          identification: content,
          symptoms: [],
          severity: 'moderate',
          alternates: [],
          treatments: {
            cultural: ['Consult with a local lawn care professional for specific recommendations.'],
            chemical: [],
            prevention: []
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format the response
    const result = {
      success: true,
      problemType,
      primaryId: parsedResult.name || parsedResult.identification?.name || 'Unknown',
      confidence: parsedResult.confidence || 'medium',
      identification: parsedResult.description || parsedResult.identification?.description || '',
      symptoms: parsedResult.symptoms || parsedResult.identification?.symptoms || [],
      severity: parsedResult.severity || 'moderate',
      alternates: parsedResult.alternates || parsedResult.alternate_possibilities || [],
      treatments: {
        cultural: parsedResult.treatments?.cultural || parsedResult.treatment?.cultural_practices || [],
        chemical: parsedResult.treatments?.chemical || parsedResult.treatment?.chemical_treatments || [],
        prevention: parsedResult.treatments?.prevention || parsedResult.treatment?.prevention || []
      }
    };

    console.log('identify-lawn-problem: Returning result for', result.primaryId);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('identify-lawn-problem error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function getSystemPrompt(problemType: string, context: any): string {
  const season = context?.season || 'unknown';
  const region = context?.region || 'unknown';
  
  const basePrompt = `You are an expert lawn care diagnostician specializing in identifying ${problemType}s in turfgrass. You must provide accurate, actionable identifications.

CONTEXT:
- Season: ${season}
- Region: ${region}

CONFIDENCE LEVELS:
- HIGH: 3+ confirming characteristics clearly visible, season/region appropriate
- MEDIUM: 1-2 characteristics visible, some ambiguity
- LOW: Limited features visible, image quality issues

You MUST respond with valid JSON in this exact format:
{
  "name": "specific name of the ${problemType}",
  "confidence": "high" | "medium" | "low",
  "description": "detailed description including visual evidence observed",
  "symptoms": ["list", "of", "observed", "symptoms"],
  "severity": "mild" | "moderate" | "severe",
  "alternates": ["other possibilities if confidence is not high"],
  "treatments": {
    "cultural": ["cultural practice recommendations"],
    "chemical": [
      {
        "product": "product type",
        "activeIngredients": ["active", "ingredients"],
        "timing": "when to apply"
      }
    ],
    "prevention": ["prevention tips"]
  }
}`;

  const problemSpecificPrompts = {
    weed: `
WEED IDENTIFICATION KEYS:
- Crabgrass: wide leaf blades, spreading growth, finger-like seed heads
- Nutsedge: triangular stem ("sedges have edges"), 3-ranked leaves, glossy
- Dandelion: basal rosette, deeply lobed leaves, milky sap, yellow flowers
- Clover: 3-leaflet compound leaves, white/pink flower heads
- Dollarweed: round coin-shaped leaves, scalloped edges
- Chickweed: opposite leaves, small white star-shaped flowers
- Spurge: opposite leaves, milky sap, prostrate growth

EXAMINE:
- Leaf shape, texture, arrangement, margins
- Growth habit: upright, prostrate, spreading
- Stem characteristics: round, square, triangular
- Flowers, seed heads, unique markings`,

    disease: `
DISEASE IDENTIFICATION KEYS:
- Brown Patch: circular patches 6"+, "smoke ring" border in morning, tan centers
- Dollar Spot: 2-6" circular patches, hourglass lesions, cottony mycelium
- Gray Leaf Spot: diamond lesions with gray centers, purple borders
- Pythium Blight: greasy/water-soaked patches, white cottony mycelium
- Rust: orange/yellow powdery pustules on blades

EXAMINE:
- Symptom pattern: circular, irregular, scattered
- Blade symptoms: lesions, discoloration type, texture
- Fungal structures: mycelium, spores
- Environmental context: moisture, shade, drainage`,

    pest: `
PEST IDENTIFICATION KEYS:
- White Grubs: turf lifts like carpet, spongy soil, bird/animal digging
- Chinch Bugs: expanding patches in sunny/hot areas, yellow halo, thatch level
- Sod Webworms: small brown patches, ragged leaf edges, silk tunnels
- Armyworms: rapid overnight damage, clean-cut blades, group feeding
- Billbugs: dead patches, stems pull easily, sawdust-like frass

DAMAGE PATTERNS:
- Turf lifts like carpet → WHITE GRUBS
- Turf firmly attached, sunny areas → CHINCH BUGS
- Ragged leaf edges + frass → SOD WEBWORMS
- Clean-cut leaves, rapid spread → ARMYWORMS
- Hollow stems at base → BILLBUGS`
  };

  return basePrompt + (problemSpecificPrompts[problemType as keyof typeof problemSpecificPrompts] || '');
}
