import { useState, useEffect, useRef } from "react";
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
  Star,
  Award,
  ChevronRight,
  Loader2,
  Sparkles
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
  buy_in?: number;
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
          <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900 mb-2">Event Not Found</h1>
          <p className="text-green-600">This event may not be published or the link is incorrect.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-white text-green-900 overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge className="bg-green-600 text-white text-sm font-medium px-4 py-2 rounded-full">
              {formatDateRange(eventData.start_date, eventData.end_date)}
            </Badge>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight text-green-900">
              {eventData.name}
            </h1>

            {eventData.description && (
              <p className="text-lg sm:text-xl text-green-700 max-w-3xl mx-auto leading-relaxed font-light">
                {eventData.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <a
                href="#courses"
                className="bg-green-600 text-white px-8 py-4 rounded-lg font-medium hover:bg-green-700 transition-colors inline-flex items-center justify-center text-lg"
              >
                View Courses
              </a>
              <a
                href="#players"
                className="border-2 border-green-600 text-green-600 px-8 py-4 rounded-lg font-medium hover:bg-green-50 transition-colors inline-flex items-center justify-center text-lg"
              >
                Meet Players
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Location</h3>
              <p className="text-gray-600">{eventData.location}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Players</h3>
              <p className="text-gray-600">{players.length} Registered</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Format</h3>
              <p className="text-gray-600">{getScoringFormat()}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-green-900 mb-2">Duration</h3>
              <p className="text-gray-600">{getDuration(eventData.start_date, eventData.end_date)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Overview Section */}
      {courses.length > 0 && (
        <section id="courses" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-900 mb-6">
                {courses.length > 1 ? 'Golf Courses' : 'Golf Course'}
              </h2>
              {customization?.home_headline && (
                <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed">
                  {customization.home_headline}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((course, index) => {
                const round = rounds.find(r => r.course_name === course.name);
                return (
                  <div key={course.id} className="group">
                    {course.image_url && (
                      <div className="h-64 overflow-hidden rounded-lg mb-6">
                        <img
                          src={course.image_url}
                          alt={course.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold text-green-900 mb-2">{course.name}</h3>
                        {course.par && course.yardage && (
                          <p className="text-gray-600">
                            Par {course.par} • {course.yardage.toLocaleString()} yards
                          </p>
                        )}
                      </div>

                      {(round?.tee_time || round?.round_date) && (
                        <div className="space-y-1 text-sm text-gray-500">
                          {round?.round_date && (
                            <p>{new Date(round.round_date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              month: 'long',
                              day: 'numeric'
                            })}</p>
                          )}
                          {round?.tee_time && (
                            <p>Tee Time: {round.tee_time}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Scoring Format Section */}
      {rounds.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-900 mb-16">Tournament Format</h2>

            <div className="bg-white rounded-xl p-8 sm:p-12 shadow-sm">
              <h3 className="text-2xl sm:text-3xl font-bold text-green-900 mb-6">{getScoringFormat()}</h3>
              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
                {getScoringFormat().includes('Stableford')
                  ? "Modified Stableford scoring system with preset competition and a team scramble format for added excitement."
                  : "Traditional stroke play format where every shot counts. Lowest total score wins the championship."
                }
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Players Section */}
      {players.length > 0 && (
        <section id="players" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-900 mb-6">Players</h2>
              <p className="text-lg text-gray-600">Tournament starts at {formatDateRange(eventData.start_date, eventData.end_date).split(',')[0]}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {players.map((player) => (
                <div key={player.id} className="text-center">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    {player.profile_image && <AvatarImage src={player.profile_image} alt={player.full_name} />}
                    <AvatarFallback className="bg-green-600 text-white text-xl">
                      {getPlayerInitials(player.full_name)}
                    </AvatarFallback>
                  </Avatar>

                  <h3 className="font-semibold text-green-900 text-sm">{player.full_name}</h3>

                  {player.handicap !== null && player.handicap !== undefined && (
                    <p className="text-xs text-gray-500 mt-1">HCP: {player.handicap}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-900 mb-6">High Stakes, Higher Handicaps</h2>
              <p className="text-lg text-gray-600">Tournament Buy-in</p>
              <div className="text-4xl sm:text-5xl font-bold text-green-600 mt-4">
                ${eventData.buy_in || 0}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {prizes.map((prize) => (
                <div key={prize.id} className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-green-600" />
                  </div>

                  <h3 className="text-lg font-bold text-green-900 mb-2 capitalize">
                    {prize.category.replace('_', ' ')}
                  </h3>

                  {prize.amount > 0 && (
                    <div className="text-2xl font-bold text-green-600 mb-2">
                      ${prize.amount}
                    </div>
                  )}

                  <p className="text-gray-600 text-sm">{prize.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Travel & Accommodation Section */}
      {travel && (travel.flight_info || travel.accommodations || travel.daily_schedule) && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-green-900 mb-6">Travel & Accommodation</h2>
              <p className="text-lg text-gray-600">Everything you need to have a smooth and comfortable trip</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {travel.flight_info && (
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <Plane className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-4">Getting There</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{travel.flight_info}</p>
                  </div>
                </div>
              )}

              {travel.accommodations && (
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <Building className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-4">Accommodation</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{travel.accommodations}</p>
                  </div>
                </div>
              )}

              {travel.daily_schedule && (
                <div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-6">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-green-900 mb-4">Daily Schedule</h3>
                  <div className="prose prose-gray max-w-none">
                    <p className="text-gray-600 whitespace-pre-line leading-relaxed">{travel.daily_schedule}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-green-600 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold mb-4">{eventData.name}</h3>
          <p className="text-green-100 text-lg mb-8">
            {eventData.location} • {formatDateRange(eventData.start_date, eventData.end_date)}
          </p>
          <div className="border-t border-green-500 pt-8 mt-8">
            <p className="text-green-200">Powered by TrackTrack Golf</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
