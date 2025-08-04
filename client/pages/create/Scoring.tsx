import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import {
  Target,
  TrendingUp,
  Info,
  FileText,
  Award,
  Trophy,
  Crown,
  Medal,
  Zap,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EventRule {
  id: string;
  rule_title?: string;
  rule_text: string;
}

export default function Scoring() {
  const navigate = useNavigate();
  const { state, updateScoring } = useTripCreation();
  const { tripData } = state;

  const [scoringFormat, setScoringFormat] = useState<
    "stroke-play" | "modified-stableford"
  >(tripData.scoringFormat || "stroke-play");

  const [customRules, setCustomRules] = useState<EventRule[]>([]);
  const [loading, setLoading] = useState(true);

  // Enhanced Stableford points system
  const enhancedStablefordPoints = [
    {
      score: "Albatross",
      points: 20,
      description: "3 under par",
      detail:
        "Legendary! The rarest score in golf deserves the highest reward.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      iconColor: "text-purple-600",
      icon: Crown,
    },
    {
      score: "Eagle",
      points: 8,
      description: "2 under par",
      detail:
        "Exceptional performance! Maximum points for being 2 strokes under par.",
      color: "from-yellow-500 to-yellow-600",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-900",
      iconColor: "text-yellow-600",
      icon: Trophy,
    },
    {
      score: "Birdie",
      points: 4,
      description: "1 under par",
      detail: "Great shot! Double points for being 1 stroke under par.",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      iconColor: "text-green-600",
      icon: Award,
    },
    {
      score: "Par",
      points: 2,
      description: "Even",
      detail: "Solid golf! Standard points for meeting par.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
      icon: CheckCircle,
    },
    {
      score: "Bogey",
      points: 1,
      description: "1 over par",
      detail: "Still in the game! One point for being 1 stroke over par.",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-900",
      iconColor: "text-orange-600",
      icon: Medal,
    },
    {
      score: "Double Bogey+",
      points: 0,
      description: "2+ over par",
      detail: "No points awarded for scores of double bogey or worse.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50",
      textColor: "text-red-900",
      iconColor: "text-red-600",
      icon: Zap,
    },
  ];

  // Load custom rules from database
  useEffect(() => {
    const loadCustomRules = async () => {
      if (tripData.id) {
        try {
          const { data: rules, error } = await supabase
            .from("event_rules")
            .select("*")
            .eq("event_id", tripData.id)
            .order("created_at");

          if (!error && rules) {
            setCustomRules(rules);
          }
        } catch (error) {
          console.error("Error loading custom rules:", error);
        }
      }
      setLoading(false);
    };

    loadCustomRules();
  }, [tripData.id]);

  const handleNext = () => {
    const scoringData = {
      scoringFormat,
      ...(scoringFormat === "modified-stableford" && {
        stablefordPoints: {
          albatross: 20,
          eagle: 8,
          birdie: 4,
          par: 2,
          bogey: 1,
          doubleBogey: 0,
        },
      }),
    };

    updateScoring(scoringData);
    navigate("/app/create/players");
  };

  const handlePrevious = () => {
    updateScoring({ scoringFormat });
    navigate("/app/create/courses");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleNext}
        onPrevious={handlePrevious}
        nextDisabled={false}
      />

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-emerald-600" />
            Scoring Format
          </CardTitle>
          <CardDescription className="text-green-600">
            Choose how scores will be calculated for your tournament
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <RadioGroup
            value={scoringFormat}
            onValueChange={(value) =>
              setScoringFormat(value as "stroke-play" | "modified-stableford")
            }
            className="space-y-4"
          >
            {/* Stroke Play Option */}
            <Card
              className={cn(
                "cursor-pointer transition-all border-2",
                scoringFormat === "stroke-play"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-green-100 hover:border-green-200",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem
                    value="stroke-play"
                    id="stroke-play"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="stroke-play"
                      className="text-lg font-semibold text-green-900 cursor-pointer flex items-center"
                    >
                      <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                      Stroke Play (Traditional)
                    </Label>
                    <p className="text-green-600 mt-2">
                      Players compete based on their total number of strokes.
                      Lowest score wins. This is the most common tournament
                      format.
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-green-800">
                        Best for:
                      </p>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Traditional golf tournaments</li>
                        <li>• Players of similar skill levels</li>
                        <li>• Straightforward scoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modified Stableford Option */}
            <Card
              className={cn(
                "cursor-pointer transition-all border-2",
                scoringFormat === "modified-stableford"
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-green-100 hover:border-green-200",
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem
                    value="modified-stableford"
                    id="modified-stableford"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label
                      htmlFor="modified-stableford"
                      className="text-lg font-semibold text-green-900 cursor-pointer flex items-center"
                    >
                      <Target className="h-5 w-5 mr-2 text-emerald-600" />
                      Stableford (Points-Based)
                    </Label>
                    <p className="text-green-600 mt-2">
                      Players earn points based on their performance on each
                      hole relative to par. Highest point total wins. More
                      exciting and forgiving format.
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-green-800">
                        Best for:
                      </p>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Mixed skill level groups</li>
                        <li>• More engaging gameplay</li>
                        <li>• Reward aggressive play</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>

          {/* Custom Rules Section */}
          {customRules.length > 0 && (
            <Card className="border-slate-100 bg-slate-50">
              <CardHeader>
                <CardTitle className="text-xl text-slate-900 flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-slate-600" />
                  Tournament Rules
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Custom rules and guidelines for this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {customRules.map((rule, index) => (
                    <Card
                      key={rule.id}
                      className="bg-white border border-slate-200"
                    >
                      <CardContent className="p-4">
                        {rule.rule_title && (
                          <h4 className="font-semibold text-slate-900 mb-2">
                            {rule.rule_title}
                          </h4>
                        )}
                        <p className="text-slate-700 text-sm leading-relaxed">
                          {rule.rule_text}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Format Comparison */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              <strong>Quick tip:</strong> You can always change the scoring
              format later.
              {scoringFormat === "stroke-play"
                ? " Stroke play is perfect for traditional tournaments."
                : " Modified Stableford keeps everyone engaged and rewards good shots."}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
