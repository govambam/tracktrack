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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  MapPin,
  FileText,
  Image,
  Save,
  Sparkles,
} from "lucide-react";

export default function BasicInfoEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [formData, setFormData] = useState({
    tripName: "",
    startDate: "",
    endDate: "",
    location: "",
    description: "",
    bannerImage: "",
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generatingAI, setGeneratingAI] = useState(false);
  const [polishingAI, setPolishingAI] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadBasicInfo();
    }
  }, [eventId]);

  const loadBasicInfo = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      console.log("Loading basic info for event:", eventId);

      // Load event data directly from Supabase to ensure fresh data
      const { data: eventData, error } = await supabase
        .from("events")
        .select("name, start_date, end_date, location, description, logo_url")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error loading event data:", error);
        toast({
          title: "Load Failed",
          description: error.message || "Failed to load event data",
          variant: "destructive",
        });
        return;
      }

      if (eventData) {
        setFormData({
          tripName: eventData.name || "",
          startDate: eventData.start_date || "",
          endDate: eventData.end_date || "",
          location: eventData.location || "",
          description: eventData.description || "",
          bannerImage: eventData.logo_url || "",
        });
        console.log("Loaded basic info:", eventData);
      }
    } catch (error) {
      console.error("Error loading basic info:", error);
      toast({
        title: "Load Failed",
        description: "An unexpected error occurred while loading event data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tripName.trim()) {
      newErrors.tripName = "Event name is required";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = "End date must be after start date";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !eventId) return;

    setSaving(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({
          name: formData.tripName.trim(),
          start_date: formData.startDate.trim(),
          end_date: formData.endDate.trim(),
          location: formData.location.trim(),
          description: formData.description.trim() || null,
          logo_url: formData.bannerImage.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) {
        console.error("Error updating event:", error);
        toast({
          title: "Save Failed",
          description: error.message || "Failed to update event",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Event Updated",
        description: "Basic information has been saved successfully",
      });
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const generateAIDescription = async () => {
    if (!eventId) return;

    setGeneratingAI(true);

    // Variables that might be needed for fallback
    let event: any = null;
    let courses: any[] = [];
    let playerCount = 0;
    let startDate = "";
    let endDate = "";

    try {
      // Fetch event data including courses and player count
      console.log("Fetching event data for ID:", eventId);

      const [eventResult, coursesResult, playersResult] = await Promise.all([
        supabase
          .from("events")
          .select("name, location, start_date, end_date")
          .eq("id", eventId)
          .single(),
        supabase.from("event_courses").select("name").eq("event_id", eventId),
        supabase.from("event_players").select("id").eq("event_id", eventId),
      ]);

      if (eventResult.error) {
        console.error("Event fetch error:", eventResult.error);
        throw new Error("Failed to fetch event data");
      }

      event = eventResult.data;
      courses = coursesResult.data || [];
      playerCount = playersResult.data?.length || 0;

      console.log("Event data:", { event, courses, playerCount });

      // Format dates
      startDate = new Date(event.start_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      endDate = new Date(event.end_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      // Format course names
      const courseNames =
        courses.length > 0
          ? courses.map((c) => c.name).join(", ")
          : "beautiful golf courses";

      // Construct prompt
      const prompt = `Write a short, fun trip description for a golf getaway among friends. The event is called ${event.name} and takes place in ${event.location} from ${startDate} to ${endDate}. They'll be playing at ${courseNames}. The tone should be lighthearted, personal, and reflect the spirit of friends' golf trip—light competition, lots of camaraderie, good times, and memorable moments. Limit the response to a maximum of 2-3 sentences.`;

      console.log("Generated prompt:", prompt);

      // Make API call with XMLHttpRequest to avoid fetch stream issues
      const xhr = new XMLHttpRequest();
      const responsePromise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log("XHR Response status:", xhr.status);
            console.log("XHR Response text:", xhr.responseText);

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (parseError) {
                console.error("JSON parse error:", parseError);
                reject(
                  new Error(
                    `Invalid JSON response: ${xhr.responseText.slice(0, 100)}...`,
                  ),
                );
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(
                  new Error(
                    `Server error (${xhr.status}): ${errorData.error || errorData.details || "Unknown error"}`,
                  ),
                );
              } catch {
                reject(
                  new Error(
                    `HTTP ${xhr.status}: ${xhr.responseText.slice(0, 100)}...`,
                  ),
                );
              }
            }
          }
        };

        xhr.onerror = function () {
          console.error("XHR network error");
          reject(new Error("Network error occurred"));
        };

        xhr.ontimeout = function () {
          console.error("XHR timeout");
          reject(new Error("Request timed out"));
        };
      });

      xhr.open("POST", "/api/generate-description", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 30000; // 30 second timeout
      xhr.send(JSON.stringify({ prompt }));

      const responseData = await responsePromise;
      console.log("Parsed response data:", responseData);

      const generatedDescription = (responseData as any)?.description;
      const source = (responseData as any)?.source;

      if (!generatedDescription) {
        throw new Error("No description received from server");
      }

      // Update the form
      handleInputChange("description", generatedDescription);

      toast({
        title: "Description Generated!",
        description: "AI has created a new event description for you.",
      });
    } catch (error) {
      console.error("Full error details:", error);

      let userMessage =
        "There was an issue generating your description. Please try again later.";

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("network") || msg.includes("fetch")) {
          userMessage =
            "Network error. Please check your connection and try again.";
        } else if (msg.includes("401") || msg.includes("unauthorized")) {
          userMessage = "API authorization failed. Please contact support.";
        } else if (msg.includes("server error")) {
          userMessage = error.message;
        }
      }

      toast({
        title: "Generation Failed",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(false);
    }
  };

  const polishWithAI = async () => {
    if (!formData.description || !formData.description.trim()) return;

    setPolishingAI(true);

    try {
      console.log("Polishing description with AI");

      const prompt = `Take the following event description and polish it for use on a public-facing event website. Improve flow, clarity, and tone while preserving the original intent. Make it sound fun, well-written, and trip-appropriate—but not overly formal. Limit the response to a maximum of 2-3 sentences.

Description:
${formData.description}`;

      console.log("Polish prompt:", prompt);

      // Make API call with XMLHttpRequest
      const xhr = new XMLHttpRequest();
      const responsePromise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log("Polish XHR Response status:", xhr.status);
            console.log("Polish XHR Response text:", xhr.responseText);

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (parseError) {
                console.error("Polish JSON parse error:", parseError);
                reject(
                  new Error(
                    `Invalid JSON response: ${xhr.responseText.slice(0, 100)}...`,
                  ),
                );
              }
            } else {
              try {
                const errorData = JSON.parse(xhr.responseText);
                reject(
                  new Error(
                    `Server error (${xhr.status}): ${errorData.error || errorData.details || "Unknown error"}`,
                  ),
                );
              } catch {
                reject(
                  new Error(
                    `HTTP ${xhr.status}: ${xhr.responseText.slice(0, 100)}...`,
                  ),
                );
              }
            }
          }
        };

        xhr.onerror = function () {
          console.error("Polish XHR network error");
          reject(new Error("Network error occurred"));
        };

        xhr.ontimeout = function () {
          console.error("Polish XHR timeout");
          reject(new Error("Request timed out"));
        };
      });

      xhr.open("POST", "/api/generate-description", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 30000; // 30 second timeout
      xhr.send(JSON.stringify({ prompt }));

      const responseData = await responsePromise;
      console.log("Polish API response data:", responseData);

      const polishedDescription = (responseData as any)?.description;

      if (!polishedDescription) {
        throw new Error("No polished description received from server");
      }

      // Update the form
      handleInputChange("description", polishedDescription);

      toast({
        title: "Description Polished!",
        description: "AI has polished your event description.",
      });
    } catch (error) {
      console.error("Error polishing description:", error);

      let userMessage =
        "There was an issue polishing your description. Please try again later.";

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("network") || msg.includes("fetch")) {
          userMessage =
            "Network error. Please check your connection and try again.";
        } else if (msg.includes("401") || msg.includes("unauthorized")) {
          userMessage = "API authorization failed. Please contact support.";
        } else if (msg.includes("server error")) {
          userMessage = error.message;
        }
      }

      toast({
        title: "Polish Failed",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setPolishingAI(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-purple-600" />
            Event Details
          </CardTitle>
          <CardDescription className="text-purple-600">
            Update the basic information for your golf event
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Name */}
          <div className="space-y-2">
            <Label htmlFor="tripName" className="text-purple-900 font-medium">
              Event Name *
            </Label>
            <Input
              id="tripName"
              value={formData.tripName}
              onChange={(e) => handleInputChange("tripName", e.target.value)}
              placeholder="e.g., Pebble Beach Golf Weekend"
              className={`border-purple-200 focus:border-purple-500 ${errors.tripName ? "border-red-300" : ""}`}
            />
            {errors.tripName && (
              <p className="text-sm text-red-600">{errors.tripName}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-purple-900 font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-1 text-purple-600" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={`border-purple-200 focus:border-purple-500 ${errors.startDate ? "border-red-300" : ""}`}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-purple-900 font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-1 text-purple-600" />
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={`border-purple-200 focus:border-purple-500 ${errors.endDate ? "border-red-300" : ""}`}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label
              htmlFor="location"
              className="text-purple-900 font-medium flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1 text-purple-600" />
              Location (City, State) *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Pebble Beach, CA"
              className={`border-purple-200 focus:border-purple-500 ${errors.location ? "border-red-300" : ""}`}
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-green-800 font-medium">
              Event Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Describe your golf event, what makes it special, activities planned..."
              rows={4}
              className="border-green-200 focus:border-emerald-500"
            />
            <div className="flex items-center justify-between">
              <p className="text-sm text-green-600">
                Help participants know what to expect at this event
              </p>
              <div className="flex items-center gap-2">
                {formData.description && formData.description.trim() && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={polishWithAI}
                    disabled={polishingAI || generatingAI}
                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                  >
                    {polishingAI ? (
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateAIDescription}
                  disabled={generatingAI || polishingAI}
                  className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                >
                  {generatingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-emerald-600 mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Generate with AI
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Banner Image (Optional) */}
          <div className="space-y-2">
            <Label
              htmlFor="bannerImage"
              className="text-green-800 font-medium flex items-center"
            >
              <Image className="h-4 w-4 mr-1 text-emerald-600" />
              Banner Image URL (Optional)
            </Label>
            <Input
              id="bannerImage"
              type="url"
              value={formData.bannerImage}
              onChange={(e) => handleInputChange("bannerImage", e.target.value)}
              placeholder="https://example.com/your-banner-image.jpg"
              className="border-green-200 focus:border-emerald-500"
            />
            <p className="text-sm text-green-600">
              Add a banner image to make your event page more appealing
            </p>
          </div>

          {/* Required Fields Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700">
              Fields marked with * are required. Changes will be saved when you
              click the Save button.
            </AlertDescription>
          </Alert>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(formData.tripName || formData.location) && (
        <Card className="border-green-100 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Preview</CardTitle>
            <CardDescription className="text-green-600">
              How your event will appear on the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🏌️‍♂️</div>
              <div>
                <h3 className="font-semibold text-green-900">
                  {formData.tripName || "Your Event Name"}
                </h3>
                <p className="text-green-600 text-sm">
                  {formData.location || "Location"}
                  {formData.startDate && formData.endDate && (
                    <>
                      {" "}
                      • {new Date(
                        formData.startDate,
                      ).toLocaleDateString()} -{" "}
                      {new Date(formData.endDate).toLocaleDateString()}
                    </>
                  )}
                </p>
                {formData.description && (
                  <p className="text-green-700 text-sm mt-1 line-clamp-2">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
