import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Calendar,
  MapPin,
  FileText,
  Image,
  Save,
  Globe,
  Check,
  X,
  Loader2,
} from "lucide-react";

export default function BasicInfo() {
  const navigate = useNavigate();
  const { state, updateBasicInfo, saveEvent } = useTripCreation();
  const { tripData } = state;
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    tripName: tripData.tripName || "",
    startDate: tripData.startDate || "",
    endDate: tripData.endDate || "",
    location: tripData.location || "",
    description: tripData.description || "",
    bannerImage: tripData.bannerImage || "",
  });

  const [slug, setSlug] = useState("");
  const [slugStatus, setSlugStatus] = useState<
    "idle" | "checking" | "valid" | "invalid"
  >("idle");
  const [slugError, setSlugError] = useState("");
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Generate slug from text
  const generateSlugFromText = (text: string): string => {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50) || // Limit length
      "golf-event"
    );
  };

  // Check slug uniqueness with debouncing
  const checkSlugUniqueness = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck.trim()) {
      setSlugStatus("invalid");
      setSlugError("URL slug cannot be empty");
      return;
    }

    setSlugStatus("checking");
    setSlugError("");

    try {
      const { data, error } = await supabase
        .from("events")
        .select("id")
        .eq("slug", slugToCheck)
        .single();

      if (error && error.code === "PGRST116") {
        // No existing event with this slug - it's available
        setSlugStatus("valid");
        setSlugError("");
      } else if (error) {
        console.error("Error checking slug uniqueness:", error);
        setSlugStatus("invalid");
        setSlugError("Unable to verify URL uniqueness");
      } else {
        // Slug already exists
        setSlugStatus("invalid");
        setSlugError("This URL is already taken, please choose another");
      }
    } catch (error) {
      console.error("Error checking slug:", error);
      setSlugStatus("invalid");
      setSlugError("Unable to verify URL uniqueness");
    }
  }, []);

  // Debounced slug checking - only show checking state and validate when user stops typing
  useEffect(() => {
    if (!slug) return;

    const timeoutId = setTimeout(() => {
      // Only proceed if user has stopped typing for 1 second
      setIsUserTyping(false);
      if (slugStatus !== "checking") {
        setSlugStatus("checking");
      }
      checkSlugUniqueness(slug);
    }, 1000); // 1 second debounce for better UX

    return () => clearTimeout(timeoutId);
  }, [slug, checkSlugUniqueness]);

  // Auto-generate slug when trip name changes (only if user hasn't manually edited it)
  useEffect(() => {
    if (!isSlugEdited && formData.tripName) {
      const autoSlug = generateSlugFromText(formData.tripName);
      setSlug(autoSlug);
      setSlugStatus("idle");
      setIsUserTyping(true); // User is actively changing the event name
    }
  }, [formData.tripName, isSlugEdited]);

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

    // Validate slug
    if (!slug.trim()) {
      newErrors.slug = "Website URL is required";
    } else if (slugStatus === "invalid") {
      newErrors.slug = slugError || "Please choose a unique URL";
    } else if (slugStatus === "checking") {
      newErrors.slug = "Please wait while we verify URL availability";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (validateForm()) {
      setSaving(true);

      console.log("Form data before save:", formData);
      console.log("Date values:", {
        startDate: formData.startDate,
        endDate: formData.endDate,
        startDateType: typeof formData.startDate,
        endDateType: typeof formData.endDate,
      });

      // Update basic info in context
      updateBasicInfo(formData);

      try {
        // Pass form data directly to saveEvent to avoid timing issues
        const result = await saveEvent({
          tripName: formData.tripName,
          startDate: formData.startDate,
          endDate: formData.endDate,
          location: formData.location,
          description: formData.description,
          bannerImage: formData.bannerImage,
          slug: slug.trim(),
        });

        if (result.success) {
          toast({
            title: "Event Saved",
            description: tripData.id
              ? "Event updated successfully"
              : "Event created successfully",
          });
          navigate("/app/create/courses");
        } else {
          toast({
            title: "Save Failed",
            description: result.error || "Failed to save event",
            variant: "destructive",
          });
        }
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
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Mark as typing if changing the trip name
    if (field === "tripName") {
      setIsUserTyping(true);
    }
  };

  const handleSlugChange = (value: string) => {
    // Clean the slug input
    const cleanSlug = value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50);

    setSlug(cleanSlug);
    setIsSlugEdited(true);
    setIsUserTyping(true); // User is actively editing the slug
    setSlugStatus(cleanSlug ? "idle" : "invalid"); // Don't show checking immediately

    if (errors.slug) {
      setErrors((prev) => ({ ...prev, slug: "" }));
    }
  };

  const handleSlugBlur = () => {
    // Trigger validation immediately when user leaves the field
    setIsUserTyping(false);
    if (slug && slugStatus !== "checking") {
      setSlugStatus("checking");
      checkSlugUniqueness(slug);
    }
  };

  const handleEventNameBlur = () => {
    // Trigger validation when user leaves the event name field
    setIsUserTyping(false);
    if (slug && !isSlugEdited && slugStatus !== "checking") {
      setSlugStatus("checking");
      checkSlugUniqueness(slug);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleNext}
        nextDisabled={saving}
        nextLabel={saving ? "Saving..." : "Next"}
      />

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-600" />
            Event Details
          </CardTitle>
          <CardDescription className="text-green-600">
            Enter the basic information for your golf event
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Trip Name */}
          <div className="space-y-2">
            <Label htmlFor="tripName" className="text-green-800 font-medium">
              Event Name *
            </Label>
            <Input
              id="tripName"
              value={formData.tripName}
              onChange={(e) => handleInputChange("tripName", e.target.value)}
              onBlur={handleEventNameBlur}
              placeholder="e.g., Pebble Beach Golf Weekend"
              className={`border-green-200 focus:border-emerald-500 ${errors.tripName ? "border-red-300" : ""}`}
            />
            {errors.tripName && (
              <p className="text-sm text-red-600">{errors.tripName}</p>
            )}
          </div>

          {/* Website URL */}
          <div className="space-y-2">
            <Label
              htmlFor="slug"
              className="text-green-800 font-medium flex items-center"
            >
              <Globe className="h-4 w-4 mr-1 text-emerald-600" />
              Website URL *
            </Label>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 bg-gray-50 border border-r-0 border-green-200 px-3 py-2 rounded-l-md">
                tracktrack.com/events/
              </span>
              <div className="flex-1 relative">
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  onBlur={handleSlugBlur}
                  placeholder="your-event-url"
                  className={`border-green-200 focus:border-emerald-500 rounded-l-none pr-10 ${
                    errors.slug
                      ? "border-red-300"
                      : slugStatus === "valid"
                        ? "border-green-300"
                        : slugStatus === "invalid"
                          ? "border-red-300"
                          : ""
                  }`}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  {slugStatus === "checking" && !isUserTyping && (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  )}
                  {slugStatus === "valid" && !isUserTyping && (
                    <Check className="h-4 w-4 text-green-600" />
                  )}
                  {slugStatus === "invalid" && !isUserTyping && (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </div>
            </div>
            {slugStatus === "valid" && !isUserTyping && (
              <p className="text-sm text-green-600 flex items-center">
                <Check className="h-3 w-3 mr-1" />
                Perfect! This URL is available
              </p>
            )}
            {(errors.slug || (slugError && !isUserTyping)) && (
              <p className="text-sm text-red-600">{errors.slug || slugError}</p>
            )}
            <p className="text-sm text-gray-600">
              This will be your event's public website address. Auto-generated
              from your event name, but you can customize it.
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="text-green-800 font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-1 text-emerald-600" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange("startDate", e.target.value)}
                className={`border-green-200 focus:border-emerald-500 ${errors.startDate ? "border-red-300" : ""}`}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="text-green-800 font-medium flex items-center"
              >
                <Calendar className="h-4 w-4 mr-1 text-emerald-600" />
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange("endDate", e.target.value)}
                className={`border-green-200 focus:border-emerald-500 ${errors.endDate ? "border-red-300" : ""}`}
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
              className="text-green-800 font-medium flex items-center"
            >
              <MapPin className="h-4 w-4 mr-1 text-emerald-600" />
              Location (City, State) *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
              placeholder="e.g., Pebble Beach, CA"
              className={`border-green-200 focus:border-emerald-500 ${errors.location ? "border-red-300" : ""}`}
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
            <p className="text-sm text-green-600">
              Help participants know what to expect at this event
            </p>
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
              Add a banner image to make your trip page more appealing
            </p>
          </div>

          {/* Required Fields Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700">
              Fields marked with * are required. You can always edit these
              details later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(formData.tripName || formData.location) && (
        <Card className="border-green-100 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Preview</CardTitle>
            <CardDescription className="text-green-600">
              How your event will appear
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
            {slug && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center text-sm">
                  <Globe className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="text-blue-700 font-medium">
                    Public Website:{" "}
                  </span>
                  <span className="text-blue-600 ml-1">
                    tracktrack.com/events/{slug}
                  </span>
                  {slugStatus === "valid" && (
                    <Check className="h-3 w-3 ml-2 text-green-600" />
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
