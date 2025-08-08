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
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-purple-900">My Events</h1>
            <p className="text-purple-600 mt-1">Loading your golf events...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 text-purple-600 animate-spin border-4 border-purple-600 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">My Events</h1>
          <p className="text-purple-600 mt-1">
            Manage your events and participate in tournaments you've been
            invited to
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Total Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {events.length}
            </div>
            <p className="text-xs text-purple-600">
              {events.filter((e) => e.user_role === "owner").length} owned,{" "}
              {events.filter((e) => e.user_role !== "owner").length} invited
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {
                events.filter(
                  (event) =>
                    getStatusFromDates(event.start_date, event.end_date) ===
                    "upcoming",
                ).length
              }
            </div>
            <p className="text-xs text-purple-600">Events planned</p>
          </CardContent>
        </Card>

        <Card className="border-purple-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
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
            <p className="text-xs text-purple-600">Events this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => {
          const status = getStatusFromDates(event.start_date, event.end_date);

          return (
            <Card
              key={event.id}
              className="border-purple-100 hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl text-purple-900">
                        {event.name}
                      </CardTitle>
                      {event.user_role === "owner" ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200"
                        >
                          Owner
                        </Badge>
                      ) : event.user_role === "admin" ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                        >
                          Admin
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-gray-50 text-gray-700 border-gray-200"
                        >
                          Player
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-purple-600 line-clamp-2">
                      {event.description || "Golf event"}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(status)}>{status}</Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-purple-700">
                    <Calendar className="h-4 w-4 mr-2 text-purple-600" />
                    {formatDateRange(event.start_date, event.end_date)}
                  </div>
                  <div className="flex items-center text-purple-700">
                    <MapPin className="h-4 w-4 mr-2 text-purple-600" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-purple-700">
                    <Eye className="h-4 w-4 mr-2 text-purple-600" />
                    {event.is_private ? "Private" : "Public"}
                    {event.is_published && (
                      <Globe
                        className="h-3 w-3 ml-1 text-blue-600"
                        title="Published"
                      />
                    )}
                  </div>
                  <div className="flex items-center text-purple-700 text-xs">
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {/* View Site button - available for all published events */}
                  {event.is_published && event.slug ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`/events/${event.slug}`, "_blank")
                      }
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
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
                    className="border-purple-200 text-purple-700 hover:bg-purple-50"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    Enter Scores
                  </Button>

                  {/* Edit Details button - only for owners and admins */}
                  {(event.user_role === "owner" ||
                    event.user_role === "admin") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditEvent(event)}
                      className="border-purple-200 text-purple-700 hover:bg-purple-50"
                    >
                      <Edit className="h-4 w-4 mr-1" />
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
          <h3 className="text-xl font-medium text-purple-900 mb-2">
            No events yet
          </h3>
          <p className="text-purple-600 mb-6">
            Create your first golf event or wait for an invitation from other
            organizers
          </p>
          <Button
            onClick={handleCreateNew}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
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
