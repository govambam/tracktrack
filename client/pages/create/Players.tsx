import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Player } from "@/contexts/TripCreationContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Trash2, User, Camera, Mail } from "lucide-react";

export default function Players() {
  const navigate = useNavigate();
  const { state, updatePlayers, savePlayers } = useTripCreation();
  const { tripData } = state;
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [players, setPlayers] = useState<Player[]>(
    tripData.players.length > 0 ? tripData.players : [
      { id: '1', name: '', email: '', handicap: undefined, image: '' }
    ]
  );

  const [errors, setErrors] = useState<Record<string, Record<string, string>>>({});

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
      // Remove errors for deleted player
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const updatePlayer = (id: string, field: keyof Player, value: any) => {
    setPlayers(players.map(player => 
      player.id === id 
        ? { ...player, [field]: value }
        : player
    ));
    
    // Clear error for this field
    if (errors[id]?.[field]) {
      setErrors(prev => ({
        ...prev,
        [id]: { ...prev[id], [field]: '' }
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, Record<string, string>> = {};

    players.forEach(player => {
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

  const handleNext = async () => {
    if (validateForm()) {
      setSaving(true);

      // Update context first
      updatePlayers(players);

      try {
        // Save players to Supabase
        const result = await savePlayers();

        if (result.success) {
          toast({
            title: "Players Saved",
            description: "Player list saved successfully",
          });
          navigate('/app/create/prizes');
        } else {
          toast({
            title: "Save Failed",
            description: result.error || "Failed to save players",
            variant: "destructive",
          });
        }
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
    }
  };

  const handlePrevious = () => {
    updatePlayers(players);
    navigate('/app/create/scoring');
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAverageHandicap = () => {
    const handicaps = players.filter(p => p.handicap !== undefined).map(p => p.handicap!);
    if (handicaps.length === 0) return null;
    return (handicaps.reduce((sum, h) => sum + h, 0) / handicaps.length).toFixed(1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleNext}
        onPrevious={handlePrevious}
        nextDisabled={saving}
        nextLabel={saving ? "Saving..." : "Next"}
      />

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center">
            <Users className="h-5 w-5 mr-2 text-emerald-600" />
            Players
          </CardTitle>
          <CardDescription className="text-green-600">
            Add all participants for your golf event
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {players.map((player, index) => (
            <Card key={player.id} className="border-green-100 bg-green-50">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-emerald-600 text-white">
                        {player.name ? getPlayerInitials(player.name) : <User className="h-5 w-5" />}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-green-900">
                        Player {index + 1}
                      </h3>
                      <p className="text-sm text-green-600">
                        {player.name || 'Enter player name'}
                      </p>
                    </div>
                  </div>
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Player Name */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Name *
                    </Label>
                    <Input
                      value={player.name}
                      onChange={(e) => updatePlayer(player.id, 'name', e.target.value)}
                      placeholder="Enter player name"
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[player.id]?.name ? 'border-red-300' : ''}`}
                    />
                    {errors[player.id]?.name && (
                      <p className="text-sm text-red-600">{errors[player.id].name}</p>
                    )}
                  </div>

                  {/* Email Address */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium flex items-center">
                      <Mail className="h-4 w-4 mr-1 text-emerald-600" />
                      Email (Optional)
                    </Label>
                    <Input
                      type="email"
                      value={player.email || ''}
                      onChange={(e) => updatePlayer(player.id, 'email', e.target.value)}
                      placeholder="john@example.com"
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[player.id]?.email ? 'border-red-300' : ''}`}
                    />
                    {errors[player.id]?.email && (
                      <p className="text-sm text-red-600">{errors[player.id].email}</p>
                    )}
                  </div>

                  {/* Handicap */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Handicap (Optional)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      max="54"
                      step="0.1"
                      value={player.handicap || ''}
                      onChange={(e) => updatePlayer(player.id, 'handicap', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="e.g., 12.4"
                      className={`border-green-200 focus:border-emerald-500 bg-white ${errors[player.id]?.handicap ? 'border-red-300' : ''}`}
                    />
                    {errors[player.id]?.handicap && (
                      <p className="text-sm text-red-600">{errors[player.id].handicap}</p>
                    )}
                  </div>

                  {/* Profile Image */}
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium flex items-center">
                      <Camera className="h-4 w-4 mr-1 text-emerald-600" />
                      Photo URL (Optional)
                    </Label>
                    <Input
                      type="url"
                      value={player.image || ''}
                      onChange={(e) => updatePlayer(player.id, 'image', e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="border-green-200 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Player Button */}
          <Button
            variant="outline"
            onClick={addPlayer}
            className="w-full border-green-200 text-green-700 hover:bg-green-50 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Player
          </Button>

          {/* Players Summary */}
          {players.length > 0 && (
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                <div className="flex flex-wrap items-center gap-4">
                  <span>
                    Total players: <Badge variant="secondary" className="ml-1">{players.length}</Badge>
                  </span>
                  {getAverageHandicap() && (
                    <span>
                      Average handicap: <Badge variant="secondary" className="ml-1">{getAverageHandicap()}</Badge>
                    </span>
                  )}
                  <span>
                    Players with handicaps: <Badge variant="secondary" className="ml-1">
                      {players.filter(p => p.handicap !== undefined).length}
                    </Badge>
                  </span>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Helper Text */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              <strong>Pro tip:</strong> Adding handicaps helps with flight pairings and makes the tournament more competitive. 
              You can always add or edit players later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
