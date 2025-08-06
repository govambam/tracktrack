# Event Invitations System

This document describes the event invitations system that allows event creators to invite players with different roles and permissions.

## Overview

The system supports:

- **Event Ownership**: Events have a `created_by` field that establishes ownership
- **Role-based Invitations**: Players can be invited as 'player' (default) or 'admin'
- **Pending Invitations**: Support for inviting users who haven't signed up yet
- **Auto-linking**: Existing users are automatically linked when invited by email

## Database Schema Changes

### Events Table

- Added `created_by` column that references `auth.users(id)`
- Maintains `user_id` for backwards compatibility
- Updated RLS policies to support role-based access

### Event Players Table

Updated with new columns:

- `user_id`: UUID reference to `auth.users(id)` (for registered users)
- `role`: TEXT ('player' or 'admin')
- `invited_email`: TEXT (for pending invitations)
- `status`: TEXT ('invited', 'accepted', 'declined', 'pending')

### Constraints

- Either `user_id` OR `invited_email` must be present (not both)
- Existing players are automatically linked to registered users where email matches

## API Endpoints

### POST /api/events/:id/invite

Invite a player to an event.

**Headers:**

```
Authorization: Bearer <token>
Content-Type: application/json
```

**Body:**

```json
{
  "email": "player@example.com",
  "role": "player" // optional, defaults to "player"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Player invited successfully",
  "user_exists": true
}
```

### POST /api/events/:id/accept-invitation

Accept an event invitation (for authenticated users).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "message": "Invitation accepted successfully"
}
```

### GET /api/events/:id/players

Get all players for an event (including pending invitations).

**Headers:**

```
Authorization: Bearer <token>
```

**Response:**

```json
{
  "success": true,
  "players": [
    {
      "id": "uuid",
      "event_id": "uuid",
      "user_id": "uuid",
      "role": "admin",
      "status": "accepted",
      "full_name": "John Doe",
      "email": "john@example.com",
      "handicap": 10.5,
      "is_registered_user": true
    },
    {
      "id": "uuid",
      "event_id": "uuid",
      "invited_email": "pending@example.com",
      "role": "player",
      "status": "invited",
      "full_name": "pending@example.com",
      "is_registered_user": false
    }
  ]
}
```

## Supabase Functions

### invite_player_to_event(p_event_id, p_email, p_role)

RPC function to invite a player to an event.

**Parameters:**

- `p_event_id`: UUID of the event
- `p_email`: Email of the player to invite
- `p_role`: Role to assign ('player' or 'admin')

**Returns:**

```json
{
  "success": true,
  "message": "Player invited successfully",
  "user_exists": true
}
```

**Permission Checks:**

- Only event creator (`created_by`) can invite players
- Event admins (role='admin', status='accepted') can invite players
- Cannot invite same email twice

### accept_event_invitation(p_event_id)

RPC function for users to accept their invitation.

**Parameters:**

- `p_event_id`: UUID of the event

**Returns:**

```json
{
  "success": true,
  "message": "Invitation accepted successfully"
}
```

## Row Level Security (RLS) Policies

### Events Table

- **View**: Users can view events they created OR events they're invited to
- **Create**: Users can create events (sets created_by = auth.uid())
- **Update**: Event creators and admins can update events
- **Delete**: Only event creators can delete events

### Event Players Table

- **View**: Users can view players for events they have access to
- **Manage**: Event creators and admins can manage players

## Testing Instructions

### 1. Apply Schema Changes

Run the SQL migration:

```bash
# Apply the schema changes to your Supabase database
psql -h your-host -U your-user -d your-db -f add_event_invitations_schema.sql
```

### 2. Test Event Creation

Create an event and verify `created_by` is set:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Golf Event",
    "start_date": "2024-06-01",
    "end_date": "2024-06-03",
    "location": "Test Golf Course"
  }'
```

### 3. Test Player Invitation

Invite a player to the event:

```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "player@example.com",
    "role": "player"
  }'
```

### 4. Test Admin Invitation

Invite an admin:

```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/invite \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "role": "admin"
  }'
```

### 5. Test Player List

Get all players for the event:

```bash
curl -X GET http://localhost:3000/api/events/EVENT_ID/players \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 6. Test Invitation Acceptance

As an invited user, accept the invitation:

```bash
curl -X POST http://localhost:3000/api/events/EVENT_ID/accept-invitation \
  -H "Authorization: Bearer INVITED_USER_TOKEN"
```

## Error Handling

Common error responses:

**Authentication Required:**

```json
{
  "error": "No authorization header"
}
```

**Permission Denied:**

```json
{
  "error": "Only event creator or admins can invite players"
}
```

**Already Invited:**

```json
{
  "error": "Player already invited or added to event"
}
```

**Invalid Role:**

```json
{
  "error": "Invalid role. Must be player or admin"
}
```

## Next Steps

This backend implementation is complete and ready for UI integration. Future enhancements could include:

1. **Email Notifications**: Send actual invitation emails
2. **Bulk Invitations**: Invite multiple players at once
3. **Invitation Expiry**: Add expiration dates to invitations
4. **Event Access Levels**: More granular permissions beyond player/admin
5. **Invitation Links**: Generate shareable invitation URLs
