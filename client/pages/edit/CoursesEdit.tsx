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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Round, SkillsContest } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Trophy,
  Save,
} from "lucide-react";

export default function CoursesEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state, saveRounds, updateCourses } = useTripCreation();
  const { tripData } = state;

  const [rounds, setRounds] = useState<Round[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadRoundsData();
    }
  }, [eventId]);

  const loadRoundsData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      console.log("Loading rounds data for event:", eventId);

      // Load rounds directly from Supabase to ensure fresh data
      const { data: roundsData, error } = await supabase
        .from("event_rounds")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at");

      if (error) {
        console.error("Error loading rounds:", error);
        // Fall back to one empty round if no data exists
        setRounds([
          {
            id: generateId(),
            courseName: "",
            courseUrl: "",
            date: "",
            time: "",
            holes: 18,
            skillsContests: [],
          },
        ]);
      } else if (roundsData && roundsData.length > 0) {
        // Load skills contests for all rounds
        const { data: skillsContestsData } = await supabase
          .from("skills_contests")
          .select("*")
          .eq("event_id", eventId);

        // Convert database format to component format
        const formattedRounds = roundsData.map((r) => {
          // Find skills contests for this round
          const roundSkillsContests =
            skillsContestsData
              ?.filter((contest) => contest.round_id === r.id)
              ?.map((contest) => ({
                id: contest.id,
                hole: contest.hole,
                type: contest.contest_type as
                  | "longest_drive"
                  | "closest_to_pin",
              })) || [];

          return {
            id: r.id,
            courseName: r.course_name || "",
            courseUrl: r.course_url || "",
            date: r.round_date || "",
            time: r.tee_time || "",
            holes: r.holes || 18,
            skillsContests: roundSkillsContests,
          };
        });
        setRounds(formattedRounds);
        console.log("Loaded rounds with skills contests:", formattedRounds);
      } else {
        // No rounds found, start with one empty round
        setRounds([
          {
            id: generateId(),
            courseName: "",
            courseUrl: "",
            date: "",
            time: "",
            holes: 18,
            skillsContests: [],
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading rounds data:", error);
      setRounds([
        {
          id: generateId(),
          courseName: "",
          courseUrl: "",
          date: "",
          time: "",
          holes: 18,
          skillsContests: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addRound = () => {
    const newRound: Round = {
      id: generateId(),
      courseName: "",
      courseUrl: "",
      date: "",
      time: "",
      holes: 18,
      skillsContests: [],
    };
    const updatedRounds = [...rounds, newRound];
    setRounds(updatedRounds);
    updateCourses(updatedRounds);
  };

  const removeRound = (id: string) => {
    if (rounds.length > 1) {
      const updatedRounds = rounds.filter((round) => round.id !== id);
      setRounds(updatedRounds);
      updateCourses(updatedRounds);
      // Clear errors for removed round
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updateRound = (id: string, field: keyof Round, value: any) => {
    const updatedRounds = rounds.map((round) =>
      round.id === id ? { ...round, [field]: value } : round,
    );
    setRounds(updatedRounds);
    updateCourses(updatedRounds);

    // Clear error for this field
    if (errors[id]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[id][field];
      if (Object.keys(newErrors[id]).length === 0) {
        delete newErrors[id];
      }
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, Record<string, string>> = {};

    rounds.forEach((round) => {
      const roundErrors: Record<string, string> = {};

      if (!round.courseName.trim()) {
        roundErrors.courseName = "Course name is required";
      }

      if (!round.date) {
        roundErrors.date = "Date is required";
      }

      if (round.holes <= 0 || round.holes > 18) {
        roundErrors.holes = "Holes must be between 1 and 18";
      }

      if (Object.keys(roundErrors).length > 0) {
        newErrors[round.id] = roundErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addSkillsContest = (roundId: string) => {
    const newContest: SkillsContest = {
      id: generateId(),
      hole: 1,
      type: "longest_drive",
    };

    setRounds(
      rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              skillsContests: [...(round.skillsContests || []), newContest],
            }
          : round,
      ),
    );
  };

  const removeSkillsContest = (roundId: string, contestId: string) => {
    setRounds(
      rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              skillsContests:
                round.skillsContests?.filter((c) => c.id !== contestId) || [],
            }
          : round,
      ),
    );
  };

  const updateSkillsContest = (
    roundId: string,
    contestId: string,
    field: keyof SkillsContest,
    value: any,
  ) => {
    setRounds(
      rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              skillsContests:
                round.skillsContests?.map((contest) =>
                  contest.id === contestId
                    ? { ...contest, [field]: value }
                    : contest,
                ) || [],
            }
          : round,
      ),
    );
  };

  const handleSave = async () => {
    if (!validateForm() || !eventId) return;

    setSaving(true);

    try {
      console.log(
        "Saving rounds with skills contests:",
        rounds.map((r) => ({
          id: r.id,
          courseName: r.courseName,
          skillsContests: r.skillsContests,
        })),
      );

      const result = await saveRounds(rounds);

      if (result.success) {
        toast({
          title: "Rounds Updated",
          description:
            "Golf rounds and skills contests have been saved successfully",
        });
        // Reload data to ensure UI shows saved state
        await loadRoundsData();
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save rounds",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving rounds:", error);
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
            <MapPin className="h-5 w-5 mr-2 text-purple-600" />
            Golf Rounds
          </CardTitle>
          <CardDescription className="text-purple-600">
            Manage the golf courses and rounds for your event
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {rounds.map((round, index) => (
            <Card key={round.id} className="border-purple-100 bg-purple-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-purple-900">
                    Round {index + 1}
                  </CardTitle>
                  {rounds.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRound(round.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Name */}
                <div className="space-y-2">
                  <Label className="text-purple-900 font-medium">
                    Course Name *
                  </Label>
                  <Input
                    value={round.courseName}
                    onChange={(e) =>
                      updateRound(round.id, "courseName", e.target.value)
                    }
                    placeholder="e.g., Pebble Beach Golf Links"
                    className={`border-purple-200 focus:border-purple-500 ${
                      errors[round.id]?.courseName ? "border-red-300" : ""
                    }`}
                  />
                  {errors[round.id]?.courseName && (
                    <p className="text-sm text-red-600">
                      {errors[round.id].courseName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label className="text-purple-900 font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-purple-600" />
                      Date *
                    </Label>
                    <Input
                      type="date"
                      value={round.date}
                      onChange={(e) =>
                        updateRound(round.id, "date", e.target.value)
                      }
                      className={`border-purple-200 focus:border-purple-500 ${
                        errors[round.id]?.date ? "border-red-300" : ""
                      }`}
                    />
                    {errors[round.id]?.date && (
                      <p className="text-sm text-red-600">
                        {errors[round.id].date}
                      </p>
                    )}
                  </div>

                  {/* Tee Time */}
                  <div className="space-y-2">
                    <Label className="text-purple-900 font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-purple-600" />
                      Tee Time
                    </Label>
                    <Input
                      type="time"
                      value={round.time}
                      onChange={(e) =>
                        updateRound(round.id, "time", e.target.value)
                      }
                      className="border-purple-200 focus:border-purple-500"
                    />
                  </div>

                  {/* Holes */}
                  <div className="space-y-2">
                    <Label className="text-purple-900 font-medium">
                      Holes *
                    </Label>
                    <Select
                      value={round.holes.toString()}
                      onValueChange={(value) =>
                        updateRound(round.id, "holes", parseInt(value))
                      }
                    >
                      <SelectTrigger className="border-purple-200 focus:border-purple-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">9 holes</SelectItem>
                        <SelectItem value="18">18 holes</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors[round.id]?.holes && (
                      <p className="text-sm text-red-600">
                        {errors[round.id].holes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Course URL */}
                <div className="space-y-2">
                  <Label className="text-purple-900 font-medium">
                    Course Website (Optional)
                  </Label>
                  <Input
                    value={round.courseUrl || ""}
                    onChange={(e) =>
                      updateRound(round.id, "courseUrl", e.target.value)
                    }
                    placeholder="e.g., https://www.pebblebeach.com"
                    className="border-purple-200 focus:border-purple-500"
                  />
                </div>

                {/* Skills Contests */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-purple-900 font-medium flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-purple-600" />
                      Skills Contests
                    </Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSkillsContest(round.id)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Contest
                    </Button>
                  </div>

                  {round.skillsContests && round.skillsContests.length > 0 ? (
                    <div className="space-y-2">
                      {round.skillsContests.map((contest) => (
                        <div
                          key={contest.id}
                          className="flex items-center gap-2 p-2 border border-purple-200 rounded bg-white"
                        >
                          <div className="flex-1">
                            <Label className="text-xs text-purple-700">
                              Hole
                            </Label>
                            <Select
                              value={contest.hole.toString()}
                              onValueChange={(value) =>
                                updateSkillsContest(
                                  round.id,
                                  contest.id,
                                  "hole",
                                  parseInt(value),
                                )
                              }
                            >
                              <SelectTrigger className="h-8 border-purple-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: round.holes }, (_, i) => (
                                  <SelectItem
                                    key={i + 1}
                                    value={(i + 1).toString()}
                                  >
                                    Hole {i + 1}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex-1">
                            <Label className="text-xs text-purple-700">
                              Contest Type
                            </Label>
                            <Select
                              value={contest.type}
                              onValueChange={(value) =>
                                updateSkillsContest(
                                  round.id,
                                  contest.id,
                                  "type",
                                  value,
                                )
                              }
                            >
                              <SelectTrigger className="h-8 border-purple-200">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="longest_drive">
                                  Longest Drive
                                </SelectItem>
                                <SelectItem value="closest_to_pin">
                                  Closest to Pin
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              removeSkillsContest(round.id, contest.id)
                            }
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-600 italic">
                      No skills contests added for this round
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Round Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={addRound}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Round
            </Button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Rounds"}
            </Button>
          </div>

          {/* Summary */}
          {rounds.length > 0 && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                <div className="font-semibold">Round Summary</div>
                <div className="mt-1">
                  {rounds.length} round{rounds.length !== 1 ? "s" : ""} planned
                  with a total of{" "}
                  {rounds.reduce((total, round) => total + round.holes, 0)}{" "}
                  holes
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
