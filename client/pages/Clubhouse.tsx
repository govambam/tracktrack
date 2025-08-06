import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEventTheme } from "@/hooks/useEventTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Trophy,
  MessageCircle,
  Calendar,
  MapPin,
  Clock,
  Target,
  Edit,
  Loader2,
  AlertCircle,
  Home,
  BarChart3,
  Megaphone,
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
}

interface EventRound {
  id: string;
  course_name: string;
  round_date: string;
  tee_time?: string;
  scoring_type: string;
  holes: number;
  round_number: number;
}

interface ClubhouseSession {
  displayName: string;
  sessionId: string;
  eventId: string;
}

export default function Clubhouse() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentTheme, theme, loading: themeLoading } = useEventTheme(slug);
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [rounds, setRounds] = useState<EventRound[]>([]);
  const [session, setSession] = useState<ClubhouseSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("scores");

  useEffect(() => {
    if (slug) {
      loadEventData();
      checkExistingSession();
    }
  }, [slug]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load main event data
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      if (eventError || !event) {
        setError("Event not found or not published");
        setLoading(false);
        return;
      }

      if (!event.clubhouse_password) {
        setError("Clubhouse is not enabled for this event");
        setLoading(false);
        return;
      }

      setEventData(event);

      // Load rounds data
      const { data: roundsData, error: roundsError } = await supabase
        .from("event_rounds")
        .select("*")
        .eq("event_id", event.id)
        .order("round_date");

      if (!roundsError) {
        setRounds(roundsData || []);
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      setError("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const checkExistingSession = async () => {
    // First get the event ID from the slug
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", slug)
      .eq("is_published", true)
      .single();

    if (eventError || !event) return;

    const sessionData = localStorage.getItem(`clubhouse_session_${event.id}`);
    if (sessionData) {
      try {
        const parsedSession = JSON.parse(sessionData);
        setSession(parsedSession);
      } catch (error) {
        console.error("Error parsing session data:", error);
        localStorage.removeItem(`clubhouse_session_${event.id}`);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getScoringFormatDisplay = (scoringType: string) => {
    switch (scoringType) {
      case "stroke_play":
        return "Stroke Play";
      case "stableford":
        return "Stableford";
      default:
        return scoringType;
    }
  };

  if (loading || themeLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme === "Masters" ? "bg-gradient-to-br from-green-50 to-amber-50" : currentTheme === "TourTech" ? "bg-gray-50" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
        <div className="text-center">
          <Loader2 className={`h-8 w-8 animate-spin mx-auto mb-4 ${currentTheme === "Masters" ? "text-green-600" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`} />
          <p className={`${currentTheme === "Masters" ? "text-green-700 font-serif" : currentTheme === "TourTech" ? "text-gray-700" : "text-blue-700"}`}>Loading clubhouse...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme === "Masters" ? "bg-gradient-to-br from-green-50 to-amber-50" : currentTheme === "TourTech" ? "bg-gray-50" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
        <div className="text-center max-w-2xl mx-auto p-6">
          <AlertCircle className={`h-16 w-16 mx-auto mb-4 ${currentTheme === "Masters" ? "text-green-400" : currentTheme === "TourTech" ? "text-gray-400" : "text-blue-400"}`} />
          <h1 className={`text-2xl font-bold mb-2 ${currentTheme === "Masters" ? "text-green-900 font-serif" : currentTheme === "TourTech" ? "text-gray-900" : "text-blue-900"}`}>
            Clubhouse Unavailable
          </h1>
          <p className={`mb-4 ${currentTheme === "Masters" ? "text-green-600 font-serif" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`}>{error}</p>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className={`${currentTheme === "Masters" ? "border-green-200 text-green-700 hover:bg-green-50" : currentTheme === "TourTech" ? "border-gray-200 text-gray-700 hover:bg-gray-50" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
          >
            <Home className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${currentTheme === "Masters" ? "bg-gradient-to-br from-green-50 to-amber-50" : currentTheme === "TourTech" ? "bg-gray-50" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
        <div className="text-center max-w-2xl mx-auto p-6">
          <Users className={`h-16 w-16 mx-auto mb-4 ${currentTheme === "Masters" ? "text-green-400" : currentTheme === "TourTech" ? "text-gray-400" : "text-blue-400"}`} />
          <h1 className={`text-2xl font-bold mb-2 ${currentTheme === "Masters" ? "text-green-900 font-serif" : currentTheme === "TourTech" ? "text-gray-900" : "text-blue-900"}`}>
            Access Required
          </h1>
          <p className={`mb-4 ${currentTheme === "Masters" ? "text-green-600 font-serif" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`}>
            You need to authenticate to access the clubhouse.
          </p>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className={`${currentTheme === "Masters" ? "border-green-200 text-green-700 hover:bg-green-50" : currentTheme === "TourTech" ? "border-gray-200 text-gray-700 hover:bg-gray-50" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
          >
            <Home className="h-4 w-4 mr-2" />
            Return to Event
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentTheme === "Masters" ? "bg-gradient-to-br from-green-50 to-amber-50" : currentTheme === "TourTech" ? "bg-gray-50" : "bg-gradient-to-br from-blue-50 to-indigo-100"}`}>
      {/* Header */}
      <div className={`bg-white shadow-sm ${currentTheme === "Masters" ? "border-b border-green-200" : currentTheme === "TourTech" ? "border-b border-gray-200" : "border-b border-blue-200"}`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${currentTheme === "Masters" ? "bg-gradient-to-br from-green-600 to-amber-600" : currentTheme === "TourTech" ? "bg-gradient-to-br from-gray-500 to-gray-600" : "bg-gradient-to-br from-blue-500 to-indigo-600"}`}>
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl font-bold ${currentTheme === "Masters" ? "text-green-900 font-serif" : currentTheme === "TourTech" ? "text-gray-900" : "text-blue-900"}`}>
                  {eventData.name} Clubhouse
                </h1>
                <p className={`${currentTheme === "Masters" ? "text-green-600 font-serif" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`}>
                  Welcome back, {session.displayName}
                </p>
              </div>
            </div>
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className={`${currentTheme === "Masters" ? "border-green-200 text-green-700 hover:bg-green-50" : currentTheme === "TourTech" ? "border-gray-200 text-gray-700 hover:bg-gray-50" : "border-blue-200 text-blue-700 hover:bg-blue-50"}`}
            >
              <Home className="h-4 w-4 mr-2" />
              Back to Event
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:grid-cols-2">
            <TabsTrigger value="scores" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Scores</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center space-x-2">
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </TabsTrigger>
          </TabsList>

          {/* Scores Tab */}
          <TabsContent value="scores" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Round Scorecards
              </h2>
              <p className="text-blue-600">
                View and edit scorecards for each round of the tournament
              </p>
            </div>

            {rounds.length === 0 ? (
              <Card className={`${currentTheme === "Masters" ? "border-green-200" : currentTheme === "TourTech" ? "border-gray-200" : "border-blue-200"}`}>
                <CardContent className="p-8 text-center">
                  <Target className={`h-12 w-12 mx-auto mb-4 ${currentTheme === "Masters" ? "text-green-400" : currentTheme === "TourTech" ? "text-gray-400" : "text-blue-400"}`} />
                  <h3 className={`text-xl font-semibold mb-2 ${currentTheme === "Masters" ? "text-green-900 font-serif" : currentTheme === "TourTech" ? "text-gray-900" : "text-blue-900"}`}>
                    No Rounds Available
                  </h3>
                  <p className={`${currentTheme === "Masters" ? "text-green-600 font-serif" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`}>
                    Rounds will appear here once they are added to the event.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {rounds.map((round, index) => (
                  <Card
                    key={round.id}
                    className={`transition-all duration-300 hover:shadow-lg ${currentTheme === "Masters" ? "border-green-200 hover:border-green-300" : currentTheme === "TourTech" ? "border-gray-200 hover:border-gray-300" : "border-blue-200 hover:border-blue-300"}`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className={`flex items-center ${currentTheme === "Masters" ? "text-green-900 font-serif" : currentTheme === "TourTech" ? "text-gray-900" : "text-blue-900"}`}>
                          <Trophy className={`h-5 w-5 mr-2 ${currentTheme === "Masters" ? "text-green-600" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`} />
                          Round {index + 1}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className={`${currentTheme === "Masters" ? "border-green-200 text-green-700" : currentTheme === "TourTech" ? "border-gray-200 text-gray-700" : "border-blue-200 text-blue-700"}`}
                        >
                          {getScoringFormatDisplay(round.scoring_type)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className={`font-semibold mb-2 ${currentTheme === "Masters" ? "text-green-900 font-serif" : currentTheme === "TourTech" ? "text-gray-900" : "text-blue-900"}`}>
                          {round.course_name}
                        </h4>
                        <div className="space-y-2">
                          {round.round_date && (
                            <div className={`flex items-center space-x-2 text-sm ${currentTheme === "Masters" ? "text-green-600 font-serif" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`}>
                              <Calendar className="h-4 w-4" />
                              <span>{formatDate(round.round_date)}</span>
                            </div>
                          )}
                          {round.tee_time && (
                            <div className={`flex items-center space-x-2 text-sm ${currentTheme === "Masters" ? "text-green-600 font-serif" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`}>
                              <Clock className="h-4 w-4" />
                              <span>Tee Time: {round.tee_time}</span>
                            </div>
                          )}
                          <div className={`flex items-center space-x-2 text-sm ${currentTheme === "Masters" ? "text-green-600 font-serif" : currentTheme === "TourTech" ? "text-gray-600" : "text-blue-600"}`}>
                            <Target className="h-4 w-4" />
                            <span>{round.holes} holes</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        className={`w-full text-white ${currentTheme === "Masters" ? "bg-green-600 hover:bg-green-700" : currentTheme === "TourTech" ? "bg-gray-600 hover:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}`}
                        onClick={() => {
                          navigate(
                            `/events/${slug}/clubhouse/scorecard/${round.id}`,
                          );
                        }}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Scorecard
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Chat Tab */}
          <TabsContent value="chat" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-blue-900 mb-2">
                Event Chat
              </h2>
              <p className="text-blue-600">
                Stay connected with other players throughout the tournament
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Announcements Channel */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center">
                    <Megaphone className="h-5 w-5 mr-2 text-blue-600" />
                    Announcements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <Megaphone className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Coming Soon
                    </h3>
                    <p className="text-blue-600">
                      Tournament announcements and updates will appear here.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* General Chat Channel */}
              <Card className="border-blue-200">
                <CardHeader>
                  <CardTitle className="text-blue-900 flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2 text-blue-600" />
                    General Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 rounded-lg p-6 text-center">
                    <MessageCircle className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      Coming Soon
                    </h3>
                    <p className="text-blue-600">
                      Chat with other players during the tournament.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <MessageCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                <strong>Live Chat Coming Soon:</strong> We're working on
                bringing you real-time chat functionality to enhance your
                tournament experience. Stay tuned for updates!
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
