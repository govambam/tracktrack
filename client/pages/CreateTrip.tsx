import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateTrip() {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to the first step of event creation
    navigate('/app/create/basic-info');
  }, [navigate]);

  return null;
}
