import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { Settings, Trash2, AlertTriangle, Copy, ExternalLink } from "lucide-react";

export default function SettingsEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  const eventName = tripData?.tripName || 'this event';

  const handleDeleteEvent = async () => {
    if (!eventId || deleteConfirmText !== eventName) return;

    setDeleting(true);

    try {
      // Delete the main event - cascade deletes will handle related data
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (error) {
        console.error('Error deleting event:', error);
        toast({
          title: "Delete Failed",
          description: error.message || "Failed to delete event",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Event Deleted",
        description: "The event and all related data have been permanently deleted",
      });

      // Navigate back to events list
      navigate('/app');

    } catch (error) {
      console.error('Error deleting event:', error);
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
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "URL Copied",
        description: "Event URL has been copied to clipboard",
      });
    }).catch(() => {
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
                  value={eventId || ''}
                  readOnly
                  className="bg-gray-50 border-gray-200"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(eventId || '');
                    toast({ title: "Copied", description: "Event ID copied to clipboard" });
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyEventUrl}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label className="text-green-800 font-medium">Created</Label>
            <p className="text-green-600 mt-1">
              {tripData?.id ? new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 'Loading...'}
            </p>
          </div>

          <Alert className="border-blue-200 bg-blue-50">
            <ExternalLink className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <div className="font-semibold">Event Access</div>
              <div className="mt-1">
                This event can be accessed at the URL above. You can share this link with participants
                or use it to bookmark your event for easy access.
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
                Once you delete an event, there is no going back. This action will permanently delete:
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
                  <p>
                    This action cannot be undone. This will permanently delete the event
                    <span className="font-semibold"> "{eventName}" </span>
                    and remove all associated data from our servers.
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="deleteConfirm" className="text-sm font-medium">
                      Please type <span className="font-bold">{eventName}</span> to confirm:
                    </Label>
                    <Input
                      id="deleteConfirm"
                      value={deleteConfirmText}
                      onChange={(e) => setDeleteConfirmText(e.target.value)}
                      placeholder="Type the event name here"
                      className="border-red-200 focus:border-red-500"
                    />
                  </div>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteEvent}
                  disabled={!isDeleteValid || deleting}
                  className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                >
                  {deleting ? 'Deleting...' : 'Delete Event'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
