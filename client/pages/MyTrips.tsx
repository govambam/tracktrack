import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Plus, Trophy, Edit, RefreshCw, ExternalLink, Globe } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { useToast } from "@/hooks/use-toast";

interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
  is_private: boolean;
  is_published: boolean;
  slug?: string;
  created_at: string;
  updated_at: string;
}

export default function MyTrips() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const { loadEvent, loadCompleteEvent, resetTrip } = useTripCreation();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    if (isLoadingEvents) {
      console.log('Already loading events, skipping...');
      return;
    }

    try {
      setLoading(true);
      setIsLoadingEvents(true);
      
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('Session error:', sessionError);
        toast({
          title: "Authentication Error",
          description: "Please sign in again",
          variant: "destructive",
        });
        return;
      }

      if (!session) {
        console.log('No session found');
        setEvents([]);
        return;
      }

      console.log('Session found, loading events directly from Supabase');
      console.log('User ID:', session.user.id);

      // Test if events table exists by doing a simple count first
      console.log('Testing events table access...');
      const { count, error: countError } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.error('Events table access test failed:', {
          message: countError.message,
          details: countError.details,
          hint: countError.hint,
          code: countError.code
        });
        toast({
          title: "Database Error",
          description: `Table access failed: ${countError.message}`,
          variant: "destructive",
        });
        return;
      }

      console.log('Events table accessible, total count:', count);

      // Use direct Supabase calls instead of server routes
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading events:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        console.error('Full error object:', JSON.stringify(error, null, 2));
        toast({
          title: "Error",
          description: error.message || error.details || "Failed to load events",
          variant: "destructive",
        });
        return;
      }

      console.log('Successfully loaded events, count:', data?.length || 0);
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsLoadingEvents(false);
    }
  };

  const handleEditEvent = async (event: Event) => {
    // Navigate to the new event editing route
    navigate(`/app/${event.id}/basic`);
  };

  const handleCreateNew = () => {
    // Reset the trip creation context for a new event
    resetTrip();
    navigate('/app/create');
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const end = new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const getStatusFromDates = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (now > end) return 'completed';
    if (now >= start && now <= end) return 'active';
    return 'upcoming';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "active":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-green-900">My Events</h1>
            <p className="text-green-600 mt-1">Loading your golf events...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-900">My Events</h1>
          <p className="text-green-600 mt-1">Manage and track your golf trips and tournaments</p>
        </div>
        <div className="flex space-x-2 mt-4 sm:mt-0">
          <Button 
            variant="outline" 
            onClick={loadEvents}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleCreateNew} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Create New Event
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{events.length}</div>
            <p className="text-xs text-green-600">Created events</p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Upcoming Events</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {events.filter(event => getStatusFromDates(event.start_date, event.end_date) === 'upcoming').length}
            </div>
            <p className="text-xs text-green-600">Events planned</p>
          </CardContent>
        </Card>

        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">This Month</CardTitle>
            <Trophy className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {events.filter(event => {
                const start = new Date(event.start_date);
                const now = new Date();
                return start.getMonth() === now.getMonth() && start.getFullYear() === now.getFullYear();
              }).length}
            </div>
            <p className="text-xs text-green-600">Events this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {events.map((event) => {
          const status = getStatusFromDates(event.start_date, event.end_date);
          
          return (
            <Card key={event.id} className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">🏌��‍♂️</div>
                    <div>
                      <CardTitle className="text-xl text-green-900">{event.name}</CardTitle>
                      <CardDescription className="text-green-600">
                        {event.description || 'Golf event'}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(status)}>
                    {status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center text-green-700">
                    <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                    {formatDateRange(event.start_date, event.end_date)}
                  </div>
                  <div className="flex items-center text-green-700">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    {event.location}
                  </div>
                  <div className="flex items-center text-green-700">
                    <Trophy className="h-4 w-4 mr-2 text-emerald-600" />
                    {event.is_private ? 'Private' : 'Public'}
                    {event.is_published && (
                      <Globe className="h-3 w-3 ml-1 text-blue-600" title="Published" />
                    )}
                  </div>
                  <div className="flex items-center text-green-700 text-xs">
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  {event.is_published && event.slug ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`/events/${event.slug}`, '_blank')}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Site
                    </Button>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEvent(event)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Empty State */}
      {events.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-xl font-medium text-green-900 mb-2">No events yet</h3>
          <p className="text-green-600 mb-6">Create your first golf event to get started</p>
          <Button onClick={handleCreateNew} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Event
          </Button>
        </div>
      )}
    </div>
  );
}
