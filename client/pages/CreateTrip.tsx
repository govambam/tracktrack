import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTripCreation } from "@/contexts/TripCreationContext";

export default function CreateTrip() {
  const navigate = useNavigate();
  const { resetTrip, state } = useTripCreation();
  const { tripData } = state;

  useEffect(() => {
    // Only reset if we don't have any ongoing creation data
    // This prevents accidental resets if user navigates back to /app/create
    const hasOngoingCreation =
      tripData.tripName ||
      tripData.startDate ||
      tripData.endDate ||
      tripData.location ||
      tripData.rounds?.length > 0;

    if (!hasOngoingCreation) {
      console.log(
        "CreateTrip: Starting fresh event creation - resetting context",
      );
      resetTrip();
    } else {
      console.log(
        "CreateTrip: Ongoing creation detected, not resetting context",
      );
    }

    // Redirect to the first step of event creation
    navigate("/app/create/basic-info");
  }, [navigate, resetTrip, tripData]);

  return null;
}
