import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Round, SkillsContest } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { MapPin, Plus, Trash2, Calendar, Clock, Trophy, Save } from "lucide-react";

export default function CoursesEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state, saveRounds } = useTripCreation();
  const { tripData } = state;

  const [rounds, setRounds] = useState<Round[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    // Initialize rounds with context data
    if (tripData?.rounds && tripData.rounds.length > 0) {
      setRounds(tripData.rounds);
    } else {
      // Initialize with one empty round
      setRounds([{
        id: generateId(),
        courseName: '',
        courseUrl: '',
        date: '',
        time: '',
        holes: 18,
        skillsContests: []
      }]);
    }
  }, [tripData?.rounds]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addRound = () => {
    const newRound: Round = {
      id: generateId(),
      courseName: '',
      courseUrl: '',
      date: '',
      time: '',
      holes: 18,
      skillsContests: []
    };
    setRounds([...rounds, newRound]);
  };

  const removeRound = (id: string) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter(round => round.id !== id));
      // Clear errors for removed round
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updateRound = (id: string, field: keyof Round, value: any) => {
    setRounds(rounds.map(round => 
      round.id === id ? { ...round, [field]: value } : round
    ));
    
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
        roundErrors.courseName = 'Course name is required';
      }

      if (!round.date) {
        roundErrors.date = 'Date is required';
      }

      if (round.holes <= 0 || round.holes > 18) {
        roundErrors.holes = 'Holes must be between 1 and 18';
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
      type: 'longest_drive'
    };

    setRounds(rounds.map(round =>
      round.id === roundId
        ? { ...round, skillsContests: [...(round.skillsContests || []), newContest] }
        : round
    ));
  };

  const removeSkillsContest = (roundId: string, contestId: string) => {
    setRounds(rounds.map(round =>
      round.id === roundId
        ? { ...round, skillsContests: round.skillsContests?.filter(c => c.id !== contestId) || [] }
        : round
    ));
  };

  const updateSkillsContest = (roundId: string, contestId: string, field: keyof SkillsContest, value: any) => {
    setRounds(rounds.map(round =>
      round.id === roundId
        ? {
            ...round,
            skillsContests: round.skillsContests?.map(contest =>
              contest.id === contestId ? { ...contest, [field]: value } : contest
            ) || []
          }
        : round
    ));
  };

  const handleSave = async () => {
    if (!validateForm() || !eventId) return;

    setSaving(true);

    try {
      const result = await saveRounds(rounds);

      if (result.success) {
        toast({
          title: "Rounds Updated",
          description: "Golf rounds and skills contests have been saved successfully",
        });
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save rounds",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving rounds:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg text-green-900 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
            Golf Rounds
          </CardTitle>
          <CardDescription className="text-green-600">
            Manage the golf courses and rounds for your event
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {rounds.map((round, index) => (
            <Card key={round.id} className="border-green-100 bg-green-50">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base text-green-900">
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
                  <Label className="text-green-800 font-medium">
                    Course Name *
                  </Label>
                  <Input
                    value={round.courseName}
                    onChange={(e) => updateRound(round.id, 'courseName', e.target.value)}
                    placeholder="e.g., Pebble Beach Golf Links"
                    className={`border-green-200 focus:border-emerald-500 ${
                      errors[round.id]?.courseName ? 'border-red-300' : ''
                    }`}
                  />
                  {errors[round.id]?.courseName && (
                    <p className="text-sm text-red-600">{errors[round.id].courseName}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Date */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-emerald-600" />
                      Date *
                    </Label>
                    <Input
                      type="date"
                      value={round.date}
                      onChange={(e) => updateRound(round.id, 'date', e.target.value)}
                      className={`border-green-200 focus:border-emerald-500 ${
                        errors[round.id]?.date ? 'border-red-300' : ''
                      }`}
                    />
                    {errors[round.id]?.date && (
                      <p className="text-sm text-red-600">{errors[round.id].date}</p>
                    )}
                  </div>

                  {/* Tee Time */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium flex items-center">
                      <Clock className="h-4 w-4 mr-1 text-emerald-600" />
                      Tee Time
                    </Label>
                    <Input
                      type="time"
                      value={round.time}
                      onChange={(e) => updateRound(round.id, 'time', e.target.value)}
                      className="border-green-200 focus:border-emerald-500"
                    />
                  </div>

                  {/* Holes */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Holes *
                    </Label>
                    <Select
                      value={round.holes.toString()}
                      onValueChange={(value) => updateRound(round.id, 'holes', parseInt(value))}
                    >
                      <SelectTrigger className="border-green-200 focus:border-emerald-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="9">9 holes</SelectItem>
                        <SelectItem value="18">18 holes</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors[round.id]?.holes && (
                      <p className="text-sm text-red-600">{errors[round.id].holes}</p>
                    )}
                  </div>
                </div>

                {/* Course Details */}
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">
                    Course Yardage (Optional)
                  </Label>
                  <Input
                    value={round.yardage}
                    onChange={(e) => updateRound(round.id, 'yardage', e.target.value)}
                    placeholder="e.g., 6,800 yards"
                    className="border-green-200 focus:border-emerald-500"
                  />
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
              {saving ? 'Saving...' : 'Save Rounds'}
            </Button>
          </div>

          {/* Summary */}
          {rounds.length > 0 && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Trophy className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                <div className="font-semibold">Round Summary</div>
                <div className="mt-1">
                  {rounds.length} round{rounds.length !== 1 ? 's' : ''} planned with a total of{' '}
                  {rounds.reduce((total, round) => total + round.holes, 0)} holes
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
