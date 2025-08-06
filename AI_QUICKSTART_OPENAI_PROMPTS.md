# AI Quickstart OpenAI Prompts

The AI Quickstart feature now uses actual OpenAI GPT-4 integration to generate personalized content for golf events. Here are the detailed prompts being used:

## API Configuration

- **Model**: GPT-4
- **Temperature**: 0.8
- **Max Tokens**: 300
- **API Endpoint**: `/api/generate-description`

## 1. Event Name Generation

**Function**: `generateEventName()`

**Context Provided**:

- Occasion type
- Course names and locations
- Event dates
- Number of players

**Prompt Template**:

```
Generate a creative and engaging golf event name for a {occasion} golf trip.

Event Details:
- Occasion: {occasion}
- Dates: {startDate} to {endDate}, {year}
- Courses: {courseNames}
- Locations: {courseLocations}
- Players: {playerCount} golfers

Requirements:
- Should be catchy and memorable
- Appropriate for a {occasion}
- Golf-themed but not overly serious
- Between 2-6 words
- No quotes or punctuation
- Consider the course names and locations for inspiration

Examples for reference:
- Birthday: "Birthday Golf Getaway"
- Bachelor Party: "Last Swing Before the Ring"
- Guys Trip: "The Boys Golf Weekend"
- Annual Trip: "Annual Golf Adventure"
- Tournament: "Championship Golf Classic"

Generate ONE event name only:
```

## 2. Event Description Generation

**Function**: `generateEventDescription()`

**Context Provided**:

- Occasion type
- Course names and locations
- Event dates
- Number of players
- Entry fee information
- Scoring format

**Prompt Template**:

```
Write an engaging event description for a golf event with these details:

Event Type: {occasion}
Dates: {startDate} to {endDate}, {year}
Courses: {courseNames}
Locations: {courseLocations}
Players: {playerCount} golfers
Entry Fee: {hasEntryFee ? $entryFee per player : No entry fee}
Scoring: Stableford format with skills contests

Requirements:
- Warm and inviting tone
- Mention the occasion and dates
- Reference the courses being played
- 2-3 sentences maximum
- Exciting but not overly promotional
- Include anticipation about the experience
- Professional but friendly

Write the description:
```

## 3. Travel Information ("Getting There")

**Function**: `generateTravelInfo()`

**Context Provided**:

- Occasion type
- Course locations
- Event dates
- Number of players
- Course names

**Prompt Template**:

```
Create helpful travel information for a {occasion} golf trip with these details:

Event: {occasion}
Dates: {startDate} to {endDate}, {year}
Location: {primaryLocation}
Players: {playerCount} golfers
Courses: {courseNames}

Write a "Getting There" section with:
- Travel recommendations and timing
- Transportation options (fly, drive, charter)
- Arrival timing suggestions
- Practical travel tips for golf trips
- Friendly and helpful tone

Format as markdown with headers. Keep it informative and limit response to 100 words or less:
```

## 4. Accommodations Information

**Function**: `generateAccommodations()`

**Context Provided**:

- Occasion type
- Course locations
- Number of players
- Course names

**Prompt Template**:

```
Create accommodation recommendations for a {occasion} golf trip with these details:

Event: {occasion}
Location: {primaryLocation}
Players: {playerCount} golfers
Courses: {courseNames}

Write a "Where to Stay" section with:
- Types of accommodation options
- What to look for in golf-friendly lodging
- Group booking tips
- Budget considerations
- Location recommendations

Format as markdown with headers. Keep it helpful and practical. Limit response to 100 words or less:
```

## 5. Daily Schedule/Itinerary

**Function**: `generateDailySchedule()`

**Context Provided**:

- Occasion type
- Course names
- Event duration
- Number of players

**Prompt Template**:

```
Create a daily schedule for a {occasion} golf trip with these details:

Event: {occasion}
Duration: {courseCount} days
Players: {playerCount} golfers
Courses: {courseNames}

Write a "Daily Itinerary" section with:
- Day-by-day breakdown for each course
- Suggested timing for golf rounds
- Meal and social time recommendations
- Flexibility for weather/preferences
- Fun and appropriate tone for {occasion}

Format as markdown with headers. Include each course as a separate day. Limit response to 100 words or less:
```

## Error Handling & Fallbacks

Each OpenAI function includes robust error handling:

1. **Network/API Errors**: Falls back to template-based generation
2. **Rate Limiting**: Graceful degradation with pre-defined content
3. **Invalid Responses**: Validation and fallback content
4. **Missing API Key**: Automatic fallback to templates

## Example Generated Content

### Event Name Examples:

- **Birthday**: "Championship Birthday Classic"
- **Bachelor Party**: "Final Fairway Freedom"
- **Guys Trip**: "The Links Brothers Getaway"

### Event Description Examples:

- "Join us for an unforgettable birthday golf experience from August 12 to August 14. We'll be playing Pebble Beach Golf Links and Spyglass Hill, creating memories and celebrating in style with 8 golfers in beautiful Monterey, California."

### Travel Information Examples:

- AI generates location-specific travel advice
- Includes real transportation options
- Considers group size and occasion type
- Provides practical timing recommendations

## Benefits of OpenAI Integration

1. **Personalization**: Content tailored to specific occasions and locations
2. **Variety**: Unique content for each event creation
3. **Quality**: Professional, engaging copy that sounds natural
4. **Context-Aware**: Takes into account all event details
5. **Reliability**: Fallback system ensures functionality always works

The AI integration provides a significant upgrade from template-based content while maintaining reliability through comprehensive error handling and fallback systems.
