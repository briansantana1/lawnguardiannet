/**
 * Treatment Database
 * 
 * Expert-curated database of lawn problem treatments
 * Includes organic and chemical options with application details
 * 
 * Data sourced from:
 * - University agricultural extensions
 * - USDA plant database
 * - Professional turf management guidelines
 */

export interface TreatmentOption {
  name: string;
  activeIngredient?: string;
  applicationMethod: string;
  applicationRate?: string;
  frequency: string;
  timing: string;
  warnings: string[];
  effectiveness: 'high' | 'medium' | 'low';
  costLevel: 'low' | 'medium' | 'high';
}

export interface LawnProblemTreatment {
  problemName: string;
  scientificName?: string;
  category: 'weed' | 'disease' | 'insect' | 'nutrient_deficiency' | 'environmental';
  description: string;
  identificationTips: string[];
  organicTreatments: TreatmentOption[];
  chemicalTreatments: TreatmentOption[];
  preventionStrategies: string[];
  bestTreatmentTiming: string;
  seasonalRisk: {
    spring: 'low' | 'medium' | 'high';
    summer: 'low' | 'medium' | 'high';
    fall: 'low' | 'medium' | 'high';
    winter: 'low' | 'medium' | 'high';
  };
  grassTypeCompatibility?: string[];
}

// ============================================
// WEED TREATMENTS
// ============================================

const WEED_TREATMENTS: LawnProblemTreatment[] = [
  {
    problemName: 'Crabgrass',
    scientificName: 'Digitaria sanguinalis',
    category: 'weed',
    description: 'Annual grassy weed that spreads rapidly in thin or stressed lawns. Forms low-growing mats with finger-like seed heads.',
    identificationTips: [
      'Coarse, light green to yellowish blades',
      'Grows in a crab-like spreading pattern',
      'Finger-like seed heads in late summer',
      'Thrives in hot, dry conditions',
      'Often found in thin areas of lawn'
    ],
    organicTreatments: [
      {
        name: 'Corn Gluten Meal',
        activeIngredient: 'Corn gluten (9-10% nitrogen)',
        applicationMethod: 'Broadcast spread evenly',
        applicationRate: '20 lbs per 1,000 sq ft',
        frequency: 'Once in early spring, once in fall',
        timing: 'Apply when soil temperature reaches 50-55°F, before seeds germinate',
        warnings: ['Do not apply within 6 weeks of overseeding', 'Not effective on established weeds'],
        effectiveness: 'medium',
        costLevel: 'medium'
      },
      {
        name: 'Hand Pulling',
        applicationMethod: 'Remove entire plant including roots when soil is moist',
        frequency: 'As needed before seed heads form',
        timing: 'Early summer before plants mature',
        warnings: ['Must remove entire root system', 'Time-intensive for large infestations'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Overseeding & Thickening Lawn',
        applicationMethod: 'Overseed thin areas to out-compete weeds',
        applicationRate: '3-4 lbs per 1,000 sq ft',
        frequency: 'Fall and spring',
        timing: 'Fall is best for cool-season grasses',
        warnings: ['Requires consistent watering', 'Takes time to establish'],
        effectiveness: 'medium',
        costLevel: 'low'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Pre-emergent Herbicide',
        activeIngredient: 'Prodiamine, Dithiopyr, or Pendimethalin',
        applicationMethod: 'Broadcast spray or granular application',
        applicationRate: 'Follow product label (typically 0.5-1.5 oz per 1,000 sq ft)',
        frequency: 'Once in early spring, optional split application',
        timing: 'When soil temperature reaches 55°F for 3-5 consecutive days',
        warnings: ['Will prevent grass seed germination', 'Do not aerate after application', 'Keep off lawn 24 hours'],
        effectiveness: 'high',
        costLevel: 'medium'
      },
      {
        name: 'Post-emergent Herbicide',
        activeIngredient: 'Quinclorac or MSMA',
        applicationMethod: 'Spot spray or broadcast application',
        applicationRate: 'Follow product label',
        frequency: 'Up to 2 applications, 2-3 weeks apart',
        timing: 'When crabgrass is young (2-4 tillers)',
        warnings: ['Less effective on mature plants', 'May require multiple applications', 'Avoid application in extreme heat'],
        effectiveness: 'high',
        costLevel: 'medium'
      }
    ],
    preventionStrategies: [
      'Maintain thick, healthy lawn through proper fertilization',
      'Mow at 3-4 inch height to shade soil',
      'Water deeply but infrequently (1 inch per week)',
      'Address bare spots promptly',
      'Apply pre-emergent in early spring before germination'
    ],
    bestTreatmentTiming: 'Pre-emergent in early spring (soil temp 55°F); Post-emergent in early summer when plants are young',
    seasonalRisk: {
      spring: 'high',
      summer: 'high',
      fall: 'low',
      winter: 'low'
    }
  },
  {
    problemName: 'Dandelion',
    scientificName: 'Taraxacum officinale',
    category: 'weed',
    description: 'Perennial broadleaf weed with bright yellow flowers and distinctive white seed heads. Deep taproot makes removal challenging.',
    identificationTips: [
      'Rosette of deeply lobed leaves',
      'Bright yellow flowers on hollow stems',
      'White, fluffy seed heads (puffballs)',
      'Milky sap when stems are broken',
      'Deep taproot (can reach 10+ inches)'
    ],
    organicTreatments: [
      {
        name: 'Hand Digging',
        applicationMethod: 'Use dandelion weeder tool to remove entire taproot',
        frequency: 'As needed, before seed heads form',
        timing: 'After rain when soil is soft',
        warnings: ['Must remove at least 2 inches of taproot', 'Any root fragment can regenerate'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Vinegar Solution',
        activeIngredient: 'Acetic acid (10-20%)',
        applicationMethod: 'Spray directly on weed crown on sunny day',
        frequency: 'Repeat every 2-3 days until dead',
        timing: 'Spring or fall, avoid hot summer days',
        warnings: ['Will damage surrounding grass', 'Non-selective herbicide', 'Multiple applications needed'],
        effectiveness: 'medium',
        costLevel: 'low'
      },
      {
        name: 'Boiling Water',
        applicationMethod: 'Pour directly on weed crown',
        frequency: 'Repeat as needed',
        timing: 'Anytime during growing season',
        warnings: ['Kills all plants it contacts', 'Be careful with hot water'],
        effectiveness: 'low',
        costLevel: 'low'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Broadleaf Herbicide',
        activeIngredient: '2,4-D + Dicamba + MCPP (Trimec)',
        applicationMethod: 'Broadcast spray when actively growing',
        applicationRate: 'Follow product label (typically 1.5 oz per gallon)',
        frequency: '1-2 applications, 4 weeks apart if needed',
        timing: 'Spring or fall when temperatures are 60-80°F',
        warnings: ['Do not apply before rain', 'Keep off lawn 24 hours', 'May damage ornamentals'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Spot Treatment',
        activeIngredient: 'Triclopyr or Fluroxypyr',
        applicationMethod: 'Apply directly to weed with trigger sprayer',
        frequency: 'As needed',
        timing: 'Active growth periods, avoid extreme temperatures',
        warnings: ['More economical for light infestations', 'Follow label directions'],
        effectiveness: 'high',
        costLevel: 'low'
      }
    ],
    preventionStrategies: [
      'Maintain dense turf through proper fertilization',
      'Mow at recommended height for grass type',
      'Remove seed heads before they mature',
      'Apply pre-emergent for broadleaf weeds in fall',
      'Address thin spots before weeds establish'
    ],
    bestTreatmentTiming: 'Fall is ideal (weeds are storing energy in roots); Spring application also effective',
    seasonalRisk: {
      spring: 'high',
      summer: 'medium',
      fall: 'high',
      winter: 'low'
    }
  },
  {
    problemName: 'White Clover',
    scientificName: 'Trifolium repens',
    category: 'weed',
    description: 'Low-growing perennial with three-leaflet leaves and white flower heads. Actually beneficial as nitrogen-fixer but considered a weed in traditional lawns.',
    identificationTips: [
      'Three-leaflet leaves with white V-shaped markings',
      'White to pinkish round flower heads',
      'Creeping stems that root at nodes',
      'Low-growing habit (2-8 inches)',
      'Often indicates low nitrogen in soil'
    ],
    organicTreatments: [
      {
        name: 'Increase Nitrogen Fertilization',
        applicationMethod: 'Apply nitrogen-rich fertilizer',
        applicationRate: '1 lb nitrogen per 1,000 sq ft',
        frequency: '4-5 times per year',
        timing: 'During active grass growth periods',
        warnings: ['Excessive nitrogen can damage grass', 'Test soil first'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Hand Removal',
        applicationMethod: 'Pull clover including stolons and roots',
        frequency: 'As needed',
        timing: 'When soil is moist',
        warnings: ['Stolons break easily and regrow', 'Best for small patches'],
        effectiveness: 'medium',
        costLevel: 'low'
      },
      {
        name: 'Smothering',
        applicationMethod: 'Cover with cardboard or plastic for 4-6 weeks',
        frequency: 'One-time treatment',
        timing: 'During active growth',
        warnings: ['Will kill grass underneath too', 'Requires reseeding afterward'],
        effectiveness: 'high',
        costLevel: 'low'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Broadleaf Herbicide',
        activeIngredient: 'Triclopyr or Dicamba + 2,4-D',
        applicationMethod: 'Broadcast spray or spot treatment',
        applicationRate: 'Follow product label',
        frequency: '1-2 applications, 2-4 weeks apart',
        timing: 'Spring or fall, when clover is actively growing',
        warnings: ['May require multiple applications', 'Avoid application near water features'],
        effectiveness: 'high',
        costLevel: 'low'
      }
    ],
    preventionStrategies: [
      'Maintain adequate soil nitrogen levels',
      'Test soil and correct nutrient deficiencies',
      'Keep lawn thick through proper care',
      'Mow at correct height for grass type',
      'Consider leaving clover if organic lawn is desired (nitrogen fixer)'
    ],
    bestTreatmentTiming: 'Fall herbicide application; Increase nitrogen fertilization in spring',
    seasonalRisk: {
      spring: 'high',
      summer: 'medium',
      fall: 'medium',
      winter: 'low'
    }
  },
  {
    problemName: 'Nutsedge',
    scientificName: 'Cyperus esculentus',
    category: 'weed',
    description: 'Aggressive sedge (not a grass) with triangular stems and underground tubers (nutlets). Extremely difficult to control once established.',
    identificationTips: [
      'Triangular stems ("sedges have edges")',
      'Lighter green/yellowish color than lawn grass',
      'Grows faster and taller than surrounding grass',
      'Yellowish-brown seed heads',
      'Produces underground tubers (nutlets)'
    ],
    organicTreatments: [
      {
        name: 'Persistent Mowing',
        applicationMethod: 'Mow regularly to weaken plants',
        frequency: 'Weekly during growing season',
        timing: 'Throughout summer',
        warnings: ['Takes multiple seasons', 'Will not eliminate mature plants'],
        effectiveness: 'low',
        costLevel: 'low'
      },
      {
        name: 'Improve Drainage',
        applicationMethod: 'Address wet areas where nutsedge thrives',
        frequency: 'One-time improvement',
        timing: 'Any time',
        warnings: ['May require professional landscaping', 'Nutsedge thrives in wet soil'],
        effectiveness: 'medium',
        costLevel: 'high'
      },
      {
        name: 'Hand Removal',
        applicationMethod: 'Dig out plants including tubers (6+ inches deep)',
        frequency: 'Multiple times as new shoots appear',
        timing: 'When soil is moist',
        warnings: ['Must remove all tubers or they will regrow', 'Very labor intensive'],
        effectiveness: 'low',
        costLevel: 'low'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Sulfentrazone Herbicide',
        activeIngredient: 'Sulfentrazone (Dismiss)',
        applicationMethod: 'Broadcast spray',
        applicationRate: 'Follow product label (typically 0.25 oz per 1,000 sq ft)',
        frequency: '2 applications, 6-10 weeks apart',
        timing: 'Late spring to early summer when actively growing',
        warnings: ['Most effective selective nutsedge control', 'May cause temporary yellowing'],
        effectiveness: 'high',
        costLevel: 'medium'
      },
      {
        name: 'Halosulfuron Herbicide',
        activeIngredient: 'Halosulfuron-methyl (Sedgehammer)',
        applicationMethod: 'Broadcast spray',
        applicationRate: 'Follow product label',
        frequency: '1-2 applications',
        timing: 'When nutsedge is 6-8 inches tall',
        warnings: ['Works slowly (2-3 weeks to show effects)', 'Very effective on yellow nutsedge'],
        effectiveness: 'high',
        costLevel: 'medium'
      }
    ],
    preventionStrategies: [
      'Improve drainage in wet areas',
      'Maintain thick, healthy lawn',
      'Address infestations early before tubers spread',
      'Clean mowing equipment to prevent spread',
      'Do not water excessively'
    ],
    bestTreatmentTiming: 'Late spring when nutsedge is actively growing; Multiple applications typically needed',
    seasonalRisk: {
      spring: 'medium',
      summer: 'high',
      fall: 'low',
      winter: 'low'
    }
  }
];

// ============================================
// DISEASE TREATMENTS
// ============================================

const DISEASE_TREATMENTS: LawnProblemTreatment[] = [
  {
    problemName: 'Brown Patch',
    scientificName: 'Rhizoctonia solani',
    category: 'disease',
    description: 'Fungal disease causing circular brown patches. Most common in humid conditions with warm nights. Primarily affects tall fescue and perennial ryegrass.',
    identificationTips: [
      'Circular patches 6 inches to several feet in diameter',
      '"Smoke ring" border of grayish-brown grass at patch edge (early morning)',
      'Leaves pull easily from sheaths',
      'Patches may have green grass in center ("frog-eye")',
      'Occurs during hot, humid weather (night temps above 65°F)'
    ],
    organicTreatments: [
      {
        name: 'Improve Air Circulation',
        applicationMethod: 'Core aerate and reduce thatch',
        frequency: 'Once in fall',
        timing: 'Early fall when temperatures cool',
        warnings: ['Will not cure active infection', 'Preventive measure'],
        effectiveness: 'medium',
        costLevel: 'medium'
      },
      {
        name: 'Reduce Nitrogen',
        applicationMethod: 'Avoid fertilizing during hot, humid periods',
        frequency: 'Adjust seasonal fertilization',
        timing: 'Late spring through summer',
        warnings: ['Excess nitrogen promotes disease', 'Use slow-release fertilizers'],
        effectiveness: 'medium',
        costLevel: 'low'
      },
      {
        name: 'Water Management',
        applicationMethod: 'Water early morning only, deeply but infrequently',
        frequency: 'Adjust watering schedule',
        timing: 'Complete watering before 10 AM',
        warnings: ['Evening watering promotes disease', 'Allow soil to dry between waterings'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Neem Oil',
        activeIngredient: 'Azadirachtin',
        applicationMethod: 'Spray affected areas',
        applicationRate: '2-4 tablespoons per gallon',
        frequency: 'Every 7-14 days',
        timing: 'Early morning or evening',
        warnings: ['May need multiple applications', 'Less effective than fungicides'],
        effectiveness: 'low',
        costLevel: 'low'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Contact Fungicide',
        activeIngredient: 'Azoxystrobin (Heritage)',
        applicationMethod: 'Broadcast spray',
        applicationRate: '0.2-0.4 oz per 1,000 sq ft',
        frequency: 'Every 14-28 days during high-risk periods',
        timing: 'Preventively before symptoms appear or at first sign',
        warnings: ['Rotate with different fungicide class', 'Water in lightly'],
        effectiveness: 'high',
        costLevel: 'high'
      },
      {
        name: 'Systemic Fungicide',
        activeIngredient: 'Propiconazole (Banner Maxx)',
        applicationMethod: 'Broadcast spray',
        applicationRate: '1-2 oz per 1,000 sq ft',
        frequency: 'Every 14-21 days',
        timing: 'At first sign of disease or preventively',
        warnings: ['Systemic protection lasts longer', 'Follow label directions'],
        effectiveness: 'high',
        costLevel: 'high'
      }
    ],
    preventionStrategies: [
      'Water in early morning only (before 10 AM)',
      'Avoid excessive nitrogen during summer',
      'Improve air circulation by pruning nearby shrubs',
      'Reduce thatch layer through core aeration',
      'Use disease-resistant grass varieties when overseeding',
      'Maintain proper mowing height'
    ],
    bestTreatmentTiming: 'Preventive fungicide before hot, humid weather; Curative at first sign of disease',
    seasonalRisk: {
      spring: 'low',
      summer: 'high',
      fall: 'medium',
      winter: 'low'
    },
    grassTypeCompatibility: ['Tall Fescue', 'Perennial Ryegrass', 'St. Augustine', 'Bentgrass']
  },
  {
    problemName: 'Dollar Spot',
    scientificName: 'Clarireedia jacksonii',
    category: 'disease',
    description: 'Fungal disease causing small, silver-dollar-sized spots. Associated with low nitrogen and drought stress. Common on many grass types.',
    identificationTips: [
      'Small, round spots about 2-6 inches in diameter',
      'Tan to straw-colored spots with reddish-brown borders',
      'Cobweb-like mycelium visible in early morning dew',
      'Hourglass-shaped lesions on individual blades',
      'Spots may merge into larger irregular areas'
    ],
    organicTreatments: [
      {
        name: 'Increase Nitrogen Fertilization',
        applicationMethod: 'Apply balanced fertilizer',
        applicationRate: '0.5-1 lb nitrogen per 1,000 sq ft',
        frequency: 'Monthly during growing season',
        timing: 'Throughout growing season',
        warnings: ['Low nitrogen promotes dollar spot', 'Use slow-release sources'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Morning Dew Removal',
        applicationMethod: 'Drag hose or pole across lawn to remove dew',
        frequency: 'Daily during disease pressure',
        timing: 'Early morning before 9 AM',
        warnings: ['Reduces prolonged leaf wetness', 'Labor intensive'],
        effectiveness: 'medium',
        costLevel: 'low'
      },
      {
        name: 'Compost Top-Dressing',
        applicationMethod: 'Apply thin layer of compost',
        applicationRate: '1/4 inch layer',
        frequency: '1-2 times per year',
        timing: 'Spring or fall',
        warnings: ['Introduces beneficial microbes', 'Improves soil health'],
        effectiveness: 'medium',
        costLevel: 'medium'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Contact Fungicide',
        activeIngredient: 'Thiophanate-methyl (Cleary 3336)',
        applicationMethod: 'Broadcast spray',
        applicationRate: '2-4 oz per 1,000 sq ft',
        frequency: 'Every 14-21 days',
        timing: 'At first sign of disease',
        warnings: ['Rotate fungicide classes to prevent resistance', 'Follow label rates'],
        effectiveness: 'high',
        costLevel: 'medium'
      },
      {
        name: 'DMI Fungicide',
        activeIngredient: 'Myclobutanil or Propiconazole',
        applicationMethod: 'Broadcast spray',
        applicationRate: 'Follow product label',
        frequency: 'Every 14-28 days',
        timing: 'Preventively or curatively',
        warnings: ['Good systemic activity', 'May cause growth regulation in some grasses'],
        effectiveness: 'high',
        costLevel: 'medium'
      }
    ],
    preventionStrategies: [
      'Maintain adequate nitrogen fertility',
      'Water deeply and infrequently in early morning',
      'Reduce thatch accumulation',
      'Improve air circulation',
      'Use resistant grass varieties',
      'Avoid drought stress'
    ],
    bestTreatmentTiming: 'Increase nitrogen at first signs; Fungicide when conditions favor disease',
    seasonalRisk: {
      spring: 'medium',
      summer: 'high',
      fall: 'medium',
      winter: 'low'
    }
  },
  {
    problemName: 'Gray Leaf Spot',
    scientificName: 'Pyricularia grisea',
    category: 'disease',
    description: 'Fungal disease primarily affecting St. Augustine and perennial ryegrass. Causes gray, water-soaked lesions that can rapidly kill grass.',
    identificationTips: [
      'Gray or tan lesions with dark brown borders',
      'Lesions are oval or elongated (up to 1/4 inch)',
      'Twisted, withered grass blades in severe cases',
      'Yellow halos around lesions',
      'Rapid spread during hot, humid weather'
    ],
    organicTreatments: [
      {
        name: 'Reduce Nitrogen',
        applicationMethod: 'Avoid nitrogen fertilization during outbreaks',
        frequency: 'During disease pressure periods',
        timing: 'Late summer when disease is common',
        warnings: ['High nitrogen promotes disease', 'Resume normal feeding when conditions improve'],
        effectiveness: 'medium',
        costLevel: 'low'
      },
      {
        name: 'Improve Drainage',
        applicationMethod: 'Address wet areas, core aerate',
        frequency: 'As needed',
        timing: 'Fall for cool-season; Spring for warm-season',
        warnings: ['Excessive moisture promotes disease'],
        effectiveness: 'medium',
        costLevel: 'medium'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Strobilurin Fungicide',
        activeIngredient: 'Azoxystrobin or Pyraclostrobin',
        applicationMethod: 'Broadcast spray',
        applicationRate: '0.2-0.9 oz per 1,000 sq ft',
        frequency: 'Every 14-21 days',
        timing: 'Preventively before hot, humid weather',
        warnings: ['Best applied preventively', 'Rotate with different class'],
        effectiveness: 'high',
        costLevel: 'high'
      },
      {
        name: 'Combination Fungicide',
        activeIngredient: 'Thiophanate-methyl + Azoxystrobin',
        applicationMethod: 'Broadcast spray',
        applicationRate: 'Follow product label',
        frequency: 'Every 14-21 days during disease pressure',
        timing: 'At first sign or preventively',
        warnings: ['Provides broader spectrum control'],
        effectiveness: 'high',
        costLevel: 'high'
      }
    ],
    preventionStrategies: [
      'Avoid excessive nitrogen during hot weather',
      'Water early morning only',
      'Plant resistant grass varieties',
      'Improve air circulation',
      'Avoid mowing when grass is wet'
    ],
    bestTreatmentTiming: 'Preventive fungicide before conditions favor disease; Reduce nitrogen during outbreaks',
    seasonalRisk: {
      spring: 'low',
      summer: 'high',
      fall: 'medium',
      winter: 'low'
    },
    grassTypeCompatibility: ['St. Augustine', 'Perennial Ryegrass', 'Tall Fescue']
  }
];

// ============================================
// INSECT TREATMENTS
// ============================================

const INSECT_TREATMENTS: LawnProblemTreatment[] = [
  {
    problemName: 'White Grubs',
    scientificName: 'Various (Phyllophaga, Popillia japonica)',
    category: 'insect',
    description: 'Larvae of various beetles that feed on grass roots. Cause dead patches that pull up easily. Most damaging in late summer to fall.',
    identificationTips: [
      'C-shaped white larvae with brown heads',
      'Found in soil under damaged turf',
      'Damaged areas feel spongy and pull up like carpet',
      'Birds, skunks, or moles digging in lawn',
      'Dead patches that don\'t respond to watering'
    ],
    organicTreatments: [
      {
        name: 'Milky Spore Disease',
        activeIngredient: 'Bacillus popilliae',
        applicationMethod: 'Apply granules in grid pattern',
        applicationRate: '1 teaspoon per 4 sq ft',
        frequency: 'One-time application',
        timing: 'Late summer or early fall when grubs are present',
        warnings: ['Takes 1-3 years to establish', 'Only affects Japanese beetle grubs'],
        effectiveness: 'high',
        costLevel: 'medium'
      },
      {
        name: 'Beneficial Nematodes',
        activeIngredient: 'Heterorhabditis bacteriophora',
        applicationMethod: 'Mix with water and spray on lawn',
        applicationRate: 'Follow product label (usually 10 million per 200-400 sq ft)',
        frequency: '1-2 applications per season',
        timing: 'Late afternoon when soil is moist, temps 60-80°F',
        warnings: ['Apply when grubs are young', 'Keep soil moist after application'],
        effectiveness: 'high',
        costLevel: 'medium'
      },
      {
        name: 'Neem Oil Soil Drench',
        activeIngredient: 'Azadirachtin',
        applicationMethod: 'Mix with water and apply to soil',
        applicationRate: '2-4 oz per gallon per 1,000 sq ft',
        frequency: 'Every 2-3 weeks during grub season',
        timing: 'When grubs are young (July-August)',
        warnings: ['Disrupts insect growth hormones', 'Less effective on mature grubs'],
        effectiveness: 'medium',
        costLevel: 'low'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Preventive Grub Control',
        activeIngredient: 'Chlorantraniliprole (Acelepryn) or Imidacloprid',
        applicationMethod: 'Broadcast granular and water in',
        applicationRate: 'Follow product label',
        frequency: 'Once per year',
        timing: 'Late spring to early summer (May-July) before eggs hatch',
        warnings: ['Apply before grubs are present', 'Water in immediately'],
        effectiveness: 'high',
        costLevel: 'medium'
      },
      {
        name: 'Curative Grub Control',
        activeIngredient: 'Trichlorfon (Dylox) or Carbaryl (Sevin)',
        applicationMethod: 'Broadcast granular and water in heavily',
        applicationRate: 'Follow product label',
        frequency: 'As needed',
        timing: 'When grubs are found and damage is occurring',
        warnings: ['Must water in immediately', 'Works on active grubs only'],
        effectiveness: 'high',
        costLevel: 'low'
      }
    ],
    preventionStrategies: [
      'Apply preventive treatment in late spring/early summer',
      'Keep lawn healthy to withstand some grub damage',
      'Let lawn go partially dormant during drought (grubs prefer moist soil)',
      'Reduce irrigation in summer when adult beetles are laying eggs',
      'Use milky spore for long-term Japanese beetle control'
    ],
    bestTreatmentTiming: 'Preventive: May-July; Curative: August-September when damage is visible',
    seasonalRisk: {
      spring: 'low',
      summer: 'medium',
      fall: 'high',
      winter: 'low'
    }
  },
  {
    problemName: 'Chinch Bugs',
    scientificName: 'Blissus leucopterus',
    category: 'insect',
    description: 'Tiny insects that suck sap from grass blades, injecting toxic saliva. Cause expanding patches of yellowing, then brown grass. Most active in hot, dry conditions.',
    identificationTips: [
      'Very small bugs (1/8-1/5 inch) with black bodies',
      'Adults have white wings with black triangular markings',
      'Red-orange nymphs visible in thatch',
      'Damage starts as yellowing patches, spreads outward',
      'Damage often appears first in sunny, hot areas near pavement'
    ],
    organicTreatments: [
      {
        name: 'Diatomaceous Earth',
        activeIngredient: 'Diatomaceous earth (food grade)',
        applicationMethod: 'Dust over affected areas',
        applicationRate: '2 lbs per 1,000 sq ft',
        frequency: 'Reapply after rain',
        timing: 'When chinch bugs are present',
        warnings: ['Physical mode of action', 'Reapply after moisture'],
        effectiveness: 'medium',
        costLevel: 'low'
      },
      {
        name: 'Beauveria bassiana',
        activeIngredient: 'Beauveria bassiana fungus',
        applicationMethod: 'Mix with water and spray',
        applicationRate: 'Follow product label',
        frequency: 'Every 7-14 days',
        timing: 'When chinch bugs are present',
        warnings: ['Biological insecticide', 'Works slowly'],
        effectiveness: 'medium',
        costLevel: 'medium'
      },
      {
        name: 'Soap Flush Detection',
        applicationMethod: 'Mix 1 oz dish soap in gallon of water, pour on suspect area',
        frequency: 'As needed for detection',
        timing: 'When damage is suspected',
        warnings: ['Brings chinch bugs to surface for counting', 'Not a treatment'],
        effectiveness: 'low',
        costLevel: 'low'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Pyrethroid Insecticide',
        activeIngredient: 'Bifenthrin or Cyfluthrin',
        applicationMethod: 'Broadcast spray or granular',
        applicationRate: 'Follow product label',
        frequency: '1-2 applications',
        timing: 'When chinch bugs are detected',
        warnings: ['Water in granules lightly', 'Apply in late afternoon'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Systemic Insecticide',
        activeIngredient: 'Clothianidin or Imidacloprid',
        applicationMethod: 'Broadcast granular and water in',
        applicationRate: 'Follow product label',
        frequency: 'Once per season',
        timing: 'Preventively or at first sign of damage',
        warnings: ['Provides longer residual control', 'Water in thoroughly'],
        effectiveness: 'high',
        costLevel: 'medium'
      }
    ],
    preventionStrategies: [
      'Maintain proper watering during drought',
      'Reduce thatch buildup (chinch bugs live in thatch)',
      'Use endophyte-enhanced grass varieties',
      'Avoid excessive nitrogen fertilization',
      'Keep lawn healthy and not drought-stressed'
    ],
    bestTreatmentTiming: 'Treat as soon as damage is detected; June-August is peak activity',
    seasonalRisk: {
      spring: 'low',
      summer: 'high',
      fall: 'low',
      winter: 'low'
    },
    grassTypeCompatibility: ['St. Augustine', 'Kentucky Bluegrass', 'Perennial Ryegrass', 'Fine Fescue']
  },
  {
    problemName: 'Sod Webworm',
    scientificName: 'Crambus spp.',
    category: 'insect',
    description: 'Larvae of lawn moths that feed on grass blades at night. Create irregular brown patches with silken tunnels in thatch. Most active in summer.',
    identificationTips: [
      'Small tan moths flying in zigzag pattern at dusk',
      'Cream to green caterpillars (3/4 inch) with dark spots',
      'Silken tunnels in thatch layer',
      'Grass blades chewed off at soil level',
      'Birds feeding intensively on lawn'
    ],
    organicTreatments: [
      {
        name: 'Bacillus thuringiensis (Bt)',
        activeIngredient: 'Bacillus thuringiensis var. kurstaki',
        applicationMethod: 'Mix with water and spray in late afternoon',
        applicationRate: 'Follow product label',
        frequency: 'Every 7-10 days while caterpillars are present',
        timing: 'When caterpillars are small',
        warnings: ['Must be ingested by larvae', 'Apply in evening when larvae are feeding'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Beneficial Nematodes',
        activeIngredient: 'Steinernema carpocapsae',
        applicationMethod: 'Mix with water and apply to lawn',
        applicationRate: 'Follow product label',
        frequency: '1-2 applications',
        timing: 'When soil temps are above 60°F',
        warnings: ['Apply in evening', 'Keep soil moist after application'],
        effectiveness: 'high',
        costLevel: 'medium'
      }
    ],
    chemicalTreatments: [
      {
        name: 'Pyrethroid Insecticide',
        activeIngredient: 'Bifenthrin, Lambda-cyhalothrin, or Cyfluthrin',
        applicationMethod: 'Broadcast spray in late afternoon',
        applicationRate: 'Follow product label',
        frequency: '1-2 applications, 2-3 weeks apart',
        timing: 'When damage is detected, apply in evening',
        warnings: ['Apply when larvae are active (evening)', 'Do not water in immediately'],
        effectiveness: 'high',
        costLevel: 'low'
      },
      {
        name: 'Carbaryl (Sevin)',
        activeIngredient: 'Carbaryl',
        applicationMethod: 'Broadcast spray or granular',
        applicationRate: 'Follow product label',
        frequency: 'As needed',
        timing: 'Evening application',
        warnings: ['Effective contact insecticide', 'Harmful to bees'],
        effectiveness: 'high',
        costLevel: 'low'
      }
    ],
    preventionStrategies: [
      'Maintain healthy lawn that can recover from minor damage',
      'Use endophyte-enhanced grass varieties',
      'Avoid excessive nitrogen (promotes succulent growth)',
      'Reduce thatch buildup',
      'Encourage natural predators (birds, parasitic wasps)'
    ],
    bestTreatmentTiming: 'Treat in evening when larvae are actively feeding; June-August is peak activity',
    seasonalRisk: {
      spring: 'low',
      summer: 'high',
      fall: 'medium',
      winter: 'low'
    }
  }
];

// ============================================
// COMBINED DATABASE
// ============================================

export const TREATMENT_DATABASE: LawnProblemTreatment[] = [
  ...WEED_TREATMENTS,
  ...DISEASE_TREATMENTS,
  ...INSECT_TREATMENTS,
];

// ============================================
// LOOKUP FUNCTIONS
// ============================================

/**
 * Find treatment information by problem name
 */
export function getTreatmentByName(problemName: string): LawnProblemTreatment | null {
  const lowerName = problemName.toLowerCase();
  
  return TREATMENT_DATABASE.find(treatment => 
    treatment.problemName.toLowerCase().includes(lowerName) ||
    treatment.scientificName?.toLowerCase().includes(lowerName)
  ) || null;
}

/**
 * Find treatments by category
 */
export function getTreatmentsByCategory(category: LawnProblemTreatment['category']): LawnProblemTreatment[] {
  return TREATMENT_DATABASE.filter(treatment => treatment.category === category);
}

/**
 * Get seasonal risks for all problems
 */
export function getSeasonalRisks(season: 'spring' | 'summer' | 'fall' | 'winter'): LawnProblemTreatment[] {
  return TREATMENT_DATABASE.filter(treatment => 
    treatment.seasonalRisk[season] === 'high' || treatment.seasonalRisk[season] === 'medium'
  );
}

/**
 * Find treatment by partial match
 */
export function searchTreatments(query: string): LawnProblemTreatment[] {
  const lowerQuery = query.toLowerCase();
  
  return TREATMENT_DATABASE.filter(treatment => 
    treatment.problemName.toLowerCase().includes(lowerQuery) ||
    treatment.scientificName?.toLowerCase().includes(lowerQuery) ||
    treatment.description.toLowerCase().includes(lowerQuery) ||
    treatment.identificationTips.some(tip => tip.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Get treatment compatibility with grass type
 */
export function getTreatmentsForGrassType(grassType: string): LawnProblemTreatment[] {
  const lowerGrass = grassType.toLowerCase();
  
  return TREATMENT_DATABASE.filter(treatment => 
    !treatment.grassTypeCompatibility || 
    treatment.grassTypeCompatibility.some(grass => 
      grass.toLowerCase().includes(lowerGrass) || lowerGrass.includes(grass.toLowerCase())
    )
  );
}

/**
 * Get quick prevention tips for a problem
 */
export function getPreventionTips(problemName: string): string[] {
  const treatment = getTreatmentByName(problemName);
  return treatment?.preventionStrategies || [];
}

/**
 * Get best treatment timing
 */
export function getBestTreatmentTiming(problemName: string): string {
  const treatment = getTreatmentByName(problemName);
  return treatment?.bestTreatmentTiming || 'Consult local extension office for timing recommendations';
}

