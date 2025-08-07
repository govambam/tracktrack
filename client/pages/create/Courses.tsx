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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Round, SkillsContest, Course } from "@/contexts/TripCreationContext";
import { CourseSelector } from "@/components/CourseSelector";
import { useToast } from "@/hooks/use-toast";
import {
  MapPin,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Trophy,
  Globe,
} from "lucide-react";

export default function Courses() {
  const navigate = useNavigate();
  const { state, updateCourses, saveRounds, searchCourses, createCourse } =
    useTripCreation();
  const { tripData } = state;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [rounds, setRounds] = useState<Round[]>(
    tripData.rounds.length > 0
      ? tripData.rounds
      : [
          {
            id: "1",
            courseName: "",
            courseUrl: "",
            date: "",
            time: "",
            holes: 18,
            skillsContests: [],
          },
        ],
  );

  // Update rounds when tripData changes (important for editing existing events)
  useEffect(() => {
    if (tripData.rounds.length > 0) {
      console.log("Updating rounds from tripData:", tripData.rounds);
      setRounds(tripData.rounds);
    }
  }, [tripData.rounds]);

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );

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
    setRounds([...rounds, newRound]);
  };

  const removeRound = (id: string) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter((round) => round.id !== id));
      // Remove errors for deleted round
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updateRound = (id: string, field: keyof Round, value: any) => {
    setRounds(
      rounds.map((round) =>
        round.id === id ? { ...round, [field]: value } : round,
      ),
    );

    // Clear error for this field
    if (errors[id]?.[field]) {
      setErrors((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: "" },
      }));
    }
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

  const updateSkillsContest = (
    roundId: string,
    contestId: string,
    field: "hole" | "type",
    value: number | string,
  ) => {
    setRounds(
      rounds.map((round) =>
        round.id === roundId
          ? {
              ...round,
              skillsContests: (round.skillsContests || []).map((contest) =>
                contest.id === contestId
                  ? { ...contest, [field]: value }
                  : contest,
              ),
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
              skillsContests: (round.skillsContests || []).filter(
                (contest) => contest.id !== contestId,
              ),
            }
          : round,
      ),
    );
  };

  const validateForm = () => {
    console.log("Validating form with rounds:", rounds);
    const newErrors: Record<string, Record<string, string>> = {};

    rounds.forEach((round, index) => {
      console.log(`Validating round ${index}:`, round);
      const roundErrors: Record<string, string> = {};

      if (!round.courseName.trim()) {
        roundErrors.courseName = "Course name is required";
        console.log(`Round ${index}: Course name is empty`);
      }

      if (!round.date) {
        roundErrors.date = "Date is required";
        console.log(`Round ${index}: Date is empty`);
      }

      // Tee time is optional
      // if (!round.time) {
      //   roundErrors.time = 'Tee time is required';
      // }

      if (round.holes <= 0 || round.holes > 18) {
        roundErrors.holes = "Holes must be between 1 and 18";
        console.log(`Round ${index}: Invalid holes count:`, round.holes);
      }

      if (Object.keys(roundErrors).length > 0) {
        console.log(`Round ${index} has errors:`, roundErrors);
        newErrors[round.id] = roundErrors;
      }
    });

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    console.log("Form validation result:", isValid ? "PASSED" : "FAILED");
    console.log("Errors:", newErrors);
    return isValid;
  };

  const handleNext = async () => {
    console.log("Courses handleNext called");
    console.log("Current rounds data:", rounds);
    console.log("Current tripData.id:", tripData.id);

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    setSaving(true);

    // Update context first
    updateCourses(rounds);
    console.log("Updated context with rounds");

    try {
      // Save rounds to Supabase - pass rounds data directly to avoid timing issues
      console.log("Calling saveRounds with direct data...");
      const result = await saveRounds(rounds);
      console.log("SaveRounds result:", result);

      if (result.success) {
        toast({
          title: "Courses Saved",
          description: "Golf rounds saved successfully",
        });
        navigate("/app/create/scoring");
      } else {
        console.error("Save failed with error:", result.error);
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save courses",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving courses:", error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePrevious = () => {
    updateCourses(rounds);
    navigate("/app/create/basic-info");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleNext}
        onPrevious={handlePrevious}
        nextDisabled={saving}
        nextLabel={saving ? "Saving..." : "Next"}
      />

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
            Golf Rounds
          </CardTitle>
          <CardDescription className="text-green-600">
            Add the golf courses and rounds for your trip
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {rounds.map((round, index) => (
            <Card key={round.id} className="border-green-100 bg-green-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-green-900">
                    Round {index + 1}
                  </CardTitle>
                  {rounds.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeRound(round.id)}
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Course Name and URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Course Name *
                    </Label>
                    <CourseSelector
                      value={round.courseId}
                      courseName={round.courseName}
                      onCourseSelect={(course, courseName) => {
                        if (course) {
                          updateRound(round.id, "courseId", course.id);
                          updateRound(round.id, "courseName", course.name);
                          // Note: existing courses table doesn't have website_url field
                          // so we don't auto-populate courseUrl
                        } else if (courseName) {
                          updateRound(round.id, "courseId", undefined);
                          updateRound(round.id, "courseName", courseName);
                        }
                      }}
                      onCourseCreate={createCourse}
                      searchCourses={searchCourses}
                      placeholder="Search for a golf course or enter manually..."
                      className={`${errors[round.id]?.courseName ? "border-red-300" : ""}`}
                    />
                    {errors[round.id]?.courseName && (
                      <p className="text-sm text-red-600">
                        {errors[round.id].courseName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium flex items-center">
                      <Globe className="h-4 w-4 mr-1 text-emerald-600" />
                      Course URL (Optional)
                    </Label>
                    <Input
                      type="url"
                      value={round.courseUrl || ""}
                      onChange={(e) =>
                        updateRound(round.id, "courseUrl", e.target.value)
                      }
                      placeholder="https://example.com/course"
                      className="border-green-200 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-emerald-600" />
                      Date *
                    </Label>
                    <Input
                      type="date"
                      value={round.date}
                      onChange={(e) =>
                        updateRound(round.id, "date", e.target.value)
                      }
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[round.id]?.date ? "border-red-300" : ""}`}
                    />
                    {errors[round.id]?.date && (
                      <p className="text-sm text-red-600">
                        {errors[round.id].date}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-emerald-600" />
                      Tee Time *
                    </Label>
                    <Input
                      type="time"
                      value={round.time}
                      onChange={(e) =>
                        updateRound(round.id, "time", e.target.value)
                      }
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[round.id]?.time ? "border-red-300" : ""}`}
                    />
                    {errors[round.id]?.time && (
                      <p className="text-sm text-red-600">
                        {errors[round.id].time}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Number of Holes *
                    </Label>
                    <Input
                      type="number"
                      min="1"
                      max="18"
                      value={round.holes}
                      onChange={(e) =>
                        updateRound(
                          round.id,
                          "holes",
                          parseInt(e.target.value) || 18,
                        )
                      }
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[round.id]?.holes ? "border-red-300" : ""}`}
                    />
                    {errors[round.id]?.holes && (
                      <p className="text-sm text-red-600">
                        {errors[round.id].holes}
                      </p>
                    )}
                  </div>
                </div>

                {/* Skills Contests */}
                <div className="space-y-4 border-t border-green-200 pt-4">
                  <div>
                    <Label className="text-green-800 font-medium flex items-center">
                      <Trophy className="h-4 w-4 mr-1 text-emerald-600" />
                      Skills Contests
                    </Label>
                    <p className="text-sm text-green-600">
                      Add contests like longest drive or closest to pin
                    </p>
                  </div>

                  {round.skillsContests && round.skillsContests.length > 0 && (
                    <div className="space-y-3">
                      {round.skillsContests.map((contest) => (
                        <div
                          key={contest.id}
                          className="flex items-center space-x-3 p-3 bg-white border border-green-200 rounded-lg"
                        >
                          <div className="flex-1 grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-sm text-green-800">
                                Hole Number
                              </Label>
                              <select
                                value={contest.hole}
                                onChange={(e) =>
                                  updateSkillsContest(
                                    round.id,
                                    contest.id,
                                    "hole",
                                    parseInt(e.target.value),
                                  )
                                }
                                className="w-full px-3 py-2 border border-green-200 rounded-md focus:border-emerald-500 focus:outline-none bg-white"
                              >
                                {Array.from(
                                  { length: round.holes },
                                  (_, i) => i + 1,
                                ).map((holeNum) => (
                                  <option key={holeNum} value={holeNum}>
                                    Hole {holeNum}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="space-y-1">
                              <Label className="text-sm text-green-800">
                                Contest Type
                              </Label>
                              <select
                                value={contest.type}
                                onChange={(e) =>
                                  updateSkillsContest(
                                    round.id,
                                    contest.id,
                                    "type",
                                    e.target.value,
                                  )
                                }
                                className="w-full px-3 py-2 border border-green-200 rounded-md focus:border-emerald-500 focus:outline-none bg-white"
                              >
                                <option value="longest_drive">
                                  Longest Drive
                                </option>
                                <option value="closest_to_pin">
                                  Closest to Pin
                                </option>
                              </select>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              removeSkillsContest(round.id, contest.id)
                            }
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add Contest Button */}
                  <Button
                    variant="outline"
                    onClick={() => addSkillsContest(round.id)}
                    className="w-full border-green-200 text-green-700 hover:bg-green-50 border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contest
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Round Button */}
          <Button
            variant="outline"
            onClick={addRound}
            className="w-full border-green-200 text-green-700 hover:bg-green-50 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Round
          </Button>

          {/* Summary */}
          {rounds.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                Total rounds:{" "}
                <Badge variant="secondary" className="ml-1">
                  {rounds.length}
                </Badge>
                {rounds.some((r) => r.skillsContests?.enabled) && (
                  <span className="ml-4">
                    Skills contests:{" "}
                    <Badge variant="secondary" className="ml-1">
                      {rounds.filter((r) => r.skillsContests?.enabled).length}
                    </Badge>
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
