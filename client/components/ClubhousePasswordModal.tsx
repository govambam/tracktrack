import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Users, AlertCircle } from "lucide-react";

interface ClubhousePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (displayName: string) => void;
  eventName: string;
  eventId: string;
}

export function ClubhousePasswordModal({
  isOpen,
  onClose,
  onSuccess,
  eventName,
  eventId,
}: ClubhousePasswordModalProps) {
  const [step, setStep] = useState<"password" | "displayName">("password");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setError("Please enter the clubhouse password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify password with the backend
      const response = await fetch("/api/clubhouse/verify-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          password,
        }),
      });

      // Handle case where API endpoint doesn't exist yet (404)
      if (response.status === 404) {
        setError(
          "Clubhouse feature not deployed yet. Please contact support or try again later.",
        );
        return;
      }

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Invalid password");
        return;
      }

      // Password is correct, move to display name step
      setStep("displayName");
      setError("");
    } catch (error) {
      console.error("Error verifying password:", error);
      setError("Failed to verify password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDisplayNameSubmit = async () => {
    if (!displayName.trim()) {
      setError("Please enter a display name");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Create clubhouse session
      const sessionId = crypto.randomUUID();
      const response = await fetch("/api/clubhouse/create-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          displayName: displayName.trim(),
          sessionId,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle specific error cases with more detail
        if (response.status === 503) {
          setError(
            "Clubhouse feature not available. Database migration required. Please contact support.",
          );
        } else if (result.details) {
          setError(`${result.error}: ${result.details}`);
        } else {
          setError(result.error || "Failed to create session");
        }
        return;
      }

      // Store session in localStorage for persistence
      localStorage.setItem(
        `clubhouse_session_${eventId}`,
        JSON.stringify({
          sessionId,
          displayName: displayName.trim(),
          eventId,
          createdAt: new Date().toISOString(),
        }),
      );

      // Call success callback with display name
      onSuccess(displayName.trim());

      // Reset modal state
      setStep("password");
      setPassword("");
      setDisplayName("");
      setError("");
    } catch (error) {
      console.error("Error creating session:", error);
      setError("Failed to create session. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep("password");
    setPassword("");
    setDisplayName("");
    setError("");
    onClose();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (step === "password") {
        handlePasswordSubmit();
      } else {
        handleDisplayNameSubmit();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>
              {step === "password" ? "Access Clubhouse" : "Choose Display Name"}
            </span>
          </DialogTitle>
          <DialogDescription>
            {step === "password"
              ? `Enter the password to access the ${eventName} clubhouse`
              : "Choose how your name will appear to other players"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === "password" ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="password">Clubhouse Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter password"
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <Users className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-700">
                  The clubhouse is where you can view scores, edit scorecards,
                  and chat with other players during the event.
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your display name"
                  disabled={loading}
                  maxLength={50}
                />
                <p className="text-sm text-gray-500">
                  This name will be visible to other players in the clubhouse
                </p>
              </div>
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={
                step === "password"
                  ? handlePasswordSubmit
                  : handleDisplayNameSubmit
              }
              disabled={
                loading ||
                (step === "password" ? !password.trim() : !displayName.trim())
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading
                ? "Processing..."
                : step === "password"
                  ? "Continue"
                  : "Enter Clubhouse"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
