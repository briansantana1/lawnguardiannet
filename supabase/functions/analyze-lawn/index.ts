import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const PLANTNET_API_KEY = Deno.env.get('PLANTNET_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Pl@ntNet API integration
interface PlantNetResult {
  success: boolean;
  scientificName?: string;
  commonNames?: string[];
  confidence?: number;
  family?: string;
  genus?: string;
  isWeed?: boolean;
  rawData?: unknown;
  error?: string;
}

async function identifyWithPlantNet(imageBase64: string): Promise<PlantNetResult> {
  if (!PLANTNET_API_KEY) {
    console.log('[PLANTNET] API key not configured, skipping');
    return { success: false, error: 'Pl@ntNet API key not configured' };
  }

  try {
    console.log('[PLANTNET] Starting identification...');
    
    // Convert base64 to blob for form data
    const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    const blob = new Blob([binaryData], { type: 'image/jpeg' });
    
    const formData = new FormData();
    formData.append('images', blob, 'lawn-image.jpg');
    formData.append('organs', 'leaf'); // For lawn weeds, use 'leaf' organ type
    
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
    console.log('[PLANTNET] Response received:', JSON.stringify(data).substring(0, 500));
    
    if (data.results && data.results.length > 0) {
      const topResult = data.results[0];
      const result: PlantNetResult = {
        success: true,
        scientificName: topResult.species?.scientificName || topResult.species?.scientificNameWithoutAuthor,
        commonNames: topResult.species?.commonNames || [],
        confidence: topResult.score,
        family: topResult.species?.family?.scientificName,
        genus: topResult.species?.genus?.scientificName,
        isWeed: true, // Will be verified by Claude
        rawData: data,
      };
      
      console.log('[PLANTNET] Identified:', result.scientificName, 'Confidence:', (result.confidence! * 100).toFixed(1) + '%');
      return result;
    } else {
      console.log('[PLANTNET] No results found');
      return { success: false, error: 'No plant identified in image' };
    }
    
  } catch (error) {
    console.error('[PLANTNET] Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

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
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims) {
      console.error('analyze-lawn: Invalid token:', claimsError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claimsData.claims.sub;
    console.log('analyze-lawn: Authenticated user:', userId);
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      throw new Error('AI API key is not configured');
    }

    const { imageBase64, additionalImages, grassType, season, location, multipleAngles } = await req.json();

    if (!imageBase64) {
      throw new Error('No image provided');
    }

    const totalImages = 1 + (additionalImages?.length || 0);
    console.log('Analyzing lawn with GPT-5-mini...');
    console.log('Total images:', totalImages);
    console.log('Grass type:', grassType || 'Unknown');
    console.log('Season:', season || 'Unknown');
    console.log('Location:', location || 'Unknown');

    // Step 1: Call Pl@ntNet API first for plant/weed identification
    let plantNetResult: PlantNetResult = { success: false };
    let plantNetContext = '';
    
    try {
      plantNetResult = await identifyWithPlantNet(imageBase64);
      
      if (plantNetResult.success && plantNetResult.confidence && plantNetResult.confidence > 0.3) {
        console.log('[PLANTNET] Using Pl@ntNet results for enhanced analysis');
        
        plantNetContext = `
===== PL@NTNET API PRE-IDENTIFICATION =====
A plant identification API (Pl@ntNet) analyzed this image and identified it as:
- Scientific Name: ${plantNetResult.scientificName || 'Unknown'}
- Common Names: ${plantNetResult.commonNames?.join(', ') || 'Unknown'}
- Confidence: ${((plantNetResult.confidence || 0) * 100).toFixed(1)}%
- Family: ${plantNetResult.family || 'Unknown'}
- Genus: ${plantNetResult.genus || 'Unknown'}

Your tasks regarding this pre-identification:
1. Verify if this is a common lawn weed or a grass species
2. If it's a weed, incorporate this identification into your diagnosis with appropriate confidence
3. If it's NOT a weed (like desirable grass, garden plants, or misidentified), note this in your analysis
4. Cross-reference with visual symptoms you observe
5. If Pl@ntNet confidence is below 50%, use your own analysis as primary and Pl@ntNet as supporting data

`;
      } else if (plantNetResult.error) {
        console.log('[PLANTNET] Skipping - Error:', plantNetResult.error);
      }
    } catch (plantNetError) {
      console.error('[PLANTNET] Failed, falling back to AI-only analysis:', plantNetError);
    }

    const systemPrompt = `You are an expert lawn care diagnostician and agronomist with 20+ years of experience specializing in turfgrass diseases, insects, and weeds. Your identifications guide treatment decisions for paid subscribers and MUST be highly accurate.

${multipleAngles ? `MULTI-ANGLE ANALYSIS: You have been provided with ${totalImages} photos from different angles. Use ALL images together to:
- Cross-reference symptoms visible in different photos
- Confirm or rule out diagnoses based on consistent evidence across images
- Identify issues that may only be visible from certain angles
- Increase confidence when the same symptoms appear in multiple photos
- Note any contradictory evidence between photos` : ''}

CRITICAL IDENTIFICATION RULES:
1. NEVER guess - if you cannot clearly see distinguishing features, mark confidence as "low" or state what's needed
2. Require MULTIPLE confirming symptoms before identifying any issue with "high" confidence
3. Consider the season (${season || 'unknown'}) and location (${location || 'unknown'}) - some issues are impossible in certain conditions
4. If image quality or angle prevents accurate ID, explicitly state what additional views would help

===== SYSTEMATIC WEED IDENTIFICATION PROTOCOL =====

When analyzing potential WEEDS, examine these characteristics systematically:

LEAF CHARACTERISTICS:
- Shape: linear, oval, lobed, compound, heart-shaped, spatulate, lanceolate
- Texture: smooth, hairy, waxy, succulent, powdery, glossy
- Arrangement: opposite, alternate, whorled, basal rosette
- Margins: smooth (entire), serrated, lobed, toothed, wavy

GROWTH HABIT:
- Pattern: upright, prostrate, spreading, clumping, mat-forming, climbing
- Height and spread relative to surrounding turf
- Root system if visible: tap root, fibrous, stolons, rhizomes, bulbs

STEM CHARACTERISTICS:
- Cross-section shape: round, square (mints/deadnettle), triangular (sedges), flat
- Texture: smooth, hairy, succulent, ridged
- Color: green, reddish, purplish, with nodes

DISTINCTIVE FEATURES:
- Flowers: color, shape, arrangement (spikes, clusters, solitary)
- Seed heads or fruits: shape, color, dispersal mechanism
- Unique markings: chevron patterns, spots, variegation
- Sap: milky (spurge, dandelion), clear, colored

COMMON WEED IDENTIFICATION KEYS:
- Crabgrass: wide leaf blades, spreading growth, finger-like seed heads, hairy
- Nutsedge: triangular stem ("sedges have edges"), 3-ranked leaves, glossy yellow-green
- Dandelion: basal rosette, deeply lobed leaves pointing backward, milky sap, yellow flowers, puffball seedhead
- Clover: 3-leaflet compound leaves, white/pink flower heads, creeping stems
- Dollarweed: round coin-shaped leaves, scalloped edges, long petiole attached to center of leaf
- Chickweed: opposite leaves, small white star-shaped 5-petal flowers (petals deeply notched), succulent stems
- Henbit: square stems, opposite rounded leaves with scalloped edges, sessile upper leaves clasping stem, tubular pink-purple flowers in whorls, hairy
- Purple Deadnettle: square stems, triangular/heart-shaped leaves with purple-red tint on upper leaves, purple hooded flowers, crowded at top
- Spurge: opposite leaves, milky sap when broken, prostrate/mat-forming growth, reddish stems
- Wild Violet: heart-shaped leaves with scalloped edges, basal rosette pattern, purple/blue/white 5-petal flowers with white throat, thick rhizomes (extremely difficult to control)
- Broadleaf Plantain: large oval/egg-shaped leaves with prominent parallel veins, basal rosette flat to ground, tall rat-tail flower spikes, fibrous root system
- Buckhorn Plantain: narrow lance-shaped ribbed leaves, basal rosette, bullet-shaped flower heads on long stalks, deeply grooved leaves
- Ground Ivy (Creeping Charlie): round/kidney-shaped leaves with scalloped edges, square creeping stems, small funnel-shaped purple flowers, minty odor when crushed
- Oxalis (Wood Sorrel): clover-like 3 heart-shaped leaflets, yellow 5-petal flowers, folds leaves at night, sour taste
- Poa Annua (Annual Bluegrass): light green grass, boat-shaped leaf tips, white seedheads even when mowed short, shallow roots, clumping
- Dallisgrass: coarse clumps, wide leaves, distinctive seed heads with black spots (ergot), grows faster than surrounding turf
- Goosegrass: silvery-white flattened stems at base, radiating spoke-like growth pattern, zipper-like seedheads, tolerates compacted soil

===== SYSTEMATIC DISEASE IDENTIFICATION PROTOCOL =====

When analyzing potential DISEASES, examine these characteristics systematically:

SYMPTOM PATTERN:
- Distribution: circular patches, irregular patches, scattered, uniform decline
- Size and shape of affected areas (measure in inches/feet)
- Pattern of spread: outward rings, random, linear along drainage, clustered

GRASS BLADE SYMPTOMS:
- Discoloration type: yellowing, browning, reddening, bleaching, water-soaked
- Lesion characteristics if present:
  * Shape: oval, diamond, hourglass, irregular
  * Size: pinpoint, 1/4", 1/2", length of blade
  * Color: tan center, brown border, purple margin, gray
  * Borders: defined vs diffuse
- Texture changes: slimy, dry, shriveled, matted, greasy
- Visible fungal structures: cottony mycelium, spores, mushrooms, fruiting bodies

OVERALL TURF CONDITION:
- Time of day indicators (morning dew present = critical for some diseases)
- Thickness of affected turf vs surrounding healthy turf
- Grass dying vs just discolored (pull test - does it detach easily?)
- Root condition if visible (rotted, shortened, discolored)
- Crown condition (firm vs mushy)

ENVIRONMENTAL CLUES:
- Moisture signs: dew, water droplets, matted/wet appearance
- Location: shade vs full sun, low vs high areas
- Air circulation: open vs enclosed by buildings/trees
- Soil visible: compacted, wet, dry

SPECIFIC DISEASE IDENTIFICATION KEYS:

BROWN PATCH (Rhizoctonia solani):
- Circular to irregular patches 6" to several feet diameter
- "Smoke ring" border: dark gray/purple water-soaked margin visible in EARLY MORNING
- Tan/brown outer ring with green grass inside (frog-eye pattern)
- Individual lesions: tan centers with dark brown borders
- Conditions: hot days (80-90°F), warm humid nights (>60°F), high nitrogen
- Most common on: tall fescue, perennial ryegrass, St. Augustine

DOLLAR SPOT (Clarireedia jacksonii):
- Circular patches 2-6 inches (silver dollar to softball size)
- Bleached straw color, may coalesce into larger areas
- DIAGNOSTIC: hourglass-shaped lesions spanning leaf blade width
- Cottony white mycelium visible in morning dew (cobweb-like)
- Conditions: moderate temps (60-85°F), drought stress, low nitrogen
- Most common on: bentgrass, bermudagrass, fine fescues, bluegrass

GRAY LEAF SPOT (Pyricularia grisea):
- Diamond/oval lesions with gray/tan centers
- Dark brown to purple borders with yellow halo
- Twisted, distorted leaf tips in severe cases
- Rapid spread in hot, humid weather
- Conditions: 80-90°F, high humidity, excessive nitrogen
- Most common on: St. Augustine, perennial ryegrass

PYTHIUM BLIGHT (Pythium spp.):
- Irregular, rapidly expanding greasy/water-soaked patches
- Grass matted, slimy, collapsed
- White cottony mycelium in humid conditions (streamer-like)
- Follows drainage patterns, low areas
- Conditions: hot (85°F+), very humid, poor drainage
- CRITICAL: can kill turf in 24 hours

TAKE-ALL ROOT ROT:
- Yellow/chlorotic patches, often irregular
- Roots shortened, dark brown to black
- Stolons/rhizomes darkened
- Grass pulls easily from soil
- Conditions: wet, cool to warm, high pH soils
- Most common on: St. Augustine, bentgrass

SPRING DEAD SPOT (Ophiosphaerella spp.):
- Circular dead patches appearing as bermudagrass breaks dormancy
- Patches remain dead while surrounding grass greens up
- Often same spots year after year
- Roots and stolons dark/rotted
- Conditions: cool fall/spring, stressed bermudagrass

RUST (Puccinia spp.):
- Orange/yellow/brown powdery pustules on leaf blades
- Rubs off on fingers, shoes, mower
- Usually scattered throughout lawn, not patchy
- Conditions: moderate temps, humidity, slow-growing turf

LEAF SPOT/MELTING OUT (Bipolaris/Drechslera):
- Dark purple/brown lesions with tan centers
- Lesions may girdle entire leaf blade
- Can progress to crown rot ("melting out")
- Conditions: cool wet spring, transitioning to hot summer
- Most common on: Kentucky bluegrass, tall fescue, perennial ryegrass

FAIRY RING (Various Basidiomycete fungi):
- Circular or arc-shaped rings/bands in lawn, 3-50+ feet diameter
- THREE TYPES:
  * Type 1: Dead grass band with mushrooms (most damaging - hydrophobic soil layer)
  * Type 2: Dark green stimulated grass ring (nitrogen release from fungal breakdown)
  * Type 3: Mushrooms/puffballs only, no grass symptoms
- Mushrooms or puffballs may appear after rain (not always present)
- Rings expand outward 6-24 inches per year
- Interior grass may appear normal or stressed
- Hydrophobic (water-repellent) soil in Type 1 - water beads up, won't penetrate
- Conditions: any temps when soil moist, organic matter in soil (buried wood, roots)
- DIAGNOSTIC: ring pattern is unmistakable, dig to find white fungal mycelium in soil

RED THREAD (Laetisaria fuciformis):
- Irregular patches 4 inches to 2 feet, pinkish-red cast
- DIAGNOSTIC: red/pink threadlike strands (sclerotia) extending from leaf tips
- Pink cottony flocks of mycelium visible in humid conditions
- Grass blades tan/bleached, often with pink tips
- Grass rarely killed, recovers with fertilization
- Conditions: cool (60-75°F), humid, wet weather, low nitrogen
- Most common on: perennial ryegrass, fine fescues, Kentucky bluegrass
- Often confused with: pink patch (similar but different pathogen)

SUMMER PATCH (Magnaporthe poae):
- Circular to crescent/frog-eye patches 6 inches to 3 feet
- DIAGNOSTIC: "frog-eye" pattern - dead ring with green center (survivor grass)
- Tan/straw colored dead grass, may have reddish-bronze tinge
- Patches often coalesce into irregular shapes
- Roots, crowns, and stolons dark brown to black, rotted
- Disease develops on ROOTS in spring but symptoms appear in SUMMER heat stress
- Conditions: hot humid summer (85°F+), compacted soil, acidic pH, poor drainage
- Most common on: Kentucky bluegrass, fine fescues, annual bluegrass
- Often confused with: necrotic ring spot (cooler temps), brown patch (surface symptoms)

NECROTIC RING SPOT (Ophiosphaerella korrae):
- Similar to summer patch but occurs in COOLER conditions (65-80°F)
- Circular patches with frog-eye pattern
- Roots and crowns blackened, dark runner hyphae on roots
- Most common on: Kentucky bluegrass
- Conditions: cool wet spring/fall, compacted soil

PINK SNOW MOLD (Microdochium nivale):
- Circular patches 1-8 inches, may coalesce
- White to pink mycelium at patch margins
- Bleached tan grass, pink tinge when active
- Does NOT require snow cover (unlike gray snow mold)
- Conditions: cool (32-60°F), wet, late fall through spring
- Most common on: all cool-season grasses

GRAY SNOW MOLD (Typhula spp.):
- Circular gray to straw-colored patches, 6-24 inches
- Matted, crusty grass with gray-white mycelium
- DIAGNOSTIC: small tan/brown sclerotia (hard fungal bodies) on leaves
- Requires extended snow cover (60+ days)
- Conditions: snow on unfrozen ground
- Most common on: all cool-season grasses in northern climates

COMMON DISEASE MISIDENTIFICATION WARNINGS:
- Dormant warm-season grass in winter = NORMAL, NOT disease
- Drought stress vs dollar spot: drought is irregular, lacks lesions
- Brown patch vs large patch: same pathogen, different conditions
- Dog urine spots vs dollar spot: urine has green ring at edge
- Fertilizer burn vs disease: follows application pattern

===== SYSTEMATIC INSECT/PEST IDENTIFICATION PROTOCOL =====

When analyzing potential INSECT damage, examine these characteristics systematically:

IF INSECT IS VISIBLE - Physical Characteristics:
- Size: length in mm (compare to grass blade width ~3-4mm)
- Body shape: C-shaped grub, caterpillar, segmented, oval, elongated
- Segments: distinct head/thorax/abdomen or fused
- Legs: 6 (insect), 0 (larva stage), many (millipede/centipede)
- Wings: present/absent, number, type (membranous, hardened)
- Color and markings: solid, striped, spotted, iridescent
- Life stage: egg, larva/grub, nymph, pupa, adult
- Distinctive features: horns, cerci, prolegs, spines

DAMAGE PATTERN ANALYSIS (when insect not directly visible):

Surface Damage Indicators:
- Chewed grass blades: ragged edges, notched, skeletonized
- Discoloration pattern: yellowing, browning, bleaching
- Distribution: scattered, clustered, expanding patches, trails

Subsurface Damage Indicators:
- Turf lifting like carpet (severed roots)
- Spongy feel when walking
- Easy pull test (grass detaches from soil)
- Visible root damage when examined

Secondary Evidence:
- Frass (insect droppings): color, size, location
- Silk webbing: tunnels, surface mats
- Burrows or mounds: size, soil type ejected
- Animal activity: birds, skunks, raccoons digging

Timing Clues:
- Sudden overnight damage vs gradual decline
- Morning/evening pest activity (many are nocturnal)
- Seasonal patterns

SPECIFIC PEST IDENTIFICATION KEYS:

WHITE GRUBS (Japanese Beetle, June Beetle, European Chafer larvae):
Physical (if visible):
- C-shaped, cream/white body with brown head
- Size: 3/4" to 1.5" depending on species
- 6 small legs near head, legless posterior
- Raster pattern (hair arrangement on rear) distinguishes species
Damage Pattern:
- Irregular brown patches that LIFT LIKE CARPET
- Spongy, detached turf (roots severed)
- Birds (starlings, crows) or mammals (skunks, raccoons) digging
- Worst damage: late summer through fall
Diagnostic Test: Pull back turf, dig 2-4 inches - more than 10 grubs/sq ft = treatment threshold
Grass Susceptibility: All lawn grasses, especially well-irrigated lawns

CHINCH BUGS (Blissus spp.):
Physical:
- Adults: 1/8-1/6" black body with white wings folded flat
- Nymphs: bright red/orange, later black with white band
- Found at thatch layer, scatter when disturbed
Damage Pattern:
- Expanding patches in SUNNY, HOT, DRY areas
- Yellow halo surrounding dead center
- Often starts near sidewalks, driveways (heat islands)
- Damage DOES NOT lift like carpet (roots intact)
Diagnostic Test: Coffee can method - remove both ends, push into turf edge, fill with water - chinch bugs float up within 10 minutes
Most Common On: St. Augustine (Southern chinch bug), fine fescues
Season: Mid-summer through early fall

SOD WEBWORMS (Crambus spp.):
Physical:
- Larvae: 3/4-1" tan/gray caterpillar with brown spots
- Adults: buff/tan moths, snout-nosed, fold wings tight to body
- Moths fly in zigzag pattern at dusk when disturbed
Damage Pattern:
- Small irregular brown patches 1-2" diameter, coalescing
- Grass chewed off at crown level (not pulled)
- RAGGED, notched leaf edges
- Green pellet frass (droppings) visible in thatch
- Silk-lined tunnels in thatch layer
Diagnostic Test: Soapy water drench (2 tbsp dish soap per gallon per sq yard) - larvae emerge within minutes
Season: Multiple generations spring through fall

ARMYWORMS (Spodoptera spp., Mythimna spp.):
Physical:
- Larvae: 1-2" caterpillars, green to brown/black
- Distinctive stripes along body sides
- Smooth skin (no prominent hairs)
- Feed in GROUPS, migrate together
Damage Pattern:
- RAPID damage overnight (army marches through)
- Clean-cut grass blades (like mowing)
- Damage front moves across lawn
- Most active early morning, evening, cloudy days
- Heavy infestations visible during day
Diagnostic Test: Visual inspection at dawn/dusk; soapy water flush
Season: Late summer/fall; more generations in South

BILLBUGS (Sphenophorus spp.):
Physical:
- Adults: 1/4-1/2" brown/black weevils with long snout
- Larvae: white legless grubs, brown head, found in stems/soil
Damage Pattern:
- Small dead patches expand slowly
- Grass stems easily pull out, severed at base
- Fine sawdust-like frass (excrement) at crown
- Dead stems hollow with packed frass
Diagnostic Test: Tug test - stems break at soil line; examine hollow stems
Most Common On: Zoysiagrass, Kentucky bluegrass, fine fescues

MOLE CRICKETS (Neoscapteriscus spp.):
Physical:
- Adults: 1-1.5" brown, velvety, enlarged front legs for digging
- Cricket-like but cannot jump well
- Visible at night, attracted to lights
Damage Pattern:
- Raised tunnels visible (like miniature mole runs)
- Soil feels spongy
- Brown streaks following tunnel patterns
- Severe root damage
Diagnostic Test: Soapy water flush at dusk
Region: Primarily southeastern US coastal areas
Season: Spring tunneling damage; adults most active March-May

CUTWORMS:
Physical:
- Larvae: 1-2" smooth caterpillars, curl into C when disturbed
- Various colors: brown, gray, black, striped
- Nocturnal, hide in soil/thatch during day
Damage Pattern:
- Circular bare spots 1-2" diameter
- Grass cut off at soil level
- Damage scattered (not expanding patches)
Diagnostic Test: Nighttime inspection with flashlight

PEST DIFFERENTIAL DIAGNOSIS:

Brown patches with:
- Turf lifts like carpet → WHITE GRUBS (check by digging)
- Turf firmly attached, sunny areas → CHINCH BUGS
- Ragged leaf edges + frass → SOD WEBWORMS
- Clean-cut leaves, rapid spread → ARMYWORMS
- Hollow stems at base → BILLBUGS
- Spongy tunnels → MOLE CRICKETS

If damage pattern is ambiguous, recommend:
1. Time of day to inspect (dawn/dusk for caterpillars)
2. Soapy water flush test
3. Dig test for grubs (2-4" depth)
4. Coffee can flotation for chinch bugs

===== CONFIDENCE LEVEL REQUIREMENTS =====

HIGH CONFIDENCE requires:
- 3+ confirming characteristics clearly visible${multipleAngles ? ' OR consistent evidence across multiple photos' : ''}
- Season and region appropriate for the issue
- Clear, quality image showing diagnostic features

MEDIUM CONFIDENCE:
- 1-2 characteristics visible
- Some ambiguity in features
- Must list alternate possibilities

LOW CONFIDENCE:
- Limited visible features
- Image quality issues
- Must explain what additional information/angles would help distinguish

For EACH identified issue, you MUST provide:
- "visual_evidence": specific features you observed in THIS image that led to identification
- "alternate_possibilities": if not high confidence, what else could it be and what would distinguish them

Your responses must be in valid JSON format with the following structure:
{
  "diagnosis": {
    "identified_issues": [
      {
        "type": "disease" | "insect" | "weed" | "nutrient_deficiency" | "environmental",
        "name": "specific name of the issue",
        "confidence": "high" | "medium" | "low",
        "confidence_score": 85,  // numeric percentage 0-100 representing your certainty
        "visual_evidence": "specific features observed: e.g., 'observed triangular stem cross-section with 3-ranked leaf arrangement confirming yellow nutsedge'",
        "description": "detailed description of the issue",
        "symptoms": ["list of visible symptoms actually observed in this image"],
        "severity": "mild" | "moderate" | "severe",
        "alternate_possibilities": ["other issues this could be with distinguishing features"]
      }
    ],
    "overall_health": "poor" | "fair" | "good" | "excellent",
    "affected_area_estimate": "percentage or description",
    "identification_notes": "any caveats about the analysis, image quality issues, or what additional angles/information would improve identification"
  },
  "treatment_plan": {
    "cultural_practices": [
      {
        "action": "specific action to take",
        "timing": "when to perform",
        "details": "additional details"
      }
    ],
    "chemical_treatments": [
      {
        "product_type": "fungicide" | "insecticide" | "herbicide" | "fertilizer",
        "active_ingredients": ["list of recommended active ingredients like Azoxystrobin, Propiconazole, Quinclorac, Sulfentrazone, etc."],
        "application_rate": "specific rate per 1,000 sq ft",
        "application_frequency": "how often to apply",
        "timing": "best time to apply",
        "precautions": ["safety precautions"]
      }
    ],
    "prevention_tips": ["list of preventive measures"]
  },
  "forecast": {
    "risk_level": "low" | "medium" | "high",
    "potential_outbreaks": [
      {
        "issue": "name of potential problem",
        "likelihood": "percentage or description",
        "conditions": "environmental conditions that increase risk"
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

${plantNetContext}
Context: Grass type is ${grassType || 'unknown'}, season is ${season || 'unknown'}, location is ${location || 'unknown'}.
If analyzing warm-season grass in winter - brown/dormant appearance is NORMAL and should NOT be diagnosed as disease.
Be specific with chemical recommendations including exact active ingredients, application rates (e.g., 0.2-0.4 oz per 1,000 sq ft for herbicides, 2-4 lbs per 1,000 sq ft for granular products), and frequencies (e.g., every 14-28 days).`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: multipleAngles 
                  ? `Please analyze these ${totalImages} lawn photos from different angles and provide a comprehensive diagnosis, treatment plan, and forecast. Use all images together to cross-reference symptoms and strengthen your diagnosis. The lawn is ${grassType || 'unknown grass type'} in ${location || 'an unknown location'} during ${season || 'an unknown season'}. Respond ONLY with the JSON object, no additional text.`
                  : `Please analyze this lawn image and provide a comprehensive diagnosis, treatment plan, and forecast. The lawn is ${grassType || 'unknown grass type'} in ${location || 'an unknown location'} during ${season || 'an unknown season'}. Respond ONLY with the JSON object, no additional text.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`
                }
              },
              // Include additional images if provided
              ...(additionalImages || []).map((img: string) => ({
                type: 'image_url',
                image_url: {
                  url: img.startsWith('data:') ? img : `data:image/jpeg;base64,${img}`
                }
              }))
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');

    const content = data.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse the JSON from the response
    let analysisResult;
    try {
      // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      analysisResult = JSON.parse(jsonString.trim());
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.log('Raw content:', content);
      throw new Error('Failed to parse analysis results');
    }

    // Add Pl@ntNet identification data to the response
    if (plantNetResult.success && plantNetResult.confidence && plantNetResult.confidence > 0.3) {
      analysisResult.plantnet_identification = {
        scientific_name: plantNetResult.scientificName,
        common_names: plantNetResult.commonNames || [],
        confidence: plantNetResult.confidence,
        family: plantNetResult.family,
        genus: plantNetResult.genus,
        source: 'Pl@ntNet API'
      };
      console.log('[PLANTNET] Added identification to response:', analysisResult.plantnet_identification);
    }

    console.log('Analysis completed successfully');

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
    console.error('Error in analyze-lawn function:', error);
    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: 'Failed to analyze lawn image'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
