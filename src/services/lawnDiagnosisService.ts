/**
 * Unified Lawn Diagnosis Service
 * 
 * Combines Plant.id API, Flora API, and Treatment Database
 * to provide comprehensive lawn problem diagnosis and treatment plans
 */

import { supabase } from '@/integrations/supabase/client';
import { getTreatmentByName, searchTreatments, type LawnProblemTreatment } from './treatmentDatabase';
import { searchPlant, type FloraPlant } from './floraApi';
import type { 
  LawnAnalysisResult, 
  Diagnosis, 
  TreatmentPlan, 
  Forecast,
  IdentifiedIssue,
  ChemicalTreatment,
  CulturalPractice
} from '@/types/lawn-analysis';

export interface DiagnosisRequest {
  imageBase64: string;
  additionalImages?: string[];
  latitude?: number;
  longitude?: number;
  grassType?: string;
  season?: string;
  location?: string;
}

export interface PlantIdResult {
  source: 'plant_id' | 'fallback' | 'lovable';
  api_version?: string;
  is_plant?: boolean;
  is_healthy?: boolean;
  is_healthy_probability?: number;
  identified_issues: PlantIdIssue[];
  overall_health: 'poor' | 'fair' | 'good' | 'excellent' | 'unknown';
  affected_area_estimate: string;
  raw_identification?: unknown;
  raw_health?: unknown;
  message?: string;
}

export interface PlantIdIssue {
  type: 'disease' | 'insect' | 'weed' | 'nutrient_deficiency' | 'environmental';
  name: string;
  confidence: 'high' | 'medium' | 'low';
  probability: number;
  visual_evidence?: string;
  description: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  alternate_possibilities?: string[];
  scientific_name?: string;
  treatment?: {
    chemical?: string[];
    biological?: string[];
    prevention?: string[];
  };
}

/**
 * Main diagnosis function that orchestrates all API calls
 */
export async function diagnoseLawn(request: DiagnosisRequest): Promise<LawnAnalysisResult> {
  console.log('Starting lawn diagnosis...');
  
  // Use OpenAI directly for lawn-specific diagnosis
  // OpenAI GPT-4o-mini is better for lawn disease/pest/weed identification
  return await analyzeWithAI(request);
}

/**
 * Fallback to existing AI analysis (GPT-4o-mini)
 */
async function analyzeWithAI(request: DiagnosisRequest): Promise<LawnAnalysisResult> {
  console.log('Calling OpenAI analyze-lawn function...');
  
  const { data, error } = await supabase.functions.invoke('analyze-lawn', {
    body: {
      imageBase64: request.imageBase64,
      additionalImages: request.additionalImages,
      grassType: request.grassType,
      season: request.season,
      location: request.location,
      multipleAngles: (request.additionalImages?.length || 0) > 0,
    },
  });

  if (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error(`AI analysis failed: ${error.message}`);
  }

  // Check for API-level errors in the response
  if (data?.error) {
    console.error('OpenAI API error:', data.error);
    throw new Error(data.error);
  }

  // Validate the response has the expected structure
  if (!data || !data.diagnosis || !data.treatment_plan) {
    console.error('Invalid response structure:', data);
    throw new Error('Invalid analysis response - missing diagnosis or treatment plan');
  }

  console.log('OpenAI analysis successful');
  return data as LawnAnalysisResult;
}

/**
 * Enrich Plant.id results with our treatment database
 */
async function enrichWithTreatments(
  plantIdResult: PlantIdResult,
  request: DiagnosisRequest
): Promise<LawnAnalysisResult> {
  
  const identifiedIssues: IdentifiedIssue[] = [];
  const culturalPractices: CulturalPractice[] = [];
  const chemicalTreatments: ChemicalTreatment[] = [];
  const preventionTips: string[] = [];
  const potentialOutbreaks: Array<{ issue: string; likelihood: string; conditions: string }> = [];

  // Process each identified issue
  for (const issue of plantIdResult.identified_issues) {
    // Convert to our IdentifiedIssue format
    const identifiedIssue: IdentifiedIssue = {
      type: issue.type,
      name: issue.name,
      confidence: issue.confidence,
      description: issue.description,
      symptoms: issue.symptoms,
      severity: issue.severity,
      visual_evidence: issue.visual_evidence,
      alternate_possibilities: issue.alternate_possibilities,
    };
    identifiedIssues.push(identifiedIssue);

    // Look up treatment in our database
    const treatment = getTreatmentByName(issue.name);
    
    if (treatment) {
      // Add cultural practices
      for (const organic of treatment.organicTreatments.slice(0, 2)) {
        if (!culturalPractices.some(cp => cp.action === organic.name)) {
          culturalPractices.push({
            action: organic.name,
            timing: organic.timing,
            details: `${organic.applicationMethod}. ${organic.warnings.join('. ')}`,
          });
        }
      }

      // Add chemical treatments
      for (const chemical of treatment.chemicalTreatments.slice(0, 2)) {
        if (!chemicalTreatments.some(ct => ct.active_ingredients.includes(chemical.activeIngredient || ''))) {
          chemicalTreatments.push({
            product_type: mapProductType(treatment.category),
            active_ingredients: chemical.activeIngredient ? [chemical.activeIngredient] : [],
            application_rate: chemical.applicationRate || 'Follow product label',
            application_frequency: chemical.frequency,
            timing: chemical.timing,
            precautions: chemical.warnings,
          });
        }
      }

      // Add prevention tips
      for (const tip of treatment.preventionStrategies) {
        if (!preventionTips.includes(tip)) {
          preventionTips.push(tip);
        }
      }

      // Add potential outbreaks based on seasonal risk
      const currentSeason = getCurrentSeason();
      const risk = treatment.seasonalRisk[currentSeason];
      if (risk === 'high' || risk === 'medium') {
        potentialOutbreaks.push({
          issue: treatment.problemName,
          likelihood: risk === 'high' ? '70-90%' : '40-60%',
          conditions: `Common during ${currentSeason}. ${treatment.bestTreatmentTiming}`,
        });
      }
    } else {
      // Use treatment info from Plant.id API if available
      if (issue.treatment) {
        if (issue.treatment.chemical?.length) {
          chemicalTreatments.push({
            product_type: mapProductType(issue.type),
            active_ingredients: issue.treatment.chemical,
            application_rate: 'Follow product label',
            application_frequency: 'As directed',
            timing: 'When conditions favor disease/pest activity',
            precautions: ['Read and follow all label directions', 'Wear appropriate PPE'],
          });
        }
        if (issue.treatment.prevention?.length) {
          preventionTips.push(...issue.treatment.prevention);
        }
      }
    }

    // Try to get additional plant info from Flora API
    const plantInfo = await searchPlant(issue.name);
    if (plantInfo) {
      // Add context to description
      identifiedIssue.description = `${issue.description} ${
        plantInfo.native_status === 'invasive' ? '(Invasive species - aggressive control recommended)' : ''
      }`;
    }
  }

  // Add general cultural practices if none found
  if (culturalPractices.length === 0) {
    culturalPractices.push({
      action: 'Maintain Proper Mowing Height',
      timing: 'Regular mowing during growing season',
      details: 'Keep grass at 3-4 inches for most cool-season grasses, 2-3 inches for warm-season. Never remove more than 1/3 of blade.',
    });
    culturalPractices.push({
      action: 'Deep, Infrequent Watering',
      timing: 'Early morning (before 10 AM)',
      details: 'Apply 1 inch of water per week, including rainfall. Deep watering encourages deep root growth.',
    });
  }

  // Build the final result
  const diagnosis: Diagnosis = {
    identified_issues: identifiedIssues,
    overall_health: plantIdResult.overall_health === 'unknown' ? 'fair' : plantIdResult.overall_health,
    affected_area_estimate: plantIdResult.affected_area_estimate,
    identification_notes: `Analysis powered by Plant.id API with ${Math.round((plantIdResult.is_healthy_probability || 0.8) * 100)}% health confidence.`,
  };

  const treatmentPlan: TreatmentPlan = {
    cultural_practices: culturalPractices,
    chemical_treatments: chemicalTreatments,
    prevention_tips: preventionTips.slice(0, 5), // Limit to top 5
  };

  const forecast: Forecast = {
    risk_level: calculateRiskLevel(identifiedIssues),
    potential_outbreaks: potentialOutbreaks,
    preventive_measures: preventionTips.slice(0, 3).map(tip => ({
      action: tip,
      timing: 'Within next 2-4 weeks',
      reason: 'Prevents recurrence and spread of identified issues',
    })),
  };

  return {
    diagnosis,
    treatment_plan: treatmentPlan,
    forecast,
  };
}

/**
 * Map issue category to product type
 */
function mapProductType(category: string): 'fungicide' | 'insecticide' | 'herbicide' | 'fertilizer' {
  switch (category) {
    case 'disease': return 'fungicide';
    case 'insect': return 'insecticide';
    case 'weed': return 'herbicide';
    case 'nutrient_deficiency': return 'fertilizer';
    default: return 'herbicide';
  }
}

/**
 * Get current season based on date
 */
function getCurrentSeason(): 'spring' | 'summer' | 'fall' | 'winter' {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'fall';
  return 'winter';
}

/**
 * Calculate overall risk level
 */
function calculateRiskLevel(issues: IdentifiedIssue[]): 'low' | 'medium' | 'high' {
  const severeCount = issues.filter(i => i.severity === 'severe').length;
  const moderateCount = issues.filter(i => i.severity === 'moderate').length;
  
  if (severeCount >= 2 || (severeCount >= 1 && moderateCount >= 2)) return 'high';
  if (severeCount >= 1 || moderateCount >= 2) return 'medium';
  return 'low';
}

/**
 * Quick identification for subscription validation
 */
export async function quickIdentify(imageBase64: string): Promise<{
  hasIssues: boolean;
  previewIssue?: string;
  requiresSubscription: boolean;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('identify-plant', {
      body: {
        imageBase64,
        includeHealth: false, // Quick check only
      },
    });

    if (error || !data) {
      return { hasIssues: false, requiresSubscription: false };
    }

    const issues = data.identified_issues || [];
    const hasIssues = issues.length > 0;
    const previewIssue = hasIssues ? issues[0].name : undefined;

    return {
      hasIssues,
      previewIssue,
      requiresSubscription: hasIssues, // Full details require subscription
    };
  } catch {
    return { hasIssues: false, requiresSubscription: false };
  }
}

/**
 * Get treatment recommendations for a specific problem
 */
export function getTreatmentRecommendations(problemName: string): {
  organic: Array<{ name: string; description: string }>;
  chemical: Array<{ name: string; activeIngredient: string }>;
  prevention: string[];
} | null {
  const treatment = getTreatmentByName(problemName);
  
  if (!treatment) {
    return null;
  }

  return {
    organic: treatment.organicTreatments.map(t => ({
      name: t.name,
      description: `${t.applicationMethod}. Timing: ${t.timing}`,
    })),
    chemical: treatment.chemicalTreatments.map(t => ({
      name: t.name,
      activeIngredient: t.activeIngredient || 'See product label',
    })),
    prevention: treatment.preventionStrategies,
  };
}

