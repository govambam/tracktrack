import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  Save,
  Target,
  Calendar,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
  Trophy,
  Plus,
  Minus,
} from "lucide-react";

interface EventRound {
  id: string;
  course_name: string;
  round_date: string;
  tee_time?: string;
  scoring_type: string;
  holes: number;
  round_number: number;
}

interface EventData {
  id: string;
  name: string;
  location: string;
}

interface HoleScore {
  hole: number;
  strokes: number;
  par: number;
}

export default function ScorecardEdit() {
  const { slug, roundId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [round, setRound] = useState<EventRound | null>(null);
  const [session, setSession] = useState<any>(null);
  const [scores, setScores] = useState<HoleScore[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug && roundId) {
      loadData();
      checkSession();
    }
  }, [slug, roundId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load event data
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("id, name, location")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (eventError || !event) {
        setError("Event not found");
        return;
      }

      setEventData(event);

      // Load round data
      const { data: roundData, error: roundError } = await supabase
        .from("event_rounds")
        .select("*")
        .eq("id", roundId)
        .eq("event_id", event.id)
        .single();

      if (roundError || !roundData) {
        setError("Round not found");
        return;
      }

      setRound(roundData);

      // Initialize scores array with default par values
      const initialScores: HoleScore[] = [];
      for (let i = 1; i <= roundData.holes; i++) {
        initialScores.push({
          hole: i,
          strokes: 0,
          par: i <= 4 ? 4 : i <= 14 ? (i % 2 === 0 ? 4 : 3) : 5, // Simple par pattern
        });
      }
      setScores(initialScores);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load scorecard data");
    } finally {
      setLoading(false);
    }
  };

  const checkSession = () => {
    if (!eventData?.id) return;

    const sessionData = localStorage.getItem(
      `clubhouse_session_${eventData.id}`,
    );
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        setSession(parsedSession);
      } catch (error) {
        console.error("Error parsing session:", error);
        navigate(`/events/${slug}/clubhouse`);
      }
    } else {
      navigate(`/events/${slug}/clubhouse`);
    }
  };

  const updateScore = (holeIndex: number, change: number) => {
    setScores((prev) => {
      const newScores = [...prev];
      const currentStrokes = newScores[holeIndex].strokes;
      const newStrokes = Math.max(0, Math.min(15, currentStrokes + change)); // Limit 0-15
      newScores[holeIndex] = { ...newScores[holeIndex], strokes: newStrokes };
      return newScores;
    });
  };

  const setScore = (holeIndex: number, strokes: number) => {
    const validStrokes = Math.max(0, Math.min(15, strokes));
    setScores((prev) => {
      const newScores = [...prev];
      newScores[holeIndex] = { ...newScores[holeIndex], strokes: validStrokes };
      return newScores;
    });
  };

  const calculateTotal = () => {
    return scores.reduce((total, hole) => total + hole.strokes, 0);
  };

  const calculateTotalPar = () => {
    return scores.reduce((total, hole) => total + hole.par, 0);
  };

  const calculateScore = () => {
    const total = calculateTotal();
    const totalPar = calculateTotalPar();
    if (total === 0) return "Not Started";

    const difference = total - totalPar;
    if (difference === 0) return "Even";
    if (difference > 0) return `+${difference}`;
    return `${difference}`;
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate save operation - in real app this would save to database
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);

    // Show success message or handle save result
    alert(
      "Scorecard saved successfully! (This is a demo - scores are not actually stored)",
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-blue-700">Loading scorecard...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData || !round) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center max-w-2xl mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-blue-900 mb-2">
            Scorecard Unavailable
          </h1>
          <p className="text-blue-600 mb-4">{error}</p>
          <Button
            onClick={() => navigate(`/events/${slug}/clubhouse`)}
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clubhouse
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-blue-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate(`/events/${slug}/clubhouse`)}
                variant="outline"
                size="sm"
                className="border-blue-200 text-blue-700 hover:bg-blue-50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-blue-900">
                  Round {round.round_number} Scorecard
                </h1>
                <p className="text-blue-600">
                  {round.course_name} • {session?.displayName}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* Scorecard */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Round Info */}
        <Card className="border-blue-200 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900">
                  {new Date(round.round_date).toLocaleDateString()}
                </span>
              </div>
              {round.tee_time && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span className="text-blue-900">{round.tee_time}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-blue-900">{round.scoring_type}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Summary */}
        <Card className="border-blue-200 mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {calculateTotal()}
                </div>
                <div className="text-sm text-blue-600">Total Strokes</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {calculateTotalPar()}
                </div>
                <div className="text-sm text-blue-600">Total Par</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {calculateScore()}
                </div>
                <div className="text-sm text-blue-600">Score</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">
                  {round.holes}
                </div>
                <div className="text-sm text-blue-600">Holes</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Holes */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scores.map((hole, index) => (
            <Card key={hole.hole} className="border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-center flex items-center justify-between">
                  <span className="text-blue-900">Hole {hole.hole}</span>
                  <Badge
                    variant="outline"
                    className="border-blue-200 text-blue-700"
                  >
                    Par {hole.par}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateScore(index, -1)}
                    disabled={hole.strokes <= 0}
                    className="h-10 w-10 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    value={hole.strokes}
                    onChange={(e) =>
                      setScore(index, parseInt(e.target.value) || 0)
                    }
                    className="w-16 text-center text-lg font-semibold border-blue-200"
                    min="0"
                    max="15"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateScore(index, 1)}
                    disabled={hole.strokes >= 15}
                    className="h-10 w-10 p-0 border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-center text-sm">
                  {hole.strokes > 0 && (
                    <span
                      className={`font-medium ${
                        hole.strokes < hole.par
                          ? "text-green-600"
                          : hole.strokes === hole.par
                            ? "text-blue-600"
                            : hole.strokes === hole.par + 1
                              ? "text-orange-600"
                              : "text-red-600"
                      }`}
                    >
                      {hole.strokes < hole.par
                        ? `Eagle -${hole.par - hole.strokes}`
                        : hole.strokes === hole.par
                          ? "Par"
                          : hole.strokes === hole.par + 1
                            ? "Bogey +1"
                            : `+${hole.strokes - hole.par}`}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Alert className="border-blue-200 bg-blue-50 mt-8">
          <Trophy className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>Demo Mode:</strong> This is a demonstration of the scorecard
            interface. In the full version, scores would be saved to your player
            profile and visible on the leaderboard.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
