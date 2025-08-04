import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { Plane, Building, Calendar, Info, Save, Sparkles } from "lucide-react";

export default function TravelEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [travelInfo, setTravelInfo] = useState({
    flightTimes: "",
    accommodations: "",
    dailySchedule: "",
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [polishingField, setPolishingField] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      loadTravelData();
    }
  }, [eventId]);

  const loadTravelData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      console.log("Loading travel data for event:", eventId);

      // Load travel data directly from Supabase
      const { data: travelData, error } = await supabase
        .from("event_travel")
        .select("flight_info, accommodations, daily_schedule")
        .eq("event_id", eventId)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading travel data:", error);
        // Don't show error for missing travel data, use defaults
      } else if (travelData) {
        setTravelInfo({
          flightTimes: travelData.flight_info || "",
          accommodations: travelData.accommodations || "",
          dailySchedule: travelData.daily_schedule || "",
        });
        console.log("Loaded travel data:", travelData);
      }
    } catch (error) {
      console.error("Error loading travel data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTravelInfo = (field: keyof typeof travelInfo, value: string) => {
    setTravelInfo((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!eventId) return;

    setSaving(true);

    try {
      // Check if travel data exists
      const { data: existingTravel, error: fetchError } = await supabase
        .from("event_travel")
        .select("*")
        .eq("event_id", eventId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching travel data:", fetchError);
        toast({
          title: "Save Failed",
          description:
            fetchError.message || "Failed to check existing travel data",
          variant: "destructive",
        });
        return;
      }

      const travelData = {
        event_id: eventId,
        flight_info: travelInfo.flightTimes.trim() || null,
        accommodations: travelInfo.accommodations.trim() || null,
        daily_schedule: travelInfo.dailySchedule.trim() || null,
        updated_at: new Date().toISOString(),
      };

      let error;

      if (existingTravel) {
        // Update existing travel data
        const { error: updateError } = await supabase
          .from("event_travel")
          .update(travelData)
          .eq("event_id", eventId);
        error = updateError;
      } else {
        // Insert new travel data
        const { error: insertError } = await supabase
          .from("event_travel")
          .insert(travelData);
        error = insertError;
      }

      if (error) {
        console.error("Error saving travel data:", error);
        toast({
          title: "Save Failed",
          description: error.message || "Failed to save travel information",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Travel Information Updated",
        description: "Travel details have been saved successfully",
      });
    } catch (error) {
      console.error("Error saving travel information:", error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const polishFieldWithAI = async (fieldName: string, currentContent: string) => {
    if (!currentContent || !currentContent.trim()) return;

    setPolishingField(fieldName);

    try {
      console.log(`Polishing ${fieldName} with AI`);

      const prompt = `Please improve and polish the following text so that it's clear, concise, and well-structured. Return the result in markdown format, including subheadings, bold or italicized text where appropriate, and bullet points if useful.

Text:
${currentContent}`;

      console.log("Polish prompt:", prompt);

      // Make API call with XMLHttpRequest
      const xhr = new XMLHttpRequest();
      const responsePromise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = function() {
          if (xhr.readyState === 4) {
            console.log(`Polish ${fieldName} XHR Response status:`, xhr.status);
            console.log(`Polish ${fieldName} XHR Response text:`, xhr.responseText);

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (parseError) {
                console.error(`Polish ${fieldName} JSON parse error:`, parseError);
                reject(new Error(`Invalid JSON response: ${xhr.responseText.slice(0, 100)}...`));
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(new Error(`Server error (${xhr.status}): ${errorData.error || errorData.details || 'Unknown error'}`));
              } catch {
                reject(new Error(`HTTP ${xhr.status}: ${xhr.responseText.slice(0, 100)}...`));
              }
            }
          }
        };

        xhr.onerror = function() {
          console.error(`Polish ${fieldName} XHR network error`);
          reject(new Error("Network error occurred"));
        };

        xhr.ontimeout = function() {
          console.error(`Polish ${fieldName} XHR timeout`);
          reject(new Error("Request timed out"));
        };
      });

      xhr.open("POST", "/api/generate-description", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 30000; // 30 second timeout
      xhr.send(JSON.stringify({ prompt }));

      const responseData = await responsePromise;
      console.log(`Polish ${fieldName} API response data:`, responseData);

      const polishedContent = responseData?.description;

      if (!polishedContent) {
        throw new Error("No polished content received from server");
      }

      // Update the appropriate field
      updateTravelInfo(fieldName, polishedContent);

      toast({
        title: "Content Polished!",
        description: `AI has polished your ${fieldName.replace(/([A-Z])/g, ' $1').toLowerCase()} content.`,
      });

    } catch (error) {
      console.error(`Error polishing ${fieldName}:`, error);

      let userMessage = "There was an issue polishing your content. Please try again later.";

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("network") || msg.includes("fetch")) {
          userMessage = "Network error. Please check your connection and try again.";
        } else if (msg.includes("401") || msg.includes("unauthorized")) {
          userMessage = "API authorization failed. Please contact support.";
        } else if (msg.includes("server error")) {
          userMessage = error.message;
        }
      }

      toast({
        title: "Polish Failed",
        description: userMessage,
        variant: "destructive"
      });
    } finally {
      setPolishingField(null);
    }
  };

  const hasAnyContent = Object.values(travelInfo).some((value) => value.trim());

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
          <CardTitle className="text-lg text-green-900 flex items-center">
            <Plane className="h-5 w-5 mr-2 text-emerald-600" />
            Travel Information
          </CardTitle>
          <CardDescription className="text-green-600">
            Add logistics and travel details for your golf event
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Flight Information */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Plane className="h-4 w-4 text-emerald-600" />
                  <Label className="text-green-800 font-medium">
                    Flight Information
                  </Label>
                </div>
                <Textarea
                  value={travelInfo.flightTimes}
                  onChange={(e) =>
                    updateTravelInfo("flightTimes", e.target.value)
                  }
                  placeholder="Include flight times, airlines, confirmation numbers, and any group booking details..."
                  className="border-green-200 focus:border-emerald-500 bg-white resize-none h-24"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-600">
                    Add departure/arrival times, airport codes, and any group
                    travel arrangements
                  </p>
                  {travelInfo.flightTimes && travelInfo.flightTimes.trim() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => polishFieldWithAI("flightTimes", travelInfo.flightTimes)}
                      disabled={polishingField === "flightTimes"}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      {polishingField === "flightTimes" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Polishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Polish with AI
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Accommodations */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-emerald-600" />
                  <Label className="text-green-800 font-medium">
                    Accommodations
                  </Label>
                </div>
                <Textarea
                  value={travelInfo.accommodations}
                  onChange={(e) =>
                    updateTravelInfo("accommodations", e.target.value)
                  }
                  placeholder="Hotel name, address, check-in/out times, room arrangements, amenities..."
                  className="border-green-200 focus:border-emerald-500 bg-white resize-none h-24"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-green-600">
                    Include hotel details, room blocks, special rates, and nearby
                    amenities
                  </p>
                  {travelInfo.accommodations && travelInfo.accommodations.trim() && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => polishFieldWithAI("accommodations", travelInfo.accommodations)}
                      disabled={polishingField === "accommodations"}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      {polishingField === "accommodations" ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                          Polishing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Polish with AI
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule */}
          <Card className="border-green-100 bg-green-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-emerald-600" />
                  <Label className="text-green-800 font-medium">
                    Daily Schedule
                  </Label>
                </div>
                <Textarea
                  value={travelInfo.dailySchedule}
                  onChange={(e) =>
                    updateTravelInfo("dailySchedule", e.target.value)
                  }
                  placeholder="Day-by-day itinerary, meal times, activities, meeting points, transportation..."
                  className="border-green-200 focus:border-emerald-500 bg-white resize-none h-32"
                />
                <p className="text-xs text-green-600">
                  Outline the schedule for each day including tee times, meals,
                  and activities
                </p>
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
              {saving ? "Saving..." : "Save Travel Information"}
            </Button>
          </div>

          {/* Info Alert */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Travel Tips:</strong> Keep all travel information updated
              and share confirmation numbers with participants. Consider
              creating a group chat for real-time coordination during travel
              days.
            </AlertDescription>
          </Alert>

          {/* Summary */}
          {hasAnyContent && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Calendar className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                <div className="font-semibold">Travel Information Summary</div>
                <div className="mt-1 space-y-1 text-sm">
                  {travelInfo.flightTimes.trim() && (
                    <div>✓ Flight details provided</div>
                  )}
                  {travelInfo.accommodations.trim() && (
                    <div>✓ Accommodation details provided</div>
                  )}
                  {travelInfo.dailySchedule.trim() && (
                    <div>✓ Daily schedule provided</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
