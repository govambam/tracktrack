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
import { MapPin, RefreshCw } from "lucide-react";

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

      // Load courses from event_courses table
      const { data: coursesData, error: coursesError } = await supabase
        .from('event_courses')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order', { ascending: true });

      if (coursesError) {
        console.error('Error loading courses:', coursesError);
      } else {
        setCourses(coursesData || []);
      }

      // Load courses enabled setting from event_customization
      const { data: customizationData, error: customizationError } = await supabase
        .from('event_customization')
        .select('courses_enabled')
        .eq('event_id', eventId)
        .single();

      if (customizationError && customizationError.code !== 'PGRST116') {
        console.error('Error loading customization data:', customizationError);
      } else if (customizationData) {
        setCoursesEnabled(customizationData.courses_enabled ?? true);
      }

    } catch (error) {
      console.error('Error loading courses customization data:', error);
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
        console.error('Error checking customization:', fetchError);
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
          console.error('Error creating customization record:', error);
        }
      }
    } catch (error) {
      console.error('Error saving courses enabled:', error);
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
                <p className="text-green-600 text-center">
                  Courses will appear here once you add them to your event in the Courses section.
                </p>
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
                          onBlur={(e) => saveCourseField(course.id, 'image_url', e.target.value)}
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
        </CardContent>
      </Card>
    </div>
  );
}
