import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Users, Plus, Trophy, Edit, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { useToast } from "@/hooks/use-toast";
import { safeFetch } from "@/lib/safeFetch";

interface Event {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export default function MyTrips() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const { loadEvent, resetTrip } = useTripCreation();
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

      // Use direct Supabase calls instead of server routes
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error loading events:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to load events",
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

  const handleEditEvent = (event: Event) => {
    // Convert event data to TripData format
    const tripData = {
      id: event.id,
      tripName: event.name,
      startDate: event.start_date,
      endDate: event.end_date,
      location: event.location,
      description: event.description || '',
      bannerImage: event.logo_url || '',
      rounds: [],
      scoringFormat: 'stroke-play' as const,
      players: [],
      customization: {
        isPrivate: event.is_private,
        logoUrl: event.logo_url
      }
    };

    // Load the event data into the context
    loadEvent(tripData);
    
    // Navigate to the basic info page for editing
    navigate('/app/create/basic-info');
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
                  </div>
                  <div className="flex items-center text-green-700 text-xs">
                    Created: {new Date(event.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                    View Details
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEditEvent(event)}
                    className="border-green-200 text-green-700 hover:bg-green-50"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit Event
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
