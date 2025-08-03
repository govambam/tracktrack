import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Home, 
  MapPin, 
  Target, 
  Trophy, 
  Plane, 
  Calendar, 
  Clock, 
  Users,
  Globe,
  Loader2
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location?: string;
  is_published: boolean;
  is_private: boolean;
  scoring_format: string;
  travel_lodging?: string;
  travel_notes?: string;
  travel_airport?: string;
  travel_distance?: string;
}

interface EventCourse {
  id: string;
  name: string;
  par?: number;
  yardage?: number;
  description?: string;
  image_url?: string;
  weather_note?: string;
  display_order?: number;
}

interface EventCustomization {
  home_headline?: string;
  courses_enabled?: boolean;
  rules_enabled?: boolean;
  leaderboard_enabled?: boolean;
  travel_enabled?: boolean;
}

interface EventRule {
  id: string;
  rule_text: string;
}

type TabType = 'home' | 'courses' | 'rules' | 'leaderboard' | 'travel';

export default function PublicEvent() {
  const { slug } = useParams();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [courses, setCourses] = useState<EventCourse[]>([]);
  const [customization, setCustomization] = useState<EventCustomization>({});
  const [rules, setRules] = useState<EventRule[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadEventData();
    }
  }, [slug]);

  // Update page title when event data loads
  useEffect(() => {
    if (eventData) {
      document.title = `${eventData.name} | TrackTrack Golf`;

      // Add meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content',
          eventData.description || `Golf tournament: ${eventData.name}`
        );
      } else {
        const meta = document.createElement('meta');
        meta.name = 'description';
        meta.content = eventData.description || `Golf tournament: ${eventData.name}`;
        document.head.appendChild(meta);
      }
    }
  }, [eventData]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load main event data
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .single();

      if (eventError) {
        if (eventError.code === 'PGRST116') {
          setError('Event not found');
        } else {
          setError('Failed to load event');
        }
        return;
      }

      if (!event.is_published) {
        setError('This event has not been published yet.');
        return;
      }

      setEventData(event);

      // Load courses
      const { data: coursesData } = await supabase
        .from('event_courses')
        .select('*')
        .eq('event_id', event.id)
        .order('display_order', { ascending: true });

      setCourses(coursesData || []);

      // Load customization
      const { data: customizationData } = await supabase
        .from('event_customization')
        .select('*')
        .eq('event_id', event.id)
        .single();

      setCustomization(customizationData || {});

      // Load rules
      const { data: rulesData } = await supabase
        .from('event_rules')
        .select('*')
        .eq('event_id', event.id);

      setRules(rulesData || []);

    } catch (err) {
      console.error('Error loading event:', err);
      setError('Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getAvailableTabs = () => {
    const tabs: { id: TabType; label: string; icon: any }[] = [
      { id: 'home', label: 'Home', icon: Home }
    ];

    if (courses.length > 0 && customization.courses_enabled !== false) {
      tabs.push({ id: 'courses', label: 'Courses', icon: MapPin });
    }

    if (customization.rules_enabled !== false) {
      tabs.push({ id: 'rules', label: 'Rules & Scoring', icon: Target });
    }

    if (customization.leaderboard_enabled !== false) {
      tabs.push({ id: 'leaderboard', label: 'Leaderboard', icon: Trophy });
    }

    // Show travel tab if any travel info exists
    const hasTravel = eventData?.travel_lodging || 
                     eventData?.travel_notes || 
                     eventData?.travel_airport || 
                     eventData?.travel_distance;
    
    if (hasTravel && customization.travel_enabled !== false) {
      tabs.push({ id: 'travel', label: 'Travel', icon: Plane });
    }

    return tabs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-green-600" />
          <p className="text-green-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="bg-white rounded-lg border border-red-200 shadow-sm p-8">
            <h1 className="text-2xl font-bold text-red-900 mb-4">
              {error === 'Event not found' ? '404 - Event Not Found' : 'Event Unavailable'}
            </h1>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={() => window.location.href = '/'} className="bg-green-600 hover:bg-green-700">
              Go to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!eventData) return null;

  const availableTabs = getAvailableTabs();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Globe className="h-6 w-6 text-green-600" />
              <div>
                <h1 className="text-lg font-semibold text-green-900">{eventData.name}</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-green-600">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDate(eventData.start_date)}
                {eventData.end_date !== eventData.start_date && (
                  <span> - {formatDate(eventData.end_date)}</span>
                )}
              </div>
              {eventData.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {eventData.location}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-green-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {availableTabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <HomeTab 
            eventData={eventData} 
            courses={courses} 
            customization={customization}
          />
        )}
        {activeTab === 'courses' && (
          <CoursesTab courses={courses} />
        )}
        {activeTab === 'rules' && (
          <RulesTab eventData={eventData} rules={rules} />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardTab />
        )}
        {activeTab === 'travel' && (
          <TravelTab eventData={eventData} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-green-100 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Powered by TrackTrack Golf</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Home Tab Component
function HomeTab({ 
  eventData, 
  courses, 
  customization 
}: { 
  eventData: EventData; 
  courses: EventCourse[]; 
  customization: EventCustomization;
}) {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-900 mb-4">{eventData.name}</h1>
        {customization.home_headline && (
          <p className="text-xl text-green-600 mb-6">{customization.home_headline}</p>
        )}
        {eventData.description && (
          <p className="text-gray-600 max-w-3xl mx-auto">{eventData.description}</p>
        )}
      </div>

      {/* Event Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-green-600" />
            Event Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Date</h3>
              <p className="text-gray-600">
                {new Date(eventData.start_date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
                {eventData.end_date !== eventData.start_date && (
                  <span> - {new Date(eventData.end_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}</span>
                )}
              </p>
            </div>
            {eventData.location && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Location</h3>
                <p className="text-gray-600">{eventData.location}</p>
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Format</h3>
              <Badge variant="outline" className="capitalize">
                {eventData.scoring_format.replace('-', ' ')}
              </Badge>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Event Type</h3>
              <Badge variant={eventData.is_private ? "secondary" : "default"}>
                {eventData.is_private ? "Private" : "Public"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Course Preview */}
      {courses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-green-600" />
              Courses
            </CardTitle>
            <CardDescription>
              Golf courses for this event
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  {course.image_url && (
                    <img 
                      src={course.image_url} 
                      alt={course.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  )}
                  <h3 className="font-medium text-gray-900 mb-1">{course.name}</h3>
                  {course.description && (
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">{course.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {course.par && <span>Par {course.par}</span>}
                    {course.yardage && <span>{course.yardage} yards</span>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Courses Tab Component
function CoursesTab({ courses }: { courses: EventCourse[] }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Courses</h1>
        <p className="text-gray-600">Detailed information about each golf course</p>
      </div>

      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          <CardContent className="p-0">
            <div className="md:flex">
              {course.image_url && (
                <div className="md:w-1/3">
                  <img 
                    src={course.image_url} 
                    alt={course.name}
                    className="w-full h-64 md:h-full object-cover"
                  />
                </div>
              )}
              <div className={`p-6 ${course.image_url ? 'md:w-2/3' : 'w-full'}`}>
                <h2 className="text-2xl font-bold text-green-900 mb-4">{course.name}</h2>
                
                {/* Course Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {course.par && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">{course.par}</div>
                      <div className="text-sm text-green-600">Par</div>
                    </div>
                  )}
                  {course.yardage && (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-900">{course.yardage.toLocaleString()}</div>
                      <div className="text-sm text-green-600">Yards</div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {course.description && (
                  <div className="mb-4">
                    <h3 className="font-medium text-gray-900 mb-2">About This Course</h3>
                    <p className="text-gray-600">{course.description}</p>
                  </div>
                )}

                {/* Weather Note */}
                {course.weather_note && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-1">Weather Note</h3>
                    <p className="text-blue-700">{course.weather_note}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Rules Tab Component
function RulesTab({ eventData, rules }: { eventData: EventData; rules: EventRule[] }) {
  const getScoringDescription = (format: string) => {
    switch (format) {
      case 'stroke-play':
        return 'Traditional stroke play - lowest total score wins.';
      case 'match-play':
        return 'Match play format - compete hole by hole against opponents.';
      case 'modified-stableford':
        return 'Modified Stableford scoring - points awarded based on score relative to par.';
      case 'scramble':
        return 'Team scramble format - all players hit, team plays best shot.';
      default:
        return 'Custom scoring format for this event.';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Rules & Scoring</h1>
        <p className="text-gray-600">Tournament format and competition rules</p>
      </div>

      {/* Scoring Format */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Scoring Format
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Badge variant="outline" className="text-lg py-1 px-3 capitalize">
              {eventData.scoring_format.replace('-', ' ')}
            </Badge>
          </div>
          <p className="text-gray-600">{getScoringDescription(eventData.scoring_format)}</p>
        </CardContent>
      </Card>

      {/* Custom Rules */}
      {rules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Event Rules</CardTitle>
            <CardDescription>
              Additional rules and guidelines for this tournament
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {rules.map((rule) => (
                <li key={rule.id} className="flex items-start">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <p className="text-gray-700">{rule.rule_text}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* General Golf Rules */}
      <Card>
        <CardHeader>
          <CardTitle>General Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-600">
            <li>• Please repair ball marks and replace divots</li>
            <li>• Maintain pace of play - ready golf encouraged</li>
            <li>• Cell phones should be on silent during play</li>
            <li>• Proper golf attire required</li>
            <li>• Have fun and play with integrity!</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

// Leaderboard Tab Component
function LeaderboardTab() {
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'leaderboard' | 'moneyboard' | 'scorecards'>('leaderboard');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Leaderboard</h1>
        <p className="text-gray-600">Tournament standings and results</p>
      </div>

      {/* Sub-tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'leaderboard', label: 'Leaderboard' },
            { id: 'moneyboard', label: 'Moneyboard' },
            { id: 'scorecards', label: 'Scorecards' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveLeaderboardTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeLeaderboardTab === tab.id
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Coming Soon Content */}
      <Card>
        <CardContent className="py-16 text-center">
          <Trophy className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            {activeLeaderboardTab === 'leaderboard' && 'Leaderboard Coming Soon'}
            {activeLeaderboardTab === 'moneyboard' && 'Moneyboard Coming Soon'}
            {activeLeaderboardTab === 'scorecards' && 'Scorecards Coming Soon'}
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            {activeLeaderboardTab === 'leaderboard' && 'Tournament standings will be displayed here once play begins.'}
            {activeLeaderboardTab === 'moneyboard' && 'Prize money distribution will be shown here after the tournament.'}
            {activeLeaderboardTab === 'scorecards' && 'Individual player scorecards will be available here during the event.'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Travel Tab Component
function TravelTab({ eventData }: { eventData: EventData }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-green-900 mb-2">Travel Information</h1>
        <p className="text-gray-600">Everything you need to know about getting there and staying comfortable</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Lodging */}
        {eventData.travel_lodging && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plane className="h-5 w-5 mr-2 text-green-600" />
                Lodging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{eventData.travel_lodging}</p>
            </CardContent>
          </Card>
        )}

        {/* Airport Information */}
        {eventData.travel_airport && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plane className="h-5 w-5 mr-2 text-green-600" />
                Airport Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{eventData.travel_airport}</p>
            </CardContent>
          </Card>
        )}

        {/* Transportation */}
        {eventData.travel_distance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-green-600" />
                Transportation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{eventData.travel_distance}</p>
            </CardContent>
          </Card>
        )}

        {/* Additional Notes */}
        {eventData.travel_notes && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Additional Travel Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-line">{eventData.travel_notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
