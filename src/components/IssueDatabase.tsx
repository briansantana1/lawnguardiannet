import { useState } from "react";
import { AlertTriangle, Bug, Leaf, CircleDot, ChevronRight, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const issues = [
  {
    id: 1,
    name: "Brown Patch",
    type: "disease",
    icon: CircleDot,
    severity: "high",
    symptoms: ["Circular patches", "Brown grass blades", "Water-soaked look"],
    description:
      "A fungal disease that thrives in hot, humid conditions. Common in cool-season grasses.",
    activeIngredients: ["Azoxystrobin", "Propiconazole"],
  },
  {
    id: 2,
    name: "Grub Damage",
    type: "insect",
    icon: Bug,
    severity: "medium",
    symptoms: ["Spongy turf", "Dead patches", "Birds/animals digging"],
    description:
      "White grubs feed on grass roots, causing turf to die and become easily pulled up.",
    activeIngredients: ["Imidacloprid", "Chlorantraniliprole"],
  },
  {
    id: 3,
    name: "Crabgrass",
    type: "weed",
    icon: Leaf,
    severity: "medium",
    symptoms: ["Coarse texture", "Light green color", "Spreading growth"],
    description:
      "An annual grassy weed that thrives in thin, weak lawns and hot temperatures.",
    activeIngredients: ["Quinclorac", "Dithiopyr"],
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
                      <Button variant="ghost" size="sm" className="w-full justify-between">
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
      </div>
    </section>
  );
}
