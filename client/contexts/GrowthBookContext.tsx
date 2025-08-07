import React, { createContext, useContext, useEffect, useState } from 'react';
import { GrowthBook } from '@growthbook-react';
import { supabase } from '@/lib/supabase';

// Helper functions to detect user attributes
const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
};

const getBrowser = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Safari')) return 'safari';
  if (ua.includes('Edge')) return 'edge';
  return 'other';
};

const getOperatingSystem = (): string => {
  const ua = navigator.userAgent;
  if (ua.includes('Mac')) return 'macos';
  if (ua.includes('Windows')) return 'windows';
  if (ua.includes('Linux')) return 'linux';
  if (ua.includes('Android')) return 'android';
  if (ua.includes('iOS')) return 'ios';
  return 'other';
};

const getTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return 'unknown';
  }
};

const getCountryFromTimezone = (timezone: string): string => {
  // Extract country from timezone (e.g., "America/New_York" -> "US")
  const timezoneToCountry: { [key: string]: string } = {
    'America/New_York': 'US',
    'America/Los_Angeles': 'US',
    'America/Chicago': 'US',
    'America/Denver': 'US',
    'Europe/London': 'GB',
    'Europe/Paris': 'FR',
    'Europe/Berlin': 'DE',
    'Asia/Tokyo': 'JP',
    'Australia/Sydney': 'AU',
    // Add more as needed
  };

  return timezoneToCountry[timezone] || 'unknown';
};

// Create GrowthBook instance
const growthbook = new GrowthBook({
  apiHost: import.meta.env.VITE_GROWTHBOOK_API_HOST || "https://cdn.growthbook.io",
  clientKey: import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY || "sdk-w1E948s82nX7yJ5u",
  enableDevMode: import.meta.env.DEV,
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
