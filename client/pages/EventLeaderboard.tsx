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

  // Hide the navigation since it's provided by the EventShell
  return <PublicLeaderboard hideNavigation={true} />;
}
