import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Palette, Save, Check } from "lucide-react";

const AVAILABLE_THEMES = [
  {
    id: "GolfOS",
    name: "GolfOS",
    description:
      "Colorful, playful design for your public event website inspired by classic Apple UIs with bright accents and rounded elements",
    preview: {
      primary: "bg-gradient-to-r from-green-400 to-green-600",
      secondary: "bg-gradient-to-r from-blue-400 to-blue-600",
      accent: "bg-gradient-to-r from-purple-400 to-orange-400",
    },
    characteristics: [
      "Rounded UI elements with soft drop shadows",
      "Bright, cheerful accent colors",
      "Generous spacing and oversized buttons",
      "Sans-serif, high-contrast typography",
      "Subtle gradients and layered components",
    ],
  },
  {
    id: "TourTech",
    name: "Tour Tech",
    description:
      "Clean, professional design inspired by modern SaaS platforms with high-contrast typography and minimalist layout",
    preview: {
      primary: "bg-gradient-to-r from-slate-800 to-slate-900",
      secondary: "bg-gradient-to-r from-slate-600 to-slate-700",
      accent: "bg-gradient-to-r from-green-600 to-green-700",
    },
    characteristics: [
      "High-contrast typography with compact layout",
      "Neutral color palette with bold accent colors",
      "Minimalist UI with clear information hierarchy",
      "Sharp corners, no unnecessary drop shadows",
      "Modern geometric fonts for headers",
      "Professional, structured design approach",
    ],
  },
];

export default function ThemeCustomization() {
  const { eventId } = useParams();
  const { toast } = useToast();

  const [selectedTheme, setSelectedTheme] = useState("GolfOS");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadThemeData();
    }
  }, [eventId]);

  const loadThemeData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);

      // Load theme from events table
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("theme")
        .eq("id", eventId)
        .single();

      if (eventError) {
        console.error("Error loading theme:", eventError);
        toast({
          title: "Error",
          description: "Failed to load theme settings",
          variant: "destructive",
        });
        return;
      }

      setSelectedTheme(eventData?.theme || "GolfOS");
    } catch (error) {
      console.error("Error loading theme data:", error);
      toast({
        title: "Error",
        description: "Failed to load theme data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTheme = async () => {
    if (!eventId) return;

    try {
      setSaving(true);
      console.log("🎨 Theme Save Debug - Event ID:", eventId);
      console.log("🎨 Theme Save Debug - Selected theme:", selectedTheme);

      // Update theme in events table
      const { error } = await supabase
        .from("events")
        .update({ theme: selectedTheme })
        .eq("id", eventId);

      console.log("🎨 Theme Save Debug - Update result error:", error);

      if (error) {
        console.error("Error saving theme:", error);
        toast({
          title: "Error",
          description: "Failed to save theme",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Public Site Theme Saved",
        description: `${selectedTheme} theme has been applied to your public event website`,
      });
    } catch (error) {
      console.error("Error saving theme:", error);
      toast({
        title: "Error",
        description: "Failed to save theme",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
          <Palette className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Public Site Theme
          </h1>
          <p className="text-slate-600">
            Choose your public event website's visual theme and personality
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {AVAILABLE_THEMES.map((theme) => (
          <Card
            key={theme.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTheme === theme.id
                ? "ring-2 ring-green-500 shadow-lg"
                : "hover:shadow-md"
            }`}
            onClick={() => setSelectedTheme(theme.id)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CardTitle className="text-xl">{theme.name}</CardTitle>
                  {selectedTheme === theme.id && (
                    <div className="p-1 bg-green-500 rounded-full">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <div
                    className={`w-6 h-6 rounded-full ${theme.preview.primary}`}
                  ></div>
                  <div
                    className={`w-6 h-6 rounded-full ${theme.preview.secondary}`}
                  ></div>
                  <div
                    className={`w-6 h-6 rounded-full ${theme.preview.accent}`}
                  ></div>
                </div>
              </div>
              <CardDescription className="text-slate-600">
                {theme.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-800 mb-2">
                  Key Features:
                </h4>
                <ul className="space-y-1">
                  {theme.characteristics.map((characteristic, index) => (
                    <li
                      key={index}
                      className="text-sm text-slate-600 flex items-center space-x-2"
                    >
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                      <span>{characteristic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={saveTheme}
          disabled={saving}
          className="bg-green-600 hover:bg-green-700 text-white px-6"
        >
          {saving ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Theme</span>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
