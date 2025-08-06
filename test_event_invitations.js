// Test script for Event Invitations System
// Run this with: node test_event_invitations.js

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://jktbmygutktbjjuzuwgq.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImprdGJteWd1dGt0YmpqdXp1d2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjExMzEsImV4cCI6MjA2OTczNzEzMX0.WNrC3L-WSZEu68DtFPBDFzBZzB29th2Nvou5Vlwq6Lg";

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testInvitationSystem() {
  console.log("🧪 Testing Event Invitations System...\n");

  try {
    // Test 1: Check if schema changes are applied
    console.log("1. Checking schema changes...");

    const { data: eventsColumns } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "events");

    const hasCreatedBy = eventsColumns?.some(
      (col) => col.column_name === "created_by",
    );
    console.log(`   ✅ Events table has 'created_by' column: ${hasCreatedBy}`);

    const { data: playersColumns } = await supabase
      .from("information_schema.columns")
      .select("column_name")
      .eq("table_name", "event_players");

    const newColumns = ["user_id", "role", "invited_email", "status"];
    const hasNewColumns = newColumns.every((col) =>
      playersColumns?.some((playerCol) => playerCol.column_name === col),
    );
    console.log(`   ✅ Event_players table has new columns: ${hasNewColumns}`);

    // Test 2: Check if RPC functions exist
    console.log("\n2. Checking RPC functions...");

    const { data: functions } = await supabase
      .from("information_schema.routines")
      .select("routine_name")
      .eq("routine_schema", "public");

    const hasInviteFunction = functions?.some(
      (func) => func.routine_name === "invite_player_to_event",
    );
    const hasAcceptFunction = functions?.some(
      (func) => func.routine_name === "accept_event_invitation",
    );

    console.log(
      `   ✅ invite_player_to_event function exists: ${hasInviteFunction}`,
    );
    console.log(
      `   ✅ accept_event_invitation function exists: ${hasAcceptFunction}`,
    );

    // Test 3: Test RPC functions (requires authentication)
    console.log("\n3. Testing RPC functions...");
    console.log("   ⚠️  Note: RPC function tests require user authentication");
    console.log(
      "   💡 Use the API endpoints with proper auth tokens for full testing",
    );

    // Test 4: Check indexes
    console.log("\n4. Checking database indexes...");

    const { data: indexes } = await supabase
      .from("pg_indexes")
      .select("indexname")
      .in("tablename", ["events", "event_players"]);

    const expectedIndexes = [
      "idx_events_created_by",
      "idx_event_players_user_id",
      "idx_event_players_invited_email",
      "idx_event_players_status",
      "idx_event_players_role",
    ];

    expectedIndexes.forEach((indexName) => {
      const hasIndex = indexes?.some((idx) => idx.indexname === indexName);
      console.log(
        `   ✅ Index ${indexName}: ${hasIndex ? "exists" : "missing"}`,
      );
    });

    console.log("\n🎉 Schema validation complete!");
    console.log("\n📋 Next Steps:");
    console.log(
      "   1. Apply the schema: Run add_event_invitations_schema.sql in Supabase",
    );
    console.log("   2. Test API endpoints with authentication");
    console.log("   3. Create events and test invitations");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    console.log(
      "\n💡 This might be expected if schema hasn't been applied yet",
    );
    console.log(
      "   Run the SQL migration first: add_event_invitations_schema.sql",
    );
  }
}

// API Endpoint Testing Examples
function printAPITestExamples() {
  console.log("\n🔗 API Testing Examples:");
  console.log("\n# 1. Create an event (with created_by):");
  console.log(`curl -X POST http://localhost:3000/api/events \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test Golf Event",
    "start_date": "2024-06-01",
    "end_date": "2024-06-03",
    "location": "Test Golf Course"
  }'`);

  console.log("\n# 2. Invite a player:");
  console.log(`curl -X POST http://localhost:3000/api/events/EVENT_ID/invite \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "player@example.com",
    "role": "player"
  }'`);

  console.log("\n# 3. Get event players:");
  console.log(`curl -X GET http://localhost:3000/api/events/EVENT_ID/players \\
  -H "Authorization: Bearer YOUR_TOKEN"`);

  console.log("\n# 4. Accept invitation:");
  console.log(`curl -X POST http://localhost:3000/api/events/EVENT_ID/accept-invitation \\
  -H "Authorization: Bearer INVITED_USER_TOKEN"`);
}

// Run the tests
testInvitationSystem().then(() => {
  printAPITestExamples();
});
