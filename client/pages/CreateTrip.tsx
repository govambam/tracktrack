import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateTrip() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first step of trip creation
    navigate('/app/create/basic-info');
  }, [navigate]);

  return null;
}
