import { AlertTriangle, Bug, Leaf, CircleDot, ChevronRight } from "lucide-react";
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

export function IssueDatabase() {
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
          {[
            { label: "All Issues", active: true },
            { label: "Diseases", icon: CircleDot },
            { label: "Insects", icon: Bug },
            { label: "Weeds", icon: Leaf },
          ].map((filter) => (
            <button
              key={filter.label}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-sm transition-all duration-200 ${
                filter.active
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
          <div className="relative">
            <input
              type="text"
              placeholder="Search by symptom (e.g., circular patches, brown spots...)"
              className="w-full h-14 px-6 pr-12 rounded-2xl border border-lawn-200 bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent shadow-sm"
            />
            <AlertTriangle className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Issues Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {issues.map((issue) => {
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
          })}
        </div>

        {/* View All Button */}
        <div className="text-center mt-10">
          <Button variant="outline" size="lg">
            Browse All Issues
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
