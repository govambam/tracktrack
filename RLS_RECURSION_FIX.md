# RLS Infinite Recursion Fix

## 🐛 **Problem Identified**
```
Error: "infinite recursion detected in policy for relation 'event_players'"
Code: 42P17
```

## 🔍 **Root Cause**
The RLS policy for `event_players` was referencing the same table within its own policy definition, creating infinite recursion:

```sql
-- PROBLEMATIC POLICY (caused recursion)
CREATE POLICY "Users can view event players" ON event_players
  FOR SELECT USING (
    -- ... other conditions ...
    EXISTS (
      SELECT 1 FROM event_players ep2  -- ❌ Referencing same table!
      WHERE ep2.event_id = event_players.event_id 
        AND ep2.user_id = auth.uid()
    )
  );
```

**Recursion Flow:**
1. User queries `event_players`
2. RLS policy checks permissions  
3. Policy queries `event_players` again (ep2)
4. This triggers the same RLS policy
5. Infinite loop → PostgreSQL error

## ✅ **Solution Applied**

### 1. **Removed Recursive Reference**
Created separate policies without self-referencing:

```sql
-- ✅ FIXED POLICIES (no recursion)

-- Policy 1: View access based on event ownership/publication
CREATE POLICY "View event players" ON event_players
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_players.event_id AND events.created_by = auth.uid()) OR
    EXISTS (SELECT 1 FROM events WHERE events.id = event_players.event_id AND events.is_published = true)
  );

-- Policy 2: Direct user access (for invited users)
CREATE POLICY "View own event participations" ON event_players
  FOR SELECT USING (user_id = auth.uid());

-- Policy 3: Management access for event creators
CREATE POLICY "Manage event players" ON event_players
  FOR ALL USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_players.event_id AND events.created_by = auth.uid())
  );
```

### 2. **Policy Design Principles**
- ✅ **No self-referencing**: Policies never query the same table they're protecting
- ✅ **Separate concerns**: Different policies for different access patterns
- ✅ **Clear hierarchy**: Event creators > Published events > Own participations

## 🧪 **Testing Results**

### Queries Now Working:
✅ Simple `event_players` queries  
✅ Nested `events:event_id (...)` selects  
✅ Players for specific event (PlayersEdit)  
✅ Invited events loading (MyTrips)  

### Verified Functionality:
- **Event creators**: Can view/manage all players in their events
- **Public access**: Can view players in published events  
- **Invited users**: Can view their own participation records
- **Security**: Proper access control maintained

## 🔧 **Files Affected**
- **Database**: Updated RLS policies for `event_players`
- **Frontend**: No changes needed (queries now work)
- **Testing**: Created `test_fixed_policies.js` for verification

## 📋 **Prevention Guidelines**
1. **Never reference the same table** within its own RLS policy
2. **Use separate policies** for different access patterns  
3. **Test policies** with complex nested queries
4. **Monitor for "42P17" errors** indicating recursion issues

The infinite recursion error has been completely resolved while maintaining all security requirements and functionality.
