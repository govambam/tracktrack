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
  const [userAttributes, setUserAttributes] = useState<any>({});

  // Function to set user attributes
  const updateUserAttributes = async () => {
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();

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
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Get user's event count and other stats
        const { count: eventCount } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .eq('created_by', session.user.id);

        // Calculate account age in days
        const accountAge = session.user.created_at
          ? Math.floor((Date.now() - new Date(session.user.created_at).getTime()) / (1000 * 60 * 60 * 24))
          : 0;

        // User-specific attributes
        const userSpecificAttributes = {
          // Core user data
          id: session.user.id,
          email: session.user.email,
          emailDomain: session.user.email?.split('@')[1] || '',

          // Profile data
          name: profile?.full_name || '',
          fullName: profile?.full_name || '',
          handicap: profile?.handicap || null,
          hasHandicap: !!(profile?.handicap),
          handicapRange: profile?.handicap ? getHandicapRange(profile.handicap) : null,
          location: profile?.location || '',
          bio: profile?.bio || '',
          hasProfileImage: !!(profile?.avatar_url),

          // Account metadata
          isEmailConfirmed: !!(session.user.email_confirmed_at),
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
        attributes.id = 'anonymous';
        attributes.userType = 'anonymous';
        attributes.isAuthenticated = false;
      }

      setUserAttributes(attributes);
      growthbook.setAttributes(attributes);

      console.log('GrowthBook attributes set:', attributes);

    } catch (error) {
      console.error('Error setting GrowthBook attributes:', error);
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
      await updateUserAttributes();

      try {
        await growthbook.loadFeatures();
        setIsLoaded(true);
      } catch (error) {
        console.error('Failed to load GrowthBook features:', error);
        setIsLoaded(true); // Continue even if features fail to load
      }
    };

    initializeGrowthBook();

    // Listen for auth state changes to update user attributes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
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
