import { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  Outlet,
  Link,
  useLocation,
} from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  MapPin,
  Target,
  Users,
  Trophy,
  Plane,
  Palette,
  Settings,
  ArrowLeft,
  Calendar,
  Globe,
  Lock,
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  location: string;
  description?: string;
  is_private: boolean;
  is_published: boolean;
  slug?: string;
  created_at: string;
}

const sidebarSections = [
  {
    id: "basic",
    label: "Basic Info",
    icon: FileText,
    description: "Event details and dates",
  },
  {
    id: "courses",
    label: "Courses",
    icon: MapPin,
    description: "Golf rounds and venues",
  },
  {
    id: "scoring",
    label: "Scoring",
    icon: Target,
    description: "Tournament format",
  },
  {
    id: "players",
    label: "Players",
    icon: Users,
    description: "Participants and handicaps",
  },
  {
    id: "prizes",
    label: "Prizes",
    icon: Trophy,
    description: "Buy-ins and payouts",
  },
  {
    id: "travel",
    label: "Travel",
    icon: Plane,
    description: "Logistics and schedule",
  },
  {
    id: "customizations",
    label: "Customizations",
    icon: Palette,
    description: "Website content and appearance",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "General event settings",
  },
];

export default function EventEdit() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { loadCompleteEvent } = useTripCreation();

  // Extract current section from the pathname
  const currentSectionId = location.pathname.split("/").pop() || "basic";

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load complete event data into context for editing
      const result = await loadCompleteEvent(eventId);

      if (!result.success) {
        toast({
          title: "Failed to Load Event",
          description: result.error || "Could not load event data",
          variant: "destructive",
        });
        navigate("/app");
        return;
      }

      // Also load basic event info for the sidebar
      const { data: event, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) {
        console.error("Error loading event:", error);
        toast({
          title: "Failed to Load Event",
          description: "Could not load event information",
          variant: "destructive",
        });
        navigate("/app");
        return;
      }

      setEventData(event);
    } catch (error) {
      console.error("Error loading event:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      navigate("/app");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-green-600">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Event not found</p>
          <Button onClick={() => navigate("/app")} className="mt-4">
            Back to Events
          </Button>
        </div>
      </div>
    );
  }

  const currentSection =
    sidebarSections.find((s) => s.id === currentSectionId) ||
    sidebarSections[0];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => navigate("/app")}
                className="text-green-600 hover:text-green-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Events
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-lg font-semibold text-green-900">
                  {eventData.name}
                </h1>
                <div className="flex items-center text-sm text-green-600 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {formatDate(eventData.start_date)} -{" "}
                    {formatDate(eventData.end_date)}
                  </div>
                  <div className="flex items-center">
                    {eventData.is_private ? (
                      <Lock className="h-4 w-4 mr-1" />
                    ) : (
                      <Globe className="h-4 w-4 mr-1" />
                    )}
                    {eventData.is_private ? "Private" : "Public"}
                  </div>
                  {eventData.is_published && eventData.slug && (
                    <div className="flex items-center">
                      <button
                        onClick={() =>
                          window.open(`/events/${eventData.slug}`, "_blank")
                        }
                        className="flex items-center text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        tracktrack.com/events/{eventData.slug}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-green-700 border-green-200"
            >
              Editing
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="border-green-100">
              <CardContent className="p-0">
                <div className="p-4 border-b border-green-100">
                  <h2 className="font-semibold text-green-900">
                    Event Sections
                  </h2>
                  <p className="text-sm text-green-600 mt-1">
                    {currentSection.description}
                  </p>
                </div>
                <nav className="p-2">
                  {sidebarSections.map((sectionItem) => {
                    const Icon = sectionItem.icon;
                    const isActive = currentSectionId === sectionItem.id;

                    return (
                      <Link
                        key={sectionItem.id}
                        to={`/app/${eventId}/${sectionItem.id}`}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600"
                            : "text-green-700 hover:bg-green-50 hover:text-emerald-600"
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {sectionItem.label}
                      </Link>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-green-100 shadow-sm">
              <div className="p-6 border-b border-green-100">
                <div className="flex items-center">
                  <currentSection.icon className="h-5 w-5 mr-2 text-emerald-600" />
                  <h1 className="text-xl font-semibold text-green-900">
                    {currentSection.label}
                  </h1>
                </div>
                <p className="text-green-600 mt-1">
                  {currentSection.description}
                </p>
              </div>
              <div className="p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
