# Courses Sync Implementation

## Problem Solved
The customizations/courses view was showing "no courses found" because course data was being stored in `event_rounds` table but the customizations interface was looking for data in the `event_courses` table.

## Solution Implemented

### 🔄 **Automatic Sync System**
- **Auto-sync on round save**: When rounds are saved (create or edit flow), unique courses are automatically extracted and synced to `event_courses`
- **Deduplication**: Multiple rounds at the same course only create one entry in `event_courses`
- **Display ordering**: Courses maintain the order they first appear in the rounds

### 📍 **Integration Points**

#### 1. **TripCreationContext.tsx**
- Added `syncCoursesToEventCourses()` function
- Integrated sync call in `saveRounds()` function
- Added sync check in `loadCompleteEvent()` for existing events
- Automatic sync handles both create and edit flows

#### 2. **CoursesCustomization.tsx** 
- Enhanced empty state with "Sync Courses from Rounds" button
- Manual sync functionality for existing events
- Proper error handling and user feedback
- Loading states during sync operations

### 🗃️ **Database Schema**
The sync creates entries in `event_courses` with:
- `event_id`: Links to the event
- `name`: Course name from `event_rounds.course_name`
- `display_order`: Order courses appear in rounds
- Customizable fields: `par`, `yardage`, `description`, `image_url`, `weather_note`

### ⚡ **Automatic Triggers**
Sync happens automatically when:
1. **Creating events**: Rounds saved during event creation flow
2. **Editing rounds**: Rounds modified in edit view  
3. **Loading events**: Existing events without `event_courses` entries
4. **Manual sync**: User clicks "Sync Courses from Rounds" button

### 🔧 **Manual Recovery**
For existing events that need sync:
1. **UI Button**: Available in customizations/courses empty state
2. **SQL Script**: `sync_existing_courses.sql` for bulk operations
3. **Automatic detection**: System detects missing courses and syncs on load

## Benefits

### ✅ **Seamless User Experience**
- Courses automatically appear in customizations after adding rounds
- No manual course creation required
- Existing events work without user intervention

### ✅ **Data Consistency**
- Single source of truth: rounds define available courses
- Automatic deduplication prevents duplicate entries
- Maintains relationship between rounds and course customizations

### ✅ **Backward Compatibility**  
- Existing events automatically sync when loaded
- Manual sync option for edge cases
- No data loss or migration required

## Usage Flow

1. **User creates/edits rounds** in Courses section
2. **System automatically syncs** unique courses to `event_courses`
3. **Customizations/courses page** now shows available courses
4. **User customizes** course details (description, images, etc.)
5. **Customizations persist** independently of round changes

The system ensures that users can always customize their course information without needing to manually manage the relationship between rounds and courses.
