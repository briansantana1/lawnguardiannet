import { useState } from "react";
import { AlertTriangle, Bug, Leaf, CircleDot, ChevronRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TreatmentModal, type LawnIssue } from "./TreatmentModal";

const issues = [
  // ===== DISEASES =====
  {
    id: 1,
    name: "Brown Patch",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Circular patches", "Brown grass blades", "Water-soaked look"],
    description:
      "A fungal disease that thrives in hot, humid conditions. Common in cool-season grasses.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Propiconazole (1-2 oz/1,000 sq ft)"],
  },
  {
    id: 2,
    name: "Gray Leaf Spot",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Gray spots on leaves", "Brown lesions", "Twisted leaf tips"],
    description:
      "Fungal disease causing gray-brown spots with dark borders, common in St. Augustine and perennial ryegrass.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Thiophanate-methyl (4 oz/1,000 sq ft)"],
  },
  {
    id: 3,
    name: "Dollar Spot",
    type: "disease",
    icon: CircleDot,
    severity: "medium",
    symptoms: ["Small circular spots", "Straw-colored patches", "Hourglass lesions"],
    description:
      "Creates silver-dollar sized dead spots in lawns. Thrives in low nitrogen conditions and excess moisture.",
    activeIngredients: ["Propiconazole (1-2 oz/1,000 sq ft)", "Boscalid (0.28 oz/1,000 sq ft)"],
  },
  {
    id: 4,
    name: "Pythium Blight",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Greasy appearance", "Cottony mycelium", "Rapid wilting"],
    description:
      "Fast-spreading water mold that can destroy large areas overnight in hot, humid weather.",
    activeIngredients: ["Mefenoxam (1-2 oz/1,000 sq ft)", "Fosetyl-Al (4-8 oz/1,000 sq ft)"],
  },
  {
    id: 5,
    name: "Red Thread",
    type: "disease",
    icon: CircleDot,
    severity: "low",
    symptoms: ["Pink-red threads", "Irregular patches", "Bleached grass tips"],
    description:
      "Produces distinctive red threadlike growths on grass blades. Common in cool, wet conditions with low nitrogen.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Chlorothalonil (3-5 oz/1,000 sq ft)"],
  },
  {
    id: 6,
    name: "Rust",
    type: "disease",
    icon: CircleDot,
    severity: "low",
    symptoms: ["Orange-yellow powder", "Rust-colored blades", "Thinning turf"],
    description:
      "Fungal disease leaving orange spores that rub off on shoes and mowers. Common in late summer.",
    activeIngredients: ["Propiconazole (1-2 oz/1,000 sq ft)", "Triadimefon (1 oz/1,000 sq ft)"],
  },
  {
    id: 7,
    name: "Powdery Mildew",
    type: "disease",
    icon: CircleDot,
    severity: "low",
    symptoms: ["White powder coating", "Yellowing leaves", "Shaded areas affected"],
    description:
      "White powdery fungus on grass blades, typically in shaded areas with poor air circulation.",
    activeIngredients: ["Myclobutanil (0.5 oz/1,000 sq ft)", "Triadimefon (1 oz/1,000 sq ft)"],
  },
  {
    id: 8,
    name: "Snow Mold",
    type: "disease",
    icon: CircleDot,
    severity: "medium",
    symptoms: ["Matted grass", "Circular gray/pink patches", "Web-like growth"],
    description:
      "Appears after snow melts, creating matted circular patches. Gray snow mold is more common than pink.",
    activeIngredients: ["Chlorothalonil (3-5 oz/1,000 sq ft)", "PCNB (6-8 oz/1,000 sq ft)"],
  },
  {
    id: 9,
    name: "Fairy Ring",
    type: "disease",
    icon: CircleDot,
    severity: "medium",
    symptoms: ["Dark green rings", "Mushroom circles", "Dead grass bands"],
    description:
      "Creates distinctive rings of dark green grass or mushrooms caused by soil-borne fungi.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Flutolanil (2-4 oz/1,000 sq ft)"],
  },
  {
    id: 10,
    name: "Take-All Root Rot",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Yellow patches", "Thin roots", "Black root sheaths"],
    description:
      "Attacks grass roots causing yellowing and death. Common in St. Augustine grass during rainy periods.",
    activeIngredients: ["Azoxystrobin (0.38 oz/1,000 sq ft)", "Myclobutanil (0.5 oz/1,000 sq ft)"],
  },

  // ===== INSECTS =====
  {
    id: 11,
    name: "Grub Damage",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Spongy turf", "Dead patches", "Birds/animals digging"],
    description:
      "White grubs feed on grass roots, causing turf to die and become easily pulled up.",
    activeIngredients: ["Imidacloprid (0.6 oz/1,000 sq ft)", "Chlorantraniliprole (0.46 oz/1,000 sq ft)"],
  },
  {
    id: 12,
    name: "Chinch Bugs",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Yellowing patches", "Drought-like stress", "Expanding dead areas"],
    description:
      "Tiny insects that suck plant juices and inject toxins, causing expanding irregular dead patches.",
    activeIngredients: ["Bifenthrin (0.25-0.5 oz/1,000 sq ft)", "Trichlorfon (4-8 oz/1,000 sq ft)"],
  },
  {
    id: 13,
    name: "Sod Webworms",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Irregular brown patches", "Chewed grass blades", "Moths flying at dusk"],
    description:
      "Caterpillars that feed on grass blades at night, leaving ragged, chewed edges and brown patches.",
    activeIngredients: ["Bacillus thuringiensis (1-2 oz/1,000 sq ft)", "Bifenthrin (0.25-0.5 oz/1,000 sq ft)"],
  },
  {
    id: 14,
    name: "Armyworms",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Rapidly spreading damage", "Completely eaten areas", "Visible caterpillars"],
    description:
      "Destructive caterpillars that march across lawns in large numbers, consuming grass to the soil.",
    activeIngredients: ["Bifenthrin (0.25-0.5 oz/1,000 sq ft)", "Carbaryl (3-6 oz/1,000 sq ft)"],
  },
  {
    id: 15,
    name: "Mole Crickets",
    type: "insect",
    icon: Bug,
    severity: "high",
    symptoms: ["Tunneling damage", "Spongy soil", "Uprooted grass"],
    description:
      "Tunnel through soil eating roots and stems, leaving raised tunnels and dying grass above.",
    activeIngredients: ["Bifenthrin (0.25-0.5 oz/1,000 sq ft)", "Fipronil (0.06 oz/1,000 sq ft)"],
  },
  {
    id: 16,
    name: "Billbugs",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Sawdust-like frass", "Easy grass pull-up", "Brown irregular patches"],
    description:
      "Weevil larvae bore into grass stems and crowns, leaving sawdust-like debris at the base.",
    activeIngredients: ["Imidacloprid (0.6 oz/1,000 sq ft)", "Bifenthrin (0.25-0.5 oz/1,000 sq ft)"],
  },
  {
    id: 17,
    name: "Fire Ants",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Mound formation", "Painful stings", "Bare patches around mounds"],
    description:
      "Build large mounds in lawns and deliver painful stings. Damage grass around nest areas.",
    activeIngredients: ["Hydramethylnon (bait)", "Spinosad (bait)"],
  },
  {
    id: 18,
    name: "Cutworms",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Cut grass at soil level", "Circular dead spots", "Night feeding damage"],
    description:
      "Nocturnal caterpillars that cut grass stems at soil level, creating small dead patches.",
    activeIngredients: ["Carbaryl (3-6 oz/1,000 sq ft)", "Bifenthrin (0.25-0.5 oz/1,000 sq ft)"],
  },

  // ===== WEEDS =====
  {
    id: 19,
    name: "Crabgrass",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Coarse texture", "Light green color", "Spreading growth"],
    description:
      "An annual grassy weed that thrives in thin, weak lawns and hot temperatures.",
    activeIngredients: ["Quinclorac (post)", "Dithiopyr (pre-emergent)"],
  },
  {
    id: 20,
    name: "Dandelion",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Yellow flowers", "Fluffy seed heads", "Rosette leaves"],
    description:
      "Common broadleaf perennial with deep taproots. Yellow flowers mature into white puffball seed heads.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Triclopyr (0.5-1 oz/1,000 sq ft)"],
  },
  {
    id: 21,
    name: "Clover",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Three-leaf clusters", "White flowers", "Creeping stems"],
    description:
      "Low-growing perennial with distinctive three-leaflet pattern. Actually fixes nitrogen in soil.",
    activeIngredients: ["Triclopyr (0.5-1 oz/1,000 sq ft)", "Fluroxypyr (0.18 oz/1,000 sq ft)"],
  },
  {
    id: 22,
    name: "Nutsedge",
    type: "weed",
    icon: Leaf,
    severity: "high",
    symptoms: ["Triangular stems", "Rapid growth", "Yellow-green color"],
    description:
      "Aggressive sedge (not a grass) that grows faster than turf and has distinctive triangular stems.",
    activeIngredients: ["Halosulfuron (0.024 oz/1,000 sq ft)", "Sulfentrazone (0.18 oz/1,000 sq ft)"],
  },
  {
    id: 23,
    name: "Chickweed",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Small white flowers", "Mat-forming growth", "Cool-season appearance"],
    description:
      "Low-growing annual that thrives in cool, moist conditions. Forms dense mats in thin turf.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Dicamba (0.25-0.5 oz/1,000 sq ft)"],
  },
  {
    id: 24,
    name: "Henbit",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Purple flowers", "Square stems", "Scalloped leaves"],
    description:
      "Winter annual with distinctive purple tubular flowers and square stems. Common in early spring.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Triclopyr (0.5-1 oz/1,000 sq ft)"],
  },
  {
    id: 25,
    name: "Plantain",
    type: "weed",
    icon: Leaf,
    severity: "low",
    symptoms: ["Oval leaves", "Prominent veins", "Rosette growth"],
    description:
      "Broadleaf perennial with ribbed leaves growing in a rosette pattern. Tolerates compacted soil.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "MCPP (1-1.5 oz/1,000 sq ft)"],
  },
  {
    id: 26,
    name: "Ground Ivy",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Creeping stems", "Round scalloped leaves", "Minty smell"],
    description:
      "Also called creeping Charlie. Aggressive spreading perennial that thrives in shady, moist areas.",
    activeIngredients: ["Triclopyr (0.5-1 oz/1,000 sq ft)", "Dicamba (0.25-0.5 oz/1,000 sq ft)"],
  },
  {
    id: 27,
    name: "Wild Violet",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Heart-shaped leaves", "Purple/white flowers", "Waxy leaf coating"],
    description:
      "Difficult-to-control perennial with waxy leaves that resist herbicides. Spreads by seed and rhizomes.",
    activeIngredients: ["Triclopyr (0.5-1 oz/1,000 sq ft)", "Fluroxypyr (0.18 oz/1,000 sq ft)"],
  },
  {
    id: 28,
    name: "Goosegrass",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Flat rosette growth", "White center", "Tough wiry stems"],
    description:
      "Annual grassy weed similar to crabgrass but grows flat with a distinctive white center.",
    activeIngredients: ["Metribuzin (0.25 oz/1,000 sq ft)", "Oxadiazon (pre-emergent)"],
  },
  {
    id: 29,
    name: "Dallisgrass",
    type: "weed",
    icon: Leaf,
    severity: "high",
    symptoms: ["Coarse clumps", "Tall seed heads", "Rhizome spreading"],
    description:
      "Aggressive perennial grassy weed that forms unsightly clumps and is very difficult to control.",
    activeIngredients: ["MSMA (where legal)", "Glyphosate (spot treatment)"],
  },
  {
    id: 30,
    name: "Spurge",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Mat-forming", "Milky sap", "Small oval leaves"],
    description:
      "Low-growing annual that forms dense mats. Produces milky sap when stems are broken.",
    activeIngredients: ["2,4-D (1-2 oz/1,000 sq ft)", "Dicamba (0.25-0.5 oz/1,000 sq ft)"],
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

type FilterType = "all" | "disease" | "insect" | "weed";

export function IssueDatabase() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIssue, setSelectedIssue] = useState<LawnIssue | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleViewTreatment = (issue: typeof issues[0]) => {
    setSelectedIssue(issue as LawnIssue);
    setModalOpen(true);
  };

  const filters: { label: string; value: FilterType; icon?: typeof CircleDot }[] = [
    { label: "All Issues", value: "all" },
    { label: "Diseases", value: "disease", icon: CircleDot },
    { label: "Insects", value: "insect", icon: Bug },
    { label: "Weeds", value: "weed", icon: Leaf },
  ];

  const filteredIssues = issues.filter((issue) => {
    // Filter by type
    const matchesType = activeFilter === "all" || issue.type === activeFilter;
    
    // Filter by search query (searches in name, symptoms, and description)
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = query === "" || 
      issue.name.toLowerCase().includes(query) ||
      issue.description.toLowerCase().includes(query) ||
      issue.symptoms.some(symptom => symptom.toLowerCase().includes(query));
    
    return matchesType && matchesSearch;
  });

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
            Filter by symptoms to find your problem fast.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap justify-center gap-3 mb-10">
          {filters.map((filter) => (
            <button
              key={filter.value}
              onClick={() => setActiveFilter(filter.value)}
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
              // Prevent full-page reload when users press Enter (common expectation for “search” inputs)
              e.preventDefault();
            }}
          >
            <input
              type="search"
              inputMode="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search lawn issues by symptom"
              placeholder="Search by symptom (e.g., circular patches, brown spots...)"
              className="w-full h-14 px-6 pr-24 rounded-2xl border border-lawn-200 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />

            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <Search className="pointer-events-none w-5 h-5 text-muted-foreground" />
              <Button type="submit" variant="ghost" size="sm" className="rounded-xl">
                Search
              </Button>
            </div>
          </form>

          <p className="mt-2 text-center text-sm text-muted-foreground">
            {searchQuery.trim()
              ? `Searching for "${searchQuery.trim()}" — showing ${filteredIssues.length} of ${issues.length}`
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
                  setActiveFilter("all");
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>

        {/* View All Button */}
        {filteredIssues.length > 0 && (
          <div className="text-center mt-10">
            <Button variant="outline" size="lg">
              Browse All Issues
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

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
