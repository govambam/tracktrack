import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  User,
  Camera,
} from "lucide-react";

interface DraftModeProps {
  localChanges: any;
  updateLocalChanges: (path: string, value: any) => void;
}

// This component will render a modified version of PublicEventHome with editing capabilities
export default function DraftModePublicEventHome({ localChanges, updateLocalChanges }: DraftModeProps) {
  const { eventId } = useParams();
  const [eventData, setEventData] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [travel, setTravel] = useState<any>(null);
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

      // Load main event data
      console.log("Loading main event data...");
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("Event loading error:", eventError.message, eventError);
        throw new Error(`Failed to load event: ${eventError.message}`);
      }

      if (!event) {
        throw new Error("Event not found");
      }

      console.log("Event loaded:", event);
      setEventData(event);

      // Load players
      console.log("Loading players...");
      const { data: playersData, error: playersError } = await supabase
        .from("event_players")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at");

      if (playersError) {
        console.error("Players loading error:", playersError.message, playersError);
        throw new Error(`Failed to load players: ${playersError.message}`);
      }

      console.log("Players loaded:", playersData?.length || 0, "players");
      setPlayers(playersData || []);

      // Load rounds
      console.log("Loading rounds...");
      const { data: roundsData, error: roundsError } = await supabase
        .from("event_rounds")
        .select("*")
        .eq("event_id", eventId)
        .order("round_date");

      if (roundsError) {
        console.error("Rounds loading error:", roundsError.message, roundsError);
        throw new Error(`Failed to load rounds: ${roundsError.message}`);
      }

      console.log("Rounds loaded:", roundsData?.length || 0, "rounds");
      setRounds(roundsData || []);

      // Load courses
      console.log("Loading courses...");
      const { data: coursesData, error: coursesError } = await supabase
        .from("event_courses")
        .select("*")
        .eq("event_id", eventId);

      if (coursesError) {
        console.error("Courses loading error:", coursesError.message, coursesError);
        throw new Error(`Failed to load courses: ${coursesError.message}`);
      }

      console.log("Courses loaded:", coursesData?.length || 0, "courses");
      setCourses(coursesData || []);

      // Load travel (optional)
      console.log("Loading travel data...");
      const { data: travelData, error: travelError } = await supabase
        .from("event_travel")
        .select("*")
        .eq("event_id", eventId)
        .single();

      if (travelError && travelError.code !== "PGRST116") {
        console.error("Travel loading error:", travelError.message, travelError);
        // Don't throw for travel data as it's optional
        console.warn("Travel data could not be loaded, continuing without it");
      } else {
        console.log("Travel data loaded:", !!travelData);
        setTravel(travelData);
      }

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

  // Modal handlers
  const handleEditDescription = () => {
    setTempDescription(getEventDescription());
    setEditDescriptionModal(true);
  };

  const handleSaveDescription = () => {
    updateLocalChanges('eventDescription', tempDescription);
    setEditDescriptionModal(false);
  };

  const handleEditCourse = (round: any) => {
    const course = courses.find(c => c.round_id === round.id);
    setTempCourseData({
      id: round.id,
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading draft preview...</p>
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
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 sm:px-8 lg:px-12">
          <div className="relative max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-green-200 rounded-full px-4 py-2 mb-8">
              <Calendar className="h-4 w-4 text-green-800" />
              <span className="text-sm font-medium text-green-800">
                {eventData.start_date && eventData.end_date
                  ? `${new Date(eventData.start_date).toLocaleDateString()} - ${new Date(eventData.end_date).toLocaleDateString()}`
                  : "Date TBD"}
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
          </div>
        </section>

        {/* Course Cards Section */}
        {rounds.length > 0 && (
          <section className="py-16 px-6 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Golf Courses
                </h2>
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
                      onClick={() => handleEditCourse(round)}
                    >
                      <div className="p-8">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-sm font-medium text-green-700 bg-green-100 px-3 py-1 rounded-full">
                            Round {index + 1}
                          </span>
                          <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-green-700 transition-colors">
                          {displayName}
                        </h3>
                        
                        <div className="space-y-2 text-sm text-slate-600 mb-4">
                          {displayDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2" />
                              {new Date(displayDate).toLocaleDateString()}
                            </div>
                          )}
                          {displayTeeTime && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2" />
                              {displayTeeTime}
                            </div>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {displayDescription || "Add description"}
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
          <section className="py-16 px-6 sm:px-8 lg:px-12">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Players
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {players.map((player) => {
                  const displayName = getPlayerValue(player.id, 'full_name', player.full_name);
                  const displayHandicap = getPlayerValue(player.id, 'handicap', player.handicap);
                  const displayBio = getPlayerValue(player.id, 'bio', player.bio);
                  
                  return (
                    <div
                      key={player.id}
                      className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200/50 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 group p-6"
                      onClick={() => handleEditPlayer(player)}
                    >
                      <div className="text-center">
                        {/* Avatar */}
                        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-xl font-bold">
                          {player.profile_image ? (
                            <img src={player.profile_image} alt={displayName} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                          )}
                        </div>
                        
                        <div className="flex items-center justify-center mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">{displayName}</h3>
                          <Edit className="ml-2 h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        
                        {displayHandicap !== null && displayHandicap !== undefined && (
                          <div className="inline-flex items-center space-x-1 bg-slate-100 rounded-full px-3 py-1 mb-4">
                            <span className="text-xs font-semibold text-slate-600">HCP: {displayHandicap}</span>
                          </div>
                        )}
                        
                        {displayBio && (
                          <p className="text-sm text-slate-600 leading-relaxed text-center">
                            "{displayBio}"
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Travel Section */}
        {travel && (
          <section className="py-16 px-6 sm:px-8 lg:px-12 bg-white/50">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
                  Travel Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Getting There */}
                <div 
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => handleEditTravel('flight_info', 'Getting There')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Getting There</h3>
                    <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-slate-600 whitespace-pre-line">
                    {getTravelValue('flight_info', travel.flight_info) || "Add flight information"}
                  </div>
                </div>

                {/* Accommodations */}
                <div 
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => handleEditTravel('accommodations', 'Accommodations')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Accommodations</h3>
                    <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-slate-600 whitespace-pre-line">
                    {getTravelValue('accommodations', travel.accommodations) || "Add accommodation details"}
                  </div>
                </div>

                {/* Daily Schedule */}
                <div 
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => handleEditTravel('daily_schedule', 'Daily Schedule')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900">Daily Schedule</h3>
                    <Edit className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-slate-600 whitespace-pre-line">
                    {getTravelValue('daily_schedule', travel.daily_schedule) || "Add daily schedule"}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Tooltips for non-editable sections */}
        <section className="py-16 px-6 sm:px-8 lg:px-12">
          <div className="max-w-6xl mx-auto text-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-8 cursor-help">
                  <h3 className="text-2xl font-bold text-yellow-900 mb-4">Tournament Buy-In & Prizes</h3>
                  <p className="text-yellow-700">Hover to see editing options</p>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>To update buy-in and prizes, go to Edit → Prizes</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </section>

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
                Update the course information for Round {editCourseModal?.round_number}.
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
                Update player information. To update profile photos, visit the Edit → Players page.
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
                To update profile photos, visit the Edit → Players page.
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
