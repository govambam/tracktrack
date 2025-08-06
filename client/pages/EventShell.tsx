import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation, Outlet } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useEventTheme } from "@/hooks/useEventTheme";
import { Button } from "@/components/ui/button";
import { ClubhousePasswordModal } from "@/components/ClubhousePasswordModal";
import { Loader2, AlertCircle, Home, BarChart3, Users } from "lucide-react";

interface EventData {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  theme?: string;
  clubhouse_password?: string;
}

interface ClubhouseSession {
  displayName: string;
  sessionId: string;
  eventId: string;
}

export default function EventShell() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTheme } = useEventTheme(slug);

  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showClubhouseModal, setShowClubhouseModal] = useState(false);
  const [clubhouseSession, setClubhouseSession] =
    useState<ClubhouseSession | null>(null);

  useEffect(() => {
    if (slug) {
      loadEventData();
      checkClubhouseSession();
    }
  }, [slug]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

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

      setEventData(event);
      setLoading(false);
    } catch (err) {
      console.error("Error loading event:", err);
      setError("Failed to load event data");
      setLoading(false);
    }
  };

  const checkClubhouseSession = () => {
    const sessionData = localStorage.getItem(`clubhouse_session_${slug}`);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        setClubhouseSession(session);
      } catch (err) {
        console.error("Error parsing clubhouse session:", err);
        localStorage.removeItem(`clubhouse_session_${slug}`);
      }
    }
  };

  const handleClubhouseAccess = () => {
    if (!eventData?.clubhouse_password) {
      return;
    }

    if (clubhouseSession) {
      navigate(`/events/${slug}/clubhouse`);
    } else {
      setShowClubhouseModal(true);
    }
  };

  const handleClubhouseAuth = (session: ClubhouseSession) => {
    setClubhouseSession(session);
    setShowClubhouseModal(false);
    navigate(`/events/${slug}/clubhouse`);
  };

  // Determine current tab based on pathname
  const getCurrentTab = () => {
    const path = location.pathname;
    if (path.includes("/clubhouse")) return "clubhouse";
    if (path.includes("/leaderboard")) return "leaderboard";
    return "home";
  };

  const navigateToTab = (tab: string) => {
    switch (tab) {
      case "home":
        navigate(`/events/${slug}`);
        break;
      case "leaderboard":
        navigate(`/events/${slug}/leaderboard`);
        break;
      case "clubhouse":
        handleClubhouseAccess();
        break;
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          currentTheme === "Masters"
            ? "bg-gradient-to-br from-green-50 to-amber-50"
            : currentTheme === "TourTech"
              ? "bg-gray-50"
              : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <div className="text-center">
          <Loader2
            className={`h-8 w-8 animate-spin mx-auto mb-4 ${
              currentTheme === "Masters"
                ? "text-green-600"
                : currentTheme === "TourTech"
                  ? "text-gray-600"
                  : "text-blue-600"
            }`}
          />
          <p
            className={`${
              currentTheme === "Masters"
                ? "text-green-700 font-serif"
                : currentTheme === "TourTech"
                  ? "text-gray-700"
                  : "text-blue-700"
            }`}
          >
            Loading event...
          </p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          currentTheme === "Masters"
            ? "bg-gradient-to-br from-green-50 to-amber-50"
            : currentTheme === "TourTech"
              ? "bg-gray-50"
              : "bg-gradient-to-br from-blue-50 to-indigo-100"
        }`}
      >
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle
            className={`h-16 w-16 mx-auto mb-4 ${
              currentTheme === "Masters"
                ? "text-green-400"
                : currentTheme === "TourTech"
                  ? "text-gray-400"
                  : "text-blue-400"
            }`}
          />
          <h1
            className={`text-2xl font-bold mb-2 ${
              currentTheme === "Masters"
                ? "text-green-900 font-serif"
                : currentTheme === "TourTech"
                  ? "text-gray-900"
                  : "text-blue-900"
            }`}
          >
            Event Not Found
          </h1>
          <p
            className={`mb-4 ${
              currentTheme === "Masters"
                ? "text-green-600 font-serif"
                : currentTheme === "TourTech"
                  ? "text-gray-600"
                  : "text-blue-600"
            }`}
          >
            {error}
          </p>
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className={`${
              currentTheme === "Masters"
                ? "border-green-200 text-green-700 hover:bg-green-50"
                : currentTheme === "TourTech"
                  ? "border-gray-200 text-gray-700 hover:bg-gray-50"
                  : "border-blue-200 text-blue-700 hover:bg-blue-50"
            }`}
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  const currentTab = getCurrentTab();

  return (
    <div
      className={`min-h-screen ${
        currentTheme === "Masters"
          ? "bg-gradient-to-br from-green-50 to-amber-50"
          : currentTheme === "TourTech"
            ? "bg-gray-50"
            : "bg-gradient-to-br from-blue-50 to-indigo-100"
      }`}
    >
      {/* Persistent Top Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 ${
          currentTheme === "Masters"
            ? "bg-white/98 backdrop-blur-sm border-b border-green-800/20 shadow-sm"
            : "bg-white/95 backdrop-blur-sm border-b border-slate-200/50 shadow-lg"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Event Name */}
            <div
              className={`font-bold ${
                currentTheme === "Masters"
                  ? "text-green-900 font-serif text-lg"
                  : "text-slate-900"
              }`}
            >
              {eventData.name}
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <Button
                variant={currentTab === "home" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigateToTab("home")}
                className={`flex items-center space-x-2 ${
                  currentTab === "home"
                    ? currentTheme === "Masters"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : currentTheme === "TourTech"
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    : currentTheme === "Masters"
                      ? "text-green-800 hover:text-green-600 hover:bg-green-50 font-serif"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>

              <Button
                variant={currentTab === "leaderboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigateToTab("leaderboard")}
                className={`flex items-center space-x-2 ${
                  currentTab === "leaderboard"
                    ? currentTheme === "Masters"
                      ? "bg-green-600 hover:bg-green-700 text-white"
                      : currentTheme === "TourTech"
                        ? "bg-gray-600 hover:bg-gray-700 text-white"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    : currentTheme === "Masters"
                      ? "text-green-800 hover:text-green-600 hover:bg-green-50 font-serif"
                      : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Leaderboard</span>
              </Button>

              <Button
                variant={currentTab === "clubhouse" ? "default" : "ghost"}
                size="sm"
                onClick={() => navigateToTab("clubhouse")}
                disabled={!eventData.clubhouse_password}
                className={`flex items-center space-x-2 ${
                  !eventData.clubhouse_password
                    ? "opacity-50 cursor-not-allowed"
                    : currentTab === "clubhouse"
                      ? currentTheme === "Masters"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : currentTheme === "TourTech"
                          ? "bg-gray-600 hover:bg-gray-700 text-white"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      : currentTheme === "Masters"
                        ? "text-green-800 hover:text-green-600 hover:bg-green-50 font-serif"
                        : "text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>Clubhouse</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-[73px]">
        <Outlet context={{ eventData, clubhouseSession }} />
      </div>

      {/* Clubhouse Password Modal */}
      {showClubhouseModal && eventData && (
        <ClubhousePasswordModal
          isOpen={showClubhouseModal}
          onClose={() => setShowClubhouseModal(false)}
          eventData={eventData}
          onSuccess={handleClubhouseAuth}
        />
      )}
    </div>
  );
}
