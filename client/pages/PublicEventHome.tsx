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

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, elementRef };
};

// Animated components to avoid hooks in loops
const AnimatedStatCard = ({ item, index }: { item: any; index: number }) => {
  const { isVisible, elementRef } = useScrollAnimation();
  const colorClasses = {
    emerald: { bg: 'from-emerald-100 to-emerald-200', text: 'text-emerald-600' },
    blue: { bg: 'from-blue-100 to-blue-200', text: 'text-blue-600' },
    purple: { bg: 'from-purple-100 to-purple-200', text: 'text-purple-600' },
    orange: { bg: 'from-orange-100 to-orange-200', text: 'text-orange-600' }
  };
  const colors = colorClasses[item.color as keyof typeof colorClasses];
  const delays = ['delay-0', 'delay-100', 'delay-200', 'delay-300'];

  return (
    <div
      ref={elementRef}
      className={`group cursor-pointer transition-all duration-700 ${delays[index] || 'delay-0'} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-200/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-2 transition-all duration-300 group-hover:bg-white">
        <div className={`w-20 h-20 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
          <item.icon className={`h-10 w-10 ${colors.text}`} />
        </div>
        <h3 className="font-bold text-slate-900 mb-3 text-lg">{item.title}</h3>
        <p className="text-slate-600 font-medium">{item.value}</p>
      </div>
    </div>
  );
};

const AnimatedCourseCard = ({ course, round, index }: { course: any; round: any; index: number }) => {
  const { isVisible, elementRef } = useScrollAnimation();

  return (
    <div
      ref={elementRef}
      className={`group transition-all duration-700 ${
        index === 0 ? 'delay-0' : index === 1 ? 'delay-150' : index === 2 ? 'delay-300' : 'delay-450'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden border border-slate-200/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-3 transition-all duration-500">
        {course.image_url && (
          <div className="h-56 overflow-hidden">
            <img
              src={course.image_url}
              alt={course.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Round {index + 1}
                </Badge>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-green-700 transition-colors">
                {course.name}
              </h3>
            </div>
          </div>

          {course.par && course.yardage && (
            <div className="flex items-center space-x-6 mb-6 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-slate-700">Par {course.par}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-slate-700">{course.yardage?.toLocaleString()} yards</span>
              </div>
            </div>
          )}

          {(round?.tee_time || round?.round_date) && (
            <div className="space-y-3 pt-4 border-t border-slate-200">
              {round?.round_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">
                    {new Date(round.round_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {round?.tee_time && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-600">
                    Tee Time: {round.tee_time}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnimatedPlayerCard = ({ player, index }: { player: any; index: number }) => {
  const { isVisible, elementRef } = useScrollAnimation();

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      ref={elementRef}
      className={`group text-center transition-all duration-500 ${
        index < 8 ? `delay-${index * 50}` : 'delay-300'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-2 transition-all duration-300 group-hover:bg-white">
        <Avatar className="h-16 w-16 mx-auto mb-4 ring-4 ring-white/50 group-hover:ring-green-200 transition-all duration-300">
          {player.profile_image && <AvatarImage src={player.profile_image} alt={player.full_name} />}
          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-lg font-bold">
            {getPlayerInitials(player.full_name)}
          </AvatarFallback>
        </Avatar>

        <h3 className="font-bold text-slate-900 text-sm mb-2 group-hover:text-green-700 transition-colors">
          {player.full_name}
        </h3>

        {player.handicap !== null && player.handicap !== undefined && (
          <div className="inline-flex items-center space-x-1 bg-slate-100 rounded-full px-3 py-1">
            <span className="text-xs font-semibold text-slate-600">HCP: {player.handicap}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const AnimatedPrizeCard = ({ prize, index }: { prize: any; index: number }) => {
  const { isVisible, elementRef } = useScrollAnimation();

  return (
    <div
      ref={elementRef}
      className={`group transition-all duration-700 ${
        index === 0 ? 'delay-0' : index === 1 ? 'delay-100' : index === 2 ? 'delay-200' : 'delay-300'
      } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-200/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-3 transition-all duration-300 group-hover:bg-white">
        <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
          <Trophy className="h-10 w-10 text-amber-600" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-4 capitalize group-hover:text-amber-700 transition-colors">
          {prize.category.replace('_', ' ')}
        </h3>

        {prize.amount > 0 && (
          <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4">
            ${prize.amount}
          </div>
        )}

        <p className="text-slate-600 font-medium">{prize.description}</p>
      </div>
    </div>
  );
};

const AnimatedTravelCard = ({ item, index }: { item: any; index: number }) => {
  const { isVisible, elementRef } = useScrollAnimation();
  const colorClasses = {
    blue: { bg: 'from-blue-100 to-blue-200', text: 'text-blue-600' },
    emerald: { bg: 'from-emerald-100 to-emerald-200', text: 'text-emerald-600' },
    purple: { bg: 'from-purple-100 to-purple-200', text: 'text-purple-600' }
  };
  const colors = colorClasses[item.color as keyof typeof colorClasses];
  const delays = ['delay-0', 'delay-150', 'delay-300'];

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ${delays[index] || 'delay-0'} ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
      }`}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-slate-200/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-2 transition-all duration-300 h-full">
        <div className={`w-16 h-16 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center mb-8`}>
          <item.icon className={`h-8 w-8 ${colors.text}`} />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 mb-6">{item.title}</h3>

        <div className="prose prose-slate max-w-none">
          <p className="text-slate-600 whitespace-pre-line leading-relaxed font-medium">
            {item.info}
          </p>
        </div>
      </div>
    </div>
  );
};

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/30"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/20 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

        <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-24 sm:py-32 lg:py-40">
          <div className="text-center space-y-10 max-w-4xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-full px-6 py-3 shadow-lg shadow-green-100/50">
              <Calendar className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {formatDateRange(eventData.start_date, eventData.end_date)}
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-slate-900 tracking-tight">
              {eventData.name}
            </h1>

            {eventData.description && (
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light">
                {eventData.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-16">
              <a
                href="#courses"
                className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 inline-flex items-center justify-center text-lg shadow-xl shadow-green-600/25 hover:shadow-2xl hover:shadow-green-600/40 hover:-translate-y-1"
              >
                View Courses
                <ChevronRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#players"
                className="group bg-white/80 backdrop-blur-sm border-2 border-green-200 text-green-700 px-10 py-5 rounded-2xl font-semibold hover:bg-green-50 hover:border-green-300 transition-all duration-300 inline-flex items-center justify-center text-lg shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Meet Players
                <Users className="h-5 w-5 ml-2 group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Summary Cards Section */}
      <section className="py-24 px-6 sm:px-8 lg:px-12 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white"></div>
        <div className="relative max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: MapPin, title: "Location", value: eventData.location, color: "emerald" },
              { icon: Users, title: "Players", value: `${players.length} Registered`, color: "blue" },
              { icon: Target, title: "Format", value: getScoringFormat(), color: "purple" },
              { icon: Calendar, title: "Duration", value: getDuration(eventData.start_date, eventData.end_date), color: "orange" }
            ].map((item, index) => (
              <AnimatedStatCard key={item.title} item={item} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Courses Overview Section */}
      {courses.length > 0 && (
        <section id="courses" className="py-28 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20"></div>
          <div className="absolute top-20 right-0 w-72 h-72 bg-green-100/10 rounded-full blur-3xl"></div>

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-green-100/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Sparkles className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Championship Venues</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
                {courses.length > 1 ? 'Golf Courses' : 'Golf Course'}
              </h2>

              {customization?.home_headline && (
                <p className="text-xl sm:text-2xl text-slate-600 max-w-4xl mx-auto font-light leading-relaxed">
                  {customization.home_headline}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-10">
              {courses.map((course, index) => {
                const round = rounds.find(r => r.course_name === course.name);
                return (
                  <AnimatedCourseCard
                    key={course.id}
                    course={course}
                    round={round}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Scoring Format Section */}
      {rounds.length > 0 && (
        <section className="py-28 px-6 sm:px-8 lg:px-12 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30"></div>
          <div className="relative max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-blue-100/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Competition Rules</span>
            </div>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-16 tracking-tight">
              Tournament Format
            </h2>

            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 sm:p-16 shadow-2xl shadow-slate-200/50 border border-slate-200/50">
              <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Target className="h-10 w-10 text-green-600" />
              </div>

              <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-8">{getScoringFormat()}</h3>
              <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto font-light">
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
        <section id="players" className="py-28 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-white to-emerald-50/10"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-100/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-purple-100/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Competitors</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
                Players
              </h2>
              <p className="text-xl text-slate-600 font-light">
                Tournament starts {formatDateRange(eventData.start_date, eventData.end_date).split(',')[0]} • {players.length} players registered
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-8">
              {players.map((player, index) => (
                <AnimatedPlayerCard key={player.id} player={player} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Prizes Section */}
      {prizes.length > 0 && (
        <section className="py-28 px-6 sm:px-8 lg:px-12 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-white to-slate-50/50"></div>
          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-amber-100/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Trophy className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-800">Prize Pool</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
                High Stakes, Higher Handicaps
              </h2>

              {eventData.buy_in && eventData.buy_in > 0 && (
                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200/50 max-w-md mx-auto">
                  <p className="text-lg text-slate-600 mb-2">Tournament Buy-in</p>
                  <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    ${eventData.buy_in}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {prizes.map((prize, index) => (
                <AnimatedPrizeCard key={prize.id} prize={prize} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Travel & Accommodation Section */}
      {travel && (travel.flight_info || travel.accommodations || travel.daily_schedule) && (
        <section className="py-28 px-6 sm:px-8 lg:px-12 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white to-slate-50/30"></div>
          <div className="absolute top-0 left-0 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>

          <div className="relative max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-blue-100/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <Plane className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Logistics</span>
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
                Travel & Accommodation
              </h2>
              <p className="text-xl text-slate-600 font-light max-w-3xl mx-auto">
                Everything you need to have a smooth and comfortable trip
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {[
                { info: travel.flight_info, icon: Plane, title: "Getting There", color: "blue" },
                { info: travel.accommodations, icon: Building, title: "Accommodation", color: "emerald" },
                { info: travel.daily_schedule, icon: Clock, title: "Daily Schedule", color: "purple" }
              ].filter(item => item.info).map((item, index) => (
                <AnimatedTravelCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="relative py-20 px-6 sm:px-8 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.1),_transparent_70%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.1),_transparent_70%)]"></div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20">
            <Target className="h-12 w-12 text-white" />
          </div>

          <h3 className="text-3xl sm:text-4xl font-bold mb-6 text-white">
            {eventData.name}
          </h3>

          <p className="text-xl text-green-200 mb-12 font-light">
            {eventData.location} • {formatDateRange(eventData.start_date, eventData.end_date)}
          </p>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
            <p className="text-green-200 text-lg font-medium">
              Powered by TrackTrack Golf
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
