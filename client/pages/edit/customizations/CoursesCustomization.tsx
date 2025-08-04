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
import { checkTableExists } from "@/lib/initDatabase";
import { MapPin, RefreshCw, Save } from "lucide-react";

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
}

export default function CoursesCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [courses, setCourses] = useState<EventCourse[]>([]);
  const [coursesEnabled, setCoursesEnabled] = useState(true);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
      const coursesTableExists = await checkTableExists('event_courses');
      if (!coursesTableExists) {
        console.error('event_courses table does not exist');
        toast({
          title: "Database Setup Required",
          description: "The event_courses table doesn't exist. Please run the event_courses_table_schema.sql script in Supabase SQL Editor.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Load courses from event_courses table
      const { data: coursesData, error: coursesError } = await supabase
        .from('event_courses')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (coursesError) {
        console.error('Error loading courses:', {
          message: coursesError.message,
          details: coursesError.details,
          hint: coursesError.hint,
          code: coursesError.code
        });

        if (coursesError.code === '42P01') {
          // Table doesn't exist - show helpful message
          toast({
            title: "Database Setup Required",
            description: "The event_courses table doesn't exist. Please run the database schema script.",
            variant: "destructive",
          });
        }
      } else {
        setCourses(coursesData || []);
      }

      // Check if event_customization table exists
      const customizationTableExists = await checkTableExists('event_customization');
      if (!customizationTableExists) {
        console.error('event_customization table does not exist');
        toast({
          title: "Database Setup Required",
          description: "The event_customization table doesn't exist. Please run the database schema scripts in Supabase SQL Editor.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Load courses enabled setting from event_customization
      const { data: customizationData, error: customizationError } = await supabase
        .from('event_customization')
        .select('courses_enabled')
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
        setCoursesEnabled(customizationData.courses_enabled ?? true);
      }

    } catch (error) {
      console.error('Error loading courses customization data:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error
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

  const saveCourseField = async (courseId: string, field: string, value: string | number) => {
    if (!eventId) return;

    try {
      const updateData = { [field]: value };
      const { error } = await supabase
        .from('event_courses')
        .update(updateData)
        .eq('id', courseId)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error saving course field:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save course information",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving course field:', error);
    }
  };

  const saveCoursesEnabled = async (enabled: boolean) => {
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
          .update({ courses_enabled: enabled })
          .eq('event_id', eventId);

        if (error) {
          console.error('Error saving courses enabled:', error);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('event_customization')
          .insert({ 
            event_id: eventId,
            courses_enabled: enabled
          });

        if (error) {
          console.error('Error creating customization record:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });
        }
      }
    } catch (error) {
      console.error('Error saving courses enabled:', error);
    }
  };

  const syncCoursesFromRounds = async () => {
    if (!eventId) return;

    setSyncing(true);
    try {
      // Get rounds for this event
      const { data: roundsData, error: roundsError } = await supabase
        .from('event_rounds')
        .select('course_name')
        .eq('event_id', eventId)
        .order('created_at');

      if (roundsError) {
        console.error('Error loading rounds:', {
          message: roundsError.message,
          details: roundsError.details,
          hint: roundsError.hint,
          code: roundsError.code
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
      const uniqueCourses = roundsData.reduce((acc, round, index) => {
        const courseName = round.course_name?.trim();
        if (courseName && !acc.some(course => course.name === courseName)) {
          acc.push({
            name: courseName,
            display_order: index + 1
          });
        }
        return acc;
      }, [] as { name: string; display_order: number }[]);

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
        .from('event_courses')
        .delete()
        .eq('event_id', eventId);

      if (deleteError) {
        console.error('Error deleting existing courses:', {
          message: deleteError.message,
          details: deleteError.details,
          hint: deleteError.hint,
          code: deleteError.code
        });
        toast({
          title: "Sync Failed",
          description: "Failed to clear existing course data",
          variant: "destructive",
        });
        return;
      }

      // Insert unique courses into event_courses table
      const coursesData = uniqueCourses.map(course => ({
        event_id: eventId,
        name: course.name,
        display_order: course.display_order
      }));

      console.log('Attempting to insert courses data:', coursesData);

      const { data: insertData, error: insertError } = await supabase
        .from('event_courses')
        .insert(coursesData)
        .select();

      if (insertError) {
        console.error('Error inserting courses:', {
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint,
          code: insertError.code
        });

        let description = "Failed to create course entries";
        if (insertError.code === '42P01') {
          description = "The event_courses table doesn't exist. Please run the database schema script.";
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
        description: `Successfully synced ${uniqueCourses.length} unique course${uniqueCourses.length !== 1 ? 's' : ''} from your rounds`,
      });

      // Reload the courses data
      loadCoursesData();

    } catch (error) {
      console.error('Error syncing courses:', error);
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
      // Save courses enabled setting
      await saveCoursesEnabled(coursesEnabled);

      toast({
        title: "Settings Saved",
        description: "Course customization settings have been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save course settings",
        variant: "destructive",
      });
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
                <MapPin className="h-5 w-5 mr-2 text-emerald-600" />
                Course Details
              </CardTitle>
              <CardDescription className="text-green-600">
                Customize the information displayed for each course in your event
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="courses-toggle" className="text-sm text-green-700">
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
            <Card className="border-dashed border-green-200 bg-green-50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MapPin className="h-12 w-12 text-green-400 mb-4" />
                <h3 className="text-lg font-medium text-green-900 mb-2">No courses found</h3>
                <p className="text-green-600 text-center mb-4">
                  Courses will appear here once you add them to your event in the Courses section.
                </p>
                <Button
                  onClick={syncCoursesFromRounds}
                  disabled={syncing || !coursesEnabled}
                  variant="outline"
                  className="border-green-200 text-green-700 hover:bg-green-100"
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
                <Card key={course.id} className="border-green-100 bg-green-50">
                  <CardHeader>
                    <CardTitle className="text-base text-green-900">{course.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">Course Image URL</Label>
                        <Input
                          value={course.image_url || ''}
                          onChange={(e) => {
                            setCourses(courses.map(c => 
                              c.id === course.id 
                                ? { ...c, image_url: e.target.value }
                                : c
                            ));
                          }}

                          placeholder="https://example.com/course-image.jpg"
                          className="border-green-200 focus:border-emerald-500 bg-white"
                          disabled={!coursesEnabled}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium">Yardage</Label>
                          <Input
                            type="number"
                            value={course.yardage || ''}
                            onChange={(e) => {
                              setCourses(courses.map(c => 
                                c.id === course.id 
                                  ? { ...c, yardage: parseInt(e.target.value) || undefined }
                                  : c
                              ));
                            }}
                            onBlur={(e) => saveCourseField(course.id, 'yardage', parseInt(e.target.value) || 0)}
                            placeholder="6800"
                            className="border-green-200 focus:border-emerald-500 bg-white"
                            disabled={!coursesEnabled}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium">Par</Label>
                          <Input
                            type="number"
                            value={course.par || ''}
                            onChange={(e) => {
                              setCourses(courses.map(c => 
                                c.id === course.id 
                                  ? { ...c, par: parseInt(e.target.value) || undefined }
                                  : c
                              ));
                            }}
                            onBlur={(e) => saveCourseField(course.id, 'par', parseInt(e.target.value) || 0)}
                            placeholder="72"
                            className="border-green-200 focus:border-emerald-500 bg-white"
                            disabled={!coursesEnabled}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800 font-medium">Course Description</Label>
                      <Textarea
                        value={course.description || ''}
                        onChange={(e) => {
                          setCourses(courses.map(c => 
                            c.id === course.id 
                              ? { ...c, description: e.target.value }
                              : c
                          ));
                        }}
                        onBlur={(e) => saveCourseField(course.id, 'description', e.target.value)}
                        placeholder="Describe the course layout, features, and difficulty..."
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        rows={3}
                        disabled={!coursesEnabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800 font-medium">Weather Note</Label>
                      <Input
                        value={course.weather_note || ''}
                        onChange={(e) => {
                          setCourses(courses.map(c => 
                            c.id === course.id 
                              ? { ...c, weather_note: e.target.value }
                              : c
                          ));
                        }}
                        onBlur={(e) => saveCourseField(course.id, 'weather_note', e.target.value)}
                        placeholder="Weather conditions, seasonal notes, etc."
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        disabled={!coursesEnabled}
                      />
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
    </div>
  );
}
