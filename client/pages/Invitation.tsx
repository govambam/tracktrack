import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Calendar, MapPin, Users, Mail } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface EventDetails {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
  is_published: boolean;
  slug?: string;
}

interface InvitationDetails {
  player_id: string;
  full_name: string;
  invited_email: string;
  role: string;
  status: string;
}

export default function Invitation() {
  const { eventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [invitation, setInvitation] = useState<InvitationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const invitedEmail = searchParams.get("email");

  useEffect(() => {
    checkAuthAndLoadInvitation();
  }, [eventId, invitedEmail]);

  const checkAuthAndLoadInvitation = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check authentication
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setUserEmail(session?.user?.email || null);

      if (!eventId || !invitedEmail) {
        setError("Invalid invitation link");
        return;
      }

      // Load event details
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select(
          "id, name, description, start_date, end_date, location, logo_url, is_published, slug",
        )
        .eq("id", eventId)
        .single();

      if (eventError || !eventData) {
        setError("Event not found");
        return;
      }

      setEvent(eventData);

      // Load invitation details
      const { data: invitationData, error: invitationError } = await supabase
        .from("event_players")
        .select("id, full_name, invited_email, role, status")
        .eq("event_id", eventId)
        .eq("invited_email", invitedEmail)
        .single();

      if (invitationError || !invitationData) {
        setError("Invitation not found or may have already been processed");
        return;
      }

      setInvitation({
        player_id: invitationData.id,
        full_name: invitationData.full_name,
        invited_email: invitationData.invited_email,
        role: invitationData.role,
        status: invitationData.status,
      });

      // If user is authenticated and email matches, auto-accept
      if (
        session &&
        session.user.email === invitedEmail &&
        invitationData.status === "invited"
      ) {
        console.log("Auto-accepting invitation for authenticated user");
        await acceptInvitation();
      }
    } catch (error) {
      console.error("Error loading invitation:", error);
      setError("Failed to load invitation details");
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    try {
      setAccepting(true);

      if (!isAuthenticated) {
        // Redirect to auth with return URL
        const returnUrl = `/invitation/${eventId}?email=${encodeURIComponent(invitedEmail || "")}`;
        navigate(`/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
        return;
      }

      // Call the accept invitation RPC
      const { data, error } = await supabase.rpc("accept_event_invitation", {
        p_event_id: eventId,
      });

      if (error) {
        console.error("Error accepting invitation:", error);
        toast({
          title: "Error",
          description: "Failed to accept invitation. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data.success) {
        toast({
          title: "Error",
          description: data.error || "Failed to accept invitation",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Invitation Accepted!",
        description: "You've successfully joined the event.",
      });

      // Redirect to My Events or the event page
      navigate("/app/my-trips");
    } catch (error) {
      console.error("Error accepting invitation:", error);
      toast({
        title: "Error",
        description: "Failed to accept invitation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAccepting(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    const end = new Date(endDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    return start === end ? start : `${start} - ${end}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto mb-4 text-green-600 animate-spin border-4 border-green-600 border-t-transparent rounded-full" />
          <p className="text-green-700">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate("/")}
              className="w-full mt-4"
              variant="outline"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!event || !invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Invitation Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              The invitation you're looking for could not be found.
            </p>
            <Button
              onClick={() => navigate("/")}
              className="w-full"
              variant="outline"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {invitation.status === "accepted" ? (
            // Already accepted invitation
            <Card className="border-green-200">
              <CardHeader className="text-center">
                <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-900">
                  You're Already In!
                </CardTitle>
                <CardDescription className="text-green-700">
                  You've already accepted this invitation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    {event.name}
                  </h3>
                  <div className="flex items-center justify-center text-green-700 mb-2">
                    <Calendar className="h-4 w-4 mr-2" />
                    {formatDateRange(event.start_date, event.end_date)}
                  </div>
                  <div className="flex items-center justify-center text-green-700">
                    <MapPin className="h-4 w-4 mr-2" />
                    {event.location}
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => navigate("/app/my-trips")}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    View My Events
                  </Button>
                  {event.is_published && event.slug && (
                    <Button
                      onClick={() =>
                        window.open(`/events/${event.slug}`, "_blank")
                      }
                      variant="outline"
                      className="flex-1"
                    >
                      View Event Site
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            // Pending invitation
            <Card className="border-green-100">
              <CardHeader className="text-center">
                <Mail className="h-16 w-16 text-emerald-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-green-900">
                  You're Invited!
                </CardTitle>
                <CardDescription className="text-green-700">
                  {invitation.full_name}, you've been invited to join this golf
                  event
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Event Details */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-xl font-semibold text-green-900 mb-3">
                    {event.name}
                  </h3>

                  {event.description && (
                    <p className="text-green-700 mb-3">{event.description}</p>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center text-green-700">
                      <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                      {formatDateRange(event.start_date, event.end_date)}
                    </div>
                    <div className="flex items-center text-green-700">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                      {event.location}
                    </div>
                    <div className="flex items-center text-green-700">
                      <Users className="h-4 w-4 mr-2 text-emerald-600" />
                      Role:{" "}
                      {invitation.role === "admin" ? "Administrator" : "Player"}
                    </div>
                  </div>
                </div>

                {/* Authentication Status */}
                {!isAuthenticated ? (
                  <Alert>
                    <AlertDescription>
                      You'll need to create an account or sign in to accept this
                      invitation.
                    </AlertDescription>
                  </Alert>
                ) : userEmail !== invitedEmail ? (
                  <Alert variant="destructive">
                    <AlertDescription>
                      You're signed in as {userEmail}, but this invitation is
                      for {invitedEmail}. Please sign in with the correct email
                      address.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <Alert>
                    <AlertDescription>
                      Ready to accept! You're signed in as {userEmail}.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <Button
                    onClick={acceptInvitation}
                    disabled={
                      accepting ||
                      (isAuthenticated && userEmail !== invitedEmail)
                    }
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                  >
                    {accepting
                      ? "Accepting..."
                      : isAuthenticated
                        ? "Accept Invitation"
                        : "Sign In & Accept"}
                  </Button>

                  <Button
                    onClick={() => navigate("/")}
                    variant="outline"
                    className="flex-1"
                  >
                    Maybe Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
