import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  MapPin,
  Users,
  Plus,
  Edit,
  ExternalLink,
  Globe,
  Eye,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { useToast } from "@/hooks/use-toast";
import { CreateEventModal } from "@/components/CreateEventModal";
import { AIQuickstartForm } from "@/components/AIQuickstartForm";
import { DraftPreviewModal } from "@/components/DraftPreviewModal";
import { useFeatureEnabled } from "@/contexts/GrowthBookContext";

interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
  is_private: boolean;
  is_published: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
  // Role information for the current user
  user_role?: "owner" | "admin" | "player";
  created_by?: string;
  invitation_status?: "invited" | "accepted" | "declined" | "pending";
}

export default function MyTrips() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIQuickstart, setShowAIQuickstart] = useState(false);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [draftEventId, setDraftEventId] = useState<string | null>(null);
  const { loadEvent, loadCompleteEvent, resetTrip } = useTripCreation();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Feature flag for AI quickstart flow
  const isAIQuickstartEnabled = useFeatureEnabled("ai_quickstart_create_flow");

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    if (isLoadingEvents) {
      console.log("Already loading events, skipping...");
      return;
    }

    try {
      setLoading(true);
      setIsLoadingEvents(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (sessionError) {
        console.error("Session error:", sessionError);
        toast({
          title: "Authentication Error",
          description: "Please sign in again",
          variant: "destructive",
        });
        return;
      }

      if (!session) {
        console.log("No session found");
        setEvents([]);
        return;
      }

      console.log("Session found, loading events directly from Supabase");
      console.log("User ID:", session.user.id);

      // Test if events table exists by doing a simple count first
      console.log("Testing events table access...");
      const { count, error: countError } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true });

      if (countError) {
        console.error("Events table access test failed:", {
          message: countError.message,
          details: countError.details,
          hint: countError.hint,
          code: countError.code,
        });
        toast({
          title: "Database Error",
          description: `Table access failed: ${countError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log("Events table accessible, total count:", count);

      // Auto-accept any pending invitations for the current user
      console.log("Auto-accepting pending invitations...");
      const { error: acceptError } = await supabase.rpc(
        "accept_event_invitation_by_user",
        {
          p_user_id: session.user.id,
        },
      );

      if (acceptError) {
        console.log(
          "No pending invitations or error auto-accepting:",
          acceptError.message,
        );
      }

      // Fetch owned events
      console.log("Loading owned events...");
      const { data: ownedEvents, error: ownedError } = await supabase
        .from("events")
        .select(
          "id, name, description, start_date, end_date, location, logo_url, is_private, is_published, slug, created_at, updated_at, created_by",
        )
        .eq("created_by", session.user.id)
        .order("start_date", { ascending: false });

      if (ownedError) {
        console.error("Error loading owned events:", ownedError);
        toast({
          title: "Error",
          description: "Failed to load owned events",
          variant: "destructive",
        });
        return;
      }

      // Fetch invited events where user_id matches current user
      console.log("Loading invited events for user:", session.user.id);
      const { data: invitedEventsRaw, error: invitedError } = await supabase
        .from("event_players")
        .select(
          `
          role,
          status,
          events:event_id (
            id, name, description, start_date, end_date, location, logo_url,
            is_private, is_published, slug, created_at, updated_at, created_by
          )
        `,
        )
        .eq("user_id", session.user.id)
        .eq("status", "accepted")
        .order("created_at", { ascending: false });

      if (invitedError) {
        console.error("Error loading invited events:", {
          message: invitedError.message,
          details: invitedError.details,
          hint: invitedError.hint,
          code: invitedError.code,
        });
        console.error(
          "Full error object:",
          JSON.stringify(invitedError, null, 2),
        );
        // Continue with owned events only
      } else {
        console.log("Invited events query result:", {
          count: invitedEventsRaw?.length || 0,
          data: invitedEventsRaw,
        });

        if (!invitedEventsRaw || invitedEventsRaw.length === 0) {
          console.log(
            "No invited events found - this is normal if user hasn't been invited or invitations haven't been auto-accepted yet",
          );
        }
      }

      // Combine and format events
      const allEvents: Event[] = [];

      // Add owned events with owner role
      if (ownedEvents) {
        ownedEvents.forEach((event) => {
          allEvents.push({
            ...event,
            user_role: "owner",
            invitation_status: "accepted",
          });
        });
      }

      // Add invited events with their roles
      if (invitedEventsRaw) {
        invitedEventsRaw.forEach((invitation) => {
          if (invitation.events) {
            const event = invitation.events as any;
            // Only add if not already in owned events
            if (!allEvents.find((e) => e.id === event.id)) {
              allEvents.push({
                ...event,
                user_role: invitation.role === "admin" ? "admin" : "player",
                invitation_status: invitation.status,
              });
            }
          }
        });
      }

      // Sort by start_date descending
      allEvents.sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
      );

      console.log("Successfully loaded all events, count:", allEvents.length);
      setEvents(allEvents);
    } catch (error) {
      console.error("Error loading events:", error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoadingEvents(false);
    }
  };

  const handleEditEvent = async (event: Event) => {
    // Navigate to the new event editing route
    navigate(`/app/${event.id}/basic`);
  };

  const handleCreateNew = () => {
    if (isAIQuickstartEnabled) {
      // Show the choice modal when AI quickstart is enabled
      setShowCreateModal(true);
    } else {
      // Use the original flow when feature flag is disabled
      resetTrip();
      navigate("/app/create");
    }
  };

  const handleQuickStart = () => {
    setShowCreateModal(false);
    setShowAIQuickstart(true);
  };

  const handleManualCreate = () => {
    setShowCreateModal(false);
    resetTrip();
    navigate("/app/create");
  };

  const handleAISuccess = (eventId: string, eventSlug: string) => {
    setShowAIQuickstart(false);
    // Open draft preview modal
    setDraftEventId(eventId);
    setShowDraftPreview(true);
    // Reload events to show the new event in the list
    loadEvents();
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    return `${start} - ${end}`;
  };

  const getStatusFromDates = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now > end) return "completed";
    if (now >= start && now <= end) return "active";
    return "upcoming";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-purple-50 text-purple-700 border-purple-200 font-medium";
      case "active":
        return "bg-blue-50 text-blue-700 border-blue-200 font-medium";
      case "completed":
        return "bg-gray-50 text-gray-600 border-gray-200 font-medium";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200 font-medium";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">My Events</h1>
            <p className="text-green-600 mt-1">Loading your golf events...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 text-green-600 animate-spin border-4 border-green-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            My Events
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your events and participate in tournaments you've been
            invited to
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {events.length}
            </div>
            <p className="text-xs text-gray-500">
              {events.filter((e) => e.user_role === "owner").length} owned,{" "}
              {events.filter((e) => e.user_role !== "owner").length} invited
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {
                events.filter(
                  (event) =>
                    getStatusFromDates(event.start_date, event.end_date) ===
                    "upcoming",
                ).length
              }
            </div>
            <p className="text-xs text-gray-500">Events planned</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 uppercase tracking-wide">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {
                events.filter((event) => {
                  const start = new Date(event.start_date);
                  const now = new Date();
                  return (
                    start.getMonth() === now.getMonth() &&
                    start.getFullYear() === now.getFullYear()
                  );
                }).length
              }
            </div>
            <p className="text-xs text-gray-500">Events this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {events.map((event) => {
          const status = getStatusFromDates(event.start_date, event.end_date);

          return (
            <Card
              key={event.id}
              className="bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200 hover:-translate-y-1"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-lg font-semibold text-gray-900 leading-tight">
                        {event.name}
                      </CardTitle>
                      {event.user_role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium bg-blue-50 text-blue-700 border-blue-200 px-2 py-1"
                        >
                          Admin
                        </Badge>
                      ) : event.user_role === "player" ? (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium bg-gray-50 text-gray-700 border-gray-200 px-2 py-1"
                        >
                          Player
                        </Badge>
                      ) : null}
                    </div>
                    <CardDescription className="text-gray-600 line-clamp-2 text-sm leading-relaxed">
                      {event.description || "Golf event"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(status)} style={{fontSize: '0.75rem', padding: '0.25rem 0.5rem'}}>
                    {status}
                  </Badge>
                </div>

                {/* Consolidated Info Bar */}
                <div className="flex items-center gap-6 text-sm text-gray-600 bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-purple-600" />
                    <span>{formatDateRange(event.start_date, event.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="truncate">{event.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-purple-600" />
                    <span>{event.is_private ? "Private" : "Public"}</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">

                <div className="flex flex-wrap gap-2">
                  {/* View Site button - available for all published events */}
                  {event.is_published && event.slug ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`/events/${event.slug}`, "_blank")
                      }
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 text-xs px-3 py-1.5 h-auto"
                    >
                      <ExternalLink className="h-3 w-3 mr-1.5" />
                      View Site
                    </Button>
                  ) : null}

                  {/* Enter Scores button - available for all users */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      navigate(`/events/${event.slug || event.id}/leaderboard`)
                    }
                    className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs px-3 py-1.5 h-auto"
                  >
                    <Users className="h-3 w-3 mr-1.5" />
                    Enter Scores
                  </Button>

                  {/* Edit Details button - only for owners and admins */}
                  {(event.user_role === "owner" ||
                    event.user_role === "admin") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                      className="border-purple-300 text-purple-700 hover:bg-purple-50 text-xs px-3 py-1.5 h-auto"
                    >
                      <Edit className="h-3 w-3 mr-1.5" />
                      Edit Details
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-purple-400 mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No events yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first golf event or wait for an invitation from other
            organizers
          </p>
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Event
          </Button>
        </div>
      )}

      {/* Create Event Modal - shows choice between AI and manual */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onQuickStart={handleQuickStart}
        onManualCreate={handleManualCreate}
      />

      {/* AI Quickstart Form */}
      <AIQuickstartForm
        isOpen={showAIQuickstart}
        onClose={() => setShowAIQuickstart(false)}
        onSuccess={handleAISuccess}
      />

      {/* Draft Preview Modal */}
      {draftEventId && (
        <DraftPreviewModal
          isOpen={showDraftPreview}
          onClose={() => {
            setShowDraftPreview(false);
            setDraftEventId(null);
          }}
          eventId={draftEventId}
          onEditMode={() => {
            setShowDraftPreview(false);
            setDraftEventId(null);
            // Navigate to event edit page
            window.location.href = `/app/${draftEventId}/settings`;
          }}
        />
      )}
    </div>
  );
}
