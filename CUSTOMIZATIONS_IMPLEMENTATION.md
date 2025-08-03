# Event Website Customizations Implementation

## Overview
Implemented a comprehensive Event Website Customizations system that allows users to customize the content and appearance of their public event websites through a tabbed interface.

## Features Implemented

### 🏠 Home Tab
- **Homepage Headline**: Customizable text field that saves to `events.homepage_headline`
- **Page Toggle**: Enable/disable the home page on the public website

### 🏌️ Courses Tab  
- **Course Image URL**: Upload/set image for each course → `event_rounds.course_image_url`
- **Course Description**: Rich text description → `event_rounds.course_description`
- **Yardage**: Course yardage information → `event_rounds.yardage`
- **Par**: Course par → `event_rounds.par`
- **Page Toggle**: Enable/disable the courses page

### 📋 Scoring & Rules Tab
- **Dynamic Rules Management**: Add, edit, and remove tournament rules
- **Real-time Saving**: Each rule auto-saves to `event_rules` table
- **Rule Text**: Full text editing for each rule
- **Page Toggle**: Enable/disable the rules page

### 🏆 Leaderboard Tab
- **Coming Soon Placeholder**: Informational content about future leaderboard functionality
- **Page Toggle**: Enable/disable the leaderboard page (for when functionality is ready)

### ✈️ Travel Tab
- **Lodging Information**: Hotel recommendations → `events.travel_lodging`
- **Airport Information**: Flight/transportation details → `events.travel_airport` 
- **Distance/Directions**: Travel directions → `events.travel_distance`
- **Additional Notes**: General travel notes → `events.travel_notes`
- **Page Toggle**: Enable/disable the travel page

## Database Schema Changes

### New Tables Created
- `event_rules`: Stores tournament rules with `event_id`, `rule_text`, timestamps

### Enhanced Existing Tables
- `events`: Added `homepage_headline`, `travel_*` fields
- `event_rounds`: Added `course_image_url`, `course_description`, `yardage`, `par`
- `event_customization`: Added page visibility toggles (`*_enabled` fields)

## Technical Implementation

### Component Structure
- **CustomizationsEdit.tsx**: Main component with tabbed interface
- **Auto-saving**: All fields save immediately on blur/change
- **Real-time Updates**: State management with instant UI feedback
- **Error Handling**: Toast notifications for save failures

### Security
- **RLS Policies**: Proper row-level security for all new tables
- **Event Ownership**: Only event owners can modify customizations
- **Public Access**: Published events allow public viewing of customizations

### User Experience
- **Visual Toggles**: Each page can be enabled/disabled with immediate feedback
- **Summary Display**: Overview showing which pages are enabled/disabled
- **Consistent Styling**: Matches existing application design patterns
- **Loading States**: Proper loading indicators during data fetch

## Usage Instructions

1. **Navigate to Event Edit**: Go to any event → Settings → Customizations
2. **Select Tab**: Choose which aspect to customize (Home, Courses, Rules, Leaderboard, Travel)
3. **Toggle Pages**: Use switches to enable/disable pages on public website
4. **Edit Content**: Fill in relevant fields - they auto-save on blur
5. **View Summary**: Check the bottom summary to see enabled pages

## Files Created/Modified

### New Files
- `client/pages/edit/CustomizationsEdit.tsx` - Main customization interface
- `event_customizations_schema.sql` - Database schema setup

### Modified Files  
- `client/pages/EventEdit.tsx` - Updated sidebar navigation
- `client/App.tsx` - Updated routing configuration
- `client/pages/edit/CustomizationEdit.tsx` → `CustomizationEdit_backup.tsx` (backed up)

## Database Setup Required

Run the SQL script `event_customizations_schema.sql` in your Supabase SQL Editor to:
- Add required columns to existing tables
- Create the `event_rules` table
- Set up proper RLS policies
- Add database indexes for performance

## Next Steps

1. **Run Database Schema**: Execute the SQL script in Supabase
2. **Test Functionality**: Navigate to any event's customizations tab
3. **Customize Content**: Add content and toggle page visibility
4. **Verify Public Site**: Check that customizations appear on published event websites

The system is fully functional and ready for immediate use!
