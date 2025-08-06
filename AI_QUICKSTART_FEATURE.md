# AI-Powered Quickstart Flow

## Overview
The AI quickstart flow is a feature-flagged streamlined event creation process that allows users to create golf events quickly using AI-generated content.

## Feature Flag
- **Key**: `ai_quickstart_create_flow`
- **Type**: Boolean
- **Default**: `false`

## User Flow

### 1. Create Event Entry Point
- When users click "Create New Event" in `/app` (MyTrips page)
- If feature flag is **enabled**: Show modal with two options
- If feature flag is **disabled**: Use original manual flow

### 2. Modal Options
Users can choose between:
- **Quick Start with AI** (2-3 minutes)
- **Enter Details Manually** (10-15 minutes, original flow)

### 3. AI Quick Start Form
Collects only essential information:
- **Courses to Play**: Multi-select from existing course database
- **Trip Dates**: Start and end date pickers
- **Players**: Add player names (generates placeholder emails)
- **Occasion**: Dropdown with predefined options

### 4. AI Generation Process
Shows loading state: "Building your event site with AI magic..."

Generates:
- Event name (contextual to occasion)
- Event description (1-2 sentences)
- Scoring format (defaults to Stroke Play)
- Travel details with getting there info
- Accommodation suggestions
- Daily itinerary based on selected courses

### 5. Database Storage
Creates records in:
- `events` table (main event data)
- `event_courses` table (course associations)
- `event_players` table (player list)
- `event_travel` table (travel and accommodation info)

### 6. Completion
- Shows success confirmation
- Redirects to public event site (`/events/{slug}`)

## Technical Implementation

### Components
- `CreateEventModal`: Choice between AI and manual flow
- `AIQuickstartForm`: Complete AI quickstart experience

### Key Features
- **Feature flag integration**: Uses GrowthBook `ai_quickstart_create_flow`
- **Responsive design**: Works on mobile and desktop
- **Error handling**: Graceful fallbacks for API failures
- **Loading states**: Clear progress indicators
- **Slug generation**: Unique slugs with timestamp suffix

### Database Schema
Uses existing Supabase tables:
- Events table for main event data
- Event_courses for course associations
- Event_players for participant management
- Event_travel for travel information

## Testing

### Enable Feature Flag
1. Visit `/admin` page
2. Create or enable `ai_quickstart_create_flow` flag
3. Set value to `true`

### Test Flow
1. Go to `/app` (MyTrips page)
2. Click "Create New Event"
3. Select "Quick Start with AI"
4. Fill out the 4-field form
5. Submit and verify event creation
6. Check that redirect works to public event page

## Configuration

### Occasion Options
- Birthday
- Bachelor Party
- Annual Trip
- Guys Trip
- Family Reunion
- Work Trip
- Charity Event
- Tournament
- Celebration
- Weekend Getaway
- Other

### AI Generation Templates
Event names and descriptions are generated using context-aware templates based on:
- Selected occasion
- Course names
- Date range
- Group composition

## Future Enhancements
- Integration with actual AI API (OpenAI, Claude, etc.)
- More sophisticated content generation
- Photo selection for events
- Custom theme selection based on occasion
- Integration with external course APIs
- Email invitation system for players
