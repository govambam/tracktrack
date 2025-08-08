import React, { createContext, useContext, useEffect, useState } from "react";
import { GrowthBook } from "@growthbook/growthbook-react";

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

// Create GrowthBook instance with proper remote loading
const createGrowthBookInstance = () => {
  const apiHost = import.meta.env.VITE_GROWTHBOOK_API_HOST || "https://cdn.growthbook.io";
  const clientKey = import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY || "sdk-w1E948s82nX7yJ5u";

  console.log("Creating GrowthBook instance with:", { apiHost, clientKey });

  const gb = new GrowthBook({
    apiHost,
    clientKey,
    enableDevMode: import.meta.env.DEV,
    trackingCallback: (experiment, result) => {
      console.log("GrowthBook Experiment:", experiment.key, result);
    },
    subscribeToChanges: false, // Disable real-time updates for stability
    backgroundSync: false, // Disable background syncing
    features: localFeatures, // Set local features as fallback
  });

  return gb;
};

const growthbook = createGrowthBookInstance();

// Create context
const GrowthBookContext = createContext<GrowthBook>(growthbook);

// Provider component that loads remote features
export const GrowthBookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  useEffect(() => {
    const initializeGrowthBook = async () => {
      console.log("Initializing GrowthBook...");

      try {
        console.log("Loading GrowthBook features from remote...");

        // Create a timeout promise (3 seconds)
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error("GrowthBook load timeout (3s)")), 3000)
        );

        // Try to load features with timeout
        await Promise.race([growthbook.loadFeatures(), timeoutPromise]);

        console.log("GrowthBook features loaded successfully from remote");
        console.log("Available features:", growthbook.getFeatures());
        setIsLoaded(true);
      } catch (error) {
        console.error("Failed to load GrowthBook features:", error);
        setLoadingError(error instanceof Error ? error.message : "Unknown error");
        console.log("Continuing with local fallback features...");

        // Ensure local features are available as fallback
        growthbook.setFeatures(localFeatures);
        setIsLoaded(true);
      }
    };

    initializeGrowthBook();
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600 mb-2">Loading features...</p>
          {loadingError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md max-w-md mx-auto">
              <p className="text-yellow-700 text-sm">
                Using local features: {loadingError}
              </p>
            </div>
          )}
          <button
            onClick={() => {
              console.log("Manually continuing with local features");
              growthbook.setFeatures(localFeatures);
              setIsLoaded(true);
            }}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
          >
            Continue with local features
          </button>
        </div>
      </div>
    );
  }

  return (
    <GrowthBookContext.Provider value={growthbook}>
      {children}
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
  return growthbook.getFeatureValue(key, false);
};

// Simplified hook for user attributes (returns empty object for now)
export const useUserAttributes = () => {
  const attributes = {};
  const updateAttributes = async () => {
    console.log("useUserAttributes: updateAttributes called (no-op)");
  };

  return {
    attributes,
    updateAttributes,
  };
};
