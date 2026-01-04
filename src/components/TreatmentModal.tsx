import { Bug, Leaf, CircleDot, X, Droplets, Calendar, Shield, Sprout, Clock, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface LawnIssue {
  id: number;
  name: string;
  type: "disease" | "insect" | "weed";
  severity: "high" | "medium" | "low";
  symptoms: string[];
  description: string;
  activeIngredients: string[];
  ipmPractices?: string[];
  applicationSchedule?: {
    timing: string;
    frequency: string;
    bestMonths: string[];
  };
  preventionTips?: string[];
}

interface TreatmentModalProps {
  issue: LawnIssue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const typeIcons = {
  disease: CircleDot,
  insect: Bug,
  weed: Leaf,
};

const severityColors = {
  high: "bg-alert/10 text-alert border-alert",
  medium: "bg-warning/10 text-warning border-warning",
  low: "bg-primary/10 text-primary border-primary",
};

const typeColors = {
  disease: "bg-purple-100 text-purple-700 border-purple-300",
  insect: "bg-orange-100 text-orange-700 border-orange-300",
  weed: "bg-green-100 text-green-700 border-green-300",
};

// Default IPM practices by issue type
const defaultIpmPractices = {
  disease: [
    "Improve air circulation by pruning nearby shrubs",
    "Water deeply but infrequently, early in the morning",
    "Avoid excessive nitrogen fertilization during peak disease season",
    "Remove thatch buildup exceeding ½ inch",
    "Overseed with disease-resistant grass varieties",
  ],
  insect: [
    "Maintain proper mowing height for your grass type",
    "Encourage beneficial predators (birds, ground beetles)",
    "Apply beneficial nematodes for biological control",
    "Monitor with soap flush test (2 tbsp dish soap per gallon)",
    "Keep lawn healthy with proper fertilization schedule",
  ],
  weed: [
    "Maintain dense, healthy turf through proper fertilization",
    "Mow at the proper height for your grass type",
    "Avoid soil compaction with core aeration",
    "Overseed thin areas to outcompete weeds",
    "Hand-pull weeds before they go to seed",
  ],
};

// Default application schedules by issue type
const defaultSchedules = {
  disease: {
    timing: "Apply at first sign of symptoms, preferably in early morning",
    frequency: "Repeat every 14-21 days as needed",
    bestMonths: ["May", "Jun", "Jul", "Aug", "Sep"],
  },
  insect: {
    timing: "Apply when pests are in vulnerable life stage (usually larvae)",
    frequency: "Single application; reapply if activity persists after 3-4 weeks",
    bestMonths: ["Apr", "May", "Jun", "Jul", "Aug"],
  },
  weed: {
    timing: "Pre-emergent: before soil temps reach 55°F. Post-emergent: when weeds are actively growing",
    frequency: "Pre-emergent: 1-2x/year. Post-emergent: as needed, 2-4 week intervals",
    bestMonths: ["Mar", "Apr", "Sep", "Oct"],
  },
};

// Default prevention tips by issue type
const defaultPreventionTips = {
  disease: [
    "Avoid watering in the evening to reduce leaf wetness overnight",
    "Sharpen mower blades to prevent ragged cuts that invite infection",
    "Apply balanced fertilizer according to soil test recommendations",
    "Improve drainage in low-lying areas",
  ],
  insect: [
    "Maintain proper soil pH (6.0-7.0 for most grasses)",
    "Avoid over-watering which attracts pests",
    "Remove excessive thatch that harbors insects",
    "Use pest-resistant grass varieties when overseeding",
  ],
  weed: [
    "Apply pre-emergent herbicides before weed seeds germinate",
    "Maintain proper lawn density through regular overseeding",
    "Test and adjust soil pH to favor grass over weeds",
    "Water deeply and infrequently to encourage deep grass roots",
  ],
};

export function TreatmentModal({ issue, open, onOpenChange }: TreatmentModalProps) {
  if (!issue) return null;

  const TypeIcon = typeIcons[issue.type];
  const ipmPractices = issue.ipmPractices || defaultIpmPractices[issue.type];
  const schedule = issue.applicationSchedule || defaultSchedules[issue.type];
  const preventionTips = issue.preventionTips || defaultPreventionTips[issue.type];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-lawn-100 flex items-center justify-center shrink-0">
              <TypeIcon className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-heading mb-2">
                {issue.name}
              </DialogTitle>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${typeColors[issue.type]}`}>
                  {issue.type}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${severityColors[issue.severity]}`}>
                  {issue.severity} severity
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4">
          <p className="text-muted-foreground">{issue.description}</p>
          
          {/* Symptoms */}
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              Key Symptoms
            </h4>
            <div className="flex flex-wrap gap-2">
              {issue.symptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="px-3 py-1.5 rounded-lg bg-lawn-100 text-sm text-foreground"
                >
                  {symptom}
                </span>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="chemical" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="chemical" className="gap-2">
              <Droplets className="w-4 h-4" />
              Chemical
            </TabsTrigger>
            <TabsTrigger value="ipm" className="gap-2">
              <Sprout className="w-4 h-4" />
              IPM Practices
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <Calendar className="w-4 h-4" />
              Schedule
            </TabsTrigger>
          </TabsList>

          {/* Chemical Treatment Tab */}
          <TabsContent value="chemical" className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                Recommended Active Ingredients
              </h4>
              <div className="space-y-3">
                {issue.activeIngredients.map((ingredient, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-lawn-50 border border-lawn-200"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">{idx + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{ingredient}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Apply according to label directions. Always wear appropriate PPE.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-warning/10 border border-warning/30">
              <p className="text-sm text-warning-foreground">
                <strong>Important:</strong> Always read and follow pesticide label instructions. 
                The label is the law. Consider rotating active ingredients to prevent resistance.
              </p>
            </div>
          </TabsContent>

          {/* IPM Practices Tab */}
          <TabsContent value="ipm" className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Sprout className="w-4 h-4 text-primary" />
                Cultural & Biological Controls
              </h4>
              <div className="space-y-2">
                {ipmPractices.map((practice, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-xl bg-lawn-50 border border-lawn-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-primary-foreground">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-foreground">{practice}</p>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" />
                Prevention Tips
              </h4>
              <ul className="space-y-2">
                {preventionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="text-primary mt-1">•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-4">
            <div className="grid gap-4">
              <div className="p-4 rounded-xl bg-lawn-50 border border-lawn-200">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Application Timing
                </h4>
                <p className="text-sm text-muted-foreground">{schedule.timing}</p>
              </div>

              <div className="p-4 rounded-xl bg-lawn-50 border border-lawn-200">
                <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Frequency
                </h4>
                <p className="text-sm text-muted-foreground">{schedule.frequency}</p>
              </div>

              <div className="p-4 rounded-xl bg-lawn-50 border border-lawn-200">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Best Months for Treatment
                </h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {schedule.bestMonths.map((month) => (
                    <span
                      key={month}
                      className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
                    >
                      {month}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border">
              <p className="text-sm text-muted-foreground">
                <strong>Pro Tip:</strong> For best results, apply treatments when temperatures 
                are between 60-80°F and no rain is expected for 24 hours. Early morning 
                applications often work best.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
