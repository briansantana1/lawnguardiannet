import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// API Keys from Supabase Secrets
const PLANTNET_API_KEY = Deno.env.get('PLANTNET_API_KEY');
const PLANT_ID_API_KEY = Deno.env.get('PLANT_ID_API_KEY');
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// STEP 1: Pl@ntNet API - Plant/Weed Species Identification
// ============================================================================
interface PlantNetResult {
  success: boolean;
  scientificName?: string;
  commonNames?: string[];
  confidence?: number;
  family?: string;
  genus?: string;
  allResults?: Array<{
    scientificName: string;
    commonNames: string[];
    score: number;
  }>;
  error?: string;
}

async function identifyWithPlantNet(imageBase64: string): Promise<PlantNetResult> {
  if (!PLANTNET_API_KEY) {
    console.log('[PLANTNET] API key not configured, skipping');
    return { success: false, error: 'Pl@ntNet API key not configured' };
  }

  try {
    console.log('[PLANTNET] 🌿 Starting species identification...');
    
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const blob = new Blob([binaryData], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('images', blob, 'lawn-image.jpg');
    formData.append('organs', 'leaf');
    
    const response = await fetch(
      `https://my-api.plantnet.org/v2/identify/all?api-key=${PLANTNET_API_KEY}&include-related-images=false`,
      {
        method: 'POST',
        body: formData,
      }
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PLANTNET] API error:', response.status, errorText);
      
      if (response.status === 404) {
        return { success: false, error: 'No plant identified in image' };
      }
      
      return { success: false, error: `Pl@ntNet API error: ${response.status}` };
    }
    
    const data = await response.json();
    console.log('[PLANTNET] Response received');
    
    if (data.results && data.results.length > 0) {
      const topResult = data.results[0];
      const result: PlantNetResult = {
        success: true,
        scientificName: topResult.species?.scientificName || topResult.species?.scientificNameWithoutAuthor,
        commonNames: topResult.species?.commonNames || [],
        confidence: topResult.score,
        family: topResult.species?.family?.scientificName,
        genus: topResult.species?.genus?.scientificName,
        allResults: data.results.slice(0, 5).map((r: any) => ({
          scientificName: r.species?.scientificName || r.species?.scientificNameWithoutAuthor,
          commonNames: r.species?.commonNames || [],
          score: r.score,
        })),
      };
      
      console.log('[PLANTNET] ✅ Identified:', result.scientificName, 'Confidence:', ((result.confidence || 0) * 100).toFixed(1) + '%');
      return result;
    }
    
    return { success: false, error: 'No plant identified' };
    
  } catch (error) {
    console.error('[PLANTNET] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// STEP 2: Plant.id API - Disease & Health Assessment
// ============================================================================
interface PlantIdHealthResult {
  success: boolean;
  isHealthy?: boolean;
  healthProbability?: number;
  diseases?: Array<{
    name: string;
    probability: number;
    description?: string;
    treatment?: {
      chemical?: string[];
      biological?: string[];
      prevention?: string[];
    };
  }>;
  pests?: Array<{
    name: string;
    probability: number;
    description?: string;
  }>;
  error?: string;
}

async function assessHealthWithPlantId(imageBase64: string): Promise<PlantIdHealthResult> {
  if (!PLANT_ID_API_KEY) {
    console.log('[PLANT.ID] API key not configured, skipping health assessment');
    return { success: false, error: 'Plant.id API key not configured' };
  }

  try {
    console.log('[PLANT.ID] 🔬 Starting health assessment...');
    
    // Clean up base64 data
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    
    const requestBody = {
      images: [`data:image/jpeg;base64,${base64Data}`],
      latitude: null,
      longitude: null,
      similar_images: false,
      health: 'all',
      disease_details: ['description', 'treatment'],
    };
    
    const response = await fetch('https://api.plant.id/v3/health_assessment', {
      method: 'POST',
      headers: {
        'Api-Key': PLANT_ID_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[PLANT.ID] API error:', response.status, errorText);
      return { success: false, error: `Plant.id API error: ${response.status}` };
    }
    
    const data = await response.json();
    console.log('[PLANT.ID] Response received');
    
    const healthAssessment = data.result?.disease || data.result?.health_assessment;
    
    if (healthAssessment) {
      const diseases = (healthAssessment.diseases || [])
        .filter((d: any) => d.probability > 0.1)
        .map((d: any) => ({
          name: d.name || d.entity_id,
          probability: d.probability,
          description: d.disease_details?.description || d.details?.description,
          treatment: d.disease_details?.treatment || d.details?.treatment,
        }));
      
      const result: PlantIdHealthResult = {
        success: true,
        isHealthy: healthAssessment.is_healthy?.binary ?? (diseases.length === 0),
        healthProbability: healthAssessment.is_healthy?.probability ?? 0.5,
        diseases: diseases,
      };
      
      console.log('[PLANT.ID] ✅ Health:', result.isHealthy ? 'Healthy' : 'Issues detected');
      console.log('[PLANT.ID] Diseases found:', diseases.length);
      
      if (diseases.length > 0) {
        diseases.slice(0, 3).forEach((d: any) => {
          console.log(`  - ${d.name}: ${(d.probability * 100).toFixed(1)}%`);
        });
      }
      
      return result;
    }
    
    return { success: false, error: 'No health data in response' };
    
  } catch (error) {
    console.error('[PLANT.ID] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ============================================================================
// STEP 3: Claude Sonnet 4 - Final Analysis & Treatment Plan
// ============================================================================
async function analyzeWithClaude(
  imageBase64: string,
  additionalImages: string[] | undefined,
  grassType: string,
  season: string,
  location: string,
  plantNetResult: PlantNetResult,
  plantIdResult: PlantIdHealthResult
): Promise<any> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('Claude API key not configured. Please add ANTHROPIC_API_KEY to Supabase secrets.');
  }

  console.log('[CLAUDE] 🧠 Starting final analysis with Claude Sonnet 4...');
  
  const totalImages = 1 + (additionalImages?.length || 0);
  const multipleAngles = totalImages > 1;
  
  // Build context from previous API results
  let apiContext = `
===== MULTI-API ANALYSIS CHAIN RESULTS =====

`;

  // Pl@ntNet results
  if (plantNetResult.success && plantNetResult.confidence && plantNetResult.confidence > 0.2) {
    apiContext += `🌿 PL@NTNET SPECIES IDENTIFICATION (Step 1):
- Top Match: ${plantNetResult.scientificName || 'Unknown'}
- Common Names: ${plantNetResult.commonNames?.join(', ') || 'Unknown'}
- Confidence: ${((plantNetResult.confidence || 0) * 100).toFixed(1)}%
- Family: ${plantNetResult.family || 'Unknown'}
- Genus: ${plantNetResult.genus || 'Unknown'}
`;
    if (plantNetResult.allResults && plantNetResult.allResults.length > 1) {
      apiContext += `- Alternative matches:\n`;
      plantNetResult.allResults.slice(1, 4).forEach((r, i) => {
        apiContext += `  ${i + 2}. ${r.scientificName} (${(r.score * 100).toFixed(1)}%)\n`;
      });
    }
    apiContext += '\n';
  } else {
    apiContext += `🌿 PL@NTNET: No confident species identification (may be grass, not a weed)\n\n`;
  }

  // Plant.id health results
  if (plantIdResult.success) {
    apiContext += `🔬 PLANT.ID HEALTH ASSESSMENT (Step 2):
- Overall Health: ${plantIdResult.isHealthy ? '✅ Healthy' : '⚠️ Issues Detected'}
- Health Probability: ${((plantIdResult.healthProbability || 0) * 100).toFixed(1)}%
`;
    if (plantIdResult.diseases && plantIdResult.diseases.length > 0) {
      apiContext += `- Detected Diseases/Issues:\n`;
      plantIdResult.diseases.forEach((d, i) => {
        apiContext += `  ${i + 1}. ${d.name} - ${(d.probability * 100).toFixed(1)}% confidence\n`;
        if (d.description) {
          apiContext += `     Description: ${d.description.substring(0, 200)}...\n`;
        }
        if (d.treatment) {
          if (d.treatment.chemical?.length) {
            apiContext += `     Chemical treatments: ${d.treatment.chemical.join(', ')}\n`;
          }
          if (d.treatment.biological?.length) {
            apiContext += `     Biological treatments: ${d.treatment.biological.join(', ')}\n`;
          }
        }
      });
    } else {
      apiContext += `- No diseases detected by Plant.id\n`;
    }
    apiContext += '\n';
  } else {
    apiContext += `🔬 PLANT.ID: ${plantIdResult.error || 'Health assessment unavailable'}\n\n`;
  }

  apiContext += `===== YOUR TASK (Step 3) =====
As the final step in this multi-API chain, you must:
1. CROSS-VALIDATE the results from Pl@ntNet and Plant.id with your own visual analysis
2. RESOLVE any conflicts between API results using your expertise
3. VERIFY identifications are appropriate for ${grassType || 'the lawn type'} in ${location || 'the region'} during ${season || 'this season'}
4. Provide the FINAL authoritative diagnosis incorporating all data sources
5. Create a comprehensive, actionable treatment plan

If APIs disagree, explain the conflict and provide your expert judgment.
If APIs found nothing but you see issues, identify them.
If APIs found issues you don't see evidence for, note the discrepancy.

`;

  const systemPrompt = `You are an elite lawn care diagnostician - the final expert in a multi-API analysis chain. Your diagnosis will be cross-validated against Pl@ntNet (species ID) and Plant.id (health assessment) results provided above.

${multipleAngles ? `MULTI-ANGLE ANALYSIS: You have ${totalImages} photos from different angles. Use ALL images to cross-reference symptoms.` : ''}

${apiContext}

CRITICAL: You are the FINAL authority. The user is paying for God-level accuracy. Be precise, be thorough, be confident when evidence supports it.

IDENTIFICATION ACCURACY REQUIREMENTS:
- HIGH confidence: 3+ confirming characteristics visible, consistent with API results
- MEDIUM confidence: 1-2 characteristics, some API support
- LOW confidence: Limited evidence, explain what would help

YOUR RESPONSE MUST BE VALID JSON with this exact structure:
{
  "diagnosis": {
    "identified_issues": [
      {
        "type": "disease" | "insect" | "weed" | "nutrient_deficiency" | "environmental",
        "name": "specific name",
        "confidence": "high" | "medium" | "low",
        "confidence_score": 85,
        "visual_evidence": "specific features observed",
        "description": "detailed description",
        "symptoms": ["list of symptoms"],
        "severity": "mild" | "moderate" | "severe",
        "alternate_possibilities": ["other possibilities"],
        "api_validation": "confirmed by Plant.id" | "confirmed by Pl@ntNet" | "independent finding" | "conflicts with API - explain"
      }
    ],
    "overall_health": "poor" | "fair" | "good" | "excellent",
    "affected_area_estimate": "percentage or description",
    "identification_notes": "any caveats, cross-validation notes"
  },
  "treatment_plan": {
    "cultural_practices": [
      {
        "action": "specific action",
        "timing": "when to perform",
        "details": "additional details"
      }
    ],
    "chemical_treatments": [
      {
        "product_type": "fungicide" | "insecticide" | "herbicide" | "fertilizer",
        "active_ingredients": ["specific ingredients"],
        "application_rate": "rate per 1,000 sq ft",
        "application_frequency": "how often",
        "timing": "best time to apply",
        "precautions": ["safety notes"]
      }
    ],
    "prevention_tips": ["preventive measures"]
  },
  "forecast": {
    "risk_level": "low" | "medium" | "high",
    "potential_outbreaks": [
      {
        "issue": "potential problem",
        "likelihood": "percentage",
        "conditions": "environmental conditions"
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
Brown/dormant warm-season grass in winter is NORMAL, not disease.
Be specific with chemical recommendations: exact active ingredients, application rates, frequencies.`;

  // Prepare image content for Claude
  const imageContent: any[] = [];
  
  // Add main image
  const mainImageBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  imageContent.push({
    type: 'image',
    source: {
      type: 'base64',
      media_type: 'image/jpeg',
      data: mainImageBase64,
    },
  });
  
  // Add additional images if provided
  if (additionalImages) {
    for (const img of additionalImages) {
      const imgBase64 = img.replace(/^data:image\/\w+;base64,/, '');
      imageContent.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: 'image/jpeg',
          data: imgBase64,
        },
      });
    }
  }
  
  // Add text prompt
  imageContent.push({
    type: 'text',
    text: multipleAngles 
      ? `Analyze these ${totalImages} lawn photos and provide your final expert diagnosis. Cross-validate with the API results above. Respond ONLY with the JSON object.`
      : `Analyze this lawn image and provide your final expert diagnosis. Cross-validate with the API results above. Respond ONLY with the JSON object.`,
  });

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: imageContent,
        },
      ],
      system: systemPrompt,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[CLAUDE] API error:', response.status, errorText);
    
    if (response.status === 401) {
      throw new Error('Invalid Anthropic API key. Please check ANTHROPIC_API_KEY in Supabase secrets.');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again in a moment.');
    }
    
    throw new Error(`Claude API error: ${response.status}`);
  }

  const data = await response.json();
  console.log('[CLAUDE] ✅ Response received');

  const content = data.content?.[0]?.text;
  if (!content) {
    throw new Error('No content in Claude response');
  }

  // Parse JSON from response
  let analysisResult;
  try {
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
    const jsonString = jsonMatch ? jsonMatch[1] : content;
    analysisResult = JSON.parse(jsonString.trim());
  } catch (parseError) {
    console.error('[CLAUDE] Failed to parse JSON:', parseError);
    console.log('[CLAUDE] Raw content:', content.substring(0, 500));
    throw new Error('Failed to parse analysis results');
  }

  return analysisResult;
}

// ============================================================================
// MAIN HANDLER - Orchestrates the Multi-API Chain
// ============================================================================
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
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    
    if (claimsError || !claimsData?.user) {
      console.error('analyze-lawn: Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.user.id;
    console.log('='.repeat(60));
    console.log('🌿 LAWN GUARDIAN - MULTI-API ANALYSIS CHAIN');
    console.log('='.repeat(60));
    console.log('User:', userId);

    const { imageBase64, additionalImages, grassType, season, location, multipleAngles } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    const totalImages = 1 + (additionalImages?.length || 0);
    console.log('📸 Images:', totalImages);
    console.log('🌱 Grass type:', grassType || 'Unknown');
    console.log('📅 Season:', season || 'Unknown');
    console.log('📍 Location:', location || 'Unknown');
    console.log('-'.repeat(60));

    // ========== STEP 1: Pl@ntNet Species Identification ==========
    console.log('\n[STEP 1/3] Pl@ntNet - Species Identification');
    const plantNetResult = await identifyWithPlantNet(imageBase64);
    
    // ========== STEP 2: Plant.id Health Assessment ==========
    console.log('\n[STEP 2/3] Plant.id - Health Assessment');
    const plantIdResult = await assessHealthWithPlantId(imageBase64);
    
    // ========== STEP 3: Claude Final Analysis ==========
    console.log('\n[STEP 3/3] Claude Sonnet 4 - Final Expert Analysis');
    const analysisResult = await analyzeWithClaude(
      imageBase64,
      additionalImages,
      grassType || 'unknown',
      season || 'unknown',
      location || 'unknown',
      plantNetResult,
      plantIdResult
    );

    // Add API chain metadata to response
    analysisResult.api_chain = {
      plantnet: {
        success: plantNetResult.success,
        species: plantNetResult.scientificName,
        confidence: plantNetResult.confidence,
      },
      plant_id: {
        success: plantIdResult.success,
        healthy: plantIdResult.isHealthy,
        diseases_found: plantIdResult.diseases?.length || 0,
      },
      final_analysis: 'Claude Sonnet 4',
      chain_version: '1.0.0',
    };

    console.log('\n' + '='.repeat(60));
    console.log('✅ ANALYSIS COMPLETE');
    console.log('Issues found:', analysisResult.diagnosis?.identified_issues?.length || 0);
    console.log('Overall health:', analysisResult.diagnosis?.overall_health);
    console.log('='.repeat(60));

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('❌ Error in analyze-lawn function:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to analyze lawn image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
