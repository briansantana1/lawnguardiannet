/**
 * Insect.id API Integration Edge Function
 *
 * Uses Insect.id API for accurate lawn pest and insect identification
 * API Documentation: https://insect.id/api-documentation
 */

const INSECT_ID_API_KEY = Deno.env.get('INSECT_ID_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface InsectIdRequest {
  images: string[];
  latitude?: number;
  longitude?: number;
  similar_images?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { imageBase64, latitude, longitude, additionalImages } = await req.json();

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

    console.log(`Processing ${formattedImages.length} image(s) for insect identification...`);

    // Check if we have Insect.id API key
    if (INSECT_ID_API_KEY) {
      const result = await identifyWithInsectId(formattedImages, latitude, longitude);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.log('Insect.id API key not configured, using fallback');
      const result = await getFallbackIdentification();
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in identify-lawn-problem function:', error);
    return new Response(JSON.stringify({
      error: errorMessage,
      details: 'Failed to identify lawn pest/insect'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

/**
 * Identify insects using Insect.id API
 */
async function identifyWithInsectId(
  images: string[],
  latitude?: number,
  longitude?: number
) {
  const identifyPayload: InsectIdRequest = {
    images: images,
    similar_images: true,
  };

  if (latitude && longitude) {
    identifyPayload.latitude = latitude;
    identifyPayload.longitude = longitude;
  }

  // Make identification request
  const identifyResponse = await fetch('https://insect.id/api/v1/identification', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': INSECT_ID_API_KEY!,
    },
    body: JSON.stringify({
      ...identifyPayload,
      insect_details: ['common_names', 'taxonomy', 'wiki_description'],
    }),
  });

  if (!identifyResponse.ok) {
    const errorText = await identifyResponse.text();
    console.error('Insect.id API error:', identifyResponse.status, errorText);

    if (identifyResponse.status === 401) {
      throw new Error('Insect.id API authentication failed');
    }
    if (identifyResponse.status === 429) {
      throw new Error('Insect.id API rate limit exceeded');
    }

    throw new Error(`Insect.id API error: ${identifyResponse.status}`);
  }

  const identifyData = await identifyResponse.json();
  console.log('Insect.id identification successful');

  return transformInsectIdResults(identifyData);
}

/**
 * Transform Insect.id API results to our format
 */
function transformInsectIdResults(identifyData: any) {
  const identifiedIssues: any[] = [];

  // Process insect identifications
  if (identifyData?.result?.classification?.suggestions) {
    for (const suggestion of identifyData.result.classification.suggestions.slice(0, 3)) {
      if (suggestion.probability < 0.15) continue;

      const isLawnPest = checkIfLawnPest(suggestion.name);

      identifiedIssues.push({
        type: 'insect',
        name: suggestion.name,
        confidence: probabilityToConfidence(suggestion.probability),
        probability: suggestion.probability,
        visual_evidence: `Insect.id identified with ${Math.round(suggestion.probability * 100)}% confidence`,
        description: suggestion.details?.wiki_description?.value ||
                    `Identified as ${suggestion.name}`,
        symptoms: suggestion.details?.common_names || [suggestion.name],
        severity: isLawnPest ? probabilityToSeverity(suggestion.probability) : 'mild',
        alternate_possibilities: identifyData.result.classification.suggestions
          .slice(1, 4)
          .filter((s: any) => s.probability > 0.1)
          .map((s: any) => s.name),
        scientific_name: suggestion.details?.taxonomy ?
          `${suggestion.details.taxonomy.genus || ''} ${suggestion.details.taxonomy.species || ''}`.trim() :
          undefined,
        is_lawn_pest: isLawnPest,
      });
    }
  }

  // Calculate overall assessment
  const hasPests = identifiedIssues.some(i => i.is_lawn_pest);
  const overallHealth = hasPests ? 'fair' : 'good';

  // Estimate affected area based on severity
  const affectedArea = estimateAffectedArea(identifiedIssues);

  return {
    source: 'insect_id',
    api_version: 'v1',
    is_insect: identifyData?.result?.is_insect?.binary ?? false,
    identified_issues: identifiedIssues,
    overall_health: overallHealth,
    affected_area_estimate: affectedArea,
    has_lawn_pests: hasPests,
    raw_identification: identifyData,
  };
}

/**
 * Check if an insect is a common lawn pest
 */
function checkIfLawnPest(name: string): boolean {
  const lawnPests = [
    'grub', 'white grub', 'japanese beetle', 'june beetle',
    'chinch bug', 'billbug', 'sod webworm', 'armyworm',
    'cutworm', 'mole cricket', 'fire ant', 'flea beetle',
    'aphid', 'scale', 'leafhopper', 'whitefly',
    'root weevil', 'crane fly', 'masked chafer'
  ];

  const lowerName = name.toLowerCase();
  return lawnPests.some(pest => lowerName.includes(pest));
}

/**
 * Convert probability to confidence level
 */
function probabilityToConfidence(probability: number): 'high' | 'medium' | 'low' {
  if (probability >= 0.75) return 'high';
  if (probability >= 0.45) return 'medium';
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
 * Estimate affected area percentage
 */
function estimateAffectedArea(issues: any[]): string {
  if (!issues.length) return 'No pests detected';

  const severeCount = issues.filter(i => i.severity === 'severe' && i.is_lawn_pest).length;
  const moderateCount = issues.filter(i => i.severity === 'moderate' && i.is_lawn_pest).length;

  if (severeCount >= 2) return 'Heavy infestation - 40-60% of lawn potentially affected';
  if (severeCount >= 1) return 'Moderate infestation - 20-40% of lawn potentially affected';
  if (moderateCount >= 2) return 'Light infestation - 15-30% of lawn potentially affected';
  if (moderateCount >= 1) return 'Minor infestation - 10-20% of lawn potentially affected';

  return 'Minimal pest activity detected';
}

/**
 * Fallback identification when Insect.id API is not available
 */
async function getFallbackIdentification() {
  return {
    source: 'fallback',
    message: 'Insect.id API key not configured. Please add INSECT_ID_API_KEY to your Supabase secrets.',
    identified_issues: [],
    overall_health: 'unknown',
    affected_area_estimate: 'Unable to analyze without API key',
  };
}
