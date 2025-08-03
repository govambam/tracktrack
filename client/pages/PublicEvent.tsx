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
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Target,
  Plane,
  Lock,
  AlertTriangle,
  Clock,
  DollarSign,
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  description?: string;
  logo_url?: string;
  is_published: boolean;
  is_private: boolean;
  created_at: string;
}

interface RoundData {
  id: string;
  course_name: string;
  round_date: string;
  tee_time?: string;
  holes: number;
  scoring_type: string;
}

interface PlayerData {
  id: string;
  full_name: string;
  email?: string;
  handicap?: number;
  profile_image?: string;
}

interface PrizeData {
  id: string;
  category: string;
  amount?: number;
  description: string;
}

interface TravelData {
  flight_info?: string;
  accommodations?: string;
  daily_schedule?: string;
}

export default function PublicEvent() {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [prizes, setPrizes] = useState<PrizeData[]>([]);
  const [travel, setTravel] = useState<TravelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadEventData();
    }
  }, [slug]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load main event data
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (eventError) {
        if (eventError.code === "PGRST116") {
          setError("Event not found");
        } else {
          setError("Failed to load event");
        }
        return;
      }

      // Check if event is published
      if (!eventData.is_published) {
        setError("Event not found");
        return;
      }

      setEvent(eventData);

      // Load related data in parallel
      const [roundsRes, playersRes, prizesRes, travelRes] = await Promise.all([
        supabase
          .from("event_rounds")
          .select("*")
          .eq("event_id", eventData.id)
          .order("round_date"),
        supabase
          .from("event_players")
          .select("*")
          .eq("event_id", eventData.id)
          .order("created_at"),
        supabase.from("event_prizes").select("*").eq("event_id", eventData.id),
        supabase
          .from("event_travel")
          .select("*")
          .eq("event_id", eventData.id)
          .single(),
      ]);

      if (roundsRes.data) setRounds(roundsRes.data);
      if (playersRes.data) setPlayers(playersRes.data);
      if (prizesRes.data) setPrizes(prizesRes.data);
      if (travelRes.data) setTravel(travelRes.data);
    } catch (error) {
      console.error("Error loading event:", error);
      setError("Failed to load event");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-green-600 text-lg">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The event you're looking for doesn't exist or is no longer
            available.
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  // Private event check
  if (event.is_private) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <Lock className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Private Event
          </h1>
          <p className="text-gray-600 mb-6">
            This is a private golf event. You need an invitation from the event
            organizer to access it.
          </p>
          <Alert className="border-yellow-200 bg-yellow-50 text-left">
            <Lock className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-700">
              <strong>Event organizers:</strong> Full authentication and
              invitation system coming soon. For now, private events show this
              placeholder to non-invited visitors.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex items-start space-x-6">
            {event.logo_url && (
              <img
                src={event.logo_url}
                alt={event.name}
                className="w-20 h-20 object-contain rounded-lg border border-gray-200"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {event.name}
                </h1>
                <Badge variant="default" className="bg-green-600">
                  Published
                </Badge>
              </div>
              <div className="flex items-center text-gray-600 space-x-6 mb-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(event.start_date)} - {formatDate(event.end_date)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {event.location}
                </div>
              </div>
              {event.description && (
                <p className="text-gray-700">{event.description}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* MVP Notice */}
        <Alert className="border-blue-200 bg-blue-50 mb-8">
          <Target className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <strong>
              This is a placeholder for a future custom golf event website.
            </strong>
            The event details are below. In the future, this will be a fully
            customizable event site with registration, leaderboards, and more
            interactive features.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Golf Rounds */}
          {rounds.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-emerald-600" />
                  Golf Rounds
                </CardTitle>
                <CardDescription>
                  Tournament schedule and courses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {rounds.map((round, index) => (
                  <div
                    key={round.id}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">Round {index + 1}</h4>
                      <Badge variant="outline">{round.holes} holes</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        {round.course_name}
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDate(round.round_date)}
                      </div>
                      {round.tee_time && (
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {round.tee_time}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2" />
                        {round.scoring_type === "stableford"
                          ? "Modified Stableford"
                          : "Stroke Play"}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Players */}
          {players.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-emerald-600" />
                  Participants ({players.length})
                </CardTitle>
                <CardDescription>Tournament participants</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {players.map((player) => (
                    <div
                      key={player.id}
                      className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="w-10 h-10 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                        {player.profile_image ? (
                          <img
                            src={player.profile_image}
                            alt={player.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          getPlayerInitials(player.full_name)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {player.full_name}
                        </div>
                        {player.handicap !== undefined && (
                          <div className="text-sm text-gray-600">
                            HCP: {player.handicap}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Prizes */}
          {prizes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2 text-emerald-600" />
                  Prizes & Awards
                </CardTitle>
                <CardDescription>
                  Tournament prizes and competitions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {prizes.map((prize) => (
                  <div
                    key={prize.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {prize.description}
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {prize.category.replace("_", " ")}
                      </div>
                    </div>
                    {prize.amount && prize.amount > 0 && (
                      <div className="flex items-center text-green-600 font-medium">
                        <DollarSign className="h-4 w-4 mr-1" />
                        {prize.amount.toFixed(2)}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Travel Information */}
          {travel &&
            (travel.flight_info ||
              travel.accommodations ||
              travel.daily_schedule) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plane className="h-5 w-5 mr-2 text-emerald-600" />
                    Travel Information
                  </CardTitle>
                  <CardDescription>
                    Logistics and travel details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {travel.flight_info && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Flight Information
                      </h4>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {travel.flight_info}
                      </p>
                    </div>
                  )}
                  {travel.accommodations && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Accommodations
                      </h4>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {travel.accommodations}
                      </p>
                    </div>
                  )}
                  {travel.daily_schedule && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Daily Schedule
                      </h4>
                      <p className="text-gray-600 whitespace-pre-wrap">
                        {travel.daily_schedule}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>Powered by TrackTrack Golf Event Management</p>
        </div>
      </div>
    </div>
  );
}
