import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Plane, Save } from "lucide-react";

interface TravelInfo {
  flight_info?: string;
  accommodations?: string;
  daily_schedule?: string;
}

export default function TravelCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [travelInfo, setTravelInfo] = useState<TravelInfo>({});
  const [travelEnabled, setTravelEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadTravelData();
    }
  }, [eventId]);

  const loadTravelData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load travel info from event_travel table
      const { data: travelData, error: travelError } = await supabase
        .from('event_travel')
        .select('flight_info, accommodations, daily_schedule')
        .eq('event_id', eventId)
        .single();

      if (travelError) {
        if (travelError.code === 'PGRST116') {
          // No record found - this is normal for new events
          console.log('No travel record found for event:', eventId, '- using defaults');
          setTravelInfo({
            flight_info: '',
            accommodations: '',
            daily_schedule: '',
          });
        } else {
          console.error('Error loading travel data:', {
            message: travelError.message,
            details: travelError.details,
            hint: travelError.hint,
            code: travelError.code
          });
          // Still set defaults on error
          setTravelInfo({
            flight_info: '',
            accommodations: '',
            daily_schedule: '',
          });
        }
      } else if (travelData) {
        console.log('Loaded travel data:', travelData);
        setTravelInfo({
          flight_info: travelData.flight_info || '',
          accommodations: travelData.accommodations || '',
          daily_schedule: travelData.daily_schedule || '',
        });
      } else {
        // Fallback - no data and no error
        console.log('No travel data returned - using defaults');
        setTravelInfo({
          flight_info: '',
          accommodations: '',
          daily_schedule: '',
        });
      }

      // Load travel enabled setting
      const { data: customizationData, error: customizationError } = await supabase
        .from('event_customization')
        .select('travel_enabled')
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
        setTravelEnabled(customizationData.travel_enabled ?? true);
      }

    } catch (error) {
      console.error('Error loading travel customization data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      toast({
        title: "Load Failed",
        description: "Failed to load travel customization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTravelField = async (field: string, value: string) => {
    if (!eventId) return;

    try {
      setSaving(true);
      console.log('Saving travel field:', field, '=', value, 'for event:', eventId);

      // Use upsert to either update existing record or create new one
      const { error } = await supabase
        .from('event_travel')
        .upsert({
          event_id: eventId,
          [field]: value,
          // Include all current values to avoid overwriting
          ...travelInfo,
          [field]: value
        }, {
          onConflict: 'event_id'
        });

      if (error) {
        console.error('Error saving travel info:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        toast({
          title: "Save Failed",
          description: "Failed to save travel information",
          variant: "destructive",
        });
      } else {
        console.log('Successfully saved travel field:', field);
      }
    } catch (error) {
      console.error('Error saving travel info:', error);
    } finally {
      setSaving(false);
    }
  };

  const saveTravelEnabled = async (enabled: boolean) => {
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
          .update({ travel_enabled: enabled })
          .eq('event_id', eventId);

        if (error) {
          console.error('Error saving travel enabled:', error);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('event_customization')
          .insert({ 
            event_id: eventId,
            travel_enabled: enabled
          });

        if (error) {
          console.error('Error creating customization record:', error);
        }
      }
    } catch (error) {
      console.error('Error saving travel enabled:', error);
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
                <Plane className="h-5 w-5 mr-2 text-emerald-600" />
                Travel Information
              </CardTitle>
              <CardDescription className="text-green-600">
                Provide travel and accommodation details for your event attendees
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="travel-toggle" className="text-sm text-green-700">
                Enable Travel Page
              </Label>
              <Switch
                id="travel-toggle"
                checked={travelEnabled}
                onCheckedChange={(checked) => {
                  setTravelEnabled(checked);
                  saveTravelEnabled(checked);
                }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">Flight Information</Label>
                  <Textarea
                    value={travelInfo.flight_info || ''}
                    onChange={(e) => {
                      setTravelInfo(prev => ({ ...prev, flight_info: e.target.value }));
                    }}
                    onBlur={(e) => saveTravelField('flight_info', e.target.value)}
                    placeholder="Nearest airports, flight recommendations, shuttle services, rental car information, etc."
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    rows={4}
                    disabled={!travelEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">Accommodations</Label>
                  <Textarea
                    value={travelInfo.accommodations || ''}
                    onChange={(e) => {
                      setTravelInfo(prev => ({ ...prev, accommodations: e.target.value }));
                    }}
                    onBlur={(e) => saveTravelField('accommodations', e.target.value)}
                    placeholder="Hotel recommendations, booking links, group rates, lodging information, etc."
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    rows={4}
                    disabled={!travelEnabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">Daily Schedule</Label>
                  <Textarea
                    value={travelInfo.daily_schedule || ''}
                    onChange={(e) => {
                      setTravelInfo(prev => ({ ...prev, daily_schedule: e.target.value }));
                    }}
                    onBlur={(e) => saveTravelField('daily_schedule', e.target.value)}
                    placeholder="Daily itinerary, meal plans, activities, check-in times, etc."
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    rows={4}
                    disabled={!travelEnabled}
                  />
                </div>

              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
