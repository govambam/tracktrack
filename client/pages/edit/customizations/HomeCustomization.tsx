import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Home } from "lucide-react";

export default function HomeCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [homeHeadline, setHomeHeadline] = useState('');
  const [homeEnabled, setHomeEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadHomeData();
    }
  }, [eventId]);

  const loadHomeData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load home headline from event_customization table
      const { data: customizationData, error: customizationError } = await supabase
        .from('event_customization')
        .select('home_headline, home_enabled')
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
        setHomeHeadline(customizationData.home_headline || '');
        setHomeEnabled(customizationData.home_enabled ?? true);
      }

    } catch (error) {
      console.error('Error loading home customization data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
      });
      toast({
        title: "Load Failed",
        description: "Failed to load home customization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveHomeHeadline = async (headline: string) => {
    if (!eventId) return;

    try {
      // First check if customization record exists
      const { data: existing, error: fetchError } = await supabase
        .from('event_customization')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error checking customization:', {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code
        });
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('event_customization')
          .update({ home_headline: headline })
          .eq('event_id', eventId);

        if (error) {
          console.error('Error saving home headline:', error);
          toast({
            title: "Save Failed",
            description: "Failed to save homepage headline",
            variant: "destructive",
          });
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('event_customization')
          .insert({ 
            event_id: eventId,
            home_headline: headline,
            home_enabled: homeEnabled
          });

        if (error) {
          console.error('Error creating customization record:', error);
          toast({
            title: "Save Failed",
            description: "Failed to save homepage headline",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error saving home headline:', error);
    }
  };

  const saveHomeEnabled = async (enabled: boolean) => {
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
          .update({ home_enabled: enabled })
          .eq('event_id', eventId);

        if (error) {
          console.error('Error saving home enabled:', error);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('event_customization')
          .insert({ 
            event_id: eventId,
            home_enabled: enabled,
            home_headline: homeHeadline
          });

        if (error) {
          console.error('Error creating customization record:', error);
        }
      }
    } catch (error) {
      console.error('Error saving home enabled:', error);
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
                <Home className="h-5 w-5 mr-2 text-emerald-600" />
                Homepage Content
              </CardTitle>
              <CardDescription className="text-green-600">
                Customize the content that appears on your event's homepage
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="home-toggle" className="text-sm text-green-700">
                Enable Home Page
              </Label>
              <Switch
                id="home-toggle"
                checked={homeEnabled}
                onCheckedChange={(checked) => {
                  setHomeEnabled(checked);
                  saveHomeEnabled(checked);
                }}
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="homepage-headline" className="text-green-800 font-medium">
                  Homepage Headline
                </Label>
                <Input
                  id="homepage-headline"
                  value={homeHeadline}
                  onChange={(e) => setHomeHeadline(e.target.value)}
                  onBlur={() => saveHomeHeadline(homeHeadline)}
                  placeholder="Add a short headline to display on your event home page"
                  className="border-green-200 focus:border-emerald-500 bg-white"
                  disabled={!homeEnabled}
                />
                <p className="text-sm text-green-600">
                  This headline will be prominently displayed on your event's homepage to welcome visitors.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
