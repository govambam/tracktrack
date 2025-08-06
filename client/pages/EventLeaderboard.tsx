import React from "react";
import { useOutletContext } from "react-router-dom";
import PublicLeaderboard from "./PublicLeaderboard";

interface EventData {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
}

interface ClubhouseSession {
  displayName: string;
  sessionId: string;
  eventId: string;
}

interface OutletContext {
  eventData: EventData;
  clubhouseSession: ClubhouseSession;
}

export default function EventLeaderboard() {
  const { eventData } = useOutletContext<OutletContext>();

  // The PublicLeaderboard component can remain as-is since it loads its own data
  // based on the slug from useParams
  return <PublicLeaderboard />;
}
