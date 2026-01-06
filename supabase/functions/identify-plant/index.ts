import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

/**
 * Plant.id API Integration Edge Function
 * 
 * Uses Plant.id API for high-accuracy plant, weed, disease, and pest identification
 * API Documentation: https://web.plant.id/documentation
 */

const PLANT_ID_API_KEY = Deno.env.get('PLANT_ID_API_KEY');
const FLORA_API_KEY = Deno.env.get('FLORA_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PlantIdRequest {
  images: string[];
  latitude?: number;
  longitude?: number;
  similar_images?: boolean;
}

interface HealthAssessmentRequest {
  images: string[];
  latitude?: number;
  longitude?: number;
  similar_images?: boolean;
  disease_details?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, latitude, longitude, includeHealth, additionalImages } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    // Prepare images array
    const images: string[] = [imageBase64];
    if (additionalImages && Array.isArray(additionalImages)) {
      images.push(...additionalImages);
    }

    // Ensure images are properly formatted
    const formattedImages = images.map(img => {
      if (img.startsWith('data:')) {
        return img;
      }
      return `data:image/jpeg;base64,${img}`;
    });

    console.log(`Processing ${formattedImages.length} image(s) for identification...`);

    // Check if we have Plant.id API key
    if (PLANT_ID_API_KEY) {
      // Use Plant.id API for identification
      const result = await identifyWithPlantId(formattedImages, latitude, longitude, includeHealth);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      // Fallback to description-based identification
      console.log('Plant.id API key not configured, using fallback');
      const result = await getFallbackIdentification();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in identify-plant function:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to identify plant/problem'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Identify plants using Plant.id API
 */
async function identifyWithPlantId(
  images: string[], 
  latitude?: number, 
  longitude?: number,
  includeHealth: boolean = true
) {
  // Plant identification request
  const identifyPayload: PlantIdRequest = {
    images: images,
    similar_images: true,
  };

  if (latitude && longitude) {
    identifyPayload.latitude = latitude;
    identifyPayload.longitude = longitude;
  }

  // Make identification request
  const identifyResponse = await fetch('https://api.plant.id/v3/identification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': PLANT_ID_API_KEY!,
    },
    body: JSON.stringify({
      ...identifyPayload,
      plant_details: ['common_names', 'taxonomy', 'wiki_description', 'edible_parts'],
    }),
  });

  if (!identifyResponse.ok) {
    const errorText = await identifyResponse.text();
    console.error('Plant.id API error:', identifyResponse.status, errorText);
    
    if (identifyResponse.status === 401) {
      throw new Error('Plant.id API authentication failed');
    }
    if (identifyResponse.status === 429) {
      throw new Error('Plant.id API rate limit exceeded');
    }
    
    throw new Error(`Plant.id API error: ${identifyResponse.status}`);
  }

  const identifyData = await identifyResponse.json();
  console.log('Plant.id identification successful');

  // Health assessment request (for disease detection)
  let healthData = null;
  if (includeHealth) {
    try {
      const healthPayload: HealthAssessmentRequest = {
        images: images,
        similar_images: true,
        disease_details: true,
      };

      if (latitude && longitude) {
        healthPayload.latitude = latitude;
        healthPayload.longitude = longitude;
      }

      const healthResponse = await fetch('https://api.plant.id/v3/health_assessment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Api-Key': PLANT_ID_API_KEY!,
        },
        body: JSON.stringify(healthPayload),
      });

      if (healthResponse.ok) {
        healthData = await healthResponse.json();
        console.log('Plant.id health assessment successful');
      }
    } catch (healthError) {
      console.error('Health assessment failed, continuing with identification only:', healthError);
    }
  }

  // Transform the results
  return transformPlantIdResults(identifyData, healthData);
}

/**
 * Transform Plant.id API results to our format
 */
function transformPlantIdResults(identifyData: any, healthData: any) {
  const identifiedIssues: any[] = [];

  // Process plant identifications
  if (identifyData?.result?.classification?.suggestions) {
    for (const suggestion of identifyData.result.classification.suggestions.slice(0, 3)) {
      if (suggestion.probability < 0.2) continue;

      const isLawnWeed = checkIfLawnWeed(suggestion.name);
      
      identifiedIssues.push({
        type: isLawnWeed ? 'weed' : 'environmental',
        name: suggestion.name,
        confidence: probabilityToConfidence(suggestion.probability),
        probability: suggestion.probability,
        visual_evidence: `Plant.id identified with ${Math.round(suggestion.probability * 100)}% confidence`,
        description: suggestion.details?.wiki_description?.value || 
                    `Identified as ${suggestion.name}`,
        symptoms: suggestion.details?.common_names || [suggestion.name],
        severity: isLawnWeed ? probabilityToSeverity(suggestion.probability) : 'mild',
        alternate_possibilities: identifyData.result.classification.suggestions
          .slice(1, 4)
          .filter((s: any) => s.probability > 0.1)
          .map((s: any) => s.name),
        scientific_name: suggestion.details?.taxonomy ? 
          `${suggestion.details.taxonomy.genus || ''} ${suggestion.details.taxonomy.species || ''}`.trim() : 
          undefined,
      });
    }
  }

  // Process health/disease assessments
  if (healthData?.result?.disease?.diseases) {
    for (const disease of healthData.result.disease.diseases) {
      if (disease.probability < 0.2) continue;

      identifiedIssues.push({
        type: determineIssueType(disease.name),
        name: disease.name,
        confidence: probabilityToConfidence(disease.probability),
        probability: disease.probability,
        visual_evidence: `Health assessment detected with ${Math.round(disease.probability * 100)}% probability`,
        description: disease.disease_details?.description || `${disease.name} detected`,
        symptoms: disease.disease_details?.common_names || [disease.name],
        severity: probabilityToSeverity(disease.probability),
        treatment: {
          chemical: disease.disease_details?.treatment?.chemical || [],
          biological: disease.disease_details?.treatment?.biological || [],
          prevention: disease.disease_details?.treatment?.prevention || [],
        },
      });
    }
  }

  // Calculate overall health
  const overallHealth = calculateOverallHealth(identifiedIssues, healthData);
  
  // Estimate affected area based on number and severity of issues
  const affectedArea = estimateAffectedArea(identifiedIssues);

  return {
    source: 'plant_id',
    api_version: 'v3',
    is_plant: identifyData?.result?.is_plant?.binary ?? true,
    is_healthy: healthData?.result?.disease?.is_healthy ?? true,
    is_healthy_probability: healthData?.result?.disease?.is_healthy_probability ?? 0.8,
    identified_issues: identifiedIssues,
    overall_health: overallHealth,
    affected_area_estimate: affectedArea,
    raw_identification: identifyData,
    raw_health: healthData,
  };
}

/**
 * Check if a plant name is a common lawn weed
 */
function checkIfLawnWeed(name: string): boolean {
  const lawnWeeds = [
    'dandelion', 'crabgrass', 'clover', 'nutsedge', 'plantain',
    'chickweed', 'henbit', 'spurge', 'thistle', 'oxalis',
    'bindweed', 'knotweed', 'purslane', 'ragweed', 'dollarweed',
    'ground ivy', 'wild violet', 'moss', 'creeping charlie'
  ];
  
  const lowerName = name.toLowerCase();
  return lawnWeeds.some(weed => lowerName.includes(weed));
}

/**
 * Determine issue type from name
 */
function determineIssueType(name: string): 'disease' | 'insect' | 'weed' | 'nutrient_deficiency' | 'environmental' {
  const lowerName = name.toLowerCase();
  
  const diseases = ['patch', 'spot', 'rust', 'mildew', 'blight', 'rot', 'mold', 'fungus', 'anthracnose'];
  const insects = ['grub', 'bug', 'worm', 'beetle', 'mite', 'aphid', 'larva', 'cricket', 'billbug'];
  
  if (diseases.some(d => lowerName.includes(d))) return 'disease';
  if (insects.some(i => lowerName.includes(i))) return 'insect';
  if (lowerName.includes('deficiency') || lowerName.includes('nitrogen')) return 'nutrient_deficiency';
  
  return 'disease';
}

/**
 * Convert probability to confidence level
 */
function probabilityToConfidence(probability: number): 'high' | 'medium' | 'low' {
  if (probability >= 0.8) return 'high';
  if (probability >= 0.5) return 'medium';
  return 'low';
}

/**
 * Convert probability to severity
 */
function probabilityToSeverity(probability: number): 'mild' | 'moderate' | 'severe' {
  if (probability >= 0.7) return 'severe';
  if (probability >= 0.4) return 'moderate';
  return 'mild';
}

/**
 * Calculate overall lawn health
 */
function calculateOverallHealth(issues: any[], healthData: any): 'poor' | 'fair' | 'good' | 'excellent' {
  if (!issues.length) {
    return healthData?.result?.disease?.is_healthy ? 'excellent' : 'good';
  }

  const severeCount = issues.filter(i => i.severity === 'severe').length;
  const moderateCount = issues.filter(i => i.severity === 'moderate').length;

  if (severeCount >= 2 || (severeCount >= 1 && moderateCount >= 2)) return 'poor';
  if (severeCount >= 1 || moderateCount >= 2) return 'fair';
  if (moderateCount >= 1 || issues.length >= 2) return 'good';
  
  return 'good';
}

/**
 * Estimate affected area percentage
 */
function estimateAffectedArea(issues: any[]): string {
  if (!issues.length) return 'No significant issues detected';
  
  const severeCount = issues.filter(i => i.severity === 'severe').length;
  const moderateCount = issues.filter(i => i.severity === 'moderate').length;
  
  if (severeCount >= 2) return '40-60% of visible lawn area';
  if (severeCount >= 1) return '20-40% of visible lawn area';
  if (moderateCount >= 2) return '15-30% of visible lawn area';
  if (moderateCount >= 1) return '10-20% of visible lawn area';
  
  return '5-15% of visible lawn area';
}

/**
 * Fallback identification when Plant.id API is not available
 */
async function getFallbackIdentification() {
  return {
    source: 'fallback',
    message: 'Plant.id API key not configured. Please add PLANT_ID_API_KEY to your Supabase secrets.',
    identified_issues: [],
    overall_health: 'unknown',
    affected_area_estimate: 'Unable to analyze without API key',
  };
}

