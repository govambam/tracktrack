import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { Target, TrendingUp, Info, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ScoringEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [scoringFormat, setScoringFormat] = useState<
    "stroke-play" | "modified-stableford"
  >("stroke-play");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadScoringData();
    }
  }, [eventId]);

  const loadScoringData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      console.log("Loading scoring data for event:", eventId);

      // Load scoring format from rounds data
      const { data: roundsData, error } = await supabase
        .from("event_rounds")
        .select("scoring_type")
        .eq("event_id", eventId)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading scoring data:", error);
        // Don't show error for missing rounds, use default
      } else if (roundsData) {
        const format =
          roundsData.scoring_type === "stableford"
            ? "modified-stableford"
            : "stroke-play";
        setScoringFormat(format);
        console.log("Loaded scoring format:", format);
      }
    } catch (error) {
      console.error("Error loading scoring data:", error);
    } finally {
      setLoading(false);
    }
  };

  const defaultStablefordPoints = {
    eagle: 4,
    birdie: 2,
    par: 0,
    bogey: -1,
    doubleBogey: -2,
  };

  const handleSave = async () => {
    if (!eventId) return;

    setSaving(true);

    try {
      // Update the main event with scoring format preference
      const { error: eventError } = await supabase
        .from("events")
        .update({
          // Store scoring format in description for now, or add a new column if needed
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (eventError) {
        console.error("Error updating event:", eventError);
        toast({
          title: "Save Failed",
          description: eventError.message || "Failed to update scoring format",
          variant: "destructive",
        });
        return;
      }

      // Update all rounds with the new scoring type
      const { error: roundsError } = await supabase
        .from("event_rounds")
        .update({
          scoring_type:
            scoringFormat === "modified-stableford"
              ? "stableford"
              : "stroke_play",
          updated_at: new Date().toISOString(),
        })
        .eq("event_id", eventId);

      if (roundsError) {
        console.error("Error updating rounds:", roundsError);
        toast({
          title: "Save Failed",
          description: roundsError.message || "Failed to update round scoring",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Scoring Updated",
        description: "Scoring format has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving scoring format:", error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-600" />
            Scoring Format
          </CardTitle>
          <CardDescription className="text-purple-600">
            Choose how players will be scored during your golf event
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
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="stroke-play" id="stroke-play" />
                <Label
                  htmlFor="stroke-play"
                  className={cn(
                    "flex-1 cursor-pointer",
                    scoringFormat === "stroke-play" &&
                      "text-purple-700 font-medium",
                  )}
                >
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-purple-600" />
                    Stroke Play (Traditional)
                  </div>
                </Label>
              </div>
              <Card
                className={cn(
                  "ml-6 border-2 transition-colors",
                  scoringFormat === "stroke-play"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-gray-50",
                )}
              >
                <CardContent className="p-4">
                  <p className="text-sm text-green-700 mb-2">
                    Count every stroke. Lowest total score wins.
                  </p>
                  <ul className="text-xs text-green-600 space-y-1">
                    <li>• Most common tournament format</li>
                    <li>• Easy to understand and track</li>
                    <li>• Best for competitive players</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Modified Stableford Option */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="modified-stableford" id="stableford" />
                <Label
                  htmlFor="stableford"
                  className={cn(
                    "flex-1 cursor-pointer",
                    scoringFormat === "modified-stableford" &&
                      "text-emerald-700 font-medium",
                  )}
                >
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-emerald-600" />
                    Modified Stableford (Points-Based)
                  </div>
                </Label>
              </div>
              <Card
                className={cn(
                  "ml-6 border-2 transition-colors",
                  scoringFormat === "modified-stableford"
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-200 bg-gray-50",
                )}
              >
                <CardContent className="p-4">
                  <p className="text-sm text-green-700 mb-3">
                    Earn points based on performance relative to par. Highest
                    points win.
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="text-green-800 font-medium">
                        Points System:
                      </div>
                      <div className="text-green-600">Eagle: +4 points</div>
                      <div className="text-green-600">Birdie: +2 points</div>
                      <div className="text-green-600">Par: 0 points</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-green-800 font-medium">&nbsp;</div>
                      <div className="text-green-600">Bogey: -1 point</div>
                      <div className="text-green-600">
                        Double Bogey: -2 points
                      </div>
                      <div className="text-green-600">Worse: -2 points</div>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-green-600">
                    • Encourages aggressive play • More forgiving of bad holes
                  </div>
                </CardContent>
              </Card>
            </div>
          </RadioGroup>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Scoring Format"}
            </Button>
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Note:</strong> Changing the scoring format will apply to
              all rounds in this event. This setting affects how leaderboards
              and final results are calculated.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
