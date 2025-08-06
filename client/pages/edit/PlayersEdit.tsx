import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Player } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import {
  Users,
  Plus,
  Trash2,
  User,
  Save,
  Mail,
  Camera,
  Edit,
  X,
  Check,
} from "lucide-react";

export default function PlayersEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [players, setPlayers] = useState<Player[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>(
    {},
  );
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadPlayersData();
    }
  }, [eventId]);

  const loadPlayersData = async () => {
    if (!eventId) return;

    try {
      setLoading(true);
      console.log("Loading players data for event:", eventId);

      // Load players directly from Supabase to ensure fresh data
      const { data: playersData, error } = await supabase
        .from("event_players")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at");

      if (error) {
        console.error("Error loading players:", {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        console.error("Full error object:", JSON.stringify(error, null, 2));
        // Fall back to one empty player if no data exists
        setPlayers([
          {
            id: generateId(),
            name: "",
            email: "",
            handicap: undefined,
            image: "",
            bio: "",
          },
        ]);
      } else if (playersData && playersData.length > 0) {
        // Convert database format to component format
        const formattedPlayers = playersData.map((p) => ({
          id: p.id,
          name: p.full_name || "",
          email: p.email || "",
          handicap: p.handicap,
          image: p.profile_image || "",
          bio: p.bio || "",
        }));
        setPlayers(formattedPlayers);
        console.log("Loaded players from database:", formattedPlayers);
        console.log(
          "Profile images from database:",
          playersData.map((p) => ({
            name: p.full_name,
            profile_image: p.profile_image,
          })),
        );
      } else {
        // No players found, start with one empty player
        setPlayers([
          {
            id: generateId(),
            name: "",
            email: "",
            handicap: undefined,
            image: "",
            bio: "",
          },
        ]);
      }
    } catch (error) {
      console.error("Error loading players data:", error);
      console.error("Full error details:", JSON.stringify(error, null, 2));
      setPlayers([
        {
          id: generateId(),
          name: "",
          email: "",
          handicap: undefined,
          image: "",
          bio: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: generateId(),
      name: "",
      email: "",
      handicap: undefined,
      image: "",
      bio: "",
    };
    setPlayers([...players, newPlayer]);
    setEditingPlayerId(newPlayer.id); // Start editing the new player
  };

  const removePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter((player) => player.id !== id));
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
      // Stop editing if we're deleting the player being edited
      if (editingPlayerId === id) {
        setEditingPlayerId(null);
      }
    }
  };

  const updatePlayer = (id: string, field: keyof Player, value: any) => {
    console.log(`Updating player ${id}, field: ${field}, value:`, value);

    setPlayers(
      players.map((player) =>
        player.id === id ? { ...player, [field]: value } : player,
      ),
    );

    // Clear error for this field
    if (errors[id]?.[field]) {
      const newErrors = { ...errors };
      delete newErrors[id][field];
      if (Object.keys(newErrors[id]).length === 0) {
        delete newErrors[id];
      }
      setErrors(newErrors);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, Record<string, string>> = {};

    players.forEach((player) => {
      const playerErrors: Record<string, string> = {};

      if (!player.name.trim()) {
        playerErrors.name = "Player name is required";
      }

      if (
        player.email &&
        !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(player.email)
      ) {
        playerErrors.email = "Please enter a valid email address";
      }

      if (
        player.handicap !== undefined &&
        (player.handicap < 0 || player.handicap > 54)
      ) {
        playerErrors.handicap = "Handicap must be between 0 and 54";
      }

      if (Object.keys(playerErrors).length > 0) {
        newErrors[player.id] = playerErrors;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !eventId) return;

    setSaving(true);

    try {
      // Delete existing players
      const { error: deleteError } = await supabase
        .from("event_players")
        .delete()
        .eq("event_id", eventId);

      if (deleteError) {
        console.error("Error deleting existing players:", deleteError);
        toast({
          title: "Save Failed",
          description: deleteError.message || "Failed to update players",
          variant: "destructive",
        });
        return;
      }

      // Insert new players
      if (players.length > 0) {
        const playersData = players.map((player) => {
          const profileImage = player.image?.trim();
          const bio = player.bio?.trim();
          const email = player.email?.trim();

          return {
            event_id: eventId,
            full_name: player.name.trim(),
            email: email || null,
            handicap: player.handicap || null,
            profile_image:
              profileImage && profileImage.length > 0 ? profileImage : null,
            bio: bio && bio.length > 0 ? bio : null,
            // Invitation system fields - satisfy check constraint
            user_id: null, // Players created via edit interface are not linked to users
            invited_email: email || `${player.name.trim().toLowerCase().replace(/\s+/g, '_')}@placeholder.local`,
            role: 'player',
            status: email ? 'invited' : 'pending' // Only mark as invited if there's an email to send to
          };
        });

        console.log("Saving players data:", playersData);
        console.log(
          "Profile images being saved:",
          playersData.map((p) => ({
            name: p.full_name,
            profile_image: p.profile_image,
          })),
        );

        const { error: insertError } = await supabase
          .from("event_players")
          .insert(playersData);

        if (insertError) {
          console.error("Error inserting players:", insertError);
          toast({
            title: "Save Failed",
            description: insertError.message || "Failed to save players",
            variant: "destructive",
          });
          return;
        }

        console.log("Players saved successfully to database");
      }

      // Send invitation emails for players with real email addresses
      const playersWithEmails = players.filter(p =>
        p.email &&
        p.email.trim() &&
        !p.email.includes('@placeholder.local') &&
        !p.email.includes('@example.com')
      );

      if (playersWithEmails.length > 0) {
        console.log("Sending invitation emails to:", playersWithEmails.map(p => p.email));

        // First test if the API endpoint is available
        try {
          const testResponse = await fetch('/api/invitations/test');
          if (!testResponse.ok) {
            console.error("Invitations API not available:", testResponse.status);
            toast({
              title: "Players Updated",
              description: "Players saved. Invitation emails are not available right now.",
            });
            return;
          }
          console.log("✅ Invitations API is available");
        } catch (testError) {
          console.error("Cannot reach invitations API:", testError);
          toast({
            title: "Players Updated",
            description: "Players saved. Could not send invitation emails (API unavailable).",
          });
          return;
        }

        try {
          // Get session token
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken = session?.access_token;

          if (!accessToken) {
            console.error("No access token available");
            toast({
              title: "Players Updated",
              description: "Players saved, but couldn't send invitations (not authenticated).",
            });
            return;
          }

          console.log("🔑 Sending invitation request with token");

          const response = await fetch('/api/invitations/send', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({ event_id: eventId })
          });

          console.log("📧 Invitation API response status:", response.status);

          if (!response.ok) {
            const errorMsg = `API request failed: ${response.status} ${response.statusText}`;
            console.error("Invitation API error:", errorMsg);
            toast({
              title: "Players Updated",
              description: `Players saved, but invitation sending failed (${response.status}).`,
              variant: "destructive"
            });
            return;
          }

          const result = await response.json();
          console.log("📧 Invitation API result:", result);

          if (result.success && result.sent_count > 0) {
            toast({
              title: "Players Saved & Invitations Sent",
              description: `Player information updated and ${result.sent_count} invitation emails sent.`,
            });
          } else if (result.success) {
            toast({
              title: "Players Updated",
              description: "Player list has been saved successfully. No invitation emails were needed.",
            });
          } else {
            console.error("Invitation send failed:", result.error);
            toast({
              title: "Players Updated",
              description: `Players saved, but invitation sending failed: ${result.error || 'Unknown error'}`,
              variant: "destructive"
            });
          }
        } catch (emailError) {
          console.error("Error sending invitation emails:", emailError);
          toast({
            title: "Players Updated",
            description: `Players saved, but there was an issue sending invitation emails: ${emailError.message}`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Players Updated",
          description: "Player list has been saved successfully",
        });
      }
    } catch (error) {
      console.error("Error saving players:", error);
      toast({
        title: "Save Failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg text-green-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-emerald-600" />
            Event Players
          </CardTitle>
          <CardDescription className="text-green-600">
            Manage the participants for your golf event
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {players.map((player, index) => {
            const isEditing = editingPlayerId === player.id;

            return (
              <Card key={player.id} className="border-green-100 bg-green-50">
                <CardContent className="p-4">
                  {!isEditing ? (
                    // Collapsed view
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          {player.image && (
                            <AvatarImage src={player.image} alt={player.name} />
                          )}
                          <AvatarFallback className="bg-emerald-600 text-white">
                            {player.name ? (
                              getPlayerInitials(player.name)
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-green-900">
                            {player.name || `Player ${index + 1}`}
                          </div>
                          <div className="text-sm text-green-600 space-y-1">
                            <div>
                              {player.email && (
                                <span className="mr-3">{player.email}</span>
                              )}
                              {player.handicap !== undefined && (
                                <span>HCP: {player.handicap}</span>
                              )}
                            </div>
                            {player.bio && (
                              <div className="text-xs text-green-500 italic max-w-md truncate">
                                "{player.bio}"
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPlayerId(player.id)}
                          className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        {players.length > 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removePlayer(player.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    // Expanded edit view
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-green-900">
                          Edit Player {index + 1}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingPlayerId(null)}
                            className="border-gray-200 text-gray-600 hover:bg-gray-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Validate this player's data
                              const playerErrors: Record<string, string> = {};
                              if (!player.name.trim()) {
                                playerErrors.name = "Player name is required";
                              }
                              if (
                                player.email &&
                                !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(
                                  player.email,
                                )
                              ) {
                                playerErrors.email =
                                  "Please enter a valid email address";
                              }
                              if (
                                player.handicap !== undefined &&
                                (player.handicap < 0 || player.handicap > 54)
                              ) {
                                playerErrors.handicap =
                                  "Handicap must be between 0 and 54";
                              }

                              if (Object.keys(playerErrors).length === 0) {
                                setEditingPlayerId(null);
                              } else {
                                setErrors((prev) => ({
                                  ...prev,
                                  [player.id]: playerErrors,
                                }));
                              }
                            }}
                            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Done
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Player Name */}
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium">
                            Full Name *
                          </Label>
                          <Input
                            value={player.name}
                            onChange={(e) =>
                              updatePlayer(player.id, "name", e.target.value)
                            }
                            placeholder="e.g., John Smith"
                            className={`border-green-200 focus:border-emerald-500 ${
                              errors[player.id]?.name ? "border-red-300" : ""
                            }`}
                          />
                          {errors[player.id]?.name && (
                            <p className="text-sm text-red-600">
                              {errors[player.id].name}
                            </p>
                          )}
                        </div>

                        {/* Email Address */}
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium">
                            Email Address (Optional)
                          </Label>
                          <Input
                            type="email"
                            value={player.email || ""}
                            onChange={(e) =>
                              updatePlayer(player.id, "email", e.target.value)
                            }
                            placeholder="e.g., john@example.com"
                            className={`border-green-200 focus:border-emerald-500 ${
                              errors[player.id]?.email ? "border-red-300" : ""
                            }`}
                          />
                          {errors[player.id]?.email && (
                            <p className="text-sm text-red-600">
                              {errors[player.id].email}
                            </p>
                          )}
                        </div>

                        {/* Handicap */}
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium">
                            Golf Handicap (Optional)
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="54"
                            step="0.1"
                            value={player.handicap || ""}
                            onChange={(e) =>
                              updatePlayer(
                                player.id,
                                "handicap",
                                e.target.value
                                  ? parseFloat(e.target.value)
                                  : undefined,
                              )
                            }
                            placeholder="e.g., 12.4"
                            className={`border-green-200 focus:border-emerald-500 ${
                              errors[player.id]?.handicap
                                ? "border-red-300"
                                : ""
                            }`}
                          />
                          {errors[player.id]?.handicap && (
                            <p className="text-sm text-red-600">
                              {errors[player.id].handicap}
                            </p>
                          )}
                        </div>

                        {/* Profile Picture */}
                        <div className="space-y-2">
                          <Label className="text-green-800 font-medium">
                            Profile Picture URL (Optional)
                          </Label>
                          <Input
                            type="url"
                            value={player.image || ""}
                            onChange={(e) =>
                              updatePlayer(player.id, "image", e.target.value)
                            }
                            placeholder="https://example.com/photo.jpg"
                            className="border-green-200 focus:border-emerald-500"
                          />
                        </div>
                      </div>

                      {/* Bio Section */}
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-green-800 font-medium">
                          Player Bio (Optional)
                        </Label>
                        <textarea
                          value={player.bio || ""}
                          onChange={(e) =>
                            updatePlayer(player.id, "bio", e.target.value)
                          }
                          placeholder="Tell us about this player's golf background, achievements, or fun facts..."
                          className="w-full min-h-[80px] px-3 py-2 border border-green-200 rounded-md focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-vertical"
                          rows={3}
                        />
                        <p className="text-xs text-green-600">
                          This will appear on the public event page to give
                          attendees more context about each player.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {/* Add Player Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={addPlayer}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Player
            </Button>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Players"}
            </Button>
          </div>

          {/* Summary */}
          {players.length > 0 && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Users className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                <div className="font-semibold">Player Summary</div>
                <div className="mt-1">
                  {players.length} player{players.length !== 1 ? "s" : ""}{" "}
                  registered for this event
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
