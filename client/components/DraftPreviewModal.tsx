import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { ArrowLeft, Eye, Palette, Settings, Loader2, ExternalLink } from "lucide-react";

// Import the public event component
import PublicEventHome from "@/pages/PublicEventHome";

interface DraftPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  onEditMode: () => void;
}

const AVAILABLE_THEMES = [
  {
    id: "GolfOS",
    name: "GolfOS",
    description: "Colorful, playful design with bright accents",
    colors: ["#10b981", "#3b82f6", "#8b5cf6"],
  },
  {
    id: "TourTech",
    name: "Tour Tech",
    description: "Professional, enterprise-ready design",
    colors: ["#1e293b", "#64748b", "#ea580c"],
  },
  {
    id: "Masters",
    name: "Masters",
    description: "Prestigious, traditional design",
    colors: ["#166534", "#15803d", "#ca8a04"],
  },
];

export const DraftPreviewModal: React.FC<DraftPreviewModalProps> = ({
  isOpen,
  onClose,
  eventId,
  onEditMode,
}) => {
  const [currentTheme, setCurrentTheme] = useState("GolfOS");
  const [originalTheme, setOriginalTheme] = useState("GolfOS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventSlug, setEventSlug] = useState<string | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isOpen && eventId) {
      loadEventData();
    }
  }, [isOpen, eventId]);

  const loadEventData = async () => {
    setLoading(true);
    try {
      const { data: eventData, error } = await supabase
        .from("events")
        .select("theme, slug")
        .eq("id", eventId)
        .single();

      if (error) throw error;

      if (eventData) {
        setOriginalTheme(eventData.theme || "GolfOS");
        setCurrentTheme(eventData.theme || "GolfOS");
        setEventSlug(eventData.slug);
      }
    } catch (error) {
      console.error("Error loading event data:", error);
      toast({
        title: "Error",
        description: "Failed to load event data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = async (newTheme: string) => {
    setCurrentTheme(newTheme);
    setSaving(true);

    try {
      const { error } = await supabase
        .from("events")
        .update({ theme: newTheme })
        .eq("id", eventId);

      if (error) throw error;

      setOriginalTheme(newTheme);
      toast({
        title: "Theme Updated",
        description: `Successfully changed theme to ${newTheme}`,
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Error",
        description: "Failed to update theme",
        variant: "destructive",
      });
      // Revert theme on error
      setCurrentTheme(originalTheme);
    } finally {
      setSaving(false);
    }
  };

  const handleBackToEdit = () => {
    onClose();
    onEditMode();
  };

  const handleOpenFullScreen = () => {
    if (eventSlug) {
      window.open(`/events/${eventSlug}?draft=true&theme=${currentTheme}`, '_blank');
    }
  };

  const selectedTheme = AVAILABLE_THEMES.find((t) => t.id === currentTheme);

  // On mobile, show a simpler interface that opens full screen
  if (isMobile) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-6 z-[70]">
          <DialogTitle className="text-xl font-bold mb-4">Preview Your Event</DialogTitle>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading preview...</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mb-4">
                  <Badge
                    variant="secondary"
                    className="bg-orange-100 text-orange-700 border-orange-200"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Draft Preview
                  </Badge>
                </div>
                <p className="text-slate-600 mb-6">
                  For the best mobile preview experience, open your event in a new tab.
                </p>

                {/* Theme Selector */}
                <div className="mb-6">
                  <label className="text-sm font-medium text-slate-700 mb-2 block">
                    Choose Theme
                  </label>
                  <Select
                    value={currentTheme}
                    onValueChange={handleThemeChange}
                    disabled={saving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        <div className="flex items-center space-x-2">
                          {selectedTheme && (
                            <>
                              <div className="flex space-x-1">
                                {selectedTheme.colors.map((color, index) => (
                                  <div
                                    key={index}
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <span>{selectedTheme.name}</span>
                            </>
                          )}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_THEMES.map((theme) => (
                        <SelectItem key={theme.id} value={theme.id}>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              {theme.colors.map((color, index) => (
                                <div
                                  key={index}
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: color }}
                                />
                              ))}
                            </div>
                            <div>
                              <div className="font-medium">{theme.name}</div>
                              <div className="text-xs text-slate-500">
                                {theme.description}
                              </div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {saving && (
                    <div className="flex items-center justify-center mt-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-600 mr-2" />
                      <span className="text-sm text-slate-600">Updating theme...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleOpenFullScreen}
                  className="w-full h-12 text-base"
                  disabled={!eventSlug}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Screen Preview
                </Button>

                <Button
                  variant="outline"
                  onClick={handleBackToEdit}
                  className="w-full h-12 text-base"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Edit
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    );
  }

  // Desktop experience with iframe-like modal
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden z-[70]">
        <DialogTitle className="sr-only">Draft Event Preview</DialogTitle>
        {/* Draft Mode Header */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200 sticky top-0 z-[60]">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToEdit}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Edit</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-700 border-orange-200"
              >
                <Eye className="h-3 w-3 mr-1" />
                Draft Preview
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Theme Selector */}
            <div className="flex items-center space-x-2">
              <Palette className="h-4 w-4 text-slate-600" />
              <Select
                value={currentTheme}
                onValueChange={handleThemeChange}
                disabled={saving}
              >
                <SelectTrigger className="w-40">
                  <SelectValue>
                    <div className="flex items-center space-x-2">
                      {selectedTheme && (
                        <>
                          <div className="flex space-x-1">
                            {selectedTheme.colors.map((color, index) => (
                              <div
                                key={index}
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                          <span>{selectedTheme.name}</span>
                        </>
                      )}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_THEMES.map((theme) => (
                    <SelectItem key={theme.id} value={theme.id}>
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          {theme.colors.map((color, index) => (
                            <div
                              key={index}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-xs text-slate-500">
                            {theme.description}
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-600" />
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleBackToEdit}
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Edit Settings</span>
            </Button>
          </div>
        </div>

        {/* Public Event Content */}
        <div className="flex-1 overflow-auto h-[calc(95vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading preview...</span>
              </div>
            </div>
          ) : eventSlug ? (
            <div className="relative">
              {/* Draft Mode Overlay Indicator */}
              <div className="absolute top-4 right-4 z-[80]">
                <Badge
                  variant="secondary"
                  className="bg-orange-100 text-orange-700 border-orange-200 shadow-lg"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Preview Mode
                </Badge>
              </div>

              {/* Render the actual public event site */}
              <PublicEventHome slug={eventSlug} forceTheme={currentTheme} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-slate-600">Event not found</p>
                <Button onClick={handleBackToEdit} className="mt-4">
                  Back to Edit
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
