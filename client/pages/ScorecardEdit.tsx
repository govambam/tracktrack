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
  Users,
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

interface EventPlayer {
  id: string;
  full_name: string;
  user_id?: string;
  status: string;
}

interface HoleScore {
  hole: number;
  strokes: number;
  par: number;
  yardage?: number;
  handicap?: number;
}

interface Player {
  id: string;
  name: string;
  scores: HoleScore[];
  totalStrokes: number;
  totalPar: number;
  scoreRelativeToPar: number;
}

export default function ScorecardEdit() {
  const { slug, roundId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [round, setRound] = useState<EventRound | null>(null);
  const [session, setSession] = useState<any>(null);
  const [courseHoles, setCourseHoles] = useState<HoleScore[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  // Remove currentPlayer and currentEventPlayer - any clubhouse user can edit any player
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

      // Load course holes with par information
      const { data: holesData, error: holesError } = await supabase
        .from("course_holes")
        .select("*")
        .eq("course_name", roundData.course_name)
        .order("hole_number");

      let holes: HoleScore[] = [];
      if (holesData && holesData.length > 0) {
        holes = holesData.map((hole) => ({
          hole: hole.hole_number,
          strokes: 0,
          par: hole.par,
          yardage: hole.yardage,
          handicap: hole.handicap,
        }));
      } else {
        // Fallback: create default holes if no course data
        for (let i = 1; i <= roundData.holes; i++) {
          holes.push({
            hole: i,
            strokes: 0,
            par: i <= 4 ? 4 : i <= 14 ? (i % 2 === 0 ? 4 : 3) : 5,
          });
        }
      }

      setCourseHoles(holes);

      // Load all existing event players and their scores
      await loadEventPlayersAndScores(event.id, roundId, holes);
    } catch (error) {
      console.error("Error loading data:", error);
      setError("Failed to load scorecard data");
    } finally {
      setLoading(false);
    }
  };

  const loadEventPlayersAndScores = async (
    eventId: string,
    roundId: string,
    holes: HoleScore[],
  ) => {
    try {
      // Load all existing event players (don't create new ones)
      const { data: eventPlayers, error: playersError } = await supabase
        .from("event_players")
        .select("*")
        .eq("event_id", eventId)
        .in("status", ["accepted", "invited"]) // Include both accepted and invited players
        .order("full_name");

      if (playersError) {
        console.error("Error loading players:", playersError);
        return;
      }

      const playersData: Player[] = [];

      for (const eventPlayer of eventPlayers || []) {
        // Load existing scores for this player and round
        const { data: existingScores } = await supabase
          .from("scorecards")
          .select("hole_number, strokes")
          .eq("event_id", eventId)
          .eq("event_round_id", roundId)
          .eq("event_player_id", eventPlayer.id);

        const playerHoles = holes.map((hole) => {
          const existingScore = existingScores?.find(
            (score) => score.hole_number === hole.hole,
          );
          return {
            ...hole,
            strokes: existingScore?.strokes || 0,
          };
        });

        const totalStrokes = playerHoles.reduce(
          (sum, hole) => sum + hole.strokes,
          0,
        );
        const totalPar = playerHoles.reduce((sum, hole) => sum + hole.par, 0);

        playersData.push({
          id: eventPlayer.id,
          name: eventPlayer.full_name,
          scores: playerHoles,
          totalStrokes,
          totalPar,
          scoreRelativeToPar: totalStrokes - totalPar,
        });
      }

      setPlayers(playersData);
    } catch (error) {
      console.error("Error loading players and scores:", error);
    }
  };

  const checkSession = async () => {
    // Get event ID from slug first
    const { data: event } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .single();

    if (!event) return;

    const sessionData = localStorage.getItem(`clubhouse_session_${event.id}`);
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        setSession(parsedSession);
        // No need to match with event_players - any clubhouse user can edit all scores
      } catch (error) {
        console.error("Error parsing session:", error);
        navigate(`/events/${slug}/clubhouse`);
      }
    } else {
      navigate(`/events/${slug}/clubhouse`);
    }
  };

  const updateScore = (playerId: string, holeIndex: number, change: number) => {
    setPlayers((prev) =>
      prev.map((player) => {
        if (player.id !== playerId) return player;

        const newScores = [...player.scores];
        const currentStrokes = newScores[holeIndex].strokes;
        const newStrokes = Math.max(0, Math.min(15, currentStrokes + change));
        newScores[holeIndex] = { ...newScores[holeIndex], strokes: newStrokes };

        const totalStrokes = newScores.reduce(
          (sum, hole) => sum + hole.strokes,
          0,
        );
        const totalPar = newScores.reduce((sum, hole) => sum + hole.par, 0);

        return {
          ...player,
          scores: newScores,
          totalStrokes,
          totalPar,
          scoreRelativeToPar: totalStrokes - totalPar,
        };
      }),
    );

    if (playerId === currentEventPlayer?.id) {
      setCurrentPlayer((prev) =>
        prev
          ? {
              ...prev,
              scores: prev.scores.map((score, idx) =>
                idx === holeIndex
                  ? {
                      ...score,
                      strokes: Math.max(
                        0,
                        Math.min(15, score.strokes + change),
                      ),
                    }
                  : score,
              ),
            }
          : null,
      );
    }
  };

  const handleSave = async () => {
    if (
      !eventData ||
      !round ||
      !session ||
      !currentPlayer ||
      !currentEventPlayer
    )
      return;

    setSaving(true);
    try {
      // Save each hole score using your existing scorecards table structure
      for (const holeScore of currentPlayer.scores) {
        // Check if score already exists
        const { data: existingScore } = await supabase
          .from("scorecards")
          .select("id")
          .eq("event_id", eventData.id)
          .eq("event_round_id", round.id)
          .eq("event_player_id", currentEventPlayer.id)
          .eq("hole_number", holeScore.hole)
          .single();

        if (existingScore) {
          // Update existing score
          await supabase
            .from("scorecards")
            .update({
              strokes: holeScore.strokes,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existingScore.id);
        } else {
          // Insert new score (only if strokes > 0 to avoid empty records)
          if (holeScore.strokes > 0) {
            await supabase.from("scorecards").insert({
              event_id: eventData.id,
              event_round_id: round.id,
              event_player_id: currentEventPlayer.id,
              hole_number: holeScore.hole,
              strokes: holeScore.strokes,
            });
          }
        }
      }

      alert("Scorecard saved successfully!");
    } catch (error) {
      console.error("Error saving scorecard:", error);
      alert("Failed to save scorecard. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const formatScore = (strokes: number, par: number) => {
    if (strokes === 0) return "";
    const diff = strokes - par;
    if (diff <= -2) return "E"; // Eagle or better
    if (diff === -1) return "B"; // Birdie
    if (diff === 0) return "P"; // Par
    if (diff === 1) return "+"; // Bogey
    return strokes.toString(); // Double bogey or worse, show actual strokes
  };

  const getScoreColor = (strokes: number, par: number) => {
    if (strokes === 0) return "text-gray-400";
    const diff = strokes - par;
    if (diff <= -2) return "text-yellow-600 font-bold"; // Eagle
    if (diff === -1) return "text-green-600 font-bold"; // Birdie
    if (diff === 0) return "text-blue-600"; // Par
    if (diff === 1) return "text-orange-600"; // Bogey
    return "text-red-600"; // Double bogey+
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
        <div className="max-w-7xl mx-auto px-6 py-4">
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
              disabled={saving || !currentPlayer}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {saving ? "Saving..." : "Save Scorecard"}
            </Button>
          </div>
        </div>
      </div>

      {/* Golf Scorecard */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Course Information */}
        <Card className="border-blue-200 mb-6">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center">
              <Target className="h-5 w-5 mr-2" />
              {round.course_name} - Round {round.round_number}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span>{new Date(round.round_date).toLocaleDateString()}</span>
              </div>
              {round.tee_time && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>{round.tee_time}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-600" />
                <span>
                  {players.length} Player{players.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span>{round.scoring_type.replace("_", " ")}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traditional Golf Scorecard */}
        <Card className="border-blue-200">
          <CardContent className="p-0 overflow-x-auto">
            <div className="min-w-[800px]">
              <table className="w-full">
                {/* Header Row */}
                <thead>
                  <tr className="bg-green-50 border-b-2 border-green-200">
                    <th className="text-left p-3 font-semibold text-green-800 min-w-[120px]">
                      Player
                    </th>
                    {courseHoles.map((hole) => (
                      <th
                        key={hole.hole}
                        className="text-center p-2 font-semibold text-green-800 w-12"
                      >
                        {hole.hole}
                      </th>
                    ))}
                    <th className="text-center p-3 font-semibold text-green-800 min-w-[60px]">
                      OUT
                    </th>
                    <th className="text-center p-3 font-semibold text-green-800 min-w-[60px]">
                      TOTAL
                    </th>
                  </tr>
                </thead>

                {/* Par Row */}
                <tbody>
                  <tr className="bg-blue-50 border-b border-blue-200">
                    <td className="font-semibold p-3 text-blue-800">PAR</td>
                    {courseHoles.map((hole) => (
                      <td
                        key={`par-${hole.hole}`}
                        className="text-center p-2 font-semibold text-blue-800"
                      >
                        {hole.par}
                      </td>
                    ))}
                    <td className="text-center p-3 font-semibold text-blue-800">
                      {courseHoles
                        .slice(0, 9)
                        .reduce((sum, hole) => sum + hole.par, 0)}
                    </td>
                    <td className="text-center p-3 font-semibold text-blue-800">
                      {courseHoles.reduce((sum, hole) => sum + hole.par, 0)}
                    </td>
                  </tr>

                  {/* Yardage Row (if available) */}
                  {courseHoles.some((hole) => hole.yardage) && (
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <td className="font-semibold p-3 text-gray-600">YDS</td>
                      {courseHoles.map((hole) => (
                        <td
                          key={`yds-${hole.hole}`}
                          className="text-center p-2 text-xs text-gray-600"
                        >
                          {hole.yardage || ""}
                        </td>
                      ))}
                      <td className="text-center p-3 text-gray-600">
                        {courseHoles
                          .slice(0, 9)
                          .reduce((sum, hole) => sum + (hole.yardage || 0), 0)}
                      </td>
                      <td className="text-center p-3 text-gray-600">
                        {courseHoles.reduce(
                          (sum, hole) => sum + (hole.yardage || 0),
                          0,
                        )}
                      </td>
                    </tr>
                  )}

                  {/* Player Rows */}
                  {players.map((player) => (
                    <tr
                      key={player.id}
                      className={`border-b border-gray-200 ${
                        player.id === currentEventPlayer?.id
                          ? "bg-blue-50"
                          : "bg-white"
                      } hover:bg-gray-50`}
                    >
                      <td className="font-semibold p-3 text-gray-900">
                        {player.name}
                        {player.id === currentEventPlayer?.id && (
                          <span className="text-blue-600 text-sm ml-2">
                            (You)
                          </span>
                        )}
                      </td>
                      {player.scores.map((hole, holeIndex) => (
                        <td
                          key={`${player.id}-${hole.hole}`}
                          className="text-center p-1"
                        >
                          {player.id === currentEventPlayer?.id ? (
                            <div className="flex items-center justify-center space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateScore(player.id, holeIndex, -1)
                                }
                                disabled={hole.strokes <= 0}
                                className="h-6 w-6 p-0 text-xs hover:bg-red-100"
                              >
                                -
                              </Button>
                              <span
                                className={`font-bold text-sm min-w-[20px] ${getScoreColor(
                                  hole.strokes,
                                  hole.par,
                                )}`}
                              >
                                {formatScore(hole.strokes, hole.par) ||
                                  hole.strokes ||
                                  ""}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  updateScore(player.id, holeIndex, 1)
                                }
                                disabled={hole.strokes >= 15}
                                className="h-6 w-6 p-0 text-xs hover:bg-green-100"
                              >
                                +
                              </Button>
                            </div>
                          ) : (
                            <span
                              className={`font-bold ${getScoreColor(
                                hole.strokes,
                                hole.par,
                              )}`}
                            >
                              {formatScore(hole.strokes, hole.par) ||
                                hole.strokes ||
                                ""}
                            </span>
                          )}
                        </td>
                      ))}
                      <td className="text-center p-3 font-semibold">
                        {player.scores
                          .slice(0, 9)
                          .reduce((sum, hole) => sum + hole.strokes, 0) || ""}
                      </td>
                      <td className="text-center p-3 font-bold text-lg">
                        <div>
                          {player.totalStrokes || ""}
                          {player.totalStrokes > 0 && (
                            <div className="text-sm text-gray-600">
                              {player.scoreRelativeToPar === 0
                                ? "E"
                                : player.scoreRelativeToPar > 0
                                  ? `+${player.scoreRelativeToPar}`
                                  : player.scoreRelativeToPar}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <Card className="border-blue-200 mt-6">
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-4 justify-center text-sm">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600 font-bold">E</span>
                <span>Eagle (-2 or better)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-green-600 font-bold">B</span>
                <span>Birdie (-1)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-blue-600 font-bold">P</span>
                <span>Par (Even)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-orange-600 font-bold">+</span>
                <span>Bogey (+1)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-bold">#</span>
                <span>Double Bogey+ (Shows strokes)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
