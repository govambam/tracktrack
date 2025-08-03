import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Player } from "@/contexts/TripCreationContext";
import { supabase } from "@/lib/supabase";
import { Users, Plus, Trash2, User, Save, Mail, Camera } from "lucide-react";

export default function PlayersEdit() {
  const { eventId } = useParams();
  const { toast } = useToast();
  const { state } = useTripCreation();
  const { tripData } = state;

  const [players, setPlayers] = useState<Player[]>([]);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

  useEffect(() => {
    // Initialize players with context data
    if (tripData?.players && tripData.players.length > 0) {
      setPlayers(tripData.players);
    } else {
      // Initialize with one empty player
      setPlayers([{
        id: generateId(),
        name: '',
        email: '',
        handicap: undefined,
        image: ''
      }]);
    }
  }, [tripData?.players]);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addPlayer = () => {
    const newPlayer: Player = {
      id: generateId(),
      name: '',
      email: '',
      handicap: undefined,
      image: ''
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (id: string) => {
    if (players.length > 1) {
      setPlayers(players.filter(player => player.id !== id));
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updatePlayer = (id: string, field: keyof Player, value: any) => {
    setPlayers(players.map(player => 
      player.id === id ? { ...player, [field]: value } : player
    ));
    
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
        playerErrors.name = 'Player name is required';
      }

      if (player.email && !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(player.email)) {
        playerErrors.email = 'Please enter a valid email address';
      }

      if (player.handicap !== undefined && (player.handicap < 0 || player.handicap > 54)) {
        playerErrors.handicap = 'Handicap must be between 0 and 54';
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
        .from('event_players')
        .delete()
        .eq('event_id', eventId);

      if (deleteError) {
        console.error('Error deleting existing players:', deleteError);
        toast({
          title: "Save Failed",
          description: deleteError.message || "Failed to update players",
          variant: "destructive",
        });
        return;
      }

      // Insert new players
      if (players.length > 0) {
        const playersData = players.map(player => ({
          event_id: eventId,
          full_name: player.name.trim(),
          email: player.email?.trim() || null,
          handicap: player.handicap || null,
          profile_image: player.image || null
        }));

        const { error: insertError } = await supabase
          .from('event_players')
          .insert(playersData);

        if (insertError) {
          console.error('Error inserting players:', insertError);
          toast({
            title: "Save Failed",
            description: insertError.message || "Failed to save players",
            variant: "destructive",
          });
          return;
        }
      }

      toast({
        title: "Players Updated",
        description: "Player list has been saved successfully",
      });

    } catch (error) {
      console.error('Error saving players:', error);
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
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
        
        <CardContent className="space-y-6">
          {players.map((player, index) => (
            <Card key={player.id} className="border-green-100 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-12 w-12 mt-2">
                    <AvatarFallback className="bg-emerald-600 text-white">
                      {player.name ? getPlayerInitials(player.name) : <User className="h-6 w-6" />}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-green-900">Player {index + 1}</h4>
                      {players.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removePlayer(player.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Player Name */}
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">
                          Full Name *
                        </Label>
                        <Input
                          value={player.name}
                          onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                          placeholder="e.g., John Smith"
                          className={`border-green-200 focus:border-emerald-500 ${
                            errors[player.id]?.name ? 'border-red-300' : ''
                          }`}
                        />
                        {errors[player.id]?.name && (
                          <p className="text-sm text-red-600">{errors[player.id].name}</p>
                        )}
                      </div>

                      {/* Email Address */}
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">
                          Email Address (Optional)
                        </Label>
                        <Input
                          type="email"
                          value={player.email || ''}
                          onChange={(e) => updatePlayer(player.id, 'email', e.target.value)}
                          placeholder="e.g., john@example.com"
                          className={`border-green-200 focus:border-emerald-500 ${
                            errors[player.id]?.email ? 'border-red-300' : ''
                          }`}
                        />
                        {errors[player.id]?.email && (
                          <p className="text-sm text-red-600">{errors[player.id].email}</p>
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
                          value={player.handicap || ''}
                          onChange={(e) => updatePlayer(player.id, 'handicap', e.target.value ? parseFloat(e.target.value) : undefined)}
                          placeholder="e.g., 12.4"
                          className={`border-green-200 focus:border-emerald-500 ${
                            errors[player.id]?.handicap ? 'border-red-300' : ''
                          }`}
                        />
                        {errors[player.id]?.handicap && (
                          <p className="text-sm text-red-600">{errors[player.id].handicap}</p>
                        )}
                      </div>

                      {/* Profile Picture */}
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">
                          Profile Picture URL (Optional)
                        </Label>
                        <Input
                          type="url"
                          value={player.image || ''}
                          onChange={(e) => updatePlayer(player.id, 'image', e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                          className="border-green-200 focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Player Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={addPlayer}
              className="border-green-200 text-green-700 hover:bg-green-50"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Player
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
              {saving ? 'Saving...' : 'Save Players'}
            </Button>
          </div>

          {/* Summary */}
          {players.length > 0 && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <Users className="h-4 w-4 text-emerald-600" />
              <AlertDescription className="text-emerald-700">
                <div className="font-semibold">Player Summary</div>
                <div className="mt-1">
                  {players.length} player{players.length !== 1 ? 's' : ''} registered for this event
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
