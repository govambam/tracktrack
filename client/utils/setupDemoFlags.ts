import { featureFlagUtils } from '@/lib/growthbookApi';

// Quick setup function for demo flags
export async function setupGrowthBookDemo() {
  console.log('🚀 Setting up GrowthBook demo flags...');
  
  try {
    // Create demo flags
    const flags = await featureFlagUtils.setupDemoFlags();
    
    // Enable some flags with interesting values
    await featureFlagUtils.setBooleanFlag('new-ui-design', true);
    await featureFlagUtils.setStringFlag('button-color', 'blue');
    await featureFlagUtils.setNumberFlag('max-users-limit', 250);
    await featureFlagUtils.setStringFlag('welcome-message', 'Welcome to the future of golf events! 🏌️‍♂️');
    await featureFlagUtils.setBooleanFlag('beta-leaderboard', true);
    
    console.log('✅ Demo flags created and configured successfully!');
    console.log('🎯 Created flags:', flags.map(f => f.key));
    
    return {
      success: true,
      flags: flags.map(f => f.key),
      message: 'Demo flags created successfully!'
    };
  } catch (error) {
    console.error('❌ Failed to setup demo flags:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create demo flags'
    };
  }
}

// Utility to reset all demo flags to default values
export async function resetDemoFlags() {
  console.log('🔄 Resetting demo flags to defaults...');
  
  try {
    await featureFlagUtils.setBooleanFlag('new-ui-design', false);
    await featureFlagUtils.setStringFlag('button-color', 'default');
    await featureFlagUtils.setNumberFlag('max-users-limit', 100);
    await featureFlagUtils.setStringFlag('welcome-message', 'Welcome to GolfOS!');
    await featureFlagUtils.setBooleanFlag('beta-leaderboard', false);
    await featureFlagUtils.setBooleanFlag('enable-dark-mode', false);
    
    console.log('✅ Demo flags reset successfully!');
    return { success: true, message: 'Demo flags reset to defaults' };
  } catch (error) {
    console.error('❌ Failed to reset demo flags:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to reset demo flags'
    };
  }
}

// Make functions available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).setupGrowthBookDemo = setupGrowthBookDemo;
  (window as any).resetDemoFlags = resetDemoFlags;
  console.log('🔧 Demo utilities available: setupGrowthBookDemo(), resetDemoFlags()');
}
