import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { Palette, Lock, Globe, Upload, Eye, EyeOff, Save } from "lucide-react";

export default function CustomizationEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [customization, setCustomization] = useState({
    isPrivate: tripData.customization?.isPrivate ?? false,
    logoUrl: tripData.customization?.logoUrl || '',
    customDomain: tripData.customization?.customDomain || ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Update local state when context data changes
    if (tripData.customization) {
      setCustomization({
        isPrivate: tripData.customization.isPrivate ?? false,
        logoUrl: tripData.customization.logoUrl || '',
        customDomain: tripData.customization.customDomain || ''
      });
    }
  }, [tripData.customization]);

  const updateCustomizationField = (field: keyof typeof customization, value: boolean | string) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!eventId) return;

    setSaving(true);

    try {
      // Update main event privacy setting
      const { error: eventError } = await supabase
        .from('events')
        .update({ 
          is_private: customization.isPrivate,
          logo_url: customization.logoUrl.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', eventId);

      if (eventError) {
        console.error('Error updating event:', eventError);
        toast({
          title: "Save Failed",
          description: eventError.message || "Failed to update event settings",
          variant: "destructive",
        });
        return;
      }

      // Check if customization data exists
      const { data: existingCustomization, error: fetchError } = await supabase
        .from('event_customization')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching customization data:', fetchError);
        toast({
          title: "Save Failed",
          description: fetchError.message || "Failed to check existing customization data",
          variant: "destructive",
        });
        return;
      }

      const customizationData = {
        event_id: eventId,
        logo_url: customization.logoUrl.trim() || null,
        custom_domain: customization.customDomain.trim() || null,
        is_private: customization.isPrivate,
        updated_at: new Date().toISOString()
      };

      let error;

      if (existingCustomization) {
        // Update existing customization data
        const { error: updateError } = await supabase
          .from('event_customization')
          .update(customizationData)
          .eq('event_id', eventId);
        error = updateError;
      } else {
        // Insert new customization data
        const { error: insertError } = await supabase
          .from('event_customization')
          .insert(customizationData);
        error = insertError;
      }

      if (error) {
        console.error('Error saving customization data:', error);
        toast({
          title: "Save Failed",
          description: error.message || "Failed to save customization settings",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Customization Updated",
        description: "Event customization settings have been saved successfully",
      });

    } catch (error) {
      console.error('Error saving customization settings:', error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg text-green-900 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-emerald-600" />
            Event Customization
          </CardTitle>
          <CardDescription className="text-green-600">
            Customize the branding and privacy settings for your golf event
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Privacy Settings */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      {customization.isPrivate ? (
                        <Lock className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Globe className="h-4 w-4 text-emerald-600" />
                      )}
                      <Label className="text-green-800 font-medium">Event Privacy</Label>
                    </div>
                    <p className="text-sm text-green-600">
                      {customization.isPrivate 
                        ? "Private events require an invitation to access" 
                        : "Public events can be discovered and joined by anyone"
                      }
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge variant={customization.isPrivate ? "secondary" : "outline"} className="text-xs">
                      {customization.isPrivate ? "Private" : "Public"}
                    </Badge>
                    <Switch
                      checked={customization.isPrivate}
                      onCheckedChange={(checked) => updateCustomizationField('isPrivate', checked)}
                    />
                  </div>
                </div>

                <Alert className={customization.isPrivate ? "border-orange-200 bg-orange-50" : "border-blue-200 bg-blue-50"}>
                  {customization.isPrivate ? (
                    <EyeOff className="h-4 w-4 text-orange-600" />
                  ) : (
                    <Eye className="h-4 w-4 text-blue-600" />
                  )}
                  <AlertDescription className={customization.isPrivate ? "text-orange-700" : "text-blue-700"}>
                    {customization.isPrivate ? (
                      <>
                        <strong>Private Event:</strong> Only invited participants can view event details, 
                        join rounds, or access the leaderboard. You'll need to manually invite players.
                      </>
                    ) : (
                      <>
                        <strong>Public Event:</strong> Anyone with the event link can view details and 
                        request to join. Great for open tournaments and community events.
                      </>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          {/* Logo Settings */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Upload className="h-4 w-4 text-emerald-600" />
                  <Label className="text-green-800 font-medium">Event Logo</Label>
                </div>
                <div className="space-y-2">
                  <Input
                    type="url"
                    value={customization.logoUrl}
                    onChange={(e) => updateCustomizationField('logoUrl', e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="border-green-200 focus:border-emerald-500 bg-white"
                  />
                  <p className="text-xs text-green-600">
                    Add a logo URL to brand your event. Recommended size: 200x100px or similar aspect ratio.
                  </p>
                </div>
                {customization.logoUrl && (
                  <div className="mt-3">
                    <Label className="text-green-800 text-sm">Logo Preview:</Label>
                    <div className="mt-2 p-4 border border-green-200 rounded-md bg-white">
                      <img 
                        src={customization.logoUrl} 
                        alt="Event Logo Preview" 
                        className="max-h-16 max-w-32 object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden text-sm text-red-600">
                        Failed to load logo. Please check the URL.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom Domain */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-emerald-600" />
                  <Label className="text-green-800 font-medium">Custom Domain (Coming Soon)</Label>
                  <Badge variant="outline" className="text-xs">Pro Feature</Badge>
                </div>
                <div className="space-y-2">
                  <Input
                    value={customization.customDomain}
                    onChange={(e) => updateCustomizationField('customDomain', e.target.value)}
                    placeholder="golf.yourcompany.com"
                    className="border-green-200 focus:border-emerald-500 bg-white"
                    disabled
                  />
                  <p className="text-xs text-green-600">
                    Host your event on your own domain. Contact support to enable this feature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Customization'}
            </Button>
          </div>

          {/* Summary */}
          <Alert className="border-emerald-200 bg-emerald-50">
            <Palette className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">
              <div className="font-semibold">Customization Summary</div>
              <div className="mt-1 space-y-1 text-sm">
                <div>Privacy: {customization.isPrivate ? "Private Event" : "Public Event"}</div>
                {customization.logoUrl.trim() && (
                  <div>✓ Custom logo configured</div>
                )}
                {customization.customDomain.trim() && (
                  <div>Custom domain: {customization.customDomain} (Pro feature)</div>
                )}
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
