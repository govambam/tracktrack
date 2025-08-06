# Draft Preview Feature

## Overview

The Draft Preview feature has been revamped to provide a better user experience for previewing golf events during the editing process. Instead of opening a new tab, it now opens as a modal overlay that provides a perfect clone of the public event site with additional draft-specific features.

## Key Features

### 1. Modal-Based Preview
- Opens as a full-screen modal instead of a new browser tab
- Maintains context within the editing interface
- Easy to close and return to editing

### 2. Live Theme Switching
- Top toolbar with theme selector showing color previews
- Real-time theme switching with instant visual feedback
- Supports all three themes: GolfOS, TourTech, and Masters
- Theme changes are automatically saved to the database

### 3. Draft Mode Indicators
- Clear "Draft Preview" badges in the header and overlay
- Visual distinction from the actual public event site
- Prevents confusion about whether changes are live

### 4. Seamless Navigation
- "Back to Edit" button returns to the event settings
- "Edit Settings" button for quick access to configuration
- Maintains editing workflow without losing context

## Technical Implementation

### Components Created/Modified

**1. `client/components/DraftPreviewModal.tsx` (New)**
- Main modal component that wraps the public event site
- Handles theme switching and state management
- Provides draft-specific UI elements and navigation

**2. `client/pages/PublicEventHome.tsx` (Modified)**
- Updated to accept optional props for draft mode usage
- Added `forceTheme` prop to override the event's saved theme
- Enhanced theme computation to support real-time switching
- Maintains backward compatibility for normal public usage

**3. `client/pages/edit/SettingsEdit.tsx` (Modified)**
- Updated "Edit Draft Site" button to "Preview Draft Site"
- Integrated DraftPreviewModal component
- Button now opens modal instead of new tab

### Key Technical Features

**Theme Override System:**
```typescript
// PublicEventHome now accepts optional props
interface PublicEventHomeProps {
  slug?: string;
  forceTheme?: string;
}

// Theme computation supports forced themes
const currentTheme = forceTheme || eventData?.theme || 'GolfOS';
```

**Live Theme Switching:**
- Real-time database updates when theme is changed
- Instant visual feedback without page reload
- Automatic save with error handling and rollback

**Modal Architecture:**
- Uses Radix UI Dialog primitive for accessibility
- Full-screen modal with proper overlay
- Responsive design that works on all screen sizes

## User Experience Improvements

### Before
- Clicking "Edit Draft Site" opened a new browser tab
- Users had to manage multiple tabs
- Theme switching required navigating to settings
- Confusing workflow between draft and live editing

### After
- Single modal overlay maintains editing context
- Live theme preview with instant switching
- Clear visual indicators for draft mode
- Streamlined workflow with easy navigation back to editing

## Theme Switching Interface

The theme selector in the draft preview shows:
- Visual color swatches for each theme
- Theme name and description
- Real-time preview of changes
- Loading state during database updates
- Error handling with automatic rollback

Available themes:
1. **GolfOS** - Colorful, playful design with bright accents
2. **TourTech** - Professional, enterprise-ready design  
3. **Masters** - Prestigious, traditional design inspired by Augusta National

## Future Enhancements

Potential future improvements:
1. **Inline Editing** - Add click-to-edit functionality within the preview
2. **Mobile Preview** - Device-specific preview modes
3. **Version History** - Compare different theme/content versions
4. **Performance Optimization** - Lazy loading of theme components
5. **Custom Themes** - Allow users to create custom color schemes

## Usage

1. Navigate to any event's Settings page
2. Click "Preview Draft Site" button
3. Modal opens showing the public event site
4. Use theme selector to switch between themes in real-time
5. Click "Back to Edit" or "Edit Settings" to return to editing
6. Changes are automatically saved to the database

The feature provides a comprehensive preview experience that mirrors the actual public event site while maintaining the editing workflow context.
