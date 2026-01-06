/**
 * Flora API Service
 * 
 * Provides detailed plant information from FloraAPI.com
 * Database of 30,000+ plant species with distribution and care data
 * 
 * Free tier: 1,000 API calls/month
 */

export interface FloraPlant {
  id: string;
  scientific_name: string;
  common_names: string[];
  family: string;
  genus: string;
  native_status: 'native' | 'introduced' | 'invasive';
  growth_habit: string;
  duration: 'annual' | 'biennial' | 'perennial';
  distribution: {
    states?: string[];
    countries?: string[];
    native_range?: string;
  };
  characteristics: {
    height_min_ft?: number;
    height_max_ft?: number;
    spread_min_ft?: number;
    spread_max_ft?: number;
    bloom_period?: string[];
    flower_color?: string[];
    leaf_type?: string;
    growth_rate?: 'slow' | 'moderate' | 'fast';
    drought_tolerance?: 'low' | 'medium' | 'high';
    shade_tolerance?: 'full_sun' | 'partial_shade' | 'full_shade';
  };
  toxicity?: {
    toxic_to_humans?: boolean;
    toxic_to_pets?: boolean;
    toxic_parts?: string[];
  };
  wildlife_value?: string[];
  growing_conditions?: {
    soil_type?: string[];
    soil_ph_min?: number;
    soil_ph_max?: number;
    water_requirements?: string;
    usda_zones?: string[];
  };
  image_url?: string;
}

export interface FloraSearchResult {
  total_results: number;
  page: number;
  per_page: number;
  results: FloraPlant[];
}

export interface FloraApiConfig {
  baseUrl: string;
  apiKey?: string;
}

// Common lawn weeds with detailed information (cached locally for fast access)
export const COMMON_LAWN_WEEDS_DATA: Record<string, Partial<FloraPlant>> = {
  'crabgrass': {
    scientific_name: 'Digitaria sanguinalis',
    common_names: ['Crabgrass', 'Hairy Crabgrass', 'Large Crabgrass'],
    family: 'Poaceae',
    native_status: 'introduced',
    growth_habit: 'Graminoid',
    duration: 'annual',
    characteristics: {
      height_max_ft: 2,
      bloom_period: ['July', 'August', 'September'],
      growth_rate: 'fast',
      drought_tolerance: 'high',
    },
  },
  'dandelion': {
    scientific_name: 'Taraxacum officinale',
    common_names: ['Common Dandelion', 'Dandelion', 'Blowball'],
    family: 'Asteraceae',
    native_status: 'introduced',
    growth_habit: 'Forb/herb',
    duration: 'perennial',
    characteristics: {
      height_max_ft: 1,
      bloom_period: ['March', 'April', 'May', 'June'],
      flower_color: ['Yellow'],
      growth_rate: 'fast',
    },
  },
  'clover': {
    scientific_name: 'Trifolium repens',
    common_names: ['White Clover', 'Dutch Clover', 'Ladino Clover'],
    family: 'Fabaceae',
    native_status: 'introduced',
    growth_habit: 'Forb/herb',
    duration: 'perennial',
    characteristics: {
      height_max_ft: 0.5,
      bloom_period: ['May', 'June', 'July', 'August'],
      flower_color: ['White', 'Pink'],
      drought_tolerance: 'medium',
    },
    wildlife_value: ['Pollinator friendly', 'Nitrogen fixer'],
  },
  'nutsedge': {
    scientific_name: 'Cyperus esculentus',
    common_names: ['Yellow Nutsedge', 'Nutgrass', 'Chufa'],
    family: 'Cyperaceae',
    native_status: 'native',
    growth_habit: 'Graminoid',
    duration: 'perennial',
    characteristics: {
      height_max_ft: 2.5,
      bloom_period: ['June', 'July', 'August'],
      growth_rate: 'fast',
    },
  },
  'plantain': {
    scientific_name: 'Plantago major',
    common_names: ['Broadleaf Plantain', 'Common Plantain', 'Greater Plantain'],
    family: 'Plantaginaceae',
    native_status: 'introduced',
    growth_habit: 'Forb/herb',
    duration: 'perennial',
    characteristics: {
      height_max_ft: 1,
      bloom_period: ['May', 'June', 'July', 'August', 'September'],
      drought_tolerance: 'medium',
    },
  },
  'chickweed': {
    scientific_name: 'Stellaria media',
    common_names: ['Common Chickweed', 'Chickenwort', 'Starweed'],
    family: 'Caryophyllaceae',
    native_status: 'introduced',
    growth_habit: 'Forb/herb',
    duration: 'annual',
    characteristics: {
      height_max_ft: 0.5,
      bloom_period: ['February', 'March', 'April', 'May'],
      flower_color: ['White'],
      shade_tolerance: 'partial_shade',
    },
  },
  'henbit': {
    scientific_name: 'Lamium amplexicaule',
    common_names: ['Henbit', 'Henbit Deadnettle', 'Greater Henbit'],
    family: 'Lamiaceae',
    native_status: 'introduced',
    growth_habit: 'Forb/herb',
    duration: 'annual',
    characteristics: {
      height_max_ft: 1,
      bloom_period: ['March', 'April', 'May'],
      flower_color: ['Purple', 'Pink'],
    },
  },
  'spurge': {
    scientific_name: 'Euphorbia maculata',
    common_names: ['Spotted Spurge', 'Prostrate Spurge', 'Milk Purslane'],
    family: 'Euphorbiaceae',
    native_status: 'native',
    growth_habit: 'Forb/herb',
    duration: 'annual',
    characteristics: {
      height_max_ft: 0.25,
      bloom_period: ['June', 'July', 'August', 'September'],
      drought_tolerance: 'high',
    },
    toxicity: {
      toxic_to_humans: true,
      toxic_to_pets: true,
      toxic_parts: ['Sap'],
    },
  },
};

/**
 * Search for plant information by name
 */
export async function searchPlant(
  query: string, 
  state?: string
): Promise<Partial<FloraPlant> | null> {
  // First check our local cache of common lawn weeds
  const lowerQuery = query.toLowerCase();
  
  for (const [key, plant] of Object.entries(COMMON_LAWN_WEEDS_DATA)) {
    if (
      lowerQuery.includes(key) || 
      plant.scientific_name?.toLowerCase().includes(lowerQuery) ||
      plant.common_names?.some(name => name.toLowerCase().includes(lowerQuery))
    ) {
      return plant;
    }
  }
  
  // If not in cache, would call Flora API (via Edge Function for API key security)
  // For now, return null to indicate not found locally
  return null;
}

/**
 * Get detailed plant information by scientific name
 */
export function getPlantByScientificName(scientificName: string): Partial<FloraPlant> | null {
  const lowerName = scientificName.toLowerCase();
  
  for (const plant of Object.values(COMMON_LAWN_WEEDS_DATA)) {
    if (plant.scientific_name?.toLowerCase() === lowerName) {
      return plant;
    }
  }
  
  return null;
}

/**
 * Get distribution status for a plant in a specific state
 */
export function getPlantDistributionStatus(
  plantName: string, 
  state: string
): 'native' | 'introduced' | 'invasive' | 'unknown' {
  const plant = Object.values(COMMON_LAWN_WEEDS_DATA).find(p => 
    p.scientific_name?.toLowerCase().includes(plantName.toLowerCase()) ||
    p.common_names?.some(name => name.toLowerCase().includes(plantName.toLowerCase()))
  );
  
  return plant?.native_status || 'unknown';
}

/**
 * Check if a plant is invasive
 */
export function isInvasivePlant(plantName: string): boolean {
  const plant = Object.values(COMMON_LAWN_WEEDS_DATA).find(p => 
    p.scientific_name?.toLowerCase().includes(plantName.toLowerCase()) ||
    p.common_names?.some(name => name.toLowerCase().includes(plantName.toLowerCase()))
  );
  
  return plant?.native_status === 'invasive';
}

/**
 * Get all common names for a plant
 */
export function getPlantCommonNames(scientificName: string): string[] {
  const plant = getPlantByScientificName(scientificName);
  return plant?.common_names || [];
}

/**
 * Flora API configuration
 * API key should be stored in Supabase Edge Function secrets
 */
export const FLORA_API_CONFIG = {
  baseUrl: 'https://api.floraapi.com/v1',
  endpoints: {
    search: '/search',
    species: '/species',
    distribution: '/distribution',
  },
  freeMonthlyLimit: 1000,
};

