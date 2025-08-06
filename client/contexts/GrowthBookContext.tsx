import React, { createContext, useContext, useEffect, useState } from 'react';
import { GrowthBook } from '@growthbook/growthbook-react';

// Create GrowthBook instance
const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-w1E948s82nX7yJ5u",
  enableDevMode: process.env.NODE_ENV === 'development',
  trackingCallback: (experiment, result) => {
    // Optional: Add analytics tracking here
    console.log('GrowthBook Experiment:', experiment.key, result);
  },
});

// Create context
const GrowthBookContext = createContext<GrowthBook>(growthbook);

// Provider component
export const GrowthBookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load feature definitions from GrowthBook
    growthbook.loadFeatures().then(() => {
      setIsLoaded(true);
    }).catch((error) => {
      console.error('Failed to load GrowthBook features:', error);
      setIsLoaded(true); // Continue even if features fail to load
    });

    // Cleanup on unmount
    return () => {
      growthbook.destroy();
    };
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading features...</p>
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
    throw new Error('useGrowthBook must be used within a GrowthBookProvider');
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
  return growthbook.isOn(key);
};
