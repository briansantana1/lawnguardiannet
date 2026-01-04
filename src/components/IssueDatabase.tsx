import { useState } from "react";
import { AlertTriangle, Bug, Leaf, CircleDot, ChevronRight, Search, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TreatmentModal, type LawnIssue } from "./TreatmentModal";

// Geographic regions with common issues
const regions = [
  { value: "all", label: "All Regions" },
  { value: "northeast", label: "Northeast US" },
  { value: "southeast", label: "Southeast US" },
  { value: "midwest", label: "Midwest US" },
  { value: "southwest", label: "Southwest US" },
  { value: "northwest", label: "Pacific Northwest" },
  { value: "california", label: "California" },
  { value: "texas", label: "Texas" },
  { value: "florida", label: "Florida" },
];

const issues = [
  // ===== DISEASES =====
  {
    id: 1,
    name: "Brown Patch",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Circular patches", "Brown grass blades", "Water-soaked look"],
    description: "A fungal disease that thrives in hot, humid conditions. Common in cool-season grasses.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Propiconazole (1-2 oz/1,000 sq ft)"],
    regions: ["southeast", "midwest", "northeast", "texas"],
  },
  {
    id: 2,
    name: "Gray Leaf Spot",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Gray spots on leaves", "Brown lesions", "Twisted leaf tips"],
    description: "Fungal disease causing gray-brown spots with dark borders, common in St. Augustine and perennial ryegrass.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Thiophanate-methyl (4 oz/1,000 sq ft)"],
    regions: ["southeast", "texas", "florida", "california"],
  },
  {
    id: 3,
    name: "Dollar Spot",
    type: "disease",
    icon: CircleDot,
    severity: "medium",
    symptoms: ["Small circular spots", "Straw-colored patches", "Hourglass lesions"],
    description: "Creates silver-dollar sized dead spots in lawns. Thrives in low nitrogen conditions and excess moisture.",
    activeIngredients: ["Propiconazole (1-2 oz/1,000 sq ft)", "Boscalid (0.28 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "southeast", "northwest"],
  },
  {
    id: 4,
    name: "Pythium Blight",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Greasy appearance", "Cottony mycelium", "Rapid wilting"],
    description: "Fast-spreading water mold that can destroy large areas overnight in hot, humid weather.",
    activeIngredients: ["Mefenoxam (1-2 oz/1,000 sq ft)", "Fosetyl-Al (4-8 oz/1,000 sq ft)"],
    regions: ["southeast", "midwest", "northeast", "florida"],
  },
  {
    id: 5,
    name: "Red Thread",
    type: "disease",
    icon: CircleDot,
    severity: "low",
    symptoms: ["Pink-red threads", "Irregular patches", "Bleached grass tips"],
    description: "Produces distinctive red threadlike growths on grass blades. Common in cool, wet conditions with low nitrogen.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Chlorothalonil (3-5 oz/1,000 sq ft)"],
    regions: ["northwest", "northeast", "midwest", "california"],
  },
  {
    id: 6,
    name: "Rust",
    type: "disease",
    icon: CircleDot,
    severity: "low",
    symptoms: ["Orange-yellow powder", "Rust-colored blades", "Thinning turf"],
    description: "Fungal disease leaving orange spores that rub off on shoes and mowers. Common in late summer.",
    activeIngredients: ["Propiconazole (1-2 oz/1,000 sq ft)", "Triadimefon (1 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "northwest"],
  },
  {
    id: 7,
    name: "Powdery Mildew",
    type: "disease",
    icon: CircleDot,
    severity: "low",
    symptoms: ["White powder coating", "Yellowing leaves", "Shaded areas affected"],
    description: "White powdery fungus on grass blades, typically in shaded areas with poor air circulation.",
    activeIngredients: ["Myclobutanil (0.5 oz/1,000 sq ft)", "Triadimefon (1 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest", "california"],
  },
  {
    id: 8,
    name: "Snow Mold",
    type: "disease",
    icon: CircleDot,
    severity: "medium",
    symptoms: ["Matted grass", "Circular gray/pink patches", "Web-like growth"],
    description: "Appears after snow melts, creating matted circular patches. Gray snow mold is more common than pink.",
    activeIngredients: ["Chlorothalonil (3-5 oz/1,000 sq ft)", "PCNB (6-8 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest"],
  },
  {
    id: 9,
    name: "Fairy Ring",
    type: "disease",
    icon: CircleDot,
    severity: "medium",
    symptoms: ["Dark green rings", "Mushroom circles", "Dead grass bands"],
    description: "Creates distinctive rings of dark green grass or mushrooms caused by soil-borne fungi.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Flutolanil (2-4 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "northwest", "california"],
  },
  {
    id: 10,
    name: "Take-All Root Rot",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Yellow patches", "Thin roots", "Black root sheaths"],
    description: "Attacks grass roots causing yellowing and death. Common in St. Augustine grass during rainy periods.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Myclobutanil (0.5 oz/1,000 sq ft)"],
    regions: ["texas", "florida", "southeast"],
  },
  {
    id: 11,
    name: "Large Patch",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Orange-tan patches", "Leaf sheath rot", "Circular patterns"],
    description: "Major disease of warm-season grasses causing large circular dead areas in spring and fall.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Propiconazole (1-2 oz/1,000 sq ft)"],
    regions: ["southeast", "texas", "florida", "california"],
  },
  {
    id: 12,
    name: "Summer Patch",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Crescent-shaped patches", "Frog-eye pattern", "Wilted grass"],
    description: "Root rot disease causing circular or crescent-shaped patches with healthy grass in the center.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Propiconazole (1-2 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest"],
  },
  {
    id: 13,
    name: "Necrotic Ring Spot",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Ring-shaped dead areas", "Sunken patches", "Black roots"],
    description: "Causes distinctive ring patterns with dead grass and healthy centers. Common in Kentucky bluegrass.",
    activeIngredients: ["Thiophanate-methyl (4 oz/1,000 sq ft)", "Azoxystrobin (0.38 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "northwest"],
  },
  {
    id: 14,
    name: "Leaf Spot/Melting Out",
    type: "disease",
    icon: CircleDot,
    severity: "medium",
    symptoms: ["Purple-brown spots", "Tan lesions", "Thinning turf"],
    description: "Starts as leaf spots then progresses to crown and root rot ('melting out') in stressed lawns.",
    activeIngredients: ["Chlorothalonil (3-5 oz/1,000 sq ft)", "Mancozeb (4-6 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "northwest", "california"],
  },
  {
    id: 15,
    name: "Spring Dead Spot",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Circular dead patches", "Bleached straw color", "Slow recovery"],
    description: "Causes circular dead areas in bermudagrass that appear as lawns green up in spring.",
    activeIngredients: ["Tebuconazole (1 oz/1,000 sq ft)", "Fenarimol (1-2 oz/1,000 sq ft)"],
    regions: ["texas", "southeast", "southwest", "california"],
  },

  // ===== INSECTS =====
  {
    id: 16,
    name: "White Grubs",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Spongy turf", "Dead patches", "Birds/animals digging"],
    description: "White grubs feed on grass roots, causing turf to die and become easily pulled up.",
    activeIngredients: ["Imidacloprid (0.6 oz/1,000 sq ft)", "Chlorantraniliprole (0.46 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "southeast", "northwest"],
  },
  {
    id: 17,
    name: "Chinch Bugs",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Yellowing patches", "Drought-like stress", "Expanding dead areas"],
    description: "Tiny insects that suck plant juices and inject toxins, causing expanding irregular dead patches.",
    activeIngredients: ["Bifenthrin (0.25-0.5 oz/1,000 sq ft)", "Trichlorfon (4-8 oz/1,000 sq ft)"],
    regions: ["texas", "florida", "southeast", "midwest"],
  },
  {
    id: 18,
    name: "Sod Webworms",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Irregular brown patches", "Chewed grass blades", "Moths flying at dusk"],
    description: "Caterpillars that feed on grass blades at night, leaving ragged, chewed edges and brown patches.",
    activeIngredients: ["Bacillus thuringiensis (1-2 oz/1,000 sq ft)", "Bifenthrin (0.25-0.5 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "southeast", "california"],
  },
  {
    id: 19,
    name: "Fall Armyworms",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Rapidly spreading damage", "Completely eaten areas", "Visible caterpillars"],
    description: "Destructive caterpillars that march across lawns in large numbers, consuming grass to the soil.",
    activeIngredients: ["Bifenthrin (0.25-0.5 oz/1,000 sq ft)", "Carbaryl (3-6 oz/1,000 sq ft)"],
    regions: ["texas", "southeast", "florida", "southwest"],
  },
  {
    id: 20,
    name: "Mole Crickets",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Tunneling damage", "Spongy soil", "Uprooted grass"],
    description: "Tunnel through soil eating roots and stems, leaving raised tunnels and dying grass above.",
    activeIngredients: ["Bifenthrin (0.25-0.5 oz/1,000 sq ft)", "Fipronil (0.06 oz/1,000 sq ft)"],
    regions: ["florida", "southeast", "texas"],
  },
  {
    id: 21,
    name: "Billbugs",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Sawdust-like frass", "Easy grass pull-up", "Brown irregular patches"],
    description: "Weevil larvae bore into grass stems and crowns, leaving sawdust-like debris at the base.",
    activeIngredients: ["Imidacloprid (0.6 oz/1,000 sq ft)", "Bifenthrin (0.25-0.5 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "northwest", "california"],
  },
  {
    id: 22,
    name: "Fire Ants",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Mound formation", "Painful stings", "Bare patches around mounds"],
    description: "Build large mounds in lawns and deliver painful stings. Damage grass around nest areas.",
    activeIngredients: ["Hydramethylnon (bait)", "Spinosad (bait)"],
    regions: ["texas", "florida", "southeast", "southwest"],
  },
  {
    id: 23,
    name: "Cutworms",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Cut grass at soil level", "Circular dead spots", "Night feeding damage"],
    description: "Nocturnal caterpillars that cut grass stems at soil level, creating small dead patches.",
    activeIngredients: ["Carbaryl (3-6 oz/1,000 sq ft)", "Bifenthrin (0.25-0.5 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "southeast", "california"],
  },
  {
    id: 24,
    name: "Japanese Beetles",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Skeletonized leaves", "Grub damage to roots", "Metallic beetles visible"],
    description: "Adults feed on ornamentals while larvae (white grubs) destroy turf roots underground.",
    activeIngredients: ["Imidacloprid (0.6 oz/1,000 sq ft)", "Carbaryl (3-6 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "southeast"],
  },
  {
    id: 25,
    name: "European Crane Fly",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Yellowing patches", "Leathery gray larvae", "Thin turf in spring"],
    description: "Larvae (leatherjackets) feed on grass roots and crowns, causing thinning and bare patches.",
    activeIngredients: ["Imidacloprid (0.6 oz/1,000 sq ft)", "Bifenthrin (0.25-0.5 oz/1,000 sq ft)"],
    regions: ["northwest", "northeast", "california"],
  },
  {
    id: 26,
    name: "Spittlebugs",
    type: "insect",
    icon: Bug,
    severity: "low",
    symptoms: ["Frothy masses on stems", "Stunted growth", "Yellowing grass"],
    description: "Nymphs produce frothy spittle masses on grass stems while feeding on plant juices.",
    activeIngredients: ["Bifenthrin (0.25-0.5 oz/1,000 sq ft)", "Carbaryl (3-6 oz/1,000 sq ft)"],
    regions: ["southeast", "texas", "florida"],
  },
  {
    id: 27,
    name: "Bermudagrass Mite",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Rosette/witches broom growth", "Shortened internodes", "Tufted appearance"],
    description: "Microscopic mites cause distinctive rosette or witches broom growth patterns in bermudagrass.",
    activeIngredients: ["Abamectin (0.15 oz/1,000 sq ft)", "Diazinon (where legal)"],
    regions: ["texas", "southwest", "california", "florida"],
  },

  // ===== WEEDS =====
  {
    id: 28,
    name: "Crabgrass",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Coarse texture", "Light green color", "Spreading growth"],
    description: "An annual grassy weed that thrives in thin, weak lawns and hot temperatures.",
    activeIngredients: ["Quinclorac (post)", "Dithiopyr (pre-emergent)"],
    regions: ["northeast", "midwest", "southeast", "texas", "california"],
  },
  {
    id: 29,
    name: "Dandelion",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Yellow flowers", "Fluffy seed heads", "Rosette leaves"],
    description: "Common broadleaf perennial with deep taproots. Yellow flowers mature into white puffball seed heads.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Triclopyr (0.5-1 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest", "california"],
  },
  {
    id: 30,
    name: "White Clover",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Three-leaf clusters", "White flowers", "Creeping stems"],
    description: "Low-growing perennial with distinctive three-leaflet pattern. Actually fixes nitrogen in soil.",
    activeIngredients: ["Triclopyr (0.5-1 oz/1,000 sq ft)", "Fluroxypyr (0.18 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest", "southeast"],
  },
  {
    id: 31,
    name: "Yellow Nutsedge",
    type: "weed",
    icon: Leaf,
    severity: "high",
    symptoms: ["Triangular stems", "Rapid growth", "Yellow-green color"],
    description: "Aggressive sedge (not a grass) that grows faster than turf and has distinctive triangular stems.",
    activeIngredients: ["Halosulfuron (0.024 oz/1,000 sq ft)", "Sulfentrazone (0.18 oz/1,000 sq ft)"],
    regions: ["southeast", "texas", "florida", "california", "midwest"],
  },
  {
    id: 32,
    name: "Purple Nutsedge",
    type: "weed",
    icon: Leaf,
    severity: "high",
    symptoms: ["Dark green blades", "Purple seed heads", "Tuber chains"],
    description: "More aggressive than yellow nutsedge, spreads via interconnected tubers that make control difficult.",
    activeIngredients: ["Halosulfuron (0.024 oz/1,000 sq ft)", "Imazaquin (0.38 oz/1,000 sq ft)"],
    regions: ["florida", "texas", "southeast", "california"],
  },
  {
    id: 33,
    name: "Chickweed",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Small white flowers", "Mat-forming growth", "Cool-season appearance"],
    description: "Low-growing annual that thrives in cool, moist conditions. Forms dense mats in thin turf.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Dicamba (0.25-0.5 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest", "california"],
  },
  {
    id: 34,
    name: "Henbit",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Purple flowers", "Square stems", "Scalloped leaves"],
    description: "Winter annual with distinctive purple tubular flowers and square stems. Common in early spring.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Triclopyr (0.5-1 oz/1,000 sq ft)"],
    regions: ["midwest", "southeast", "texas", "northeast"],
  },
  {
    id: 35,
    name: "Broadleaf Plantain",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Oval leaves", "Prominent veins", "Rosette growth"],
    description: "Broadleaf perennial with ribbed leaves growing in a rosette pattern. Tolerates compacted soil.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "MCPP (1-1.5 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest", "california"],
  },
  {
    id: 36,
    name: "Ground Ivy (Creeping Charlie)",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Creeping stems", "Round scalloped leaves", "Minty smell"],
    description: "Aggressive spreading perennial that thrives in shady, moist areas. Very difficult to control.",
    activeIngredients: ["Triclopyr (0.5-1 oz/1,000 sq ft)", "Dicamba (0.25-0.5 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "northwest"],
  },
  {
    id: 37,
    name: "Wild Violet",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Heart-shaped leaves", "Purple/white flowers", "Waxy leaf coating"],
    description: "Difficult-to-control perennial with waxy leaves that resist herbicides. Spreads by seed and rhizomes.",
    activeIngredients: ["Triclopyr (0.5-1 oz/1,000 sq ft)", "Fluroxypyr (0.18 oz/1,000 sq ft)"],
    regions: ["northeast", "midwest", "southeast"],
  },
  {
    id: 38,
    name: "Goosegrass",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Flat rosette growth", "White center", "Tough wiry stems"],
    description: "Annual grassy weed similar to crabgrass but grows flat with a distinctive white center.",
    activeIngredients: ["Metribuzin (0.25 oz/1,000 sq ft)", "Oxadiazon (pre-emergent)"],
    regions: ["southeast", "texas", "florida", "california"],
  },
  {
    id: 39,
    name: "Dallisgrass",
    type: "weed",
    icon: Leaf,
    severity: "high",
    symptoms: ["Coarse clumps", "Tall seed heads", "Rhizome spreading"],
    description: "Aggressive perennial grassy weed that forms unsightly clumps and is very difficult to control.",
    activeIngredients: ["MSMA (where legal)", "Glyphosate (spot treatment)"],
    regions: ["texas", "southeast", "california", "florida"],
  },
  {
    id: 40,
    name: "Spotted Spurge",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Mat-forming", "Milky sap", "Red spot on leaves"],
    description: "Low-growing annual that forms dense mats. Produces milky sap and has distinctive red leaf spots.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Dicamba (0.25-0.5 oz/1,000 sq ft)"],
    regions: ["texas", "california", "southwest", "southeast"],
  },
  {
    id: 41,
    name: "Annual Bluegrass (Poa annua)",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Light green color", "White seed heads", "Clumpy growth"],
    description: "Cool-season annual grass that invades lawns, producing prolific seeds and dying in summer heat.",
    activeIngredients: ["Prodiamine (pre-emergent)", "Ethofumesate (1-2 oz/1,000 sq ft)"],
    regions: ["california", "northwest", "northeast", "southeast"],
  },
  {
    id: 42,
    name: "Doveweed",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Glossy leaves", "Thick fleshy stems", "Mat-forming"],
    description: "Summer annual with thick, fleshy stems that thrives in moist, warm conditions.",
    activeIngredients: ["Atrazine (where legal)", "Sulfentrazone (0.18 oz/1,000 sq ft)"],
    regions: ["florida", "southeast", "texas"],
  },
  {
    id: 43,
    name: "Torpedograss",
    type: "weed",
    icon: Leaf,
    severity: "high",
    symptoms: ["Sharp pointed tips", "Extensive rhizomes", "Aggressive spread"],
    description: "Extremely aggressive perennial grass with sharp-tipped leaves. Nearly impossible to eradicate.",
    activeIngredients: ["Glyphosate (spot treatment)", "Sethoxydim (1.5 oz/1,000 sq ft)"],
    regions: ["florida", "southeast", "texas"],
  },
  {
    id: 44,
    name: "Oxalis (Yellow Woodsorrel)",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Clover-like leaves", "Yellow flowers", "Heart-shaped leaflets"],
    description: "Often confused with clover, oxalis has heart-shaped leaflets and produces small yellow flowers.",
    activeIngredients: ["Triclopyr (0.5-1 oz/1,000 sq ft)", "Sulfentrazone (0.18 oz/1,000 sq ft)"],
    regions: ["california", "southeast", "texas", "florida"],
  },
  {
    id: 45,
    name: "Poa Trivialis (Rough Bluegrass)",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Light green streaks", "Stoloniferous growth", "Dies in summer"],
    description: "Cool-season grass that appears as light green patches, spreading by stolons and dying in heat.",
    activeIngredients: ["Glyphosate (spot treatment)", "Tenacity (mesotrione)"],
    regions: ["northeast", "midwest", "northwest"],
  },
  {
    id: 46,
    name: "Black Medic",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Three leaflets", "Yellow flower clusters", "Black seed pods"],
    description: "Annual legume resembling clover with yellow flowers that develop into black kidney-shaped seeds.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Triclopyr (0.5-1 oz/1,000 sq ft)"],
    regions: ["midwest", "northeast", "northwest", "california"],
  },
  {
    id: 47,
    name: "Kyllinga",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Resembles grass", "Globular seed heads", "Rapid spread"],
    description: "Sedge that resembles turf but spreads aggressively via rhizomes. Often mistaken for grass.",
    activeIngredients: ["Halosulfuron (0.024 oz/1,000 sq ft)", "Sulfentrazone (0.18 oz/1,000 sq ft)"],
    regions: ["southeast", "texas", "florida", "california"],
  },
  {
    id: 48,
    name: "Bahiagrass",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Y-shaped seed heads", "Coarse texture", "Clumpy growth"],
    description: "Perennial grass considered a weed in most lawns due to its coarse texture and tall seed stalks.",
    activeIngredients: ["Metsulfuron (0.025 oz/1,000 sq ft)", "Imazaquin (0.38 oz/1,000 sq ft)"],
    regions: ["florida", "southeast", "texas"],
  },
  {
    id: 49,
    name: "Lawn Burweed (Stickers)",
    type: "weed",
    icon: Leaf,
    severity: "high",
    symptoms: ["Low growing", "Painful spiny seeds", "Carrot-like leaves"],
    description: "Winter annual producing painful spiny seeds (stickers) that make lawns unusable in late spring.",
    activeIngredients: ["Atrazine (where legal)", "2,4-D + Dicamba (pre-emergence)"],
    regions: ["florida", "texas", "southeast"],
  },
  {
    id: 50,
    name: "Chamberbitter",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Fern-like appearance", "Small round seeds", "Upright growth"],
    description: "Summer annual with distinctive fern-like leaves and small round seed capsules underneath.",
    activeIngredients: ["Atrazine (where legal)", "2,4-D (1-2 oz/1,000 sq ft)"],
    regions: ["florida", "southeast", "texas"],
  },
];

const severityColors = {
  high: "bg-alert/10 text-alert border-alert",
  medium: "bg-warning/10 text-warning border-warning",
  low: "bg-primary/10 text-primary border-primary",
};

const typeIcons = {
  disease: CircleDot,
  insect: Bug,
  weed: Leaf,
};

type FilterType = "disease" | "insect" | "weed";

export function IssueDatabase() {
  const [activeFilter, setActiveFilter] = useState<FilterType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedIssue, setSelectedIssue] = useState<LawnIssue | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewTreatment = (issue: typeof issues[0]) => {
    setSelectedIssue(issue as LawnIssue);
    setModalOpen(true);
  };

  const filters: { label: string; value: FilterType; icon?: typeof CircleDot }[] = [
    { label: "Diseases", value: "disease", icon: CircleDot },
    { label: "Insects", value: "insect", icon: Bug },
    { label: "Weeds", value: "weed", icon: Leaf },
  ];

  // Filter issues by region and search, then limit to 5 per category
  const getFilteredIssues = () => {
    const query = searchQuery.toLowerCase().trim();
    
    const filterByRegionAndSearch = (issue: typeof issues[0]) => {
      const matchesRegion = selectedRegion === "all" || issue.regions.includes(selectedRegion);
      const matchesSearch = query === "" || 
        issue.name.toLowerCase().includes(query) ||
        issue.description.toLowerCase().includes(query) ||
        issue.symptoms.some(symptom => symptom.toLowerCase().includes(query));
      return matchesRegion && matchesSearch;
    };

    // Get 5 of each category
    const diseases = issues.filter(i => i.type === "disease" && filterByRegionAndSearch(i)).slice(0, 5);
    const insects = issues.filter(i => i.type === "insect" && filterByRegionAndSearch(i)).slice(0, 5);
    const weeds = issues.filter(i => i.type === "weed" && filterByRegionAndSearch(i)).slice(0, 5);

    // Filter by active type if selected
    if (activeFilter === "disease") return diseases;
    if (activeFilter === "insect") return insects;
    if (activeFilter === "weed") return weeds;
    
    // No filter selected - show all categories
    return [...diseases, ...insects, ...weeds];
  };

  const filteredIssues = getFilteredIssues();

  return (
    <section id="issues" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Common Lawn Issues
          </h2>
          <p className="text-muted-foreground text-lg">
            Browse our searchable database of diseases, weeds, and insects.
            Filter by symptoms or location to find your problem fast.
          </p>
        </div>

        {/* Location Filter */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select your region" />
              </SelectTrigger>
              <SelectContent>
                {regions.map((region) => (
                  <SelectItem key={region.value} value={region.value}>
                    {region.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(activeFilter === filter.value ? null : filter.value)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                activeFilter === filter.value
                  ? "bg-primary text-primary-foreground shadow-lawn"
                  : "bg-lawn-100 text-foreground hover:bg-lawn-200"
              }`}
            >
              {filter.icon && <filter.icon className="w-4 h-4" />}
              {filter.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <form
            className="relative"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <input
              type="search"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search lawn issues by symptom"
              placeholder="Search by symptom"
              className="w-full h-14 px-6 pr-14 rounded-2xl border border-lawn-200 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />

            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl hover:bg-lawn-100 transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-muted-foreground" />
            </button>
          </form>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            {searchQuery.trim() || selectedRegion !== "all"
              ? `Showing ${filteredIssues.length} of ${issues.length} issues`
              : `Showing ${filteredIssues.length} of ${issues.length}`}
          </p>
        </div>

        {/* Issues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIssues.length > 0 ? (
            filteredIssues.map((issue) => {
              const TypeIcon = typeIcons[issue.type as keyof typeof typeIcons];
              return (
                <Card key={issue.id} variant="issue" className="group cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-lawn-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <TypeIcon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{issue.name}</CardTitle>
                          <span className="text-xs text-muted-foreground capitalize">
                            {issue.type}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          severityColors[issue.severity as keyof typeof severityColors]
                        }`}
                      >
                        {issue.severity}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {issue.description}
                    </p>

                    {/* Symptoms */}
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-foreground mb-2">
                        Symptoms:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {issue.symptoms.map((symptom) => (
                          <span
                            key={symptom}
                            className="px-2 py-1 rounded-lg bg-lawn-100 text-xs text-foreground"
                          >
                            {symptom}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Treatment Preview */}
                    <div className="pt-4 border-t border-lawn-100">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-between"
                        onClick={() => handleViewTreatment(issue)}
                      >
                        View Treatment
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">
                No issues found matching your search.
              </p>
              <Button 
                variant="ghost" 
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter(null);
                  setSelectedRegion("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>


        {/* Treatment Modal */}
        <TreatmentModal
          issue={selectedIssue}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </div>
    </section>
  );
}
