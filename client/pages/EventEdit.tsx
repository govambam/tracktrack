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
  ChevronDown,
  ChevronRight,
  Home,
  Menu,
  X,
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
    label: "Rounds",
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
    submenu: [
      {
        id: "customizations/home",
        label: "Home",
        icon: Home,
        description: "Homepage content",
      },
      {
        id: "customizations/courses",
        label: "Courses",
        icon: MapPin,
        description: "Course details",
      },
      {
        id: "customizations/rules",
        label: "Rules",
        icon: Target,
        description: "Tournament rules",
      },
      {
        id: "customizations/leaderboard",
        label: "Leaderboard",
        icon: Trophy,
        description: "Leaderboard settings",
      },
      {
        id: "customizations/travel",
        label: "Travel",
        icon: Plane,
        description: "Travel information",
      },
    ],
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
  const pathParts = location.pathname.split("/");
  const currentSectionId = pathParts
    .slice(-2)
    .join("/")
    .startsWith("customizations/")
    ? pathParts.slice(-2).join("/")
    : pathParts.pop() || "basic";

  const [eventData, setEventData] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([
    "customizations",
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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

  const currentSection = (() => {
    // First check if it's a submenu item
    for (const section of sidebarSections) {
      if (section.submenu) {
        const submenuItem = section.submenu.find(
          (sub) => sub.id === currentSectionId,
        );
        if (submenuItem) return submenuItem;
      }
    }
    // Then check if it's a main section
    return (
      sidebarSections.find((s) => s.id === currentSectionId) ||
      sidebarSections[0]
    );
  })();

  const toggleMenu = (sectionId: string) => {
    setExpandedMenus((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 md:space-x-4 flex-1 min-w-0">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-green-600 hover:text-green-700 p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/app")}
                className="text-green-600 hover:text-green-700 p-2 lg:px-3 lg:py-2"
              >
                <ArrowLeft className="h-4 w-4 lg:mr-2" />
                <span className="hidden lg:inline">Back to Events</span>
              </Button>

              <Separator orientation="vertical" className="h-6 hidden lg:block" />

              <div className="min-w-0 flex-1">
                <h1 className="text-sm md:text-lg font-semibold text-green-900 truncate">
                  {eventData.name}
                </h1>
                <div className="hidden md:flex items-center text-xs md:text-sm text-green-600 space-x-2 lg:space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    <span className="hidden lg:inline">
                      {formatDate(eventData.start_date)} -{" "}
                      {formatDate(eventData.end_date)}
                    </span>
                    <span className="lg:hidden">
                      {new Date(eventData.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="flex items-center">
                    {eventData.is_private ? (
                      <Lock className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    ) : (
                      <Globe className="h-3 w-3 md:h-4 md:w-4 mr-1" />
                    )}
                    {eventData.is_private ? "Private" : "Public"}
                  </div>
                  {eventData.is_published && eventData.slug && (
                    <div className="hidden lg:flex items-center">
                      <button
                        onClick={() =>
                          window.open(`/events/${eventData.slug}`, "_blank")
                        }
                        className="flex items-center text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        <Globe className="h-4 w-4 mr-1" />
                        <span className="truncate">tracktrack.com/events/{eventData.slug}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-green-700 border-green-200 text-xs"
            >
              Editing
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        <div className="flex gap-4 lg:gap-8">
          {/* Desktop Sidebar Navigation */}
          <div className="hidden lg:block w-64 flex-shrink-0">
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
                    const isCustomizations =
                      sectionItem.id === "customizations";
                    const isExpanded = expandedMenus.includes(sectionItem.id);
                    const hasActiveSubmenu = sectionItem.submenu?.some(
                      (sub) => sub.id === currentSectionId,
                    );

                    return (
                      <div key={sectionItem.id}>
                        {sectionItem.submenu ? (
                          // Expandable menu item
                          <button
                            onClick={() => toggleMenu(sectionItem.id)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                              hasActiveSubmenu
                                ? "bg-emerald-50 text-emerald-700"
                                : "text-green-700 hover:bg-green-50 hover:text-emerald-600"
                            }`}
                          >
                            <div className="flex items-center">
                              <Icon className="h-4 w-4 mr-3" />
                              {sectionItem.label}
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </button>
                        ) : (
                          // Regular menu item
                          <Link
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
                        )}

                        {/* Submenu items */}
                        {sectionItem.submenu && isExpanded && (
                          <div className="ml-4 mt-1 space-y-1">
                            {sectionItem.submenu.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive =
                                currentSectionId === subItem.id;

                              return (
                                <Link
                                  key={subItem.id}
                                  to={`/app/${eventId}/${subItem.id}`}
                                  className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                                    isSubActive
                                      ? "bg-emerald-100 text-emerald-700 border-l-2 border-emerald-600"
                                      : "text-green-600 hover:bg-green-50 hover:text-emerald-600"
                                  }`}
                                >
                                  <SubIcon className="h-3 w-3 mr-3" />
                                  {subItem.label}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg border border-green-100 shadow-sm">
              <div className="p-4 lg:p-6 border-b border-green-100">
                <div className="flex items-center">
                  <currentSection.icon className="h-5 w-5 mr-2 text-emerald-600" />
                  <h1 className="text-lg lg:text-xl font-semibold text-green-900">
                    {currentSection.label}
                  </h1>
                </div>
                <p className="text-green-600 mt-1 text-sm lg:text-base">
                  {currentSection.description}
                </p>
              </div>
              <div className="p-4 lg:p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-80 max-w-[80vw] bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-green-100">
              <h2 className="font-semibold text-green-900">Event Sections</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="p-2"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <p className="text-sm text-green-600 mb-4">
                {currentSection.description}
              </p>
            </div>
            <nav className="px-2 pb-4">
              {sidebarSections.map((sectionItem) => {
                const Icon = sectionItem.icon;
                const isActive = currentSectionId === sectionItem.id;
                const isCustomizations = sectionItem.id === "customizations";
                const isExpanded = expandedMenus.includes(sectionItem.id);
                const hasActiveSubmenu = sectionItem.submenu?.some(
                  (sub) => sub.id === currentSectionId,
                );

                return (
                  <div key={sectionItem.id}>
                    {sectionItem.submenu ? (
                      // Expandable menu item
                      <button
                        onClick={() => toggleMenu(sectionItem.id)}
                        className={`w-full flex items-center justify-between px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                          hasActiveSubmenu
                            ? "bg-emerald-50 text-emerald-700"
                            : "text-green-700 hover:bg-green-50 hover:text-emerald-600"
                        }`}
                      >
                        <div className="flex items-center">
                          <Icon className="h-5 w-5 mr-3" />
                          {sectionItem.label}
                        </div>
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </button>
                    ) : (
                      // Regular menu item
                      <Link
                        to={`/app/${eventId}/${sectionItem.id}`}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-emerald-50 text-emerald-700 border-l-2 border-emerald-600"
                            : "text-green-700 hover:bg-green-50 hover:text-emerald-600"
                        }`}
                      >
                        <Icon className="h-5 w-5 mr-3" />
                        {sectionItem.label}
                      </Link>
                    )}

                    {/* Submenu items */}
                    {sectionItem.submenu && isExpanded && (
                      <div className="ml-4 mt-1 space-y-1">
                        {sectionItem.submenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          const isSubActive = currentSectionId === subItem.id;

                          return (
                            <Link
                              key={subItem.id}
                              to={`/app/${eventId}/${subItem.id}`}
                              onClick={() => setSidebarOpen(false)}
                              className={`flex items-center px-3 py-2 rounded-md text-sm transition-colors ${
                                isSubActive
                                  ? "bg-emerald-100 text-emerald-700 border-l-2 border-emerald-600"
                                  : "text-green-600 hover:bg-green-50 hover:text-emerald-600"
                              }`}
                            >
                              <SubIcon className="h-4 w-4 mr-3" />
                              {subItem.label}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
