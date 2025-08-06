import { useFeatureFlag, useFeatureEnabled } from '@/contexts/GrowthBookContext';

// Define your feature flag keys here for type safety
export type FeatureFlagKey = 
  | 'new-ui-design'
  | 'button-color'
  | 'max-users-limit'
  | 'welcome-message'
  | 'enable-dark-mode'
  | 'show-advanced-features'
  | 'beta-leaderboard'
  | 'enhanced-scoring';

// Type-safe feature flag hooks
export const useTypedFeatureFlag = <T>(key: FeatureFlagKey, fallback: T): T => {
  return useFeatureFlag(key, fallback);
};

export const useTypedFeatureEnabled = (key: FeatureFlagKey): boolean => {
  return useFeatureEnabled(key);
};

// Predefined feature flag hooks for common flags
export const useNewUIDesign = () => useFeatureEnabled('new-ui-design');
export const useButtonColor = () => useFeatureFlag('button-color', 'default');
export const useMaxUsersLimit = () => useFeatureFlag('max-users-limit', 100);
export const useWelcomeMessage = () => useFeatureFlag('welcome-message', 'Welcome to GolfOS!');
export const useDarkModeEnabled = () => useFeatureEnabled('enable-dark-mode');
export const useAdvancedFeaturesEnabled = () => useFeatureEnabled('show-advanced-features');
export const useBetaLeaderboard = () => useFeatureEnabled('beta-leaderboard');
export const useEnhancedScoring = () => useFeatureEnabled('enhanced-scoring');

// Utility for checking multiple flags at once
export const useMultipleFeatureFlags = (flags: FeatureFlagKey[]) => {
  return flags.reduce((acc, flag) => {
    acc[flag] = useFeatureEnabled(flag);
    return acc;
  }, {} as Record<FeatureFlagKey, boolean>);
};
