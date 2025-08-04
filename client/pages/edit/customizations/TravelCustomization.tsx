import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Plane } from "lucide-react";

interface TravelInfo {
  travel_lodging?: string;
  travel_notes?: string;
  travel_airport?: string;
  travel_distance?: string;
}

export default function TravelCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [travelInfo, setTravelInfo] = useState<TravelInfo>({});
  const [travelEnabled, setTravelEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadTravelData();
    }
  }, [eventId]);

  const loadTravelData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load travel info from events table
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('travel_lodging, travel_notes, travel_airport, travel_distance')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error loading event data:', {
          message: eventError.message,
          details: eventError.details,
          hint: eventError.hint,
          code: eventError.code
        });
      } else {
        setTravelInfo({
          travel_lodging: eventData.travel_lodging || '',
          travel_notes: eventData.travel_notes || '',
          travel_airport: eventData.travel_airport || '',
          travel_distance: eventData.travel_distance || '',
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
      const updateData = { [field]: value };
      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', eventId);

      if (error) {
        console.error('Error saving travel info:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save travel information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving travel info:', error);
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
                  <Label className="text-green-800 font-medium">Lodging Information</Label>
                  <Textarea
                    value={travelInfo.travel_lodging || ''}
                    onChange={(e) => {
                      setTravelInfo(prev => ({ ...prev, travel_lodging: e.target.value }));
                    }}
                    onBlur={(e) => saveTravelField('travel_lodging', e.target.value)}
                    placeholder="Hotel recommendations, booking links, group rates, etc."
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    rows={4}
                    disabled={!travelEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">Airport Information</Label>
                  <Textarea
                    value={travelInfo.travel_airport || ''}
                    onChange={(e) => {
                      setTravelInfo(prev => ({ ...prev, travel_airport: e.target.value }));
                    }}
                    onBlur={(e) => saveTravelField('travel_airport', e.target.value)}
                    placeholder="Nearest airports, shuttle services, rental car information, etc."
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    rows={4}
                    disabled={!travelEnabled}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">Distance & Directions</Label>
                  <Input
                    value={travelInfo.travel_distance || ''}
                    onChange={(e) => {
                      setTravelInfo(prev => ({ ...prev, travel_distance: e.target.value }));
                    }}
                    onBlur={(e) => saveTravelField('travel_distance', e.target.value)}
                    placeholder="Distance from major cities, driving directions"
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    disabled={!travelEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">Additional Notes</Label>
                  <Input
                    value={travelInfo.travel_notes || ''}
                    onChange={(e) => {
                      setTravelInfo(prev => ({ ...prev, travel_notes: e.target.value }));
                    }}
                    onBlur={(e) => saveTravelField('travel_notes', e.target.value)}
                    placeholder="Weather, local attractions, dining recommendations, etc."
                    className="border-green-200 focus:border-emerald-500 bg-white"
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
