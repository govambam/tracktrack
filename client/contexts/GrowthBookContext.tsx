import React, { createContext, useContext } from "react";
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

// Create a simple GrowthBook instance with just local features
const createGrowthBookInstance = () => {
  console.log("Creating GrowthBook instance with local features only");

  const gb = new GrowthBook({
    // Use only local features, no remote loading
    features: localFeatures,
    enableDevMode: import.meta.env.DEV,
  });

  return gb;
};

const growthbook = createGrowthBookInstance();

// Create context
const GrowthBookContext = createContext<GrowthBook>(growthbook);

// Simple provider component that just provides the context
export const GrowthBookProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
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
  return {
    attributes: {},
    updateAttributes: async () => {},
  };
};
