# Event Invitations UX Testing Guide

This guide explains how to test the complete event invitations user experience that was just implemented.

## Overview

The system now supports:
- ✅ **Auto-acceptance**: When invited users log in, they automatically accept pending invitations
- ✅ **Mixed Event View**: "My Events" shows both owned and invited events
- ✅ **Role-based Buttons**: Different button sets based on user role (owner/admin/player)
- ✅ **Visual Indicators**: Badge showing user's role in each event

## Updated UI Features

### My Events Page Changes

1. **Page Title & Description**
   - Title: "My Events" 
   - Description: "Manage your events and participate in tournaments you've been invited to"

2. **Event Cards Now Show**
   - **Role Badge**: Owner/Admin/Player badge next to event name
   - **Role-based Buttons**:
     - **Owners/Admins**: "View Site", "Enter Scores", "Edit Details"
     - **Players**: "View Site", "Enter Scores"

3. **Updated Stats**
   - Total Events shows: "X owned, Y invited"

4. **Auto-invitation Acceptance**
   - When users log in, pending invitations are automatically accepted
   - Users immediately see invited events in their list

## Testing Steps

### Step 1: Create Test Events and Invitations

1. **Create a test event** (as User A):
   ```bash
   # Use the AI quickstart or manual creation flow
   # This user becomes the "owner"
   ```

2. **Invite a player** (still as User A):
   ```bash
   curl -X POST http://localhost:3000/api/events/EVENT_ID/invite \
     -H "Authorization: Bearer USER_A_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testplayer@example.com",
       "role": "player"
     }'
   ```

3. **Invite an admin** (still as User A):
   ```bash
   curl -X POST http://localhost:3000/api/events/EVENT_ID/invite \
     -H "Authorization: Bearer USER_A_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "email": "testadmin@example.com", 
       "role": "admin"
     }'
   ```

### Step 2: Test Player Experience

1. **Sign up/Login as testplayer@example.com**
2. **Navigate to "My Events"**
3. **Verify**:
   - Event appears in the list
   - Shows "Player" badge
   - Has buttons: "View Site", "Enter Scores" (no "Edit Details")
   - Stats show "0 owned, 1 invited"

### Step 3: Test Admin Experience

1. **Sign up/Login as testadmin@example.com**
2. **Navigate to "My Events"**
3. **Verify**:
   - Event appears in the list
   - Shows "Admin" badge
   - Has buttons: "View Site", "Enter Scores", "Edit Details"
   - Stats show "0 owned, 1 invited"

### Step 4: Test Owner Experience

1. **Login as User A (event creator)**
2. **Navigate to "My Events"**
3. **Verify**:
   - Event appears in the list
   - Shows "Owner" badge
   - Has buttons: "View Site", "Enter Scores", "Edit Details"
   - Stats show "1 owned, 0 invited"

### Step 5: Test Button Functionality

1. **View Site**: Should open public event page in new tab
2. **Enter Scores**: Should navigate to leaderboard/scoring page
3. **Edit Details**: Should navigate to event edit interface (only for owners/admins)

## Expected Behavior

### Auto-acceptance Flow
```
1. User receives invitation email → invited_email stored in event_players
2. User creates account with same email → user_id linked to profiles
3. User logs in → accept_event_invitation_by_user() auto-runs
4. invitation status changes from 'invited' → 'accepted'
5. invited_email cleared, user_id set
6. Event appears in "My Events"
```

### Database State After Testing

```sql
-- Check invitations were processed correctly
SELECT 
  e.name as event_name,
  ep.full_name,
  ep.role,
  ep.status,
  ep.user_id IS NOT NULL as is_linked_user,
  ep.invited_email
FROM event_players ep
JOIN events e ON e.id = ep.event_id
ORDER BY e.name, ep.role;
```

## Troubleshooting

### Issue: Invited events don't show up
**Check**: 
1. RPC function `accept_event_invitation_by_user` exists
2. User's email matches the invited_email exactly
3. Console logs in browser show auto-acceptance running

### Issue: Wrong buttons showing
**Check**:
1. User role is correctly set in database
2. Event has correct `created_by` field
3. Browser console for any JavaScript errors

### Issue: Auto-acceptance not working
**Check**:
1. profiles table has correct email for user
2. event_players has matching invited_email
3. RPC function permissions are correct

## API Endpoints for Manual Testing

```bash
# Get event players (to verify roles)
curl -X GET http://localhost:3000/api/events/EVENT_ID/players \
  -H "Authorization: Bearer TOKEN"

# Test RPC function directly
SELECT accept_event_invitation_by_user('USER_UUID');
```

## Success Criteria

✅ Invited users see events immediately after login  
✅ Role badges display correctly (Owner/Admin/Player)  
✅ Button sets match user permissions  
✅ Stats accurately reflect owned vs invited events  
✅ All button actions work correctly  
✅ No duplicate events for users with multiple roles  

The invitation system creates a seamless experience where invited players just need to create an account and their events automatically appear in "My Events" with appropriate permissions.
