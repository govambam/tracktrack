import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { 
  Palette, 
  Home, 
  MapPin, 
  Target, 
  Trophy, 
  Plane, 
  Plus, 
  Trash2, 
  Save,
  Upload,
  Eye,
  EyeOff,
  Info
} from "lucide-react";

interface CourseCustomization {
  id: string;
  course_name: string;
  course_image_url?: string;
  course_description?: string;
  yardage?: string;
  par?: number;
}

interface EventRule {
  id: string;
  rule_text: string;
}

interface TravelInfo {
  travel_lodging?: string;
  travel_notes?: string;
  travel_airport?: string;
  travel_distance?: string;
}

interface PageVisibility {
  home_enabled: boolean;
  courses_enabled: boolean;
  rules_enabled: boolean;
  leaderboard_enabled: boolean;
  travel_enabled: boolean;
}

export default function CustomizationsEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  // State for different customization sections
  const [homepageHeadline, setHomepageHeadline] = useState('');
  const [courses, setCourses] = useState<CourseCustomization[]>([]);
  const [rules, setRules] = useState<EventRule[]>([]);
  const [travelInfo, setTravelInfo] = useState<TravelInfo>({});
  const [pageVisibility, setPageVisibility] = useState<PageVisibility>({
    home_enabled: true,
    courses_enabled: true,
    rules_enabled: true,
    leaderboard_enabled: true,
    travel_enabled: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadCustomizationData();
    }
  }, [eventId]);

  const loadCustomizationData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load homepage headline from events table
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .select('homepage_headline, travel_lodging, travel_notes, travel_airport, travel_distance')
        .eq('id', eventId)
        .single();

      if (eventError) {
        console.error('Error loading event data:', eventError);
      } else {
        setHomepageHeadline(eventData.homepage_headline || '');
        setTravelInfo({
          travel_lodging: eventData.travel_lodging || '',
          travel_notes: eventData.travel_notes || '',
          travel_airport: eventData.travel_airport || '',
          travel_distance: eventData.travel_distance || '',
        });
      }

      // Load courses from event_rounds table (assuming this is the courses table)
      const { data: coursesData, error: coursesError } = await supabase
        .from('event_rounds')
        .select('id, course_name, course_image_url, course_description, yardage, par')
        .eq('event_id', eventId);

      if (coursesError) {
        console.error('Error loading courses:', coursesError);
      } else {
        setCourses(coursesData || []);
      }

      // Load rules from event_rules table
      const { data: rulesData, error: rulesError } = await supabase
        .from('event_rules')
        .select('id, rule_text')
        .eq('event_id', eventId);

      if (rulesError) {
        console.error('Error loading rules:', rulesError);
      } else {
        setRules(rulesData || []);
      }

      // Load page visibility settings (could be from event_customization table)
      const { data: customizationData, error: customizationError } = await supabase
        .from('event_customization')
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (customizationError && customizationError.code !== 'PGRST116') {
        console.error('Error loading customization:', customizationError);
      } else if (customizationData) {
        setPageVisibility({
          home_enabled: customizationData.home_enabled ?? true,
          courses_enabled: customizationData.courses_enabled ?? true,
          rules_enabled: customizationData.rules_enabled ?? true,
          leaderboard_enabled: customizationData.leaderboard_enabled ?? true,
          travel_enabled: customizationData.travel_enabled ?? true,
        });
      }

    } catch (error) {
      console.error('Error loading customization data:', error);
      toast({
        title: "Load Failed",
        description: "Failed to load customization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveHomepageHeadline = async (headline: string) => {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from('events')
        .update({ homepage_headline: headline })
        .eq('id', eventId);

      if (error) {
        console.error('Error saving homepage headline:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save homepage headline",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving homepage headline:', error);
    }
  };

  const saveCourseCustomization = async (courseId: string, field: string, value: string | number) => {
    if (!eventId) return;

    try {
      const updateData = { [field]: value };
      const { error } = await supabase
        .from('event_rounds')
        .update(updateData)
        .eq('id', courseId)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error saving course customization:', error);
        toast({
          title: "Save Failed",
          description: "Failed to save course customization",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving course customization:', error);
    }
  };

  const addRule = async () => {
    if (!eventId) return;

    try {
      const { data, error } = await supabase
        .from('event_rules')
        .insert({ 
          event_id: eventId, 
          rule_text: 'New rule' 
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding rule:', error);
        toast({
          title: "Add Failed",
          description: "Failed to add new rule",
          variant: "destructive",
        });
      } else {
        setRules([...rules, data]);
      }
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const updateRule = async (ruleId: string, ruleText: string) => {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from('event_rules')
        .update({ rule_text: ruleText })
        .eq('id', ruleId)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error updating rule:', error);
        toast({
          title: "Update Failed",
          description: "Failed to update rule",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error updating rule:', error);
    }
  };

  const deleteRule = async (ruleId: string) => {
    if (!eventId) return;

    try {
      const { error } = await supabase
        .from('event_rules')
        .delete()
        .eq('id', ruleId)
        .eq('event_id', eventId);

      if (error) {
        console.error('Error deleting rule:', error);
        toast({
          title: "Delete Failed",
          description: "Failed to delete rule",
          variant: "destructive",
        });
      } else {
        setRules(rules.filter(rule => rule.id !== ruleId));
      }
    } catch (error) {
      console.error('Error deleting rule:', error);
    }
  };

  const saveTravelInfo = async (field: string, value: string) => {
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

  const savePageVisibility = async (page: keyof PageVisibility, enabled: boolean) => {
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

      const updateData = { [page]: enabled };

      if (existing) {
        // Update existing record
        const { error } = await supabase
          .from('event_customization')
          .update(updateData)
          .eq('event_id', eventId);

        if (error) {
          console.error('Error updating page visibility:', error);
        }
      } else {
        // Create new record
        const { error } = await supabase
          .from('event_customization')
          .insert({ 
            event_id: eventId,
            ...pageVisibility,
            [page]: enabled
          });

        if (error) {
          console.error('Error creating customization record:', error);
        }
      }
    } catch (error) {
      console.error('Error saving page visibility:', error);
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
          <CardTitle className="text-lg text-green-900 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-emerald-600" />
            Event Website Customization
          </CardTitle>
          <CardDescription className="text-green-600">
            Customize the content and appearance of your public event website
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="home" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="home" className="flex items-center space-x-1">
                <Home className="h-4 w-4" />
                <span>Home</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>Courses</span>
              </TabsTrigger>
              <TabsTrigger value="rules" className="flex items-center space-x-1">
                <Target className="h-4 w-4" />
                <span>Rules</span>
              </TabsTrigger>
              <TabsTrigger value="leaderboard" className="flex items-center space-x-1">
                <Trophy className="h-4 w-4" />
                <span>Leaderboard</span>
              </TabsTrigger>
              <TabsTrigger value="travel" className="flex items-center space-x-1">
                <Plane className="h-4 w-4" />
                <span>Travel</span>
              </TabsTrigger>
            </TabsList>

            {/* Home Tab */}
            <TabsContent value="home" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-green-900">Homepage Content</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="home-toggle" className="text-sm text-green-700">
                    Enable Home Page
                  </Label>
                  <Switch
                    id="home-toggle"
                    checked={pageVisibility.home_enabled}
                    onCheckedChange={(checked) => {
                      setPageVisibility(prev => ({ ...prev, home_enabled: checked }));
                      savePageVisibility('home_enabled', checked);
                    }}
                  />
                </div>
              </div>

              <Card className="border-green-100 bg-green-50">
                <CardContent className="p-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="homepage-headline" className="text-green-800 font-medium">
                      Homepage Headline
                    </Label>
                    <Input
                      id="homepage-headline"
                      value={homepageHeadline}
                      onChange={(e) => setHomepageHeadline(e.target.value)}
                      onBlur={() => saveHomepageHeadline(homepageHeadline)}
                      placeholder="Add a short headline to display on your event home page"
                      className="border-green-200 focus:border-emerald-500 bg-white"
                      disabled={!pageVisibility.home_enabled}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-green-900">Course Details</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="courses-toggle" className="text-sm text-green-700">
                    Enable Courses Page
                  </Label>
                  <Switch
                    id="courses-toggle"
                    checked={pageVisibility.courses_enabled}
                    onCheckedChange={(checked) => {
                      setPageVisibility(prev => ({ ...prev, courses_enabled: checked }));
                      savePageVisibility('courses_enabled', checked);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-4">
                {courses.map((course) => (
                  <Card key={course.id} className="border-green-100 bg-green-50">
                    <CardHeader>
                      <CardTitle className="text-base text-green-900">{course.course_name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium">Course Image URL</Label>
                          <Input
                            value={course.course_image_url || ''}
                            onChange={(e) => {
                              setCourses(courses.map(c => 
                                c.id === course.id 
                                  ? { ...c, course_image_url: e.target.value }
                                  : c
                              ));
                            }}
                            onBlur={(e) => saveCourseCustomization(course.id, 'course_image_url', e.target.value)}
                            placeholder="https://example.com/course-image.jpg"
                            className="border-green-200 focus:border-emerald-500 bg-white"
                            disabled={!pageVisibility.courses_enabled}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-2">
                            <Label className="text-green-800 font-medium">Yardage</Label>
                            <Input
                              value={course.yardage || ''}
                              onChange={(e) => {
                                setCourses(courses.map(c => 
                                  c.id === course.id 
                                    ? { ...c, yardage: e.target.value }
                                    : c
                                ));
                              }}
                              onBlur={(e) => saveCourseCustomization(course.id, 'yardage', e.target.value)}
                              placeholder="6,800 yards"
                              className="border-green-200 focus:border-emerald-500 bg-white"
                              disabled={!pageVisibility.courses_enabled}
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
                              onBlur={(e) => saveCourseCustomization(course.id, 'par', parseInt(e.target.value) || 0)}
                              placeholder="72"
                              className="border-green-200 focus:border-emerald-500 bg-white"
                              disabled={!pageVisibility.courses_enabled}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">Course Description</Label>
                        <Textarea
                          value={course.course_description || ''}
                          onChange={(e) => {
                            setCourses(courses.map(c => 
                              c.id === course.id 
                                ? { ...c, course_description: e.target.value }
                                : c
                            ));
                          }}
                          onBlur={(e) => saveCourseCustomization(course.id, 'course_description', e.target.value)}
                          placeholder="Describe the course layout, features, and difficulty..."
                          className="border-green-200 focus:border-emerald-500 bg-white"
                          rows={3}
                          disabled={!pageVisibility.courses_enabled}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Rules Tab */}
            <TabsContent value="rules" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-green-900">Scoring & Rules</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="rules-toggle" className="text-sm text-green-700">
                    Enable Rules Page
                  </Label>
                  <Switch
                    id="rules-toggle"
                    checked={pageVisibility.rules_enabled}
                    onCheckedChange={(checked) => {
                      setPageVisibility(prev => ({ ...prev, rules_enabled: checked }));
                      savePageVisibility('rules_enabled', checked);
                    }}
                  />
                </div>
              </div>

              <Card className="border-green-100 bg-green-50">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-green-800 font-medium">Tournament Rules</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addRule}
                      className="border-green-200 text-green-700 hover:bg-green-50"
                      disabled={!pageVisibility.rules_enabled}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Rule
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {rules.map((rule, index) => (
                      <div key={rule.id} className="flex items-start space-x-2">
                        <div className="flex-1">
                          <Textarea
                            value={rule.rule_text}
                            onChange={(e) => {
                              setRules(rules.map(r => 
                                r.id === rule.id 
                                  ? { ...r, rule_text: e.target.value }
                                  : r
                              ));
                            }}
                            onBlur={(e) => updateRule(rule.id, e.target.value)}
                            placeholder={`Rule ${index + 1}...`}
                            className="border-green-200 focus:border-emerald-500 bg-white"
                            rows={2}
                            disabled={!pageVisibility.rules_enabled}
                          />
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteRule(rule.id)}
                          className="border-red-200 text-red-600 hover:bg-red-50"
                          disabled={!pageVisibility.rules_enabled}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {rules.length === 0 && (
                    <div className="text-center py-8 text-green-600">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No rules added yet. Click "Add Rule" to get started.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Leaderboard Tab */}
            <TabsContent value="leaderboard" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-green-900">Leaderboard</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="leaderboard-toggle" className="text-sm text-green-700">
                    Enable Leaderboard Page
                  </Label>
                  <Switch
                    id="leaderboard-toggle"
                    checked={pageVisibility.leaderboard_enabled}
                    onCheckedChange={(checked) => {
                      setPageVisibility(prev => ({ ...prev, leaderboard_enabled: checked }));
                      savePageVisibility('leaderboard_enabled', checked);
                    }}
                  />
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Info className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  <div className="font-semibold">Leaderboard functionality coming soon</div>
                  <div className="mt-1">
                    This page will automatically update when score entry is enabled. 
                    Players and spectators will be able to view real-time standings during your tournament.
                  </div>
                </AlertDescription>
              </Alert>
            </TabsContent>

            {/* Travel Tab */}
            <TabsContent value="travel" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-green-900">Travel Information</h3>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="travel-toggle" className="text-sm text-green-700">
                    Enable Travel Page
                  </Label>
                  <Switch
                    id="travel-toggle"
                    checked={pageVisibility.travel_enabled}
                    onCheckedChange={(checked) => {
                      setPageVisibility(prev => ({ ...prev, travel_enabled: checked }));
                      savePageVisibility('travel_enabled', checked);
                    }}
                  />
                </div>
              </div>

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
                        onBlur={(e) => saveTravelInfo('travel_lodging', e.target.value)}
                        placeholder="Hotel recommendations, booking links, etc."
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        rows={3}
                        disabled={!pageVisibility.travel_enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800 font-medium">Airport Information</Label>
                      <Textarea
                        value={travelInfo.travel_airport || ''}
                        onChange={(e) => {
                          setTravelInfo(prev => ({ ...prev, travel_airport: e.target.value }));
                        }}
                        onBlur={(e) => saveTravelInfo('travel_airport', e.target.value)}
                        placeholder="Nearest airports, transportation options, etc."
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        rows={3}
                        disabled={!pageVisibility.travel_enabled}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-green-800 font-medium">Distance/Directions</Label>
                      <Input
                        value={travelInfo.travel_distance || ''}
                        onChange={(e) => {
                          setTravelInfo(prev => ({ ...prev, travel_distance: e.target.value }));
                        }}
                        onBlur={(e) => saveTravelInfo('travel_distance', e.target.value)}
                        placeholder="Distance from major cities, driving directions"
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        disabled={!pageVisibility.travel_enabled}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-green-800 font-medium">Additional Notes</Label>
                      <Input
                        value={travelInfo.travel_notes || ''}
                        onChange={(e) => {
                          setTravelInfo(prev => ({ ...prev, travel_notes: e.target.value }));
                        }}
                        onBlur={(e) => saveTravelInfo('travel_notes', e.target.value)}
                        placeholder="Weather, local attractions, dining, etc."
                        className="border-green-200 focus:border-emerald-500 bg-white"
                        disabled={!pageVisibility.travel_enabled}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Summary */}
          <Alert className="border-emerald-200 bg-emerald-50 mt-6">
            <Palette className="h-4 w-4 text-emerald-600" />
            <AlertDescription className="text-emerald-700">
              <div className="font-semibold">Website Configuration Summary</div>
              <div className="mt-1 grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                <div className="flex items-center space-x-1">
                  {pageVisibility.home_enabled ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Home</span>
                </div>
                <div className="flex items-center space-x-1">
                  {pageVisibility.courses_enabled ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Courses</span>
                </div>
                <div className="flex items-center space-x-1">
                  {pageVisibility.rules_enabled ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Rules</span>
                </div>
                <div className="flex items-center space-x-1">
                  {pageVisibility.leaderboard_enabled ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Leaderboard</span>
                </div>
                <div className="flex items-center space-x-1">
                  {pageVisibility.travel_enabled ? (
                    <Eye className="h-3 w-3 text-green-600" />
                  ) : (
                    <EyeOff className="h-3 w-3 text-gray-400" />
                  )}
                  <span>Travel</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
