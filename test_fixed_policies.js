// Test script to verify the fixed RLS policies work with actual application queries
// Run this in browser console to test the fixes

const testFixedPolicies = async () => {
  console.log("🧪 Testing Fixed RLS Policies...");
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      console.log("❌ No session - testing with anonymous access");
    } else {
      console.log("✅ Testing with user session:", session.user.id);
    }
    
    // Test 1: Simple event_players query (was failing with recursion)
    console.log("\n🔍 Test 1: Simple event_players query");
    const { data: players, error: playersError } = await supabase
      .from('event_players')
      .select('id, full_name, role, status')
      .limit(3);
      
    if (playersError) {
      console.error("❌ Players query failed:", playersError);
    } else {
      console.log("✅ Players query succeeded:", players?.length || 0, "results");
    }
    
    // Test 2: The original failing invited events query
    console.log("\n🔍 Test 2: Invited events query (original failing query)");
    const { data: invitedEvents, error: invitedError } = await supabase
      .from('event_players')
      .select(`
        role,
        status,
        events:event_id (
          id, name, description, start_date, end_date, location, logo_url,
          is_private, is_published, slug, created_at, updated_at, created_by
        )
      `)
      .eq('user_id', session?.user?.id || '00000000-0000-0000-0000-000000000000')
      .eq('status', 'accepted')
      .order('created_at', { ascending: false });
      
    if (invitedError) {
      console.error("❌ Invited events query failed:", invitedError);
    } else {
      console.log("✅ Invited events query succeeded:", invitedEvents?.length || 0, "results");
    }
    
    // Test 3: Players query for a specific event (PlayersEdit failing query)
    console.log("\n🔍 Test 3: Players for specific event query");
    
    // First get an event ID
    const { data: events } = await supabase
      .from('events')
      .select('id')
      .limit(1);
      
    if (events && events.length > 0) {
      const eventId = events[0].id;
      console.log("   Testing with event ID:", eventId);
      
      const { data: eventPlayers, error: eventPlayersError } = await supabase
        .from('event_players')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at');
        
      if (eventPlayersError) {
        console.error("❌ Event players query failed:", eventPlayersError);
      } else {
        console.log("✅ Event players query succeeded:", eventPlayers?.length || 0, "results");
      }
    }
    
    // Test 4: Check RLS policy permissions
    console.log("\n🔍 Test 4: RLS policy verification");
    
    // Try to access a published event's players (should work)
    const { data: publicPlayers, error: publicError } = await supabase
      .from('event_players')
      .select(`
        full_name,
        events:event_id!inner (
          name,
          is_published
        )
      `)
      .eq('events.is_published', true)
      .limit(3);
      
    if (publicError) {
      console.error("❌ Public players query failed:", publicError);
    } else {
      console.log("✅ Public players query succeeded:", publicPlayers?.length || 0, "results");
    }
    
    console.log("\n🎉 Policy testing complete!");
    
  } catch (error) {
    console.error("❌ Test script error:", error);
  }
};

// Usage: testFixedPolicies()
console.log("Test script loaded. Run: testFixedPolicies()");
