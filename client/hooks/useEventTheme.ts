import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getThemeStyles } from "@/lib/themeComponents";

interface UseEventThemeResult {
  currentTheme: string;
  theme: any;
  loading: boolean;
  error: string | null;
}

export const useEventTheme = (eventSlug?: string): UseEventThemeResult => {
  const [currentTheme, setCurrentTheme] = useState<string>("GolfOS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadEventTheme = async () => {
      if (!eventSlug) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: event, error: eventError } = await supabase
          .from("events")
          .select("theme")
          .eq("slug", eventSlug)
          .eq("is_published", true)
          .single();

        if (eventError || !event) {
          console.error("Failed to load event theme:", eventError);
          setError("Failed to load event theme");
          setCurrentTheme("GolfOS"); // Default fallback
        } else {
          setCurrentTheme(event.theme || "GolfOS");
        }
      } catch (err) {
        console.error("Error loading event theme:", err);
        setError("Error loading event theme");
        setCurrentTheme("GolfOS"); // Default fallback
      } finally {
        setLoading(false);
      }
    };

    loadEventTheme();
  }, [eventSlug]);

  const theme = getThemeStyles(currentTheme);

  return {
    currentTheme,
    theme,
    loading,
    error,
  };
};
