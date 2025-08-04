import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  MapPin,
  Users,
  Target,
  Calendar,
  Trophy,
  Plane,
  Building,
  Clock,
  Golf,
  Star,
  Award,
  ChevronRight,
  Loader2
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
  is_published: boolean;
  is_private: boolean;
}

interface EventPlayer {
  id: string;
  full_name: string;
  email?: string;
  handicap?: number;
  profile_image?: string;
}

interface EventCourse {
  id: string;
  name: string;
  par?: number;
  yardage?: number;
  image_url?: string;
  display_order?: number;
}

interface EventRound {
  id: string;
  course_name: string;
  round_date: string;
  tee_time?: string;
  scoring_type: string;
  holes: number;
}

interface EventPrize {
  id: string;
  category: string;
  amount: number;
  description: string;
}

interface TravelData {
  flight_info?: string;
  accommodations?: string;
  daily_schedule?: string;
}

interface EventCustomization {
  home_headline?: string;
}

export default function PublicEventHome() {
  // Add smooth scrolling to page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [players, setPlayers] = useState<EventPlayer[]>([]);
  const [courses, setCourses] = useState<EventCourse[]>([]);
  const [rounds, setRounds] = useState<EventRound[]>([]);
  const [prizes, setPrizes] = useState<EventPrize[]>([]);
  const [travel, setTravel] = useState<TravelData | null>(null);
  const [customization, setCustomization] = useState<EventCustomization | null>(null);

  useEffect(() => {
    if (slug) {
      loadEventData();
    }
  }, [slug]);

  const loadEventData = async () => {
    try {
      setLoading(true);

      // Load main event data
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (eventError || !event) {
        console.error('Event not found:', eventError);
        return;
      }

      setEventData(event);

      // Load all related data in parallel
      const [playersResult, coursesResult, roundsResult, prizesResult, travelResult, customizationResult] = await Promise.all([
        supabase.from('event_players').select('*').eq('event_id', event.id),
        supabase.from('event_courses').select('*').eq('event_id', event.id).order('display_order'),
        supabase.from('event_rounds').select('*').eq('event_id', event.id).order('round_date'),
        supabase.from('event_prizes').select('*').eq('event_id', event.id),
        supabase.from('event_travel').select('*').eq('event_id', event.id).maybeSingle(),
        supabase.from('event_customization').select('*').eq('event_id', event.id).maybeSingle()
      ]);

      // Handle results with error checking
      if (!playersResult.error) setPlayers(playersResult.data || []);
      if (!coursesResult.error) setCourses(coursesResult.data || []);
      if (!roundsResult.error) setRounds(roundsResult.data || []);
      if (!prizesResult.error) setPrizes(prizesResult.data || []);
      if (!travelResult.error) setTravel(travelResult.data || null);
      if (!customizationResult.error) setCustomization(customizationResult.data || null);

      // Log any errors for debugging
      if (playersResult.error) console.log('Players error:', playersResult.error);
      if (coursesResult.error) console.log('Courses error:', coursesResult.error);
      if (roundsResult.error) console.log('Rounds error:', roundsResult.error);
      if (prizesResult.error) console.log('Prizes error:', prizesResult.error);
      if (travelResult.error) console.log('Travel error:', travelResult.error);
      if (customizationResult.error) console.log('Customization error:', customizationResult.error);

    } catch (error) {
      console.error('Error loading event data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const startMonth = start.toLocaleDateString('en-US', { month: 'long' });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString('en-US', { month: 'long' });
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
    }
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 Day";
    return `${diffDays} Days`;
  };

  const getScoringFormat = () => {
    const formats = [...new Set(rounds.map(r => r.scoring_type))];
    return formats.map(format => {
      switch (format) {
        case 'stroke_play': return 'Stroke Play';
        case 'stableford': return 'Stableford';
        default: return format;
      }
    }).join(', ') || 'Stroke Play';
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-green-700">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <Golf className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900 mb-2">Event Not Found</h1>
          <p className="text-green-600">This event may not be published or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-emerald-600 to-green-700 text-white overflow-hidden">
        {eventData.logo_url && (
          <div className="absolute inset-0 opacity-20">
            <img 
              src={eventData.logo_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="relative max-w-6xl mx-auto px-6 py-16 sm:py-24">
          <div className="text-center space-y-6">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 text-sm font-medium px-4 py-2">
              <Calendar className="h-4 w-4 mr-2" />
              {formatDateRange(eventData.start_date, eventData.end_date)}
            </Badge>
            
            <h1 className="text-4xl sm:text-6xl font-bold leading-tight">
              {eventData.name}
            </h1>
            
            {eventData.description && (
              <p className="text-xl sm:text-2xl text-green-100 max-w-4xl mx-auto leading-relaxed">
                {eventData.description}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a 
                href="#courses" 
                className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center justify-center"
              >
                View Courses <ChevronRight className="h-4 w-4 ml-2" />
              </a>
              <a 
                href="#players" 
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center justify-center"
              >
                Meet Players <Users className="h-4 w-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-green-100">
              <CardContent className="p-6 text-center">
                <MapPin className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-900 mb-2">Location</h3>
                <p className="text-green-600">{eventData.location}</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100">
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-900 mb-2">Players</h3>
                <p className="text-green-600">{players.length} Registered</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100">
              <CardContent className="p-6 text-center">
                <Target className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-900 mb-2">Format</h3>
                <p className="text-green-600">{getScoringFormat()}</p>
              </CardContent>
            </Card>
            
            <Card className="border-green-100">
              <CardContent className="p-6 text-center">
                <Calendar className="h-10 w-10 text-emerald-600 mx-auto mb-4" />
                <h3 className="font-semibold text-green-900 mb-2">Duration</h3>
                <p className="text-green-600">{getDuration(eventData.start_date, eventData.end_date)}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Courses Overview Section */}
      {courses.length > 0 && (
        <section id="courses" className="py-16 px-6 bg-green-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-4">The Courses</h2>
              {customization?.home_headline && (
                <p className="text-xl text-green-600 max-w-3xl mx-auto">{customization.home_headline}</p>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {courses.map((course, index) => {
                const round = rounds.find(r => r.course_name === course.name);
                return (
                  <Card key={course.id} className="border-green-200 overflow-hidden">
                    {course.image_url && (
                      <div className="h-48 overflow-hidden">
                        <img 
                          src={course.image_url} 
                          alt={course.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <Badge variant="outline" className="text-emerald-600 border-emerald-200 mb-2">
                            Round {index + 1}
                          </Badge>
                          <h3 className="text-xl font-bold text-green-900">{course.name}</h3>
                        </div>
                        <Golf className="h-6 w-6 text-emerald-600" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {course.par && (
                          <div>
                            <span className="text-green-600">Par:</span>
                            <span className="font-semibold text-green-900 ml-2">{course.par}</span>
                          </div>
                        )}
                        {course.yardage && (
                          <div>
                            <span className="text-green-600">Yardage:</span>
                            <span className="font-semibold text-green-900 ml-2">{course.yardage}</span>
                          </div>
                        )}
                        {round?.tee_time && (
                          <div>
                            <span className="text-green-600">Tee Time:</span>
                            <span className="font-semibold text-green-900 ml-2">{round.tee_time}</span>
                          </div>
                        )}
                        {round?.round_date && (
                          <div>
                            <span className="text-green-600">Date:</span>
                            <span className="font-semibold text-green-900 ml-2">
                              {new Date(round.round_date).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Scoring Format Section */}
      {rounds.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-6">Scoring Format</h2>
            <Card className="border-green-200">
              <CardContent className="p-8">
                <Target className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-900 mb-4">{getScoringFormat()}</h3>
                <p className="text-green-600 leading-relaxed">
                  {getScoringFormat().includes('Stableford') 
                    ? "Points-based scoring system where players earn points based on performance relative to par. Higher scores win!"
                    : "Traditional stroke play format where every shot counts. Lowest total score wins!"
                  }
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Players Section */}
      {players.length > 0 && (
        <section id="players" className="py-16 px-6 bg-green-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-4">Meet the Players</h2>
              <p className="text-xl text-green-600">The competitors taking on the course</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {players.map((player) => (
                <Card key={player.id} className="border-green-200">
                  <CardContent className="p-6 text-center">
                    <Avatar className="h-16 w-16 mx-auto mb-4">
                      {player.profile_image && <AvatarImage src={player.profile_image} alt={player.full_name} />}
                      <AvatarFallback className="bg-emerald-600 text-white text-lg">
                        {getPlayerInitials(player.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <h3 className="font-semibold text-green-900 mb-2">{player.full_name}</h3>
                    
                    {player.handicap !== null && player.handicap !== undefined && (
                      <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                        HCP: {player.handicap}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-4">High Stakes, Higher Handicaps</h2>
              <p className="text-xl text-green-600">What's up for grabs</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {prizes.map((prize) => (
                <Card key={prize.id} className="border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <Trophy className="h-8 w-8 text-emerald-600" />
                      {prize.amount > 0 && (
                        <Badge className="bg-emerald-600 text-white">
                          ${prize.amount}
                        </Badge>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-bold text-green-900 mb-2 capitalize">
                      {prize.category.replace('_', ' ')}
                    </h3>
                    
                    <p className="text-green-600">{prize.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Travel & Accommodation Section */}
      {travel && (travel.flight_info || travel.accommodations || travel.daily_schedule) && (
        <section className="py-16 px-6 bg-green-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-green-900 mb-4">Travel & Accommodation</h2>
              <p className="text-xl text-green-600">Everything you need to know</p>
            </div>
            
            <div className="space-y-6">
              {travel.flight_info && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-900">
                      <Plane className="h-5 w-5 mr-2 text-emerald-600" />
                      Getting There
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 whitespace-pre-line">{travel.flight_info}</p>
                  </CardContent>
                </Card>
              )}
              
              {travel.accommodations && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-900">
                      <Building className="h-5 w-5 mr-2 text-emerald-600" />
                      Accommodation
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 whitespace-pre-line">{travel.accommodations}</p>
                  </CardContent>
                </Card>
              )}
              
              {travel.daily_schedule && (
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-900">
                      <Clock className="h-5 w-5 mr-2 text-emerald-600" />
                      Daily Schedule
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-green-700 whitespace-pre-line">{travel.daily_schedule}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-green-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-2">{eventData.name}</h3>
          <p className="text-green-200 mb-4">
            {eventData.location} • {formatDateRange(eventData.start_date, eventData.end_date)}
          </p>
          <div className="border-t border-green-700 pt-6 mt-6">
            <p className="text-green-300 text-sm">Powered by TrackTrack Golf</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
