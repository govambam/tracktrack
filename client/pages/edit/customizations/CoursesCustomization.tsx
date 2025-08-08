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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { checkTableExists } from "@/lib/initDatabase";
import {
  MapPin,
  RefreshCw,
  Save,
  Sparkles,
  Search,
  X,
  ExternalLink,
} from "lucide-react";

interface EventCourse {
  id: string;
  event_id: string;
  course_id?: string;
  name: string;
  par?: number;
  yardage?: number;
  description?: string;
  image_url?: string;
  weather_note?: string;
  display_order?: number;
  holes?: number;
}

export default function CoursesCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [courses, setCourses] = useState<EventCourse[]>([]);
  const [coursesEnabled, setCoursesEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [generatingAI, setGeneratingAI] = useState<string | null>(null);
  const [imageSearchModal, setImageSearchModal] = useState<{
    isOpen: boolean;
    courseId: string;
    courseName: string;
  }>({ isOpen: false, courseId: "", courseName: "" });

  useEffect(() => {
    if (eventId) {
      loadCoursesData();
    }
  }, [eventId]);

  const loadCoursesData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Check if event_courses table exists
      const coursesTableExists = await checkTableExists("event_courses");
      if (!coursesTableExists) {
        console.error("event_courses table does not exist");
        toast({
          title: "Database Setup Required",
          description:
            "The event_courses table doesn't exist. Please run the event_courses_table_schema.sql script in Supabase SQL Editor.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Load courses from event_courses table
      const { data: coursesData, error: coursesError } = await supabase
        .from("event_courses")
        .select("*")
        .eq("event_id", eventId)
        .order("display_order", { ascending: true });

      if (coursesError) {
        console.error("Error loading courses:", {
          message: coursesError.message,
          details: coursesError.details,
          hint: coursesError.hint,
          code: coursesError.code,
        });

        if (coursesError.code === "42P01") {
          // Table doesn't exist - show helpful message
          toast({
            title: "Database Setup Required",
            description:
              "The event_courses table doesn't exist. Please run the database schema script.",
            variant: "destructive",
          });
        }
      } else {
        setCourses(coursesData || []);
      }

      // Check if event_customization table exists
      const customizationTableExists = await checkTableExists(
        "event_customization",
      );
      if (!customizationTableExists) {
        console.error("event_customization table does not exist");
        toast({
          title: "Database Setup Required",
          description:
            "The event_customization table doesn't exist. Please run the database schema scripts in Supabase SQL Editor.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Load courses enabled setting from event_customization
      const { data: customizationData, error: customizationError } =
        await supabase
          .from("event_customization")
          .select("courses_enabled")
          .eq("event_id", eventId)
          .single();

      if (customizationError && customizationError.code !== "PGRST116") {
        console.error("Error loading customization data:", {
          message: customizationError.message,
          details: customizationError.details,
          hint: customizationError.hint,
          code: customizationError.code,
        });
      } else if (customizationData) {
        setCoursesEnabled(customizationData.courses_enabled ?? true);
      }
    } catch (error) {
      console.error("Error loading courses customization data:", {
        message: error instanceof Error ? error.message : "Unknown error",
        error: error,
      });
      toast({
        title: "Load Failed",
        description: "Failed to load courses customization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveCourseField = async (
    courseId: string,
    field: string,
    value: string | number,
  ) => {
    if (!eventId) return;

    try {
      const updateData = { [field]: value };
      const { error } = await supabase
        .from("event_courses")
        .update(updateData)
        .eq("id", courseId)
        .eq("event_id", eventId);

      if (error) {
        console.error("Error saving course field:", error);
        toast({
          title: "Save Failed",
          description: "Failed to save course information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving course field:", error);
    }
  };

  const saveCoursesEnabled = async (enabled: boolean) => {
    if (!eventId) return;

    try {
      // First check if customization record exists
      const { data: existing, error: fetchError } = await supabase
        .from("event_customization")
        .select("*")
        .eq("event_id", eventId)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error checking customization:", {
          message: fetchError.message,
          details: fetchError.details,
          hint: fetchError.hint,
          code: fetchError.code,
        });
        return;
      }

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from("event_customization")
          .update({ courses_enabled: enabled })
          .eq("event_id", eventId);

        if (error) {
          console.error("Error saving courses enabled:", error);
        }
      } else {
        // Create new record
        const { error } = await supabase.from("event_customization").insert({
          event_id: eventId,
          courses_enabled: enabled,
        });

        if (error) {
          console.error("Error creating customization record:", {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
        }
      }
    } catch (error) {
      console.error("Error saving courses enabled:", error);
    }
  };

  const syncCoursesFromRounds = async () => {
    if (!eventId) return;

    setSyncing(true);
    try {
      // Get rounds for this event
      const { data: roundsData, error: roundsError } = await supabase
        .from("event_rounds")
        .select("course_name")
        .eq("event_id", eventId)
        .order("created_at");

      if (roundsError) {
        console.error("Error loading rounds:", {
          message: roundsError.message,
          details: roundsError.details,
          hint: roundsError.hint,
          code: roundsError.code,
        });
        toast({
          title: "Sync Failed",
          description: "Failed to load rounds data",
          variant: "destructive",
        });
        return;
      }

      if (!roundsData || roundsData.length === 0) {
        toast({
          title: "No Rounds Found",
          description: "Please add some rounds first in the Courses section",
          variant: "destructive",
        });
        return;
      }

      // Get unique course names from rounds
      const uniqueCourses = roundsData.reduce(
        (acc, round, index) => {
          const courseName = round.course_name?.trim();
          if (courseName && !acc.some((course) => course.name === courseName)) {
            acc.push({
              name: courseName,
              display_order: index + 1,
            });
          }
          return acc;
        },
        [] as { name: string; display_order: number }[],
      );

      if (uniqueCourses.length === 0) {
        toast({
          title: "No Courses Found",
          description: "No valid course names found in rounds",
          variant: "destructive",
        });
        return;
      }

      // Delete existing event_courses for this event first
      const { error: deleteError } = await supabase
        .from("event_courses")
        .delete()
        .eq("event_id", eventId);

      if (deleteError) {
        console.error("Error deleting existing courses:", {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code,
        });
        toast({
          title: "Sync Failed",
          description: "Failed to clear existing course data",
          variant: "destructive",
        });
        return;
      }

      // Insert unique courses into event_courses table
      const coursesData = uniqueCourses.map((course) => ({
        event_id: eventId,
        name: course.name,
        display_order: course.display_order,
      }));

      console.log("Attempting to insert courses data:", coursesData);

      const { data: insertData, error: insertError } = await supabase
        .from("event_courses")
        .insert(coursesData)
        .select();

      if (insertError) {
        console.error("Error inserting courses:", {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code,
        });

        let description = "Failed to create course entries";
        if (insertError.code === "42P01") {
          description =
            "The event_courses table doesn't exist. Please run the database schema script.";
        } else if (insertError.message) {
          description = insertError.message;
        }

        toast({
          title: "Sync Failed",
          description: description,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Courses Synced",
        description: `Successfully synced ${uniqueCourses.length} unique course${uniqueCourses.length !== 1 ? "s" : ""} from your rounds`,
      });

      // Reload the courses data
      loadCoursesData();
    } catch (error) {
      console.error("Error syncing courses:", error);
      toast({
        title: "Sync Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  const handleSaveAll = async () => {
    if (!eventId) return;

    try {
      // Save all course field changes (courses enabled toggle saves immediately)
      for (const course of courses) {
        if (course.image_url !== undefined) {
          await saveCourseField(course.id, "image_url", course.image_url || "");
        }
        if (course.yardage !== undefined) {
          await saveCourseField(course.id, "yardage", course.yardage || 0);
        }
        if (course.par !== undefined) {
          await saveCourseField(course.id, "par", course.par || 0);
        }
        if (course.description !== undefined) {
          await saveCourseField(
            course.id,
            "description",
            course.description || "",
          );
        }
        if (course.weather_note !== undefined) {
          await saveCourseField(
            course.id,
            "weather_note",
            course.weather_note || "",
          );
        }
      }

      toast({
        title: "Changes Saved",
        description: "Course information has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save course information",
        variant: "destructive",
      });
    }
  };

  const generateCourseWithAI = async (course: EventCourse) => {
    setGeneratingAI(course.id);

    try {
      console.log(`Generating AI data for course: ${course.name}`);

      // Get event data for location and dates
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("location, start_date, end_date")
        .eq("id", eventId)
        .single();

      if (eventError || !eventData) {
        console.error("Failed to fetch event data:", eventError);
        throw new Error("Failed to fetch event data");
      }

      const startDate = new Date(eventData.start_date).toLocaleDateString(
        "en-US",
        {
          month: "long",
          day: "numeric",
          year: "numeric",
        },
      );
      const endDate = new Date(eventData.end_date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });

      const prompt = `Write a polished 2-3 sentence description of the golf course "${course.name}" located in ${eventData.location}.
Also provide:
- The par score (estimate if unknown).
- The total yardage (estimate if unknown).
- A brief weather note for the event dates (${startDate} to ${endDate}).

Return your response as a JSON object with these fields:
{
  "description": "...",
  "par": "...",
  "yardage": "...",
  "weather": "..."
}`;

      console.log("AI prompt:", prompt);

      // Make API call with XMLHttpRequest
      const xhr = new XMLHttpRequest();
      const responsePromise = new Promise((resolve, reject) => {
        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            console.log(`Course AI XHR Response status:`, xhr.status);
            console.log(`Course AI XHR Response text:`, xhr.responseText);

            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const data = JSON.parse(xhr.responseText);
                resolve(data);
              } catch (parseError) {
                console.error(`Course AI JSON parse error:`, parseError);
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
          console.error(`Course AI XHR network error`);
          reject(new Error("Network error occurred"));
        };

        xhr.ontimeout = function () {
          console.error(`Course AI XHR timeout`);
          reject(new Error("Request timed out"));
        };
      });

      xhr.open("POST", "/api/generate-description", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 30000; // 30 second timeout
      xhr.send(JSON.stringify({ prompt }));

      const responseData = await responsePromise;
      console.log(`Course AI response data:`, responseData);

      const aiResponse = (responseData as any)?.description;

      if (!aiResponse) {
        throw new Error("No AI response received from server");
      }

      // Parse the JSON response from AI
      let courseData;
      try {
        courseData = JSON.parse(aiResponse);
      } catch (parseError) {
        console.error("Failed to parse AI JSON response:", parseError);
        throw new Error("AI returned invalid JSON format");
      }

      // Update the course with AI-generated data
      setCourses(
        courses.map((c) =>
          c.id === course.id
            ? {
                ...c,
                description: courseData.description || c.description,
                par: courseData.par ? parseInt(courseData.par) : c.par,
                yardage: courseData.yardage
                  ? parseInt(courseData.yardage)
                  : c.yardage,
                weather_note: courseData.weather || c.weather_note,
              }
            : c,
        ),
      );

      toast({
        title: "Course Data Generated!",
        description: `AI has generated data for ${course.name}.`,
      });
    } catch (error) {
      console.error(
        `Error generating AI data for course ${course.name}:`,
        error,
      );

      let userMessage =
        "There was an issue generating course data. Please try again later.";

      if (error instanceof Error) {
        const msg = error.message.toLowerCase();
        if (msg.includes("network") || msg.includes("fetch")) {
          userMessage =
            "Network error. Please check your connection and try again.";
        } else if (msg.includes("401") || msg.includes("unauthorized")) {
          userMessage = "API authorization failed. Please contact support.";
        } else if (msg.includes("server error")) {
          userMessage = error.message;
        } else if (msg.includes("json")) {
          userMessage = "AI response format error. Please try again.";
        }
      }

      toast({
        title: "Generation Failed",
        description: userMessage,
        variant: "destructive",
      });
    } finally {
      setGeneratingAI(null);
    }
  };

  const openImageSearch = (courseId: string, courseName: string) => {
    setImageSearchModal({ isOpen: true, courseId, courseName });
  };

  const closeImageSearch = () => {
    setImageSearchModal({ isOpen: false, courseId: "", courseName: "" });
  };

  const handleImageSelect = (imageUrl: string) => {
    // Update the course with the selected image URL
    setCourses(
      courses.map((c) =>
        c.id === imageSearchModal.courseId ? { ...c, image_url: imageUrl } : c,
      ),
    );

    // Save the image URL immediately
    saveCourseField(imageSearchModal.courseId, "image_url", imageUrl);

    toast({
      title: "Image Selected",
      description: "Course image has been updated successfully",
    });

    closeImageSearch();
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
      <Card className="border-purple-100">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-purple-900 flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                Course Details
              </CardTitle>
              <CardDescription className="text-purple-600">
                Customize the information displayed for each course in your
                event
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label
                htmlFor="courses-toggle"
                className="text-sm text-purple-700"
              >
                Enable Courses Page
              </Label>
              <Switch
                id="courses-toggle"
                checked={coursesEnabled}
                onCheckedChange={(checked) => {
                  setCoursesEnabled(checked);
                  saveCoursesEnabled(checked);
                }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {courses.length === 0 ? (
            <Card className="border-dashed border-purple-200 bg-purple-50/30">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-lg font-medium text-purple-900 mb-2">
                  No courses found
                </h3>
                <p className="text-purple-600 text-center mb-4">
                  Courses will appear here once you add them to your event in
                  the Courses section.
                </p>
                <Button
                  onClick={syncCoursesFromRounds}
                  disabled={syncing}
                  variant="outline"
                  className="border-purple-200 text-purple-700 hover:bg-purple-100"
                >
                  {syncing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sync Courses from Rounds
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <Card key={course.id} className="border-purple-100 bg-purple-50/30">
                  <CardHeader>
                    <CardTitle className="text-base text-green-900">
                      {course.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-4">
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">
                          Course Image URL
                        </Label>
                        <Input
                          value={course.image_url || ""}
                          onChange={(e) => {
                            setCourses(
                              courses.map((c) =>
                                c.id === course.id
                                  ? { ...c, image_url: e.target.value }
                                  : c,
                              ),
                            );
                          }}
                          placeholder="https://example.com/course-image.jpg"
                          className="border-green-200 focus:border-emerald-500 bg-white"
                        />
                        {!course.image_url && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              openImageSearch(course.id, course.name)
                            }
                            className="w-full sm:w-auto mt-2 border-blue-200 text-blue-700 hover:bg-blue-50"
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Search for Course Image
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2 sm:gap-4">
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium text-sm">
                            Yardage
                          </Label>
                          <Input
                            type="number"
                            value={course.yardage || ""}
                            onChange={(e) => {
                              setCourses(
                                courses.map((c) =>
                                  c.id === course.id
                                    ? {
                                        ...c,
                                        yardage:
                                          parseInt(e.target.value) || undefined,
                                      }
                                    : c,
                                ),
                              );
                            }}
                            placeholder="6800"
                            className="border-green-200 focus:border-emerald-500 bg-white"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium text-sm">
                            Par
                          </Label>
                          <Input
                            type="number"
                            value={course.par || ""}
                            onChange={(e) => {
                              setCourses(
                                courses.map((c) =>
                                  c.id === course.id
                                    ? {
                                        ...c,
                                        par:
                                          parseInt(e.target.value) || undefined,
                                      }
                                    : c,
                                ),
                              );
                            }}
                            placeholder="72"
                            className="border-green-200 focus:border-emerald-500 bg-white"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800 font-medium">
                        Course Description
                      </Label>
                      <Textarea
                        value={course.description || ""}
                        onChange={(e) => {
                          setCourses(
                            courses.map((c) =>
                              c.id === course.id
                                ? { ...c, description: e.target.value }
                                : c,
                            ),
                          );
                        }}
                        placeholder="Describe the course layout, features, and difficulty..."
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800 font-medium">
                        Weather Note
                      </Label>
                      <Input
                        value={course.weather_note || ""}
                        onChange={(e) => {
                          setCourses(
                            courses.map((c) =>
                              c.id === course.id
                                ? { ...c, weather_note: e.target.value }
                                : c,
                            ),
                          );
                        }}
                        placeholder="Weather conditions, seasonal notes, etc."
                        className="border-green-200 focus:border-emerald-500 bg-white"
                      />
                    </div>

                    {/* Generate/Polish with AI Button */}
                    <div className="pt-4 border-t border-green-100">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => generateCourseWithAI(course)}
                        disabled={generatingAI === course.id}
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        {generatingAI === course.id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            {course.description ||
                            course.par ||
                            course.yardage ||
                            course.weather_note
                              ? "Polish with AI"
                              : "Generate with AI"}
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button
              onClick={handleSaveAll}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Image Search Modal */}
      <Dialog open={imageSearchModal.isOpen} onOpenChange={closeImageSearch}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] max-h-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span className="text-sm md:text-base truncate">
                Search Images for {imageSearchModal.courseName}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeImageSearch}
                className="h-6 w-6 p-0 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 mb-2">
                    How to find and use an image:
                  </h4>
                  <ol className="text-sm text-blue-700 space-y-1 mb-3">
                    <li>
                      1. Click "Open Google Images" below to search for course
                      images
                    </li>
                    <li>2. Right-click on an image you like</li>
                    <li>3. Select "Copy image address" or "Copy image URL"</li>
                    <li>
                      4. Return here, paste the URL, and click "Use This Image"
                    </li>
                  </ol>
                  <Button
                    onClick={() => {
                      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(imageSearchModal.courseName + " golf course")}&tbm=isch`;
                      window.open(searchUrl, "_blank");
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open Google Images
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label
                htmlFor="imageUrl"
                className="text-sm font-medium text-gray-700"
              >
                Paste Image URL:
              </Label>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <Input
                  id="imageUrl"
                  placeholder="https://example.com/course-image.jpg"
                  className="flex-1"
                />
                <Button
                  onClick={() => {
                    const input = document.getElementById(
                      "imageUrl",
                    ) as HTMLInputElement;
                    if (input?.value.trim()) {
                      handleImageSelect(input.value.trim());
                    }
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 whitespace-nowrap"
                >
                  Use This Image
                </Button>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Tip:</strong> Look for high-quality images that show the
                course layout or signature holes. Make sure the URL ends with
                .jpg, .png, or .webp for best compatibility.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
