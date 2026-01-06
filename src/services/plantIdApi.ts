/**
 * Plant.id API Service
 * 
 * Provides plant identification, disease detection, and pest identification
 * using the Plant.id API (https://web.plant.id)
 * 
 * Features:
 * - Plant identification with 99% accuracy
 * - Disease detection for lawn problems
 * - Pest identification
 * - Confidence scores for all identifications
 */

export interface PlantIdSuggestion {
  id: number;
  name: string;
  probability: number;
  similar_images?: {
    id: string;
    url: string;
    similarity: number;
  }[];
  details?: {
    common_names?: string[];
    taxonomy?: {
      class?: string;
      family?: string;
      genus?: string;
      kingdom?: string;
      order?: string;
      phylum?: string;
    };
    url?: string;
    description?: {
      value: string;
      citation?: string;
    };
    synonyms?: string[];
    image?: {
      value: string;
    };
    edible_parts?: string[];
    watering?: {
      max?: number;
      min?: number;
    };
    propagation_methods?: string[];
    wiki_description?: {
      value: string;
      citation: string;
    };
  };
}

export interface PlantIdHealthAssessment {
  is_healthy: boolean;
  is_healthy_probability: number;
  diseases?: {
    name: string;
    probability: number;
    disease_details?: {
      local_name?: string;
      description?: string;
      url?: string;
      treatment?: {
        chemical?: string[];
        biological?: string[];
        prevention?: string[];
      };
      cause?: string;
      common_names?: string[];
    };
    similar_images?: {
      id: string;
      url: string;
      similarity: number;
    }[];
  }[];
}

export interface PlantIdResult {
  access_token: string;
  model_version: string;
  custom_id?: string;
  input: {
    latitude?: number;
    longitude?: number;
    similar_images: boolean;
    images: string[];
    datetime: string;
  };
  result: {
    is_plant: {
      binary: boolean;
      threshold: number;
      probability: number;
    };
    classification: {
      suggestions: PlantIdSuggestion[];
    };
    disease?: PlantIdHealthAssessment;
  };
  status: string;
  sla_compliant_client: boolean;
  sla_compliant_system: boolean;
  created: number;
  completed: number;
}

export interface PlantIdRequest {
  images: string[]; // Base64 encoded images
  latitude?: number;
  longitude?: number;
  similar_images?: boolean;
  health?: 'all' | 'only';
  disease_details?: boolean;
}

export interface LawnProblemIdentification {
  type: 'disease' | 'insect' | 'weed' | 'nutrient_deficiency' | 'environmental';
  name: string;
  scientificName?: string;
  confidence: 'high' | 'medium' | 'low';
  probability: number;
  description: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
  visualEvidence?: string;
  alternatePossibilities?: string[];
  treatment?: {
    chemical?: string[];
    biological?: string[];
    prevention?: string[];
  };
}

/**
 * Converts Plant.id API probability to confidence level
 */
function probabilityToConfidence(probability: number): 'high' | 'medium' | 'low' {
  if (probability >= 0.8) return 'high';
  if (probability >= 0.5) return 'medium';
  return 'low';
}

/**
 * Converts probability to severity (for diseases)
 */
function probabilityToSeverity(probability: number): 'mild' | 'moderate' | 'severe' {
  if (probability >= 0.7) return 'severe';
  if (probability >= 0.4) return 'moderate';
  return 'mild';
}

/**
 * Determines if a plant name is a common lawn weed
 */
const COMMON_LAWN_WEEDS = [
  'dandelion', 'crabgrass', 'clover', 'nutsedge', 'plantain', 
  'chickweed', 'henbit', 'spurge', 'thistle', 'oxalis',
  'bindweed', 'knotweed', 'purslane', 'ragweed', 'dollarweed',
  'ground ivy', 'wild violet', 'moss', 'algae'
];

function isLawnWeed(plantName: string): boolean {
  const lowerName = plantName.toLowerCase();
  return COMMON_LAWN_WEEDS.some(weed => lowerName.includes(weed));
}

/**
 * Maps Plant.id diseases to lawn-specific issue types
 */
const LAWN_DISEASES = [
  'brown patch', 'dollar spot', 'rust', 'powdery mildew', 
  'gray leaf spot', 'pythium blight', 'summer patch', 
  'red thread', 'snow mold', 'fairy ring', 'leaf spot',
  'anthracnose', 'take-all patch', 'necrotic ring spot'
];

const LAWN_PESTS = [
  'grub', 'chinch bug', 'sod webworm', 'armyworm', 
  'billbug', 'cutworm', 'crane fly', 'mole cricket',
  'aphid', 'mite', 'nematode'
];

function determineIssueType(name: string, isDisease: boolean): 'disease' | 'insect' | 'weed' | 'nutrient_deficiency' | 'environmental' {
  const lowerName = name.toLowerCase();
  
  if (LAWN_PESTS.some(pest => lowerName.includes(pest))) {
    return 'insect';
  }
  
  if (LAWN_DISEASES.some(disease => lowerName.includes(disease))) {
    return 'disease';
  }
  
  if (isLawnWeed(name)) {
    return 'weed';
  }
  
  if (isDisease) {
    return 'disease';
  }
  
  if (lowerName.includes('deficiency') || lowerName.includes('nitrogen') || lowerName.includes('iron')) {
    return 'nutrient_deficiency';
  }
  
  if (lowerName.includes('drought') || lowerName.includes('heat') || lowerName.includes('cold')) {
    return 'environmental';
  }
  
  return 'weed'; // Default for plant identifications
}

/**
 * Transforms Plant.id API response to our lawn problem format
 */
export function transformPlantIdResult(result: PlantIdResult): LawnProblemIdentification[] {
  const identifications: LawnProblemIdentification[] = [];
  
  // Process plant/weed identifications
  if (result.result.classification?.suggestions) {
    for (const suggestion of result.result.classification.suggestions.slice(0, 3)) {
      if (suggestion.probability < 0.2) continue;
      
      const isWeed = isLawnWeed(suggestion.name);
      
      identifications.push({
        type: isWeed ? 'weed' : determineIssueType(suggestion.name, false),
        name: suggestion.name,
        scientificName: suggestion.details?.taxonomy?.genus 
          ? `${suggestion.details.taxonomy.genus} ${suggestion.name.split(' ')[1] || ''}`.trim()
          : undefined,
        confidence: probabilityToConfidence(suggestion.probability),
        probability: suggestion.probability,
        description: suggestion.details?.wiki_description?.value || 
                    suggestion.details?.description?.value || 
                    `Identified as ${suggestion.name}`,
        symptoms: suggestion.details?.common_names || [suggestion.name],
        severity: isWeed ? probabilityToSeverity(suggestion.probability) : 'mild',
        visualEvidence: `Plant.id matched with ${Math.round(suggestion.probability * 100)}% confidence`,
        alternatePossibilities: result.result.classification.suggestions
          .slice(1, 4)
          .filter(s => s.probability > 0.1)
          .map(s => s.name),
      });
    }
  }
  
  // Process disease/health assessments
  if (result.result.disease?.diseases) {
    for (const disease of result.result.disease.diseases) {
      if (disease.probability < 0.2) continue;
      
      identifications.push({
        type: determineIssueType(disease.name, true),
        name: disease.name,
        confidence: probabilityToConfidence(disease.probability),
        probability: disease.probability,
        description: disease.disease_details?.description || 
                    `${disease.name} detected in lawn`,
        symptoms: disease.disease_details?.common_names || [disease.name],
        severity: probabilityToSeverity(disease.probability),
        visualEvidence: `Health assessment detected with ${Math.round(disease.probability * 100)}% probability`,
        treatment: disease.disease_details?.treatment,
      });
    }
  }
  
  return identifications;
}

/**
 * API configuration for Plant.id
 * Note: API key should be stored securely in environment variables
 */
export const PLANT_ID_CONFIG = {
  baseUrl: 'https://api.plant.id/v3',
  endpoints: {
    identify: '/identification',
    health: '/health_assessment',
  },
  // API key is passed via Supabase Edge Function for security
};

/**
 * Prepares image for Plant.id API (converts to base64 if needed)
 */
export function prepareImageForApi(imageData: string): string {
  if (imageData.startsWith('data:')) {
    // Already base64 with data URI prefix - extract just the base64 part
    const base64Match = imageData.match(/base64,(.+)/);
    return base64Match ? base64Match[1] : imageData;
  }
  return imageData;
}

