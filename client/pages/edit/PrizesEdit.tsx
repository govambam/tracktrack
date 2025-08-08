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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { Trophy, DollarSign, Gift, Target, Save } from "lucide-react";

export default function PrizesEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state, updatePrizes } = useTripCreation();
  const { tripData } = state;

  const [buyIn, setBuyIn] = useState<number | undefined>(undefined);
  const [enablePayout, setEnablePayout] = useState(false);
  const [enableContests, setEnableContests] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [payoutStructure, setPayoutStructure] = useState({
    champion: 0,
    runnerUp: 0,
    third: 0,
  });

  const [contestPrizes, setContestPrizes] = useState({
    longestDrive: 0,
    closestToPin: 0,
    other: "",
  });

  useEffect(() => {
    if (eventId) {
      loadPrizesData();
    }
  }, [eventId]);

  const loadPrizesData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      console.log("Loading prizes data for event:", eventId);

      // Load buy-in from events table
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("buy_in")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("Error loading event data:", eventError);
      } else if (eventData) {
        setBuyIn(eventData.buy_in || 0);
        console.log("Loaded buy-in:", eventData.buy_in);
      }

      // Load prizes from event_prizes table
      const { data: prizesData, error: prizesError } = await supabase
        .from("event_prizes")
        .select("*")
        .eq("event_id", eventId);

      if (prizesError) {
        console.error("Error loading prizes data:", prizesError);
      } else if (prizesData && prizesData.length > 0) {
        const newPayoutStructure = { champion: 0, runnerUp: 0, third: 0 };
        const newContestPrizes = {
          longestDrive: 0,
          closestToPin: 0,
          other: "",
        };
        let hasPayouts = false;
        let hasContests = false;

        prizesData.forEach((prize) => {
          switch (prize.category) {
            case "overall_champion":
              newPayoutStructure.champion = prize.amount || 0;
              hasPayouts = true;
              break;
            case "runner_up":
              newPayoutStructure.runnerUp = prize.amount || 0;
              hasPayouts = true;
              break;
            case "third_place":
              newPayoutStructure.third = prize.amount || 0;
              hasPayouts = true;
              break;
            case "longest_drive":
              newContestPrizes.longestDrive = prize.amount || 0;
              hasContests = true;
              break;
            case "closest_to_pin":
              newContestPrizes.closestToPin = prize.amount || 0;
              hasContests = true;
              break;
            case "custom":
              newContestPrizes.other = prize.description || "";
              hasContests = true;
              break;
          }
        });

        setPayoutStructure(newPayoutStructure);
        setContestPrizes(newContestPrizes);
        setEnablePayout(hasPayouts);
        setEnableContests(hasContests);
        console.log("Loaded prizes:", {
          payouts: newPayoutStructure,
          contests: newContestPrizes,
        });
      }
    } catch (error) {
      console.error("Error loading prizes data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get skills contests from rounds data
  const getSkillsContestsFromRounds = () => {
    const contests: { hole: number; type: string; roundName: string }[] = [];
    tripData.rounds.forEach((round) => {
      if (round.skillsContests && round.skillsContests.length > 0) {
        round.skillsContests.forEach((contest) => {
          contests.push({
            hole: contest.hole,
            type:
              contest.type === "longest_drive"
                ? "Longest Drive"
                : "Closest to Pin",
            roundName: round.courseName,
          });
        });
      }
    });
    return contests;
  };

  const skillsContestsFromRounds = getSkillsContestsFromRounds();
  const longestDriveCount = skillsContestsFromRounds.filter(
    (c) => c.type === "Longest Drive",
  ).length;
  const closestToPinCount = skillsContestsFromRounds.filter(
    (c) => c.type === "Closest to Pin",
  ).length;

  const totalPayout =
    payoutStructure.champion + payoutStructure.runnerUp + payoutStructure.third;
  const totalContestPrizes =
    contestPrizes.longestDrive + contestPrizes.closestToPin;
  const totalPrizes = totalPayout + totalContestPrizes;
  const playerCount = tripData.players.length || 1;
  const totalBuyIns = (buyIn || 0) * playerCount;

  const handleSave = async () => {
    if (!eventId) return;

    setSaving(true);

    try {
      // Update buy-in in events table
      const { error: eventUpdateError } = await supabase
        .from("events")
        .update({ buy_in: buyIn || 0 })
        .eq("id", eventId);

      if (eventUpdateError) {
        console.error("Error updating event buy-in:", eventUpdateError);
        toast({
          title: "Save Failed",
          description: eventUpdateError.message || "Failed to update buy-in",
          variant: "destructive",
        });
        return;
      }

      // Delete existing prizes
      const { error: deleteError } = await supabase
        .from("event_prizes")
        .delete()
        .eq("event_id", eventId);

      if (deleteError) {
        console.error("Error deleting existing prizes:", deleteError);
        toast({
          title: "Save Failed",
          description: deleteError.message || "Failed to update prizes",
          variant: "destructive",
        });
        return;
      }

      // Prepare prizes data
      const prizesData = [];

      // Add payout structure prizes
      if (enablePayout) {
        if (payoutStructure.champion > 0) {
          prizesData.push({
            event_id: eventId,
            category: "overall_champion",
            amount: payoutStructure.champion,
            description: "Overall Champion",
          });
        }
        if (payoutStructure.runnerUp > 0) {
          prizesData.push({
            event_id: eventId,
            category: "runner_up",
            amount: payoutStructure.runnerUp,
            description: "Runner Up",
          });
        }
        if (payoutStructure.third > 0) {
          prizesData.push({
            event_id: eventId,
            category: "third_place",
            amount: payoutStructure.third,
            description: "Third Place",
          });
        }
      }

      // Add contest prizes
      if (enableContests) {
        if (contestPrizes.longestDrive > 0) {
          prizesData.push({
            event_id: eventId,
            category: "longest_drive",
            amount: contestPrizes.longestDrive,
            description: "Longest Drive",
          });
        }
        if (contestPrizes.closestToPin > 0) {
          prizesData.push({
            event_id: eventId,
            category: "closest_to_pin",
            amount: contestPrizes.closestToPin,
            description: "Closest to Pin",
          });
        }
        if (contestPrizes.other.trim()) {
          prizesData.push({
            event_id: eventId,
            category: "custom",
            amount: 0,
            description: contestPrizes.other.trim(),
          });
        }
      }

      // Insert new prizes
      if (prizesData.length > 0) {
        const { error: insertError } = await supabase
          .from("event_prizes")
          .insert(prizesData);

        if (insertError) {
          console.error("Error inserting prizes:", insertError);
          toast({
            title: "Save Failed",
            description: insertError.message || "Failed to save prizes",
            variant: "destructive",
          });
          return;
        }
      }

      // Update context with saved data
      updatePrizes({
        buyIn: buyIn,
        payoutStructure: enablePayout ? payoutStructure : undefined,
        contestPrizes: enableContests ? contestPrizes : undefined,
      });

      toast({
        title: "Prizes Updated",
        description: "Prize structure has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving prizes:", error);
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
            <Trophy className="h-5 w-5 mr-2 text-purple-600" />
            Prize Structure
          </CardTitle>
          <CardDescription className="text-purple-600">
            Set up buy-ins, payouts, and contest prizes for your golf event
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Buy-in Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-purple-600" />
              <Label className="text-purple-900 font-medium">
                Entry Fee (Optional)
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-700">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={buyIn || ""}
                onChange={(e) =>
                  setBuyIn(
                    e.target.value ? parseFloat(e.target.value) : undefined,
                  )
                }
                placeholder="0.00"
                className="w-32 border-green-200 focus:border-emerald-500"
              />
              <span className="text-green-600 text-sm">per player</span>
            </div>
          </div>

          {/* Payout Structure */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Trophy className="h-4 w-4 text-emerald-600" />
                  <Label className="text-green-800 font-medium">
                    Tournament Payouts
                  </Label>
                </div>
                <Switch
                  checked={enablePayout}
                  onCheckedChange={setEnablePayout}
                />
              </div>

              {enablePayout && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-green-800">Champion</Label>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-700">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payoutStructure.champion || ""}
                        onChange={(e) =>
                          setPayoutStructure((prev) => ({
                            ...prev,
                            champion: e.target.value
                              ? parseFloat(e.target.value)
                              : 0,
                          }))
                        }
                        placeholder="0.00"
                        className="border-green-200 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-800">Runner Up</Label>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-700">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payoutStructure.runnerUp || ""}
                        onChange={(e) =>
                          setPayoutStructure((prev) => ({
                            ...prev,
                            runnerUp: e.target.value
                              ? parseFloat(e.target.value)
                              : 0,
                          }))
                        }
                        placeholder="0.00"
                        className="border-green-200 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-800">Third Place</Label>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-700">$</span>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={payoutStructure.third || ""}
                        onChange={(e) =>
                          setPayoutStructure((prev) => ({
                            ...prev,
                            third: e.target.value
                              ? parseFloat(e.target.value)
                              : 0,
                          }))
                        }
                        placeholder="0.00"
                        className="border-green-200 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contest Prizes */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-emerald-600" />
                  <Label className="text-green-800 font-medium">
                    Skills Contests
                  </Label>
                </div>
                <Switch
                  checked={enableContests}
                  onCheckedChange={setEnableContests}
                />
              </div>

              {/* Contest Holes Display */}
              {skillsContestsFromRounds.length > 0 && (
                <div className="mb-4 p-3 bg-white border border-green-200 rounded-lg">
                  <Label className="text-green-800 font-medium text-sm">
                    Skills Contests from Courses:
                  </Label>
                  <div className="mt-2 space-y-1">
                    {skillsContestsFromRounds.map((contest, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-green-700">
                          {contest.roundName} - Hole {contest.hole}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {contest.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  {longestDriveCount > 0 && (
                    <div className="mt-2 text-xs text-green-600">
                      • {longestDriveCount} Longest Drive contest
                      {longestDriveCount !== 1 ? "s" : ""}
                    </div>
                  )}
                  {closestToPinCount > 0 && (
                    <div className="text-xs text-green-600">
                      • {closestToPinCount} Closest to Pin contest
                      {closestToPinCount !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              )}

              {enableContests && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-800">Longest Drive</Label>
                      <div className="flex items-center space-x-1">
                        <span className="text-green-700">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={contestPrizes.longestDrive || ""}
                          onChange={(e) =>
                            setContestPrizes((prev) => ({
                              ...prev,
                              longestDrive: e.target.value
                                ? parseFloat(e.target.value)
                                : 0,
                            }))
                          }
                          placeholder="0.00"
                          className="border-green-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800">Closest to Pin</Label>
                      <div className="flex items-center space-x-1">
                        <span className="text-green-700">$</span>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={contestPrizes.closestToPin || ""}
                          onChange={(e) =>
                            setContestPrizes((prev) => ({
                              ...prev,
                              closestToPin: e.target.value
                                ? parseFloat(e.target.value)
                                : 0,
                            }))
                          }
                          placeholder="0.00"
                          className="border-green-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-green-800">
                      Other Contests (Optional)
                    </Label>
                    <Input
                      value={contestPrizes.other}
                      onChange={(e) =>
                        setContestPrizes((prev) => ({
                          ...prev,
                          other: e.target.value,
                        }))
                      }
                      placeholder="e.g., Most Improved, Putting Contest, etc."
                      className="border-green-200 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          {(buyIn || totalPrizes > 0) && (
            <Alert className="border-blue-200 bg-blue-50">
              <Gift className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <div className="font-semibold mb-2">Prize Summary</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div>Players: {playerCount}</div>
                    {buyIn && <div>Entry Fee: ${buyIn.toFixed(2)} each</div>}
                    {buyIn && (
                      <div>Total Buy-ins: ${totalBuyIns.toFixed(2)}</div>
                    )}
                  </div>
                  <div>
                    {enablePayout && totalPayout > 0 && (
                      <div>Tournament Prizes: ${totalPayout.toFixed(2)}</div>
                    )}
                    {enableContests && totalContestPrizes > 0 && (
                      <div>
                        Contest Prizes: ${totalContestPrizes.toFixed(2)}
                      </div>
                    )}
                    {totalPrizes > 0 && (
                      <div className="font-medium">
                        Total Prizes: ${totalPrizes.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Prize Structure"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
