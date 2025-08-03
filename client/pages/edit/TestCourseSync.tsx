import { useState } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function TestCourseSync() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const checkEventData = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      // Check event_rounds
      const { data: roundsData, error: roundsError } = await supabase
        .from('event_rounds')
        .select('*')
        .eq('event_id', eventId);

      // Check event_courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('event_courses')
        .select('*')
        .eq('event_id', eventId);

      console.log('=== EVENT DATA DEBUG ===');
      console.log('Event ID:', eventId);
      console.log('Rounds data:', roundsData);
      console.log('Rounds error:', roundsError);
      console.log('Courses data:', coursesData);
      console.log('Courses error:', coursesError);

      setData({
        rounds: { data: roundsData, error: roundsError },
        courses: { data: coursesData, error: coursesError }
      });

      toast({
        title: "Debug Complete",
        description: "Check browser console for detailed info",
      });

    } catch (error) {
      console.error('Debug error:', error);
      toast({
        title: "Debug Failed",
        description: "Error checking event data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const manualSync = async () => {
    if (!eventId) return;

    setLoading(true);
    try {
      // Get rounds
      const { data: roundsData, error: roundsError } = await supabase
        .from('event_rounds')
        .select('*')
        .eq('event_id', eventId);

      if (roundsError) {
        throw new Error(`Failed to load rounds: ${roundsError.message}`);
      }

      console.log('=== MANUAL SYNC ===');
      console.log('Rounds for sync:', roundsData);

      if (!roundsData || roundsData.length === 0) {
        toast({
          title: "No Rounds",
          description: "No rounds found to sync courses from",
          variant: "destructive",
        });
        return;
      }

      // Transform to Round format and sync
      const rounds = roundsData.map(r => ({
        id: r.id,
        courseName: r.course_name,
        courseUrl: r.course_url || '',
        date: r.round_date,
        time: r.tee_time || '',
        holes: r.holes || 18,
        skillsContests: []
      }));

      // Get existing courses to avoid duplicates
      const { data: existingCourses, error: existingError } = await supabase
        .from('event_courses')
        .select('name')
        .eq('event_id', eventId);

      if (existingError) {
        throw new Error(`Failed to check existing courses: ${existingError.message}`);
      }

      const existingCourseNames = existingCourses?.map(c => c.name.toLowerCase()) || [];
      console.log('Existing courses:', existingCourseNames);

      // Get unique course names that don't already exist
      const uniqueCourses = rounds.reduce((acc, round, index) => {
        const courseName = round.courseName?.trim();
        if (courseName) {
          const courseNameLower = courseName.toLowerCase();
          if (!existingCourseNames.includes(courseNameLower) &&
              !acc.some(course => course.name.toLowerCase() === courseNameLower)) {
            acc.push({
              name: courseName,
              display_order: existingCourseNames.length + acc.length + 1
            });
          }
        }
        return acc;
      }, [] as { name: string; display_order: number }[]);

      console.log('New courses to insert:', uniqueCourses);

      if (uniqueCourses.length > 0) {
        const { data: insertData, error: insertError } = await supabase
          .from('event_courses')
          .insert(uniqueCourses.map(course => ({
            event_id: eventId,
            name: course.name,
            display_order: course.display_order
          })))
          .select();

        if (insertError) {
          console.error('Insert error:', insertError);
          throw new Error(`Failed to insert courses: ${insertError.message}`);
        }

        console.log('Successfully inserted:', insertData);

        toast({
          title: "Sync Success",
          description: `Synced ${uniqueCourses.length} courses`,
        });
      } else {
        toast({
          title: "No Courses",
          description: "No valid course names found in rounds",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('Manual sync error:', error);
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Course Sync Debug</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Event ID: {eventId}</p>
          
          <div className="flex gap-4">
            <Button onClick={checkEventData} disabled={loading}>
              {loading ? "Checking..." : "Check Event Data"}
            </Button>
            <Button onClick={manualSync} disabled={loading} variant="outline">
              {loading ? "Syncing..." : "Manual Sync"}
            </Button>
          </div>

          {data && (
            <div className="space-y-4 mt-4">
              <div>
                <h3 className="font-semibold">Rounds ({data.rounds.data?.length || 0}):</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(data.rounds.data, null, 2)}
                </pre>
                {data.rounds.error && (
                  <p className="text-red-600 text-sm">Error: {data.rounds.error.message}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold">Courses ({data.courses.data?.length || 0}):</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(data.courses.data, null, 2)}
                </pre>
                {data.courses.error && (
                  <p className="text-red-600 text-sm">Error: {data.courses.error.message}</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
