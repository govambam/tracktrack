import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DraftModePublicEventHome from "./DraftModePublicEventHome";

export default function DraftMode() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [localChanges, setLocalChanges] = useState<any>({});

  const handleBack = () => {
    if (hasChanges) {
      setShowExitDialog(true);
    } else {
      // Close the tab/window
      window.close();
      // Fallback if window.close() doesn't work (some browsers prevent it)
      setTimeout(() => {
        window.location.href = `/app/${eventId}/settings`;
      }, 100);
    }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Save all local changes to Supabase
      const promises = [];

      // Save event description if changed
      if (localChanges.eventDescription !== undefined) {
        promises.push(
          supabase
            .from("events")
            .update({ description: localChanges.eventDescription })
            .eq("id", eventId),
        );
      }

      // Save course changes
      if (localChanges.courses) {
        Object.entries(localChanges.courses).forEach(
          ([courseId, courseData]: [string, any]) => {
            if (courseData.course_name !== undefined) {
              promises.push(
                supabase
                  .from("event_rounds")
                  .update({ course_name: courseData.course_name })
                  .eq("id", courseId),
              );
            }
            if (courseData.tee_time !== undefined) {
              promises.push(
                supabase
                  .from("event_rounds")
                  .update({ tee_time: courseData.tee_time })
                  .eq("id", courseId),
              );
            }
            if (courseData.round_date !== undefined) {
              promises.push(
                supabase
                  .from("event_rounds")
                  .update({ round_date: courseData.round_date })
                  .eq("id", courseId),
              );
            }
            if (courseData.description !== undefined) {
              promises.push(
                supabase
                  .from("event_courses")
                  .update({ description: courseData.description })
                  .eq("round_id", courseId),
              );
            }
          },
        );
      }

      // Save player changes
      if (localChanges.players) {
        Object.entries(localChanges.players).forEach(
          ([playerId, playerData]: [string, any]) => {
            const updates: any = {};
            if (playerData.full_name !== undefined)
              updates.full_name = playerData.full_name;
            if (playerData.handicap !== undefined)
              updates.handicap = playerData.handicap;
            if (playerData.bio !== undefined) updates.bio = playerData.bio;

            if (Object.keys(updates).length > 0) {
              promises.push(
                supabase
                  .from("event_players")
                  .update(updates)
                  .eq("id", playerId),
              );
            }
          },
        );
      }

      // Save travel changes
      if (localChanges.travel) {
        const travelUpdates: any = {};
        if (localChanges.travel.flight_info !== undefined)
          travelUpdates.flight_info = localChanges.travel.flight_info;
        if (localChanges.travel.accommodations !== undefined)
          travelUpdates.accommodations = localChanges.travel.accommodations;
        if (localChanges.travel.daily_schedule !== undefined)
          travelUpdates.daily_schedule = localChanges.travel.daily_schedule;

        if (Object.keys(travelUpdates).length > 0) {
          promises.push(
            supabase
              .from("event_travel")
              .update(travelUpdates)
              .eq("event_id", eventId),
          );
        }
      }

      await Promise.all(promises);

      setHasChanges(false);
      setLocalChanges({});

      toast({
        title: "Changes Saved",
        description: "All your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving changes:", error);
      toast({
        title: "Save Failed",
        description: "Failed to save your changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    setLocalChanges({});
    setHasChanges(false);
    setShowExitDialog(false);
    window.close();
    // Fallback
    setTimeout(() => {
      window.location.href = `/app/${eventId}/settings`;
    }, 100);
  };

  const handleSaveAndExit = async () => {
    await handleSaveChanges();
    setShowExitDialog(false);
    window.close();
    // Fallback
    setTimeout(() => {
      window.location.href = `/app/${eventId}/settings`;
    }, 100);
  };

  const updateLocalChanges = (path: string, value: any) => {
    setLocalChanges((prev) => {
      const newChanges = { ...prev };
      const keys = path.split(".");
      let current = newChanges;

      for (let i = 0; i < keys.length - 1; i++) {
        if (!(keys[i] in current)) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newChanges;
    });
    setHasChanges(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Persistent Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleBack}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <div className="text-lg font-semibold text-gray-900">
                Draft Mode
              </div>
              {hasChanges && (
                <div className="flex items-center text-amber-600">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span className="text-sm">Unsaved changes</span>
                </div>
              )}
            </div>

            <Button
              onClick={handleSaveChanges}
              disabled={!hasChanges || saving}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Draft Mode Content - Full Public Site Experience */}
      <DraftModePublicEventHome
        localChanges={localChanges}
        updateLocalChanges={updateLocalChanges}
      />

      {/* Exit Confirmation Dialog */}
      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. What would you like to do?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowExitDialog(false)}>
              Stay in Draft Mode
            </AlertDialogCancel>
            <Button
              variant="outline"
              onClick={handleDiscardChanges}
              className="border-red-200 text-red-700 hover:bg-red-50"
            >
              Discard Changes
            </Button>
            <AlertDialogAction
              onClick={handleSaveAndExit}
              className="bg-green-600 hover:bg-green-700"
            >
              Save & Exit
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
