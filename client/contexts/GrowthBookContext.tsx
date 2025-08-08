import React, { createContext, useContext, useEffect, useState } from "react";
import { GrowthBook } from "@growthbook/growthbook-react";
import { supabase } from "@/lib/supabase";

// Helper functions to detect user attributes
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return "tablet";
  }
  if (
    /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
      ua,
    )
  ) {
    return "mobile";
  }
  return "desktop";
};

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Chrome")) return "chrome";
  if (ua.includes("Firefox")) return "firefox";
  if (ua.includes("Safari")) return "safari";
  if (ua.includes("Edge")) return "edge";
  return "other";
};

const getOperatingSystem = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes("Mac")) return "macos";
  if (ua.includes("Windows")) return "windows";
  if (ua.includes("Linux")) return "linux";
  if (ua.includes("Android")) return "android";
  if (ua.includes("iOS")) return "ios";
  return "other";
};

const getTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return "unknown";
  }
};

const getCountryFromTimezone = (timezone: string): string => {
  // Extract country from timezone (e.g., "America/New_York" -> "US")
  const timezoneToCountry: { [key: string]: string } = {
    "America/New_York": "US",
    "America/Los_Angeles": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "Europe/London": "GB",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Asia/Tokyo": "JP",
    "Australia/Sydney": "AU",
    // Add more as needed
  };

  return timezoneToCountry[timezone] || "unknown";
};

const getHandicapRange = (handicap: number): string => {
  if (handicap <= 5) return "low"; // Low handicap (scratch to 5)
  if (handicap <= 15) return "mid"; // Mid handicap (6-15)
  if (handicap <= 25) return "high"; // High handicap (16-25)
  return "beginner"; // Beginner (25+)
};

const getAccountAgeCategory = (ageInDays: number): string => {
  if (ageInDays <= 1) return "new"; // New user (within 24 hours)
  if (ageInDays <= 7) return "recent"; // Recent (within a week)
  if (ageInDays <= 30) return "established"; // Established (within a month)
  return "veteran"; // Long-time user
};

const getUserType = (eventCount: number, accountAge: number): string => {
  if (eventCount === 0) {
    return accountAge <= 7 ? "new_user" : "inactive_user";
  }
  if (eventCount >= 10) return "power_user";
  if (eventCount >= 3) return "active_user";
  return "casual_user";
};

const getEngagementLevel = (eventCount: number, accountAge: number): string => {
  if (accountAge === 0) return "new";

  const eventsPerDay = eventCount / accountAge;
  if (eventsPerDay >= 0.1) return "high"; // More than 1 event per 10 days
  if (eventsPerDay >= 0.03) return "medium"; // More than 1 event per month
  return "low";
};

// Local feature definitions as fallback
const localFeatures = {
  "new-ui-design": false,
  "button-color": "default",
  "max-users-limit": 100,
  "welcome-message": "Welcome to GolfOS!",
  "enable-dark-mode": false,
  "show-advanced-features": false,
  "beta-leaderboard": false,
  "enhanced-scoring": false,
  ai_quickstart_create_flow: false,
  delete_projects: false,
};

// Create GrowthBook instance with fallback configuration
const createGrowthBookInstance = () => {
  const apiHost =
    import.meta.env.VITE_GROWTHBOOK_API_HOST || "https://cdn.growthbook.io";
  const clientKey =
    import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY || "sdk-w1E948s82nX7yJ5u";

  console.log("Creating GrowthBook instance with:", { apiHost, clientKey });

  const gb = new GrowthBook({
    apiHost,
    clientKey,
    enableDevMode: import.meta.env.DEV,
    trackingCallback: (experiment, result) => {
      console.log("GrowthBook Experiment:", experiment.key, result);
    },
    // Add additional options for better error handling
    subscribeToChanges: false, // Disable real-time updates
    backgroundSync: false, // Disable background syncing
    // Set local features as fallback
    features: localFeatures,
    // Add timeout for network requests
    streamingHost: undefined, // Disable streaming
  });

  return gb;
};

const growthbook = createGrowthBookInstance();

// Create context
const GrowthBookContext = createContext<GrowthBook>(growthbook);

// Create a context for user attributes
const UserAttributesContext = createContext<{
  attributes: any;
  updateAttributes: () => Promise<void>;
}>({
  attributes: {},
  updateAttributes: async () => {},
});

// Provider component
export const GrowthBookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [userAttributes, setUserAttributes] = useState<any>({});
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Function to set user attributes
  const updateUserAttributes = async () => {
    try {
      // Get current user session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // Base attributes (always available)
      const baseAttributes = {
        // Auto-detected attributes
        deviceType: getDeviceType(),
        browser: getBrowser(),
        os: getOperatingSystem(),
        timezone: getTimezone(),
        country: getCountryFromTimezone(getTimezone()),
        url: window.location.href,
        path: window.location.pathname,
        userAgent: navigator.userAgent,
        language: navigator.language,
        // Date/time attributes
        dayOfWeek: new Date().getDay(), // 0-6 (Sunday-Saturday)
        hourOfDay: new Date().getHours(), // 0-23
        // Screen attributes
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
      };

      let attributes = { ...baseAttributes };

      if (session?.user) {
        // Get user profile data
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        // Get user's event count and other stats
        const { count: eventCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true })
          .eq("created_by", session.user.id);

        // Calculate account age in days
        const accountAge = session.user.created_at
          ? Math.floor(
              (Date.now() - new Date(session.user.created_at).getTime()) /
                (1000 * 60 * 60 * 24),
            )
          : 0;

        // User-specific attributes
        const userSpecificAttributes = {
          // Core user data
          id: session.user.id,
          email: session.user.email,
          emailDomain: session.user.email?.split("@")[1] || "",
          isAuthenticated: true,

          // Profile data
          name: profile?.full_name || "",
          fullName: profile?.full_name || "",
          handicap: profile?.handicap || null,
          hasHandicap: !!profile?.handicap,
          handicapRange: profile?.handicap
            ? getHandicapRange(profile.handicap)
            : null,
          location: profile?.location || "",
          bio: profile?.bio || "",
          hasProfileImage: !!profile?.avatar_url,

          // Account metadata
          isEmailConfirmed: !!session.user.email_confirmed_at,
          accountAgeInDays: accountAge,
          accountAgeCategory: getAccountAgeCategory(accountAge),
          createdAt: session.user.created_at,

          // Activity data
          totalEvents: eventCount || 0,
          hasCreatedEvents: (eventCount || 0) > 0,
          userType: getUserType(eventCount || 0, accountAge),
          engagementLevel: getEngagementLevel(eventCount || 0, accountAge),
        };

        attributes = { ...attributes, ...userSpecificAttributes };
      } else {
        // Anonymous user attributes
        attributes.id = "anonymous";
        attributes.userType = "anonymous";
        attributes.isAuthenticated = false;
      }

      setUserAttributes(attributes);
      growthbook.setAttributes(attributes);

      console.log("GrowthBook attributes set:", attributes);
    } catch (error) {
      console.error("Error setting GrowthBook attributes:", error);
      // Set minimal attributes on error
      const minimalAttributes = {
        deviceType: getDeviceType(),
        browser: getBrowser(),
        isAuthenticated: false,
      };
      setUserAttributes(minimalAttributes);
      growthbook.setAttributes(minimalAttributes);
    }
  };

  useEffect(() => {
    // Initialize attributes and load features
    const initializeGrowthBook = async () => {
      console.log("Initializing GrowthBook...");

      try {
        await updateUserAttributes();
        console.log("User attributes updated successfully");
      } catch (error) {
        console.error("Failed to update user attributes:", error);
      }

      try {
        console.log("Loading GrowthBook features...");

        // Create a more aggressive timeout (2 seconds)
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("GrowthBook load timeout (2s)")), 2000),
        );

        // Wrap loadFeatures in a promise that resolves immediately if it takes too long
        const loadFeaturesPromise = growthbook.loadFeatures().catch((error) => {
          console.warn("GrowthBook loadFeatures failed:", error);
          return Promise.resolve(); // Convert failure to success
        });

        await Promise.race([loadFeaturesPromise, timeoutPromise]);

        console.log("GrowthBook features loaded successfully");
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load GrowthBook features:", error);
        setLoadingError(
          error instanceof Error ? error.message : "Unknown error",
        );
        console.log("Continuing without GrowthBook features (using local fallbacks)...");
        // Ensure local features are available
        growthbook.setFeatures(localFeatures);
        setIsLoaded(true); // Continue even if features fail to load
      }
    };

    initializeGrowthBook();

    // Listen for auth state changes to update user attributes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event);
      await updateUserAttributes();
    });

    // Cleanup on unmount
    return () => {
      subscription?.unsubscribe();
      growthbook.destroy();
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 mb-4">Loading features...</p>
          {loadingError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md max-w-md mx-auto">
              <p className="text-red-700 text-sm">
                Failed to load features: {loadingError}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              console.log("Manually skipping GrowthBook initialization");
              setIsLoaded(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Continue without features
          </button>
        </div>
      </div>
    );
  }

  return (
    <GrowthBookContext.Provider value={growthbook}>
      <UserAttributesContext.Provider
        value={{
          attributes: userAttributes,
          updateAttributes: updateUserAttributes,
        }}
      >
        {children}
      </UserAttributesContext.Provider>
    </GrowthBookContext.Provider>
  );
};

// Hook to use GrowthBook
export const useGrowthBook = () => {
  const context = useContext(GrowthBookContext);
  if (!context) {
    throw new Error("useGrowthBook must be used within a GrowthBookProvider");
  }
  return context;
};

// Hook to get feature flags easily
export const useFeatureFlag = (key: string, fallback: any = false) => {
  const growthbook = useGrowthBook();
  return growthbook.getFeatureValue(key, fallback);
};

// Hook to check if feature is enabled (boolean features)
export const useFeatureEnabled = (key: string) => {
  const growthbook = useGrowthBook();
  // Use getFeatureValue with false fallback instead of isOn for better error handling
  return growthbook.getFeatureValue(key, false);
};

// Hook to access user attributes
export const useUserAttributes = () => {
  const context = useContext(UserAttributesContext);
  if (!context) {
    throw new Error(
      "useUserAttributes must be used within a GrowthBookProvider",
    );
  }
  return context;
};
