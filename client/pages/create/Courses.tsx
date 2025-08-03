import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Round } from "@/contexts/TripCreationContext";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Trash2, Calendar, Clock, Trophy } from "lucide-react";

export default function Courses() {
  const navigate = useNavigate();
  const { state, updateCourses, saveRounds } = useTripCreation();
  const { tripData } = state;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [rounds, setRounds] = useState<Round[]>(tripData.rounds.length > 0 ? tripData.rounds : [
    {
      id: '1',
      courseName: '',
      date: '',
      time: '',
      holes: 18,
      yardage: '',
      skillsContests: { enabled: false, holes: '' }
    }
  ]);

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addRound = () => {
    const newRound: Round = {
      id: generateId(),
      courseName: '',
      date: '',
      time: '',
      holes: 18,
      yardage: '',
      skillsContests: { enabled: false, holes: '' }
    };
    setRounds([...rounds, newRound]);
  };

  const removeRound = (id: string) => {
    if (rounds.length > 1) {
      setRounds(rounds.filter(round => round.id !== id));
      // Remove errors for deleted round
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updateRound = (id: string, field: keyof Round, value: any) => {
    setRounds(rounds.map(round => 
      round.id === id 
        ? { ...round, [field]: value }
        : round
    ));
    
    // Clear error for this field
    if (errors[id]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: '' }
      }));
    }
  };

  const updateSkillsContest = (id: string, field: 'enabled' | 'holes', value: boolean | string) => {
    setRounds(rounds.map(round => 
      round.id === id 
        ? { 
            ...round, 
            skillsContests: { 
              ...round.skillsContests,
              [field]: value 
            } 
          }
        : round
    ));
  };

  const validateForm = () => {
    const newErrors: Record<string, Record<string, string>> = {};

    rounds.forEach(round => {
      const roundErrors: Record<string, string> = {};

      if (!round.courseName.trim()) {
        roundErrors.courseName = 'Course name is required';
      }

      if (!round.date) {
        roundErrors.date = 'Date is required';
      }

      if (!round.time) {
        roundErrors.time = 'Tee time is required';
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

  const handleNext = async () => {
    if (validateForm()) {
      setSaving(true);

      // Update context first
      updateCourses(rounds);

      try {
        // Save rounds to Supabase
        const result = await saveRounds();

        if (result.success) {
          toast({
            title: "Courses Saved",
            description: "Golf rounds saved successfully",
          });
          navigate('/app/create/scoring');
        } else {
          toast({
            title: "Save Failed",
            description: result.error || "Failed to save courses",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error('Error saving courses:', error);
        toast({
          title: "Save Failed",
          description: "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  const handlePrevious = () => {
    updateCourses(rounds);
    navigate('/app/create/basic-info');
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
                {/* Course Name */}
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">
                    Course Name *
                  </Label>
                  <Input
                    value={round.courseName}
                    onChange={(e) => updateRound(round.id, 'courseName', e.target.value)}
                    placeholder="e.g., Pebble Beach Golf Links"
                    className={`border-green-200 focus:border-emerald-500 bg-white ${errors[round.id]?.courseName ? 'border-red-300' : ''}`}
                  />
                  {errors[round.id]?.courseName && (
                    <p className="text-sm text-red-600">{errors[round.id].courseName}</p>
                  )}
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
                      onChange={(e) => updateRound(round.id, 'date', e.target.value)}
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[round.id]?.date ? 'border-red-300' : ''}`}
                    />
                    {errors[round.id]?.date && (
                      <p className="text-sm text-red-600">{errors[round.id].date}</p>
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
                      onChange={(e) => updateRound(round.id, 'time', e.target.value)}
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[round.id]?.time ? 'border-red-300' : ''}`}
                    />
                    {errors[round.id]?.time && (
                      <p className="text-sm text-red-600">{errors[round.id].time}</p>
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
                      onChange={(e) => updateRound(round.id, 'holes', parseInt(e.target.value) || 18)}
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[round.id]?.holes ? 'border-red-300' : ''}`}
                    />
                    {errors[round.id]?.holes && (
                      <p className="text-sm text-red-600">{errors[round.id].holes}</p>
                    )}
                  </div>
                </div>

                {/* Optional Fields */}
                <div className="space-y-4 border-t border-green-200 pt-4">
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Course Yardage (Optional)
                    </Label>
                    <Input
                      value={round.yardage || ''}
                      onChange={(e) => updateRound(round.id, 'yardage', e.target.value)}
                      placeholder="e.g., 6,828 yards"
                      className="border-green-200 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  {/* Skills Contests */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-green-800 font-medium flex items-center">
                          <Trophy className="h-4 w-4 mr-1 text-emerald-600" />
                          Skills Contests
                        </Label>
                        <p className="text-sm text-green-600">
                          Add contests like longest drive or closest to pin
                        </p>
                      </div>
                      <Switch
                        checked={round.skillsContests?.enabled || false}
                        onCheckedChange={(checked) => updateSkillsContest(round.id, 'enabled', checked)}
                      />
                    </div>

                    {round.skillsContests?.enabled && (
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">
                          Contest Holes
                        </Label>
                        <Input
                          value={round.skillsContests.holes || ''}
                          onChange={(e) => updateSkillsContest(round.id, 'holes', e.target.value)}
                          placeholder="e.g., 7 (longest drive), 15 (closest to pin)"
                          className="border-green-200 focus:border-emerald-500 bg-white"
                        />
                        <p className="text-sm text-green-600">
                          Specify which holes will have skills contests
                        </p>
                      </div>
                    )}
                  </div>
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
                Total rounds: <Badge variant="secondary" className="ml-1">{rounds.length}</Badge>
                {rounds.some(r => r.skillsContests?.enabled) && (
                  <span className="ml-4">
                    Skills contests: <Badge variant="secondary" className="ml-1">
                      {rounds.filter(r => r.skillsContests?.enabled).length}
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
