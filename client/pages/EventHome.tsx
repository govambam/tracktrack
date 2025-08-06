import React from "react";
import { useOutletContext } from "react-router-dom";
import PublicEventHome from "./PublicEventHome";

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

export default function EventHome() {
  const { eventData } = useOutletContext<OutletContext>();

  // Pass the eventData to the existing PublicEventHome component
  // Hide navigation since it's provided by the shell
  return <PublicEventHome preloadedEventData={eventData} hideNavigation={true} />;
}
