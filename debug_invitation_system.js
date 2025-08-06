// Debugging script for invitation system issues
// Run in browser console when errors occur

const debugInvitationSystem = async () => {
  console.log("🔍 Debugging Invitation System...");
  
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error("❌ Session error:", sessionError);
      return;
    }
    
    if (!session) {
      console.log("❌ No active session");
      return;
    }
    
    console.log("✅ Active session for user:", session.user.id);
    console.log("   Email:", session.user.email);
    
    // Check user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
      
    if (profileError) {
      console.error("❌ Profile error:", profileError);
    } else {
      console.log("✅ User profile:", profile);
    }
    
    // Test owned events query
    console.log("\n📊 Testing owned events query...");
    const { data: ownedEvents, error: ownedError } = await supabase
      .from('events')
      .select('id, name, created_by, user_id')
      .eq('created_by', session.user.id);
      
    if (ownedError) {
      console.error("❌ Owned events error:", ownedError);
    } else {
      console.log("✅ Owned events count:", ownedEvents?.length || 0);
      console.log("   Events:", ownedEvents);
    }
    
    // Test invited events query  
    console.log("\n📧 Testing invited events query...");
    const { data: invitedEvents, error: invitedError } = await supabase
      .from('event_players')
      .select(`
        role,
        status,
        user_id,
        invited_email,
        events:event_id (id, name)
      `)
      .eq('user_id', session.user.id);
      
    if (invitedError) {
      console.error("❌ Invited events error:", invitedError);
    } else {
      console.log("✅ Invited events count:", invitedEvents?.length || 0);
      console.log("   Events:", invitedEvents);
    }
    
    // Test auto-accept function
    console.log("\n🔄 Testing auto-accept function...");
    const { data: acceptResult, error: acceptError } = await supabase
      .rpc('accept_event_invitation_by_user', {
        p_user_id: session.user.id
      });
      
    if (acceptError) {
      console.error("❌ Auto-accept error:", acceptError);
    } else {
      console.log("✅ Auto-accept result:", acceptResult);
    }
    
    // Check for matching emails
    console.log("\n📮 Checking for matching invitation emails...");
    const { data: potentialMatches, error: matchError } = await supabase
      .from('event_players')
      .select('invited_email, full_name, event_id')
      .eq('invited_email', session.user.email)
      .is('user_id', null);
      
    if (matchError) {
      console.error("❌ Email match error:", matchError);
    } else {
      console.log("✅ Potential invitation matches:", potentialMatches?.length || 0);
      console.log("   Matches:", potentialMatches);
    }
    
    // Test event players access for first event
    if (ownedEvents && ownedEvents.length > 0) {
      const firstEventId = ownedEvents[0].id;
      console.log(`\n👥 Testing players access for event: ${firstEventId}`);
      
      const { data: players, error: playersError } = await supabase
        .from('event_players')
        .select('*')
        .eq('event_id', firstEventId);
        
      if (playersError) {
        console.error("❌ Players access error:", playersError);
      } else {
        console.log("✅ Players accessible:", players?.length || 0);
      }
    }
    
    console.log("\n🎉 Debug complete!");
    
  } catch (error) {
    console.error("❌ Debug script error:", error);
  }
};

// To use this script:
// 1. Open browser console on a page with supabase loaded
// 2. Copy and paste this entire script
// 3. Run: debugInvitationSystem()
console.log("Debug script loaded. Run: debugInvitationSystem()");
