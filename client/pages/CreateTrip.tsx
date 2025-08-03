import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTripCreation } from "@/contexts/TripCreationContext";

export default function CreateTrip() {
  const navigate = useNavigate();
  const { resetTrip } = useTripCreation();

  useEffect(() => {
    // Reset the trip context for a fresh start
    resetTrip();
    // Redirect to the first step of event creation
    navigate("/app/create/basic-info");
  }, [navigate, resetTrip]);

  return null;
}
