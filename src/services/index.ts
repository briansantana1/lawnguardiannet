/**
 * Services Index
 * 
 * Exports all lawn care diagnostic services
 */

// Main diagnosis service
export { 
  diagnoseLawn, 
  quickIdentify, 
  getTreatmentRecommendations,
  type DiagnosisRequest,
  type PlantIdResult,
  type PlantIdIssue,
} from './lawnDiagnosisService';

// Plant.id API types and utilities
export {
  transformPlantIdResult,
  prepareImageForApi,
  PLANT_ID_CONFIG,
  type PlantIdSuggestion,
  type PlantIdHealthAssessment,
  type PlantIdResult as RawPlantIdResult,
  type PlantIdRequest,
  type LawnProblemIdentification,
} from './plantIdApi';

// Flora API for plant information
export {
  searchPlant,
  getPlantByScientificName,
  getPlantDistributionStatus,
  isInvasivePlant,
  getPlantCommonNames,
  COMMON_LAWN_WEEDS_DATA,
  FLORA_API_CONFIG,
  type FloraPlant,
  type FloraSearchResult,
} from './floraApi';

// Treatment database
export {
  getTreatmentByName,
  getTreatmentsByCategory,
  getSeasonalRisks,
  searchTreatments,
  getTreatmentsForGrassType,
  getPreventionTips,
  getBestTreatmentTiming,
  TREATMENT_DATABASE,
  type TreatmentOption,
  type LawnProblemTreatment,
} from './treatmentDatabase';

