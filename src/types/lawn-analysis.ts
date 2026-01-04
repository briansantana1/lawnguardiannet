export interface IdentifiedIssue {
  type: 'disease' | 'insect' | 'weed' | 'nutrient_deficiency' | 'environmental';
  name: string;
  confidence: 'high' | 'medium' | 'low';
  description: string;
  symptoms: string[];
  severity: 'mild' | 'moderate' | 'severe';
}

export interface Diagnosis {
  identified_issues: IdentifiedIssue[];
  overall_health: 'poor' | 'fair' | 'good' | 'excellent';
  affected_area_estimate: string;
}

export interface CulturalPractice {
  action: string;
  timing: string;
  details: string;
}

export interface ChemicalTreatment {
  product_type: 'fungicide' | 'insecticide' | 'herbicide' | 'fertilizer';
  active_ingredients: string[];
  application_rate: string;
  application_frequency: string;
  timing: string;
  precautions: string[];
}

export interface TreatmentPlan {
  cultural_practices: CulturalPractice[];
  chemical_treatments: ChemicalTreatment[];
  prevention_tips: string[];
}

export interface PotentialOutbreak {
  issue: string;
  likelihood: string;
  conditions: string;
}

export interface PreventiveMeasure {
  action: string;
  timing: string;
  reason: string;
}

export interface Forecast {
  risk_level: 'low' | 'medium' | 'high';
  potential_outbreaks: PotentialOutbreak[];
  preventive_measures: PreventiveMeasure[];
}

export interface LawnAnalysisResult {
  diagnosis: Diagnosis;
  treatment_plan: TreatmentPlan;
  forecast: Forecast;
}

export interface SavedTreatmentPlan {
  id: string;
  user_id: string;
  image_url: string | null;
  diagnosis: Diagnosis;
  treatment_plan: TreatmentPlan;
  forecast: Forecast | null;
  grass_type: string | null;
  season: string | null;
  created_at: string;
}
