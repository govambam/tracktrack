import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Edit,
  Calendar,
  Clock,
  MapPin,
  Users,
  Target,
  Trophy,
  Plane,
  Building,
  Star,
  Award,
  ChevronRight,
  Loader2,
  Camera,
  MoreHorizontal,
  X,
  Crosshair,
  Zap,
  Info,
  Crown,
  Medal,
  CheckCircle,
  Flag,
} from "lucide-react";

interface DraftModeProps {
  localChanges: any;
  updateLocalChanges: (path: string, value: any) => void;
}

export default function DraftModePublicEventHome({ localChanges, updateLocalChanges }: DraftModeProps) {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [prizes, setPrizes] = useState<any[]>([]);
  const [travel, setTravel] = useState<any>(null);
  const [skillsContests, setSkillsContests] = useState<any[]>([]);
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [editDescriptionModal, setEditDescriptionModal] = useState(false);
  const [editCourseModal, setEditCourseModal] = useState<any>(null);
  const [editPlayerModal, setEditPlayerModal] = useState<any>(null);
  const [editTravelModal, setEditTravelModal] = useState<{ type: string; title: string } | null>(null);
  
  // Temporary form states
  const [tempDescription, setTempDescription] = useState("");
  const [tempCourseData, setTempCourseData] = useState<any>({});
  const [tempPlayerData, setTempPlayerData] = useState<any>({});
  const [tempTravelData, setTempTravelData] = useState("");

  useEffect(() => {
    console.log("DraftModePublicEventHome mounted with eventId:", eventId);
    if (eventId) {
      loadEventData();
    } else {
      setError("No event ID provided");
      setLoading(false);
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Loading event data for eventId:", eventId);

      // Check authentication
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      console.log("Current session:", session?.user?.email || "No session");

      if (authError) {
        console.error("Auth error:", authError);
      }

      // Load main event data
      console.log("Loading main event data...");
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      console.log("Event query result:", { event, eventError });

      if (eventError) {
        console.error("Event loading error:", eventError.message, eventError);
        throw new Error(`Failed to load event: ${eventError.message}`);
      }
      
      if (!event) {
        throw new Error("Event not found");
      }
      
      console.log("Event loaded:", event);
      setEventData(event);

      // Load all data in parallel like PublicEventHome does
      const [
        playersResult,
        roundsResult,
        coursesResult,
        prizesResult,
        travelResult,
        skillsContestsResult,
        customRulesResult
      ] = await Promise.all([
        supabase
          .from("event_players")
          .select("*")
          .eq("event_id", eventId)
          .order("created_at"),
        supabase
          .from("event_rounds")
          .select("*")
          .eq("event_id", eventId)
          .order("round_date"),
        supabase
          .from("event_courses")
          .select("*")
          .eq("event_id", eventId),
        supabase.from("event_prizes").select("*").eq("event_id", eventId),
        supabase
          .from("event_travel")
          .select("*")
          .eq("event_id", eventId)
          .maybeSingle(),
        supabase
          .from("skills_contests")
          .select("*")
          .eq("event_id", eventId),
        supabase
          .from("event_rules")
          .select("*")
          .eq("event_id", eventId)
          .order("display_order")
      ]);

      // Handle results with detailed error logging
      console.log("Players result:", playersResult);
      console.log("Rounds result:", roundsResult);
      console.log("Courses result:", coursesResult);
      console.log("Prizes result:", prizesResult);
      console.log("Skills contests result:", skillsContestsResult);
      console.log("Custom rules result:", customRulesResult);

      // Handle errors but continue if possible (some tables might not exist for new events)
      if (playersResult.error) {
        console.error("Players error:", playersResult.error);
        console.warn("Continuing without players data");
      }
      if (roundsResult.error) {
        console.error("Rounds error:", roundsResult.error);
        console.warn("Continuing without rounds data");
      }
      if (coursesResult.error) {
        console.error("Courses error:", coursesResult.error);
        console.warn("Continuing without courses data");
      }
      if (prizesResult.error) {
        console.error("Prizes error:", prizesResult.error);
        console.warn("Continuing without prizes data");
      }
      if (skillsContestsResult.error) {
        console.error("Skills contests error:", skillsContestsResult.error);
        console.warn("Continuing without skills contests data");
      }
      if (customRulesResult.error) {
        console.error("Custom rules error:", customRulesResult.error);
        console.warn("Continuing without custom rules data");
      }

      setPlayers(playersResult.data || []);
      setRounds(roundsResult.data || []);
      setCourses(coursesResult.data || []);
      setPrizes(prizesResult.data || []);
      setTravel(travelResult.data);
      setSkillsContests(skillsContestsResult.data || []);
      setCustomRules(customRulesResult.data || []);

      console.log("All event data loaded successfully");

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error loading event data:", errorMessage);
      console.error("Full error object:", error);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getValue = (path: string, defaultValue: any = "") => {
    const keys = path.split('.');
    let current = localChanges;
    
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return defaultValue;
      }
    }
    
    return current !== undefined ? current : defaultValue;
  };

  const getEventDescription = () => {
    return getValue('eventDescription', eventData?.description || "");
  };

  const getCourseValue = (courseId: string, field: string, defaultValue: any = "") => {
    return getValue(`courses.${courseId}.${field}`, defaultValue);
  };

  const getPlayerValue = (playerId: string, field: string, defaultValue: any = "") => {
    return getValue(`players.${playerId}.${field}`, defaultValue);
  };

  const getTravelValue = (field: string, defaultValue: any = "") => {
    return getValue(`travel.${field}`, defaultValue);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const options: Intl.DateTimeFormatOptions = { 
      month: 'long', 
      day: 'numeric'
    };
    
    if (start.getFullYear() !== new Date().getFullYear()) {
      options.year = 'numeric';
    }
    
    if (start.toDateString() === end.toDateString()) {
      return start.toLocaleDateString('en-US', options);
    }
    
    if (start.getMonth() === end.getMonth()) {
      return `${start.getDate()}-${end.toLocaleDateString('en-US', options)}`;
    }
    
    return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`;
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Modal handlers
  const handleEditDescription = () => {
    setTempDescription(getEventDescription());
    setEditDescriptionModal(true);
  };

  const handleSaveDescription = () => {
    updateLocalChanges('eventDescription', tempDescription);
    setEditDescriptionModal(false);
  };

  const handleEditCourse = (round: any, roundIndex?: number) => {
    const course = courses.find(c => c.round_id === round.id);
    const calculatedRoundNumber = roundIndex !== undefined ? roundIndex + 1 : rounds.findIndex(r => r.id === round.id) + 1;
    setTempCourseData({
      id: round.id,
      roundNumber: calculatedRoundNumber,
      course_name: getCourseValue(round.id, 'course_name', round.course_name),
      tee_time: getCourseValue(round.id, 'tee_time', round.tee_time),
      round_date: getCourseValue(round.id, 'round_date', round.round_date),
      description: getCourseValue(round.id, 'description', course?.description || ""),
    });
    setEditCourseModal(round);
  };

  const handleSaveCourse = () => {
    const courseId = tempCourseData.id;
    updateLocalChanges(`courses.${courseId}.course_name`, tempCourseData.course_name);
    updateLocalChanges(`courses.${courseId}.tee_time`, tempCourseData.tee_time);
    updateLocalChanges(`courses.${courseId}.round_date`, tempCourseData.round_date);
    updateLocalChanges(`courses.${courseId}.description`, tempCourseData.description);
    setEditCourseModal(null);
  };

  const handleEditPlayer = (player: any) => {
    setTempPlayerData({
      id: player.id,
      full_name: getPlayerValue(player.id, 'full_name', player.full_name),
      handicap: getPlayerValue(player.id, 'handicap', player.handicap),
      bio: getPlayerValue(player.id, 'bio', player.bio || ""),
    });
    setEditPlayerModal(player);
  };

  const handleSavePlayer = () => {
    const playerId = tempPlayerData.id;
    updateLocalChanges(`players.${playerId}.full_name`, tempPlayerData.full_name);
    updateLocalChanges(`players.${playerId}.handicap`, tempPlayerData.handicap);
    updateLocalChanges(`players.${playerId}.bio`, tempPlayerData.bio);
    setEditPlayerModal(null);
  };

  const handleEditTravel = (type: string, title: string) => {
    setTempTravelData(getTravelValue(type, travel?.[type] || ""));
    setEditTravelModal({ type, title });
  };

  const handleSaveTravel = () => {
    if (editTravelModal) {
      updateLocalChanges(`travel.${editTravelModal.type}`, tempTravelData);
      setEditTravelModal(null);
    }
  };

  // Get contest data organized by round (from PublicEventHome)
  const getContestsByRound = () => {
    return rounds.map((round, index) => {
      const roundContests = skillsContests.filter((contest) => contest.round_id === round.id);
      const contests = roundContests.map((contest) => ({
        hole: contest.hole,
        type: contest.contest_type,
        emoji: contest.contest_type === "closest_to_pin" ? "🎯" : "🏌️‍♂️",
      }));

      return {
        roundNumber: index + 1,
        courseName: round.course_name,
        contests: contests.sort((a, b) => a.hole - b.hole),
      };
    }).filter((round) => round.contests.length > 0);
  };

  // Helper functions for contests by type (needed for Contest Rules section)
  const getContestsByType = (type: string) => {
    return skillsContests
      .filter((contest) => contest.contest_type === type)
      .reduce(
        (acc, contest) => {
          const round = rounds.find((r) => r.id === contest.round_id);
          if (round) {
            const existing = acc.find(
              (item) => item.roundName === round.course_name,
            );
            if (existing) {
              existing.holes.push(contest.hole);
            } else {
              acc.push({
                roundName: round.course_name,
                holes: [contest.hole],
              });
            }
          }
          return acc;
        },
        [] as { roundName: string; holes: number[] }[],
      );
  };

  const getScoringFormat = () => {
    const formats = [...new Set(rounds.map((r) => r.scoring_type))];
    return (
      formats
        .map((format) => {
          switch (format) {
            case "stroke_play":
              return "Stroke Play";
            case "stableford":
              return "Stableford";
            default:
              return format;
          }
        })
        .join(", ") || "Stroke Play"
    );
  };

  // Enhanced Stableford points system (from PublicEventHome)
  const enhancedStablefordPoints = [
    {
      score: "Albatross",
      points: 20,
      description: "3 under par",
      detail: "Legendary! The rarest score in golf deserves the highest reward.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-900",
      iconColor: "text-purple-600",
      icon: Crown,
    },
    {
      score: "Eagle",
      points: 8,
      description: "2 under par",
      detail: "Outstanding performance that separates the field.",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-900",
      iconColor: "text-yellow-600",
      icon: Medal,
    },
    {
      score: "Birdie",
      points: 3,
      description: "1 under par",
      detail: "Solid golf rewarded with bonus points.",
      color: "from-green-500 to-emerald-500",
      bgColor: "bg-green-50",
      textColor: "text-green-900",
      iconColor: "text-green-600",
      icon: CheckCircle,
    },
    {
      score: "Par",
      points: 2,
      description: "On target",
      detail: "Right where you want to be for consistent scoring.",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-900",
      iconColor: "text-blue-600",
      icon: Target,
    },
    {
      score: "Bogey",
      points: 1,
      description: "1 over par",
      detail: "Still in the game with room for recovery.",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      textColor: "text-orange-900",
      iconColor: "text-orange-600",
      icon: Flag,
    },
    {
      score: "Double+",
      points: 0,
      description: "2+ over par",
      detail: "Reset and focus on the next hole.",
      color: "from-slate-500 to-gray-500",
      bgColor: "bg-slate-50",
      textColor: "text-slate-900",
      iconColor: "text-slate-600",
      icon: X,
    },
  ];

  const closestToPinPrize = prizes.find((p) => p.category === "closest_to_pin")?.amount || 0;
  const longestDrivePrize = prizes.find((p) => p.category === "longest_drive")?.amount || 0;

  const closestToPinGroups = getContestsByType("closest_to_pin");
  const longestDriveGroups = getContestsByType("longest_drive");

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

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-600 text-xl font-semibold mb-4">Error Loading Event</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadEventData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Event not found</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
        {/* Hero Section - Matches PublicEventHome exactly */}
        <section id="overview" className="relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-32">
            <div className="relative text-center">
              <div className="inline-flex items-center space-x-2 bg-green-200 rounded-full px-4 py-2 mb-8">
                <Calendar className="h-4 w-4 text-green-800" />
                <span className="text-sm font-medium text-green-800">
                  {formatDateRange(eventData.start_date, eventData.end_date)}
                </span>
              </div>

              <div className="space-y-8">
                <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-slate-900 tracking-tight">
                  {eventData.name}
                </h1>

                {/* Editable Description */}
                <div className="relative group">
                  {getEventDescription() ? (
                    <p 
                      className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-light cursor-pointer hover:bg-blue-50 p-4 rounded-lg transition-colors"
                      onClick={handleEditDescription}
                    >
                      {getEventDescription()}
                      <Edit className="inline-block ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  ) : (
                    <button
                      onClick={handleEditDescription}
                      className="text-xl sm:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-light hover:bg-blue-50 p-4 rounded-lg transition-colors border-2 border-dashed border-slate-300 hover:border-blue-300"
                    >
                      <Edit className="inline-block mr-2 h-4 w-4" />
                      Add event description
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-8 mt-16">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
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
          </div>
        </section>

        {/* Summary Cards Section */}
        <section className="py-24 px-6 sm:px-8 lg:px-12 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white"></div>
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: MapPin,
                  title: "Location",
                  value: eventData.location,
                  color: "emerald",
                },
                {
                  icon: Users,
                  title: "Players",
                  value: `${players.length} Registered`,
                  color: "blue",
                },
                {
                  icon: Target,
                  title: "Format",
                  value: "Stroke Play",
                  color: "purple",
                },
                {
                  icon: Trophy,
                  title: "Duration",
                  value: `${rounds.length} Round${rounds.length !== 1 ? 's' : ''}`,
                  color: "orange",
                },
              ].map((item, index) => {
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
                    key={index}
                    className={`group cursor-pointer transition-all duration-700 ${delays[index] || 'delay-0'} opacity-100 translate-y-0`}
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
              })}
            </div>
          </div>
        </section>

        {/* Course Cards Section */}
        {rounds.length > 0 && (
          <section id="courses" className="py-20 px-6 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-green-200 rounded-full px-4 py-2 mb-4">
                  <Building className="h-4 w-4 text-green-800" />
                  <span className="text-sm font-medium text-green-700">Golf Courses</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Featured Courses</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">Experience these exceptional golf courses during your tournament</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {rounds.map((round, index) => {
                  const course = courses.find(c => c.round_id === round.id);
                  const displayName = getCourseValue(round.id, 'course_name', round.course_name);
                  const displayTeeTime = getCourseValue(round.id, 'tee_time', round.tee_time);
                  const displayDate = getCourseValue(round.id, 'round_date', round.round_date);
                  const displayDescription = getCourseValue(round.id, 'description', course?.description);
                  
                  return (
                    <div
                      key={round.id}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group"
                      onClick={() => handleEditCourse(round, index)}
                    >
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Round {index + 1}
                          </Badge>
                          <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <h3 className="text-2xl font-bold text-slate-900 mb-6 group-hover:text-green-700 transition-colors">
                          {displayName}
                        </h3>
                        
                        <div className="space-y-3 text-sm text-slate-600 mb-6">
                          {displayDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-3 text-slate-400" />
                              <span>{new Date(displayDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                            </div>
                          )}
                          {displayTeeTime && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-3 text-slate-400" />
                              <span>{displayTeeTime}</span>
                            </div>
                          )}
                        </div>
                        
                        <p className="text-slate-600 leading-relaxed">
                          {displayDescription || "Click to add course description"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Player Cards Section */}
        {players.length > 0 && (
          <section id="players" className="py-20 px-6 sm:px-8 lg:px-12 bg-white/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-blue-200 rounded-full px-4 py-2 mb-4">
                  <Users className="h-4 w-4 text-blue-800" />
                  <span className="text-sm font-medium text-blue-700">Tournament Roster</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Meet the Players</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">Get to know the golfers participating in this tournament</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player) => {
                  const displayName = getPlayerValue(player.id, 'full_name', player.full_name);
                  const displayHandicap = getPlayerValue(player.id, 'handicap', player.handicap);
                  const displayBio = getPlayerValue(player.id, 'bio', player.bio);
                  const hasBio = displayBio && displayBio.trim().length > 0;
                  const shouldShowSeeMore = hasBio && displayBio.length > 80;
                  const isShortBio = hasBio && displayBio.length <= 80;
                  
                  return (
                    <div
                      key={player.id}
                      className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-2 transition-all duration-300 group-hover:bg-white flex flex-col cursor-pointer group ${!hasBio ? 'h-64' : isShortBio ? 'h-72' : 'h-80'}`}
                      onClick={() => handleEditPlayer(player)}
                    >
                      {/* Avatar Section - Top */}
                      <div className="flex flex-col items-center pt-6 pb-4">
                        <Avatar className="h-20 w-20 ring-4 ring-white/50 group-hover:ring-green-200 transition-all duration-300">
                          {player.profile_image && <AvatarImage src={player.profile_image} alt={displayName} />}
                          <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-xl font-bold">
                            {getPlayerInitials(displayName)}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Name and Handicap Section */}
                      <div className="text-center px-6 pb-4">
                        <div className="flex items-center justify-center mb-2">
                          <h3 className="font-bold text-slate-900 text-lg group-hover:text-green-700 transition-colors">
                            {displayName}
                          </h3>
                          <Edit className="ml-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        {displayHandicap !== null && displayHandicap !== undefined && (
                          <div className="inline-flex items-center space-x-1 bg-slate-100 rounded-full px-3 py-1">
                            <span className="text-xs font-semibold text-slate-600">HCP: {displayHandicap}</span>
                          </div>
                        )}
                      </div>

                      {/* Bio Section */}
                      <div className="flex-1 px-6 pb-6 relative">
                        {hasBio && (
                          <div className="relative h-full">
                            <p
                              className="text-sm text-slate-600 leading-relaxed overflow-hidden text-center"
                              style={{
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                maxHeight: '2.75rem',
                                lineHeight: '1.375rem'
                              }}
                            >
                              "{displayBio}"
                            </p>
                            {shouldShowSeeMore && (
                              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
                            )}

                            {shouldShowSeeMore && (
                              <div className="absolute bottom-0 right-0">
                                <MoreHorizontal className="h-3 w-3 text-slate-400" />
                              </div>
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
          <section id="scoring" className="py-28 px-6 sm:px-8 lg:px-12 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30"></div>
            <div className="relative max-w-6xl mx-auto">
              <div className="text-center mb-20">
                <div className="inline-flex items-center space-x-2 bg-blue-100/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Competition Rules
                  </span>
                </div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-8 tracking-tight">
                  Scoring Format
                </h2>

                <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-200/50 max-w-2xl mx-auto mb-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Target className="h-8 w-8 text-green-600" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                    {getScoringFormat()}
                  </h3>
                  <p className="text-lg text-slate-600 leading-relaxed font-light">
                    {getScoringFormat().includes("Stableford")
                      ? "Modified Stableford scoring system with preset competition and a team scramble format for added excitement."
                      : "Traditional stroke play format where every shot counts. Lowest total score wins the championship."}
                  </p>
                </div>
              </div>

              {/* Enhanced Stableford Points System */}
              {getScoringFormat().includes("Stableford") && (
                <div className="mb-20">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                      Point Values
                    </h3>
                    <p className="text-xl text-slate-600 font-light">
                      Points awarded based on performance relative to par
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {enhancedStablefordPoints.map((scoring, index) => {
                      const IconComponent = scoring.icon;
                      return (
                        <div
                          key={scoring.score}
                          className={`${scoring.bgColor} border-2 border-opacity-20 rounded-3xl p-6 shadow-xl shadow-slate-200/50 hover:scale-105 transition-transform duration-200`}
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div
                              className={`w-12 h-12 rounded-full bg-gradient-to-r ${scoring.color} flex items-center justify-center shadow-lg`}
                            >
                              <span className="text-2xl font-bold text-white">
                                {scoring.points}
                              </span>
                            </div>
                            <IconComponent
                              className={`h-6 w-6 ${scoring.iconColor}`}
                            />
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h4
                                className={`text-lg font-bold ${scoring.textColor}`}
                              >
                                {scoring.score}
                              </h4>
                              <Badge
                                variant="outline"
                                className={`${scoring.textColor} border-current text-xs`}
                              >
                                {scoring.description}
                              </Badge>
                            </div>

                            <p
                              className={`text-sm ${scoring.textColor} opacity-80 leading-relaxed`}
                            >
                              {scoring.detail}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-emerald-600 mt-0.5" />
                      <div>
                        <div className="font-semibold text-emerald-900 mb-2">
                          Why Stableford?
                        </div>
                        <p className="text-emerald-700 text-sm leading-relaxed">
                          Stableford scoring rewards aggressive play and reduces the impact of one bad hole. It encourages golfers to take calculated risks and creates more exciting competition throughout the field.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom Rules Section */}
              {customRules.length > 0 && (
                <div className="mb-16">
                  <div className="text-center mb-12">
                    <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                      Custom Rules
                    </h3>
                    <p className="text-xl text-slate-600 font-light">
                      Special tournament regulations and guidelines
                    </p>
                  </div>

                  <div className="space-y-6">
                    {customRules.map((rule, index) => (
                      <div
                        key={rule.id}
                        className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50"
                      >
                        <h4 className="text-lg font-bold text-slate-900 mb-3">
                          {rule.title}
                        </h4>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                          {rule.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Hole Contests Section */}
        {skillsContests.length > 0 && (
          <section className="py-20 px-6 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="bg-indigo-50 rounded-3xl p-8 sm:p-12 border border-indigo-200">
                <div className="text-center mb-8">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="inline-flex items-center space-x-2 bg-indigo-200 rounded-full px-4 py-2 mb-4 cursor-help">
                        <Target className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium text-indigo-700">Skills Contests</span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Hole contest details can be edited in the Edit → Rounds page.</p>
                    </TooltipContent>
                  </Tooltip>
                  <h3 className="text-2xl sm:text-3xl font-bold text-indigo-900">Hole Contests</h3>
                  <p className="text-lg text-indigo-600 font-light">Extra prizes on designated holes</p>
                </div>

                <div className="space-y-6">
                  {getContestsByRound().map((round, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm">
                      <h4 className="text-xl font-bold text-indigo-900 mb-4">
                        Round {round.roundNumber} ({round.courseName})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {round.contests.map((contest, contestIndex) => (
                          <div
                            key={contestIndex}
                            className="flex items-center space-x-2 bg-indigo-50 rounded-lg px-3 py-2"
                          >
                            <span className="text-lg" role="img" aria-label={contest.type === 'closest_to_pin' ? 'target' : 'golf swing'}>
                              {contest.emoji}
                            </span>
                            <span className="font-medium text-indigo-900 text-sm">
                              Hole {contest.hole}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Prize Information */}
                  {(closestToPinPrize > 0 || longestDrivePrize > 0) && (
                    <div className="bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm">
                      <h4 className="text-lg font-semibold text-indigo-900 mb-4">Prize Information</h4>
                      <div className="flex flex-wrap gap-4">
                        {closestToPinPrize > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg" role="img" aria-label="target">🎯</span>
                            <span className="text-sm text-green-700 font-medium">
                              Closest to Pin: ${closestToPinPrize} per hole
                            </span>
                          </div>
                        )}
                        {longestDrivePrize > 0 && (
                          <div className="flex items-center space-x-2">
                            <span className="text-lg" role="img" aria-label="golf swing">🏌️‍♂️</span>
                            <span className="text-sm text-orange-700 font-medium">
                              Long Drive: ${longestDrivePrize} per hole
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Prizes Section */}
        {(prizes.length > 0 || eventData.buy_in > 0) && (
          <section className="py-20 px-6 sm:px-8 lg:px-12 bg-white/50">
            <div className="max-w-6xl mx-auto text-center">
              <div className="mb-16">
                <div className="inline-flex items-center space-x-2 bg-yellow-200 rounded-full px-4 py-2 mb-4">
                  <Trophy className="h-4 w-4 text-yellow-800" />
                  <span className="text-sm font-medium text-yellow-700">Tournament Prizes</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Prizes & Buy-In</h2>
              </div>

              {eventData.buy_in && eventData.buy_in > 0 && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-200/50 max-w-md mx-auto mb-12 cursor-help">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Tournament Buy-In</h3>
                        <div className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                          ${eventData.buy_in}
                        </div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Buy-in and prizes can be edited in the Edit → Prizes page.</p>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </section>
        )}

        {/* Travel Section */}
        {travel && (
          <section className="py-20 px-6 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <div className="inline-flex items-center space-x-2 bg-blue-200 rounded-full px-4 py-2 mb-4">
                  <Plane className="h-4 w-4 text-blue-800" />
                  <span className="text-sm font-medium text-blue-700">Travel & Accommodation</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Travel Information</h2>
                <p className="text-xl text-slate-600 max-w-2xl mx-auto">Everything you need to know about getting there and staying comfortable</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Getting There */}
                <div 
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group"
                  onClick={() => handleEditTravel('flight_info', 'Getting There')}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Plane className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Getting There</h3>
                    <Edit className="ml-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {getTravelValue('flight_info', travel.flight_info) || "Click to add flight information"}
                  </div>
                </div>

                {/* Accommodations */}
                <div 
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group"
                  onClick={() => handleEditTravel('accommodations', 'Accommodations')}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Accommodations</h3>
                    <Edit className="ml-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {getTravelValue('accommodations', travel.accommodations) || "Click to add accommodation details"}
                  </div>
                </div>

                {/* Daily Schedule */}
                <div 
                  className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group"
                  onClick={() => handleEditTravel('daily_schedule', 'Daily Schedule')}
                >
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Calendar className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex items-center justify-center mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Daily Schedule</h3>
                    <Edit className="ml-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {getTravelValue('daily_schedule', travel.daily_schedule) || "Click to add daily schedule"}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Modals */}

        {/* Description Edit Modal */}
        <Dialog open={editDescriptionModal} onOpenChange={setEditDescriptionModal}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Event Description</DialogTitle>
              <DialogDescription>
                Update the description that appears below the event title.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={tempDescription}
                onChange={(e) => setTempDescription(e.target.value)}
                placeholder="Enter a compelling description for your event..."
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditDescriptionModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDescription}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Course Edit Modal */}
        <Dialog open={!!editCourseModal} onOpenChange={() => setEditCourseModal(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Course Details</DialogTitle>
              <DialogDescription>
                Update the course information for Round {tempCourseData.roundNumber || 1}.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="course_name">Course Name</Label>
                <Input
                  id="course_name"
                  value={tempCourseData.course_name || ""}
                  onChange={(e) => setTempCourseData(prev => ({...prev, course_name: e.target.value}))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="round_date">Date</Label>
                  <Input
                    id="round_date"
                    type="date"
                    value={tempCourseData.round_date || ""}
                    onChange={(e) => setTempCourseData(prev => ({...prev, round_date: e.target.value}))}
                  />
                </div>
                <div>
                  <Label htmlFor="tee_time">Tee Time</Label>
                  <Input
                    id="tee_time"
                    type="time"
                    value={tempCourseData.tee_time || ""}
                    onChange={(e) => setTempCourseData(prev => ({...prev, tee_time: e.target.value}))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={tempCourseData.description || ""}
                  onChange={(e) => setTempCourseData(prev => ({...prev, description: e.target.value}))}
                  placeholder="Describe this course..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditCourseModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCourse}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Player Edit Modal */}
        <Dialog open={!!editPlayerModal} onOpenChange={() => setEditPlayerModal(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Player Details</DialogTitle>
              <DialogDescription>
                Update player information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Name</Label>
                <Input
                  id="full_name"
                  value={tempPlayerData.full_name || ""}
                  onChange={(e) => setTempPlayerData(prev => ({...prev, full_name: e.target.value}))}
                />
              </div>
              <div>
                <Label htmlFor="handicap">Handicap</Label>
                <Input
                  id="handicap"
                  type="number"
                  value={tempPlayerData.handicap || ""}
                  onChange={(e) => setTempPlayerData(prev => ({...prev, handicap: parseFloat(e.target.value) || null}))}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={tempPlayerData.bio || ""}
                  onChange={(e) => setTempPlayerData(prev => ({...prev, bio: e.target.value}))}
                  placeholder="Tell us about this player..."
                />
              </div>
              <div className="flex items-center text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Camera className="h-4 w-4 mr-2" />
                Profile pictures can be updated from the Edit → Players page.
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditPlayerModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSavePlayer}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Travel Edit Modal */}
        <Dialog open={!!editTravelModal} onOpenChange={() => setEditTravelModal(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit {editTravelModal?.title}</DialogTitle>
              <DialogDescription>
                Update the {editTravelModal?.title.toLowerCase()} information.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Textarea
                value={tempTravelData}
                onChange={(e) => setTempTravelData(e.target.value)}
                placeholder={`Enter ${editTravelModal?.title.toLowerCase()} details...`}
                className="min-h-[150px]"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditTravelModal(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveTravel}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
