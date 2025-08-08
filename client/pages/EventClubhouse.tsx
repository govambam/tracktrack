import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEventTheme } from "@/hooks/useEventTheme";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  BarChart3,
  Megaphone,
  Home,
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
}

interface ClubhouseSession {
  displayName: string;
  sessionId: string;
  eventId: string;
}

interface OutletContext {
  eventData: EventData;
  clubhouseSession: ClubhouseSession;
}

export default function EventClubhouse() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { eventData, clubhouseSession } = useOutletContext<OutletContext>();
  const { currentTheme } = useEventTheme(slug);

  const [loading, setLoading] = useState(true);
  const [rounds, setRounds] = useState<EventRound[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventData) {
      loadRounds();
    }
  }, [eventData]);

  // Check if user has clubhouse access
  useEffect(() => {
    if (!clubhouseSession) {
      // Redirect to home if no clubhouse session
      navigate(`/events/${slug}`);
    }
  }, [clubhouseSession, slug, navigate]);

  const loadRounds = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: roundsData, error: roundsError } = await supabase
        .from("event_rounds")
        .select("*")
        .eq("event_id", eventData.id)
        .order("created_at");

      if (roundsError) {
        console.error("Error loading rounds:", roundsError);
        setError("Failed to load rounds");
        setLoading(false);
        return;
      }

      setRounds(roundsData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error loading rounds:", err);
      setError("Failed to load rounds data");
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

  const formatTime = (timeString?: string) => {
    if (!timeString) return "TBD";
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (!clubhouseSession) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2
            className={`h-8 w-8 animate-spin mx-auto mb-4 ${
              currentTheme === "Masters"
                ? "text-yellow-600"
                : currentTheme === "TourTech"
                  ? "text-orange-600"
                  : "text-blue-600"
            }`}
          />
          <p
            className={`${
              currentTheme === "Masters"
                ? "text-green-800 font-serif"
                : currentTheme === "TourTech"
                  ? "text-gray-700"
                  : "text-blue-700"
            }`}
          >
            Loading clubhouse...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${currentTheme === "TrackTrack" ? "bg-gradient-to-br from-purple-50/50 via-pink-50/50 to-orange-50/50" : ""}`}
    >
      {/* Background elements for TrackTrack theme */}
      {currentTheme === "TrackTrack" && (
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-32 left-20 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/3 w-28 h-28 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
        </div>
      )}

      {/* Welcome Header */}
      <div
        className={`${currentTheme === "TrackTrack" ? "bg-white/90" : "bg-white/80"} backdrop-blur-sm border-b ${currentTheme === "TrackTrack" ? "border-purple-200/50" : "border-slate-200/50"}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div
              className={`w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                currentTheme === "Masters"
                  ? "bg-gradient-to-br from-green-600 to-amber-600"
                  : currentTheme === "TourTech"
                    ? "bg-gradient-to-br from-gray-500 to-gray-600"
                    : currentTheme === "TrackTrack"
                      ? "bg-gradient-to-br from-purple-600 to-pink-600"
                      : "bg-gradient-to-br from-blue-500 to-indigo-600"
              }`}
            >
              <Users className="h-8 w-8 text-white" />
            </div>
            <h1
              className={`text-3xl font-bold mb-2 ${
                currentTheme === "Masters"
                  ? "text-green-900 font-serif"
                  : currentTheme === "TourTech"
                    ? "text-gray-900"
                    : currentTheme === "TrackTrack"
                      ? "text-gray-900"
                      : "text-blue-900"
              }`}
            >
              {currentTheme === "TrackTrack" ? (
                <>
                  Welcome to the{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Clubhouse
                  </span>
                </>
              ) : (
                "Welcome to the Clubhouse"
              )}
            </h1>
            <p
              className={`text-lg ${
                currentTheme === "Masters"
                  ? "text-green-800/70 font-serif"
                  : currentTheme === "TourTech"
                    ? "text-gray-600"
                    : currentTheme === "TrackTrack"
                      ? "text-gray-600"
                      : "text-blue-600"
              }`}
            >
              Welcome back, {clubhouseSession.displayName}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12 relative">
        {/* Scorecard Section */}
        <section>
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-bold mb-2 ${
                currentTheme === "Masters"
                  ? "text-green-900 font-serif"
                  : currentTheme === "TourTech"
                    ? "text-gray-900"
                    : currentTheme === "TrackTrack"
                      ? "text-gray-900"
                      : "text-blue-900"
              }`}
            >
              {currentTheme === "TrackTrack" ? (
                <>
                  Round{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Scorecards
                  </span>
                </>
              ) : (
                "Round Scorecards"
              )}
            </h2>
            <p
              className={`${
                currentTheme === "Masters"
                  ? "text-green-800/70 font-serif"
                  : currentTheme === "TourTech"
                    ? "text-gray-600"
                    : currentTheme === "TrackTrack"
                      ? "text-gray-600"
                      : "text-blue-600"
              }`}
            >
              Select a round to enter or edit scores
            </p>
          </div>

          {rounds.length === 0 ? (
            <Card
              className={`${
                currentTheme === "Masters"
                  ? "border-green-200"
                  : currentTheme === "TourTech"
                    ? "border-gray-200"
                    : currentTheme === "TrackTrack"
                      ? "border-purple-200 bg-white/90 backdrop-blur-sm"
                      : "border-blue-200"
              }`}
            >
              <CardContent className="p-8 text-center">
                <Target
                  className={`h-12 w-12 mx-auto mb-4 ${
                    currentTheme === "Masters"
                      ? "text-yellow-600"
                      : currentTheme === "TourTech"
                        ? "text-orange-600"
                        : currentTheme === "TrackTrack"
                          ? "text-purple-600"
                          : "text-blue-400"
                  }`}
                />
                <h3
                  className={`text-xl font-semibold mb-2 ${
                    currentTheme === "Masters"
                      ? "text-green-900 font-serif"
                      : currentTheme === "TourTech"
                        ? "text-gray-900"
                        : "text-blue-900"
                  }`}
                >
                  No Rounds Available
                </h3>
                <p
                  className={`${
                    currentTheme === "Masters"
                      ? "text-green-800/70 font-serif"
                      : currentTheme === "TourTech"
                        ? "text-gray-600"
                        : "text-blue-600"
                  }`}
                >
                  No tournament rounds have been set up yet. Check back later
                  for scoring opportunities.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rounds.map((round) => (
                <Card
                  key={round.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                    currentTheme === "Masters"
                      ? "border-green-200 hover:border-green-300"
                      : currentTheme === "TourTech"
                        ? "border-gray-200 hover:border-gray-300"
                        : currentTheme === "TrackTrack"
                          ? "bg-white/90 backdrop-blur-sm border-purple-200 hover:border-purple-300 hover:shadow-purple-100/50"
                          : "border-blue-200 hover:border-blue-300"
                  }`}
                  onClick={() =>
                    navigate(`/events/${slug}/clubhouse/scorecard/${round.id}`)
                  }
                >
                  <CardHeader>
                    <CardTitle
                      className={`flex items-center justify-between ${
                        currentTheme === "Masters"
                          ? "text-green-900 font-serif"
                          : currentTheme === "TourTech"
                            ? "text-gray-900"
                            : currentTheme === "TrackTrack"
                              ? "text-gray-900"
                              : "text-blue-900"
                      }`}
                    >
                      <span>Round {rounds.indexOf(round) + 1}</span>
                      <Edit
                        className={`h-4 w-4 ${
                          currentTheme === "Masters"
                            ? "text-yellow-600"
                            : currentTheme === "TourTech"
                              ? "text-orange-600"
                              : currentTheme === "TrackTrack"
                                ? "text-purple-600"
                                : "text-blue-600"
                        }`}
                      />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <MapPin
                        className={`h-4 w-4 ${
                          currentTheme === "Masters"
                            ? "text-yellow-600"
                            : currentTheme === "TourTech"
                              ? "text-orange-600"
                              : currentTheme === "TrackTrack"
                                ? "text-purple-600"
                                : "text-blue-600"
                        }`}
                      />
                      <span className="font-medium">{round.course_name}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Calendar
                        className={`h-4 w-4 ${
                          currentTheme === "Masters"
                            ? "text-yellow-600"
                            : currentTheme === "TourTech"
                              ? "text-orange-600"
                              : currentTheme === "TrackTrack"
                                ? "text-purple-600"
                                : "text-blue-600"
                        }`}
                      />
                      <span className="text-sm">
                        {formatDate(round.round_date)}
                      </span>
                    </div>

                    {round.tee_time && (
                      <div className="flex items-center space-x-2">
                        <Clock
                          className={`h-4 w-4 ${
                            currentTheme === "Masters"
                              ? "text-yellow-600"
                              : currentTheme === "TourTech"
                                ? "text-orange-600"
                                : currentTheme === "TrackTrack"
                                  ? "text-purple-600"
                                  : "text-blue-600"
                          }`}
                        />
                        <span className="text-sm">
                          {formatTime(round.tee_time)}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <Badge
                        variant="secondary"
                        className={`${
                          currentTheme === "Masters"
                            ? "bg-green-100 text-green-800"
                            : currentTheme === "TourTech"
                              ? "bg-gray-100 text-gray-800"
                              : currentTheme === "TrackTrack"
                                ? "bg-purple-100 text-purple-800"
                                : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {round.scoring_type}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {round.holes} holes
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Chat Section */}
        <section>
          <div className="text-center mb-8">
            <h2
              className={`text-3xl font-bold mb-2 ${
                currentTheme === "Masters"
                  ? "text-green-900 font-serif"
                  : currentTheme === "TourTech"
                    ? "text-gray-900"
                    : currentTheme === "TrackTrack"
                      ? "text-gray-900"
                      : "text-blue-900"
              }`}
            >
              {currentTheme === "TrackTrack" ? (
                <>
                  Event{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Chat
                  </span>
                </>
              ) : (
                "Event Chat"
              )}
            </h2>
            <p
              className={`${
                currentTheme === "Masters"
                  ? "text-green-800/70 font-serif"
                  : currentTheme === "TourTech"
                    ? "text-gray-600"
                    : currentTheme === "TrackTrack"
                      ? "text-gray-600"
                      : "text-blue-600"
              }`}
            >
              Stay connected with other players throughout the tournament
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Announcements Channel */}
            <Card
              className={`${
                currentTheme === "Masters"
                  ? "border-green-200"
                  : currentTheme === "TourTech"
                    ? "border-gray-200"
                    : currentTheme === "TrackTrack"
                      ? "border-purple-200 bg-white/90 backdrop-blur-sm"
                      : "border-blue-200"
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center ${
                    currentTheme === "Masters"
                      ? "text-green-900 font-serif"
                      : currentTheme === "TourTech"
                        ? "text-gray-900"
                        : currentTheme === "TrackTrack"
                          ? "text-gray-900"
                          : "text-blue-900"
                  }`}
                >
                  <Megaphone
                    className={`h-5 w-5 mr-2 ${
                      currentTheme === "Masters"
                        ? "text-yellow-600"
                        : currentTheme === "TourTech"
                          ? "text-orange-600"
                          : currentTheme === "TrackTrack"
                            ? "text-purple-600"
                            : "text-blue-600"
                    }`}
                  />
                  Announcements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`rounded-lg p-6 text-center ${
                    currentTheme === "Masters"
                      ? "bg-green-50"
                      : currentTheme === "TourTech"
                        ? "bg-gray-50"
                        : "bg-blue-50"
                  }`}
                >
                  <Megaphone
                    className={`h-12 w-12 mx-auto mb-4 ${
                      currentTheme === "Masters"
                        ? "text-yellow-600"
                        : currentTheme === "TourTech"
                          ? "text-orange-600"
                          : "text-blue-400"
                    }`}
                  />
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      currentTheme === "Masters"
                        ? "text-green-900 font-serif"
                        : currentTheme === "TourTech"
                          ? "text-gray-900"
                          : "text-blue-900"
                    }`}
                  >
                    Coming Soon
                  </h3>
                  <p
                    className={`${
                      currentTheme === "Masters"
                        ? "text-green-800/70 font-serif"
                        : currentTheme === "TourTech"
                          ? "text-gray-600"
                          : "text-blue-600"
                    }`}
                  >
                    Tournament announcements and updates will appear here.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* General Chat Channel */}
            <Card
              className={`${
                currentTheme === "Masters"
                  ? "border-green-200"
                  : currentTheme === "TourTech"
                    ? "border-gray-200"
                    : currentTheme === "TrackTrack"
                      ? "border-purple-200 bg-white/90 backdrop-blur-sm"
                      : "border-blue-200"
              }`}
            >
              <CardHeader>
                <CardTitle
                  className={`flex items-center ${
                    currentTheme === "Masters"
                      ? "text-green-900 font-serif"
                      : currentTheme === "TourTech"
                        ? "text-gray-900"
                        : "text-blue-900"
                  }`}
                >
                  <MessageCircle
                    className={`h-5 w-5 mr-2 ${
                      currentTheme === "Masters"
                        ? "text-yellow-600"
                        : currentTheme === "TourTech"
                          ? "text-orange-600"
                          : "text-blue-600"
                    }`}
                  />
                  General Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`rounded-lg p-6 text-center ${
                    currentTheme === "Masters"
                      ? "bg-green-50"
                      : currentTheme === "TourTech"
                        ? "bg-gray-50"
                        : "bg-blue-50"
                  }`}
                >
                  <MessageCircle
                    className={`h-12 w-12 mx-auto mb-4 ${
                      currentTheme === "Masters"
                        ? "text-yellow-600"
                        : currentTheme === "TourTech"
                          ? "text-orange-600"
                          : "text-blue-400"
                    }`}
                  />
                  <h3
                    className={`text-lg font-semibold mb-2 ${
                      currentTheme === "Masters"
                        ? "text-green-900 font-serif"
                        : currentTheme === "TourTech"
                          ? "text-gray-900"
                          : "text-blue-900"
                    }`}
                  >
                    Coming Soon
                  </h3>
                  <p
                    className={`${
                      currentTheme === "Masters"
                        ? "text-green-800/70 font-serif"
                        : currentTheme === "TourTech"
                          ? "text-gray-600"
                          : "text-blue-600"
                    }`}
                  >
                    Chat with other players during the tournament.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert
            className={`mt-6 ${
              currentTheme === "Masters"
                ? "border-green-200 bg-green-50"
                : currentTheme === "TourTech"
                  ? "border-gray-200 bg-gray-50"
                  : "border-blue-200 bg-blue-50"
            }`}
          >
            <MessageCircle
              className={`h-4 w-4 ${
                currentTheme === "Masters"
                  ? "text-yellow-600"
                  : currentTheme === "TourTech"
                    ? "text-orange-600"
                    : "text-blue-600"
              }`}
            />
            <AlertDescription
              className={`${
                currentTheme === "Masters"
                  ? "text-green-800 font-serif"
                  : currentTheme === "TourTech"
                    ? "text-gray-700"
                    : "text-blue-700"
              }`}
            >
              <strong>Live Chat Coming Soon:</strong> We're working on bringing
              you real-time chat functionality to enhance your tournament
              experience. Stay tuned for updates!
            </AlertDescription>
          </Alert>
        </section>
      </div>
    </div>
  );
}
