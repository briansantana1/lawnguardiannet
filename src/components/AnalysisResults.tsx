import { 
  AlertTriangle, 
  Bug, 
  Leaf, 
  Droplets, 
  Sun,
  Save,
  Camera,
  ChevronDown,
  ChevronUp,
  Shield,
  Clock,
  Beaker,
  Sprout,
  ThumbsUp,
  ThumbsDown,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LawnAnalysisResult, IdentifiedIssue, ChemicalTreatment } from "@/types/lawn-analysis";
import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface AnalysisResultsProps {
  result: LawnAnalysisResult;
  imageUrl: string | null;
  onSave: () => void;
  onNewScan: () => void;
  isLoggedIn: boolean;
}

const getIssueIcon = (type: string) => {
  switch (type) {
    case 'disease': return <AlertTriangle className="w-5 h-5" />;
    case 'insect': return <Bug className="w-5 h-5" />;
    case 'weed': return <Leaf className="w-5 h-5" />;
    case 'nutrient_deficiency': return <Droplets className="w-5 h-5" />;
    case 'environmental': return <Sun className="w-5 h-5" />;
    default: return <AlertTriangle className="w-5 h-5" />;
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'severe': return 'bg-red-100 text-red-700 border-red-200';
    case 'moderate': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'mild': return 'bg-green-100 text-green-700 border-green-200';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getConfidenceColor = (confidence: string) => {
  switch (confidence) {
    case 'high': return 'bg-lawn-100 text-lawn-700';
    case 'medium': return 'bg-amber-100 text-amber-700';
    case 'low': return 'bg-muted text-muted-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'high': return 'text-red-600';
    case 'medium': return 'text-amber-600';
    case 'low': return 'text-lawn-600';
    default: return 'text-muted-foreground';
  }
};

const IssueCard = ({ issue }: { issue: IdentifiedIssue }) => {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const handleFeedback = (type: 'correct' | 'incorrect') => {
    setFeedback(type);
    if (type === 'correct') {
      toast.success(`Thanks! Confirmed: ${issue.name}`);
    } else {
      toast.info(`Thanks for the feedback! We'll improve our detection of ${issue.name}`);
    }
  };

  return (
    <Card className={`border-2 ${getSeverityColor(issue.severity)}`}>
      <CardContent className="p-4">
        <div 
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className={`p-2 rounded-lg ${getSeverityColor(issue.severity)}`}>
            {getIssueIcon(issue.type)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-foreground">{issue.name}</h4>
              <Badge variant="secondary" className={getConfidenceColor(issue.confidence)}>
                {issue.confidence} confidence
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground capitalize">{issue.type.replace('_', ' ')}</p>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-current/10 space-y-4">
            {/* Visual Evidence */}
            {issue.visual_evidence && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs font-semibold text-blue-700 uppercase mb-1 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Visual Evidence
                </p>
                <p className="text-sm text-blue-900">{issue.visual_evidence}</p>
              </div>
            )}
            
            <p className="text-sm text-foreground">{issue.description}</p>
            
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Symptoms Observed</p>
              <div className="flex flex-wrap gap-1">
                {issue.symptoms.map((symptom, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {symptom}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Alternate possibilities */}
            {issue.alternate_possibilities && issue.alternate_possibilities.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Could Also Be</p>
                <div className="flex flex-wrap gap-1">
                  {issue.alternate_possibilities.map((alt, i) => (
                    <Badge key={i} variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                      {alt}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback section */}
            <div className="pt-3 border-t border-current/10">
              <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Is this identification correct?</p>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={feedback === 'correct' ? 'default' : 'outline'}
                  className={feedback === 'correct' ? 'bg-lawn-500 hover:bg-lawn-600' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback('correct');
                  }}
                  disabled={feedback !== null}
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  Correct
                </Button>
                <Button 
                  size="sm" 
                  variant={feedback === 'incorrect' ? 'default' : 'outline'}
                  className={feedback === 'incorrect' ? 'bg-red-500 hover:bg-red-600' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeedback('incorrect');
                  }}
                  disabled={feedback !== null}
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  Incorrect
                </Button>
              </div>
              {feedback === 'incorrect' && (
                <p className="text-xs text-muted-foreground mt-2">
                  Tip: Try uploading a closer, clearer photo for better results
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const ChemicalTreatmentCard = ({ treatment }: { treatment: ChemicalTreatment }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Card className="border border-lawn-200 bg-lawn-50/50">
      <CardContent className="p-4">
        <div 
          className="flex items-start gap-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="p-2 rounded-lg bg-lawn-100">
            <Beaker className="w-5 h-5 text-lawn-700" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground capitalize">{treatment.product_type}</h4>
            <p className="text-sm text-lawn-600">{treatment.active_ingredients.join(', ')}</p>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-lawn-200 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Application Rate</p>
                <p className="text-sm font-medium text-foreground">{treatment.application_rate}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase">Frequency</p>
                <p className="text-sm font-medium text-foreground">{treatment.application_frequency}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase">Best Timing</p>
              <p className="text-sm text-foreground">{treatment.timing}</p>
            </div>
            {treatment.precautions.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-red-600 uppercase">Safety Precautions</p>
                <ul className="text-sm text-foreground list-disc list-inside">
                  {treatment.precautions.map((precaution, i) => (
                    <li key={i}>{precaution}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export function AnalysisResults({ result, imageUrl, onSave, onNewScan, isLoggedIn }: AnalysisResultsProps) {
  return (
    <section className="py-12 bg-lawn-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 mb-8">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt="Analyzed lawn" 
                className="w-full h-48 object-cover rounded-2xl shadow-lawn"
              />
            )}
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
              Analysis Complete
            </h2>
            <div className="flex gap-3">
              {isLoggedIn ? (
                <Button variant="outline" onClick={onSave} className="border-lawn-500 text-lawn-600 hover:bg-lawn-50">
                  <Save className="w-4 h-4" />
                  Save Treatment Plan
                </Button>
              ) : (
                <Link to="/auth">
                  <Button variant="outline" className="border-lawn-500 text-lawn-600 hover:bg-lawn-50">
                    <Save className="w-4 h-4" />
                    Sign in to Save Plan
                  </Button>
                </Link>
              )}
              <Button variant="outline" onClick={onNewScan} className="border-lawn-500 text-lawn-600 hover:bg-lawn-50">
                <Camera className="w-4 h-4" />
                New Scan
              </Button>
            </div>
          </div>

          {/* Identification Notes */}
          {result.diagnosis.identification_notes && (
            <Card className="mb-4 border-amber-200 bg-amber-50">
              <CardContent className="p-4">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span><strong>Note:</strong> {result.diagnosis.identification_notes}</span>
                </p>
              </CardContent>
            </Card>
          )}

          {/* Identified Issues */}
          <Card className="mb-8" variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Identified Issues ({result.diagnosis.identified_issues.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.diagnosis.identified_issues.map((issue, index) => (
                <IssueCard key={index} issue={issue} />
              ))}
            </CardContent>
          </Card>

          {/* Treatment Plan */}
          <Card className="mb-8" variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sprout className="w-5 h-5 text-lawn-500" />
                Treatment Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cultural Practices */}
              {result.treatment_plan.cultural_practices.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-lawn-500" />
                    Cultural Practices
                  </h4>
                  <div className="space-y-3">
                    {result.treatment_plan.cultural_practices.map((practice, i) => (
                      <div key={i} className="p-4 bg-lawn-50 rounded-xl border border-lawn-100">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{practice.action}</p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {practice.timing}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{practice.details}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chemical Treatments */}
              {result.treatment_plan.chemical_treatments.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Beaker className="w-4 h-4 text-lawn-500" />
                    Chemical Treatments
                  </h4>
                  <div className="space-y-3">
                    {result.treatment_plan.chemical_treatments.map((treatment, i) => (
                      <ChemicalTreatmentCard key={i} treatment={treatment} />
                    ))}
                  </div>
                </div>
              )}

              {/* Prevention Tips */}
              {result.treatment_plan.prevention_tips.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-lawn-500" />
                    Prevention Tips
                  </h4>
                  <ul className="space-y-2">
                    {result.treatment_plan.prevention_tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="w-1.5 h-1.5 rounded-full bg-lawn-400 mt-2 flex-shrink-0" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Forecast */}
          <Card variant="elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-500" />
                Outbreak Forecast
                <Badge className={`ml-2 ${
                  result.forecast.risk_level === 'high' ? 'bg-red-100 text-red-700' :
                  result.forecast.risk_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-lawn-100 text-lawn-700'
                }`}>
                  {result.forecast.risk_level} risk
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Potential Outbreaks */}
              {result.forecast.potential_outbreaks.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Potential Issues to Watch</h4>
                  <div className="space-y-3">
                    {result.forecast.potential_outbreaks.map((outbreak, i) => (
                      <div key={i} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{outbreak.issue}</p>
                          <span className={`text-sm font-medium ${getRiskColor(
                            outbreak.likelihood.includes('high') ? 'high' :
                            outbreak.likelihood.includes('medium') ? 'medium' : 'low'
                          )}`}>
                            {outbreak.likelihood}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{outbreak.conditions}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preventive Measures */}
              {result.forecast.preventive_measures.length > 0 && (
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Recommended Preventive Actions</h4>
                  <div className="space-y-3">
                    {result.forecast.preventive_measures.map((measure, i) => (
                      <div key={i} className="p-4 bg-lawn-50 rounded-xl border border-lawn-100">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-foreground">{measure.action}</p>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {measure.timing}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{measure.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}