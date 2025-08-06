import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { DraftPreviewModal } from "@/components/DraftPreviewModal";
import {
  Settings,
  Trash2,
  AlertTriangle,
  Copy,
  ExternalLink,
  Globe,
  Eye,
  EyeOff,
  Share,
  Edit,
  Users,
  Lock,
} from "lucide-react";

export default function SettingsEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [eventInfo, setEventInfo] = useState<any>(null);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDraftPreview, setShowDraftPreview] = useState(false);
  const [clubhousePassword, setClubhousePassword] = useState("");
  const [updatingClubhouse, setUpdatingClubhouse] = useState(false);

  const eventName = tripData?.tripName || "this event";

  useEffect(() => {
    if (eventId) {
      loadEventInfo();
    }
  }, [eventId]);

  const loadEventInfo = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("events")
        .select("is_published, is_private, slug, created_at, clubhouse_password")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error loading event info:", error.message || error);
        return;
      }

      setEventInfo(data);
      setClubhousePassword(data?.clubhouse_password || "");
    } catch (error) {
      console.error("Error loading event info:", error instanceof Error ? error.message : error);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!eventId) return;

    setPublishing(true);

    try {
      const { data, error } = await supabase
        .from("events")
        .update({
          is_published: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .select("slug")
        .single();

      if (error) {
        console.error("Error publishing event:", error);
        toast({
          title: "Publish Failed",
          description: error.message || "Failed to publish event",
          variant: "destructive",
        });
        return;
      }

      // Reload event info to get the generated slug
      await loadEventInfo();

      toast({
        title: "Event Published",
        description: "Your event is now live and accessible to the public",
      });
    } catch (error) {
      console.error("Error publishing event:", error);
      toast({
        title: "Publish Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleUnpublish = async () => {
    if (!eventId) return;

    setPublishing(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          is_published: false,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) {
        console.error("Error unpublishing event:", error);
        toast({
          title: "Unpublish Failed",
          description: error.message || "Failed to unpublish event",
          variant: "destructive",
        });
        return;
      }

      await loadEventInfo();

      toast({
        title: "Event Unpublished",
        description: "Your event is no longer publicly accessible",
      });
    } catch (error) {
      console.error("Error unpublishing event:", error);
      toast({
        title: "Unpublish Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const copyPublicUrl = () => {
    if (!eventInfo?.slug) return;

    const url = `${window.location.origin}/events/${eventInfo.slug}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "URL Copied",
          description: "Public event URL has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy URL to clipboard",
          variant: "destructive",
        });
      });
  };

  const updateClubhousePassword = async () => {
    if (!eventId) return;

    setUpdatingClubhouse(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          clubhouse_password: clubhousePassword || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) {
        console.error("Error updating clubhouse password:", error);
        toast({
          title: "Update Failed",
          description: error.message || "Failed to update clubhouse password",
          variant: "destructive",
        });
        return;
      }

      await loadEventInfo();

      toast({
        title: "Clubhouse Updated",
        description: clubhousePassword
          ? "Clubhouse password has been set successfully"
          : "Clubhouse password has been removed",
      });
    } catch (error) {
      console.error("Error updating clubhouse password:", error);
      toast({
        title: "Update Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setUpdatingClubhouse(false);
    }
  };

  const generateSlug = async () => {
    if (!eventId || !tripData?.tripName) return;

    setPublishing(true);

    try {
      // Generate slug from event name
      let baseSlug = tripData.tripName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "");

      if (!baseSlug) baseSlug = "golf-event";

      // Check for uniqueness and append counter if needed
      let finalSlug = baseSlug;
      let counter = 0;

      while (true) {
        const { data: existingEvent, error } = await supabase
          .from("events")
          .select("id")
          .eq("slug", finalSlug)
          .neq("id", eventId)
          .single();

        if (error && error.code === "PGRST116") {
          // No existing event with this slug, we can use it
          break;
        } else if (error) {
          throw error;
        } else {
          // Slug exists, try with counter
          counter++;
          finalSlug = `${baseSlug}-${counter}`;
        }
      }

      // Update the event with the new slug
      const { error: updateError } = await supabase
        .from("events")
        .update({
          slug: finalSlug,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (updateError) {
        throw updateError;
      }

      // Reload event info to show the new slug
      await loadEventInfo();

      toast({
        title: "Slug Generated",
        description: `Event URL slug has been set to: ${finalSlug}`,
      });
    } catch (error) {
      console.error("Error generating slug:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate event slug",
        variant: "destructive",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!eventId || deleteConfirmText !== eventName) return;

    setDeleting(true);

    try {
      // Delete the main event - cascade deletes will handle related data
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", eventId);

      if (error) {
        console.error("Error deleting event:", error);
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete event",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Event Deleted",
        description:
          "The event and all related data have been permanently deleted",
      });

      // Navigate back to events list
      navigate("/app");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Delete Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  const copyEventUrl = () => {
    const url = `${window.location.origin}/app/${eventId}/basic`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: "URL Copied",
          description: "Event URL has been copied to clipboard",
        });
      })
      .catch(() => {
        toast({
          title: "Copy Failed",
          description: "Could not copy URL to clipboard",
          variant: "destructive",
        });
      });
  };

  const isDeleteValid = deleteConfirmText === eventName;

  return (
    <div className="space-y-6">
      {/* Publishing Controls */}
      <Card className="border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 flex items-center">
            <Globe className="h-5 w-5 mr-2 text-blue-600" />
            Event Publishing
          </CardTitle>
          <CardDescription className="text-blue-600">
            Make your event accessible to the public with a custom URL
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-4 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-center space-x-3">
                  {eventInfo?.is_published ? (
                    <>
                      <Eye className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-900">
                          Event is Published
                        </div>
                        <div className="text-sm text-green-600">
                          {eventInfo.is_private
                            ? "Private event - requires invitation"
                            : "Public event - anyone can view"}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-5 w-5 text-gray-600" />
                      <div>
                        <div className="font-medium text-gray-900">
                          Event is Not Published
                        </div>
                        <div className="text-sm text-gray-600">
                          Only you can access this event through the editor
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Badge
                    variant={eventInfo?.is_published ? "default" : "outline"}
                  >
                    {eventInfo?.is_published ? "Published" : "Draft"}
                  </Badge>
                  {eventInfo?.is_private && (
                    <Badge variant="secondary">Private</Badge>
                  )}
                </div>
              </div>

              {eventInfo?.is_published && eventInfo?.slug && (
                <div className="space-y-2">
                  <Label className="text-blue-800 font-medium">
                    Public Event URL
                  </Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={`${window.location.origin}/events/${eventInfo.slug}`}
                      readOnly
                      className="bg-blue-50 border-blue-200"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyPublicUrl}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`/events/${eventInfo.slug}`, "_blank")
                      }
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {eventInfo?.is_published && !eventInfo?.slug && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>Missing URL Slug:</strong> This event is
                        published but doesn't have a public URL yet.
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={generateSlug}
                        disabled={publishing}
                        className="border-yellow-300 text-yellow-700 hover:bg-yellow-100 ml-3"
                      >
                        {publishing ? "Generating..." : "Generate URL"}
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex items-center space-x-3 flex-wrap gap-y-3">
                <Button
                  variant="outline"
                  onClick={() => setShowDraftPreview(true)}
                  className="border-green-200 text-green-700 hover:bg-green-50"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Preview Draft Site
                </Button>

                {eventInfo?.is_published && eventInfo?.slug && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      window.open(`/events/${eventInfo.slug}`, "_blank")
                    }
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Published Site
                  </Button>
                )}
                {eventInfo?.is_published ? (
                  <Button
                    variant="outline"
                    onClick={handleUnpublish}
                    disabled={publishing}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50"
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    {publishing ? "Unpublishing..." : "Unpublish Event"}
                  </Button>
                ) : (
                  <Button
                    onClick={handlePublish}
                    disabled={publishing}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    {publishing ? "Publishing..." : "Publish Event"}
                  </Button>
                )}
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Globe className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <strong>About Publishing:</strong> When you publish your
                  event, it becomes accessible at a public URL that you can
                  share with participants.{" "}
                  {eventInfo?.is_private
                    ? "Since this is a private event, visitors will need an invitation to access it."
                    : "Since this is a public event, anyone with the link can view the details."}
                </AlertDescription>
              </Alert>
            </>
          )}
        </CardContent>
      </Card>

      {/* Clubhouse Settings */}
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-purple-600" />
            Clubhouse Settings
          </CardTitle>
          <CardDescription className="text-purple-600">
            Configure player access to the event clubhouse for scores and chat
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="clubhousePassword" className="text-purple-800 font-medium">
              Clubhouse Password
            </Label>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
                <Input
                  id="clubhousePassword"
                  type="password"
                  value={clubhousePassword}
                  onChange={(e) => setClubhousePassword(e.target.value)}
                  placeholder="Set a password for player access"
                  className="pl-10 border-purple-200 focus:border-purple-500"
                />
              </div>
              <Button
                onClick={updateClubhousePassword}
                disabled={updatingClubhouse || clubhousePassword === (eventInfo?.clubhouse_password || "")}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                {updatingClubhouse ? "Updating..." : "Update"}
              </Button>
            </div>
            <p className="text-sm text-purple-600">
              {clubhousePassword ?
                "Players will need this password to access the clubhouse where they can view scores and chat." :
                "Leave empty to disable the clubhouse feature for this event."
              }
            </p>
          </div>

          <Alert className="border-purple-200 bg-purple-50">
            <Users className="h-4 w-4 text-purple-600" />
            <AlertDescription className="text-purple-700">
              <strong>About the Clubhouse:</strong> When enabled, players can access a special area of your public event site where they can:
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>View and edit scorecards for each round</li>
                <li>Participate in event chat and announcements</li>
                <li>Access this content using the password you set above</li>
              </ul>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Event Information */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg text-green-900 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-emerald-600" />
            Event Information
          </CardTitle>
          <CardDescription className="text-green-600">
            General information about this event
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-green-800 font-medium">Event ID</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={eventId || ""}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(eventId || "");
                    toast({
                      title: "Copied",
                      description: "Event ID copied to clipboard",
                    });
                  }}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-green-800 font-medium">Event URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Input
                  value={`/app/${eventId}/basic`}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
                <Button variant="outline" size="sm" onClick={copyEventUrl}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-green-800 font-medium">Created</Label>
            <p className="text-green-600 mt-1">
              {tripData?.id
                ? new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Loading..."}
            </p>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <div className="font-semibold">Event Access</div>
              <div className="mt-1">
                This event can be accessed at the URL above. You can share this
                link with participants or use it to bookmark your event for easy
                access.
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-lg text-red-900 flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-600">
            Irreversible and destructive actions
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="font-semibold">Delete Event</div>
              <div className="mt-1">
                Once you delete an event, there is no going back. This action
                will permanently delete:
              </div>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li>Event details and configuration</li>
                <li>All golf rounds and courses</li>
                <li>Player list and handicaps</li>
                <li>Prize structure and payouts</li>
                <li>Travel information</li>
                <li>Customization settings</li>
              </ul>
            </AlertDescription>
          </Alert>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Event Permanently
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-red-900">
                  Are you absolutely sure?
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  This action cannot be undone. This will permanently delete the
                  event <span className="font-semibold">"{eventName}"</span> and
                  remove all associated data from our servers.
                </AlertDialogDescription>
                <div className="space-y-2">
                  <Label
                    htmlFor="deleteConfirm"
                    className="text-sm font-medium"
                  >
                    Please type <span className="font-bold">{eventName}</span>{" "}
                    to confirm:
                  </Label>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type the event name here"
                    className="border-red-200 focus:border-red-500"
                  />
                </div>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText("")}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteEvent}
                  disabled={!isDeleteValid || deleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {deleting ? "Deleting..." : "Delete Event"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Draft Preview Modal */}
      {eventId && (
        <DraftPreviewModal
          isOpen={showDraftPreview}
          onClose={() => setShowDraftPreview(false)}
          eventId={eventId}
          onEditMode={() => {
            // Stay on the current edit page
            setShowDraftPreview(false);
          }}
        />
      )}
    </div>
  );
}
