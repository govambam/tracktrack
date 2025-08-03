import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Trophy, Info } from "lucide-react";

export default function LeaderboardCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [leaderboardEnabled, setLeaderboardEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadLeaderboardData();
    }
  }, [eventId]);

  const loadLeaderboardData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load leaderboard enabled setting
      const { data: customizationData, error: customizationError } = await supabase
        .from('event_customization')
        .select('leaderboard_enabled')
        .eq('event_id', eventId)
        .single();

      if (customizationError && customizationError.code !== 'PGRST116') {
        console.error('Error loading customization data:', {
          message: customizationError.message,
          details: customizationError.details,
          hint: customizationError.hint,
          code: customizationError.code
        });
      } else if (customizationData) {
        setLeaderboardEnabled(customizationData.leaderboard_enabled ?? true);
      }

    } catch (error) {
      console.error('Error loading leaderboard customization data:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load leaderboard customization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveLeaderboardEnabled = async (enabled: boolean) => {
    if (!eventId) return;

    try {
      // First check if customization record exists
      const { data: existing, error: fetchError } = await supabase
        .from('event_customization')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking customization:', fetchError);
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('event_customization')
          .update({ leaderboard_enabled: enabled })
          .eq('event_id', eventId);

        if (error) {
          console.error('Error saving leaderboard enabled:', error);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('event_customization')
          .insert({ 
            event_id: eventId,
            leaderboard_enabled: enabled
          });

        if (error) {
          console.error('Error creating customization record:', error);
        }
      }
    } catch (error) {
      console.error('Error saving leaderboard enabled:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-emerald-600" />
                Leaderboard
              </CardTitle>
              <CardDescription className="text-green-600">
                Configure how the leaderboard will be displayed on your event website
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="leaderboard-toggle" className="text-sm text-green-700">
                Enable Leaderboard Page
              </Label>
              <Switch
                id="leaderboard-toggle"
                checked={leaderboardEnabled}
                onCheckedChange={(checked) => {
                  setLeaderboardEnabled(checked);
                  saveLeaderboardEnabled(checked);
                }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <div className="font-semibold">Leaderboard functionality coming soon</div>
              <div className="mt-1">
                This page will automatically update when score entry is enabled. 
                Players and spectators will be able to view real-time standings during your tournament.
              </div>
            </AlertDescription>
          </Alert>

          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <h4 className="font-medium text-green-900">Future Features</h4>
                <ul className="space-y-2 text-sm text-green-700">
                  <li>• Real-time score updates during the tournament</li>
                  <li>• Multiple leaderboard views (overall, daily, gross/net)</li>
                  <li>• Player position tracking and movement indicators</li>
                  <li>• Skills contest standings integration</li>
                  <li>• Customizable scoring formats and tie-breaking rules</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
