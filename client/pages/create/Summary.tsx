import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { 
  CheckCircle, 
  FileText, 
  Golf, 
  Target, 
  Users, 
  Trophy, 
  Plane, 
  Palette,
  Calendar,
  MapPin,
  DollarSign,
  Lock,
  Globe
} from "lucide-react";

export default function Summary() {
  const navigate = useNavigate();
  const { state, resetTrip } = useTripCreation();
  const { tripData } = state;

  const handleConfirm = () => {
    // Save trip to localStorage (simulating backend save)
    const existingTrips = JSON.parse(localStorage.getItem('userTrips') || '[]');
    const newTrip = {
      id: Date.now().toString(),
      ...tripData,
      createdAt: new Date().toISOString(),
      status: 'upcoming'
    };
    
    localStorage.setItem('userTrips', JSON.stringify([...existingTrips, newTrip]));
    
    // Reset the trip creation state
    resetTrip();
    
    // Navigate back to dashboard
    navigate('/app');
  };

  const handlePrevious = () => {
    navigate('/app/create/customization');
  };

  const getPlayerInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleConfirm}
        onPrevious={handlePrevious}
        nextLabel="Create Trip"
        nextDisabled={false}
      />

      <Card className="border-emerald-200 bg-emerald-50">
        <CardHeader>
          <CardTitle className="text-xl text-emerald-900 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Trip Summary
          </CardTitle>
          <CardDescription className="text-emerald-600">
            Review all details before creating your golf trip
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Basic Information */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg text-green-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-600" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-green-900 text-xl">{tripData.tripName}</h3>
              <div className="flex items-center text-green-600 mt-1">
                <Calendar className="h-4 w-4 mr-2" />
                {formatDate(tripData.startDate)} - {formatDate(tripData.endDate)}
              </div>
              <div className="flex items-center text-green-600 mt-1">
                <MapPin className="h-4 w-4 mr-2" />
                {tripData.location}
              </div>
            </div>
            {tripData.description && (
              <div>
                <p className="text-green-700">{tripData.description}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Golf Rounds */}
      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-lg text-green-900 flex items-center">
            <Golf className="h-5 w-5 mr-2 text-emerald-600" />
            Golf Rounds ({tripData.rounds.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {tripData.rounds.map((round, index) => (
            <div key={round.id} className="p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-green-900">Round {index + 1}: {round.courseName}</h4>
                <Badge variant="outline">{round.holes} holes</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-green-600">
                <div>📅 {formatDate(round.date)}</div>
                <div>🕐 {formatTime(round.time)}</div>
                {round.yardage && <div>📏 {round.yardage}</div>}
                {round.skillsContests?.enabled && (
                  <div className="col-span-2 md:col-span-3">
                    🏆 Skills contests: {round.skillsContests.holes}
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Scoring & Players */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Scoring Format */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg text-green-900 flex items-center">
              <Target className="h-5 w-5 mr-2 text-emerald-600" />
              Scoring Format
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="mb-2">
              {tripData.scoringFormat === 'stroke-play' ? 'Stroke Play' : 'Modified Stableford'}
            </Badge>
            {tripData.scoringFormat === 'modified-stableford' && tripData.stablefordPoints && (
              <div className="mt-3 space-y-1 text-sm text-green-600">
                <div>Eagle: +{tripData.stablefordPoints.eagle} pts</div>
                <div>Birdie: +{tripData.stablefordPoints.birdie} pts</div>
                <div>Par: {tripData.stablefordPoints.par} pts</div>
                <div>Bogey: {tripData.stablefordPoints.bogey} pts</div>
                <div>Double Bogey+: {tripData.stablefordPoints.doubleBogey} pts</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Players */}
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg text-green-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-emerald-600" />
              Players ({tripData.players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tripData.players.slice(0, 4).map((player) => (
                <div key={player.id} className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-emerald-600 text-white text-sm">
                      {getPlayerInitials(player.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <span className="text-green-900">{player.name}</span>
                    {player.handicap !== undefined && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        HCP {player.handicap}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {tripData.players.length > 4 && (
                <div className="text-sm text-green-600">
                  +{tripData.players.length - 4} more players
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optional Sections */}
      {(tripData.buyIn || tripData.payoutStructure || tripData.contestPrizes) && (
        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg text-green-900 flex items-center">
              <Trophy className="h-5 w-5 mr-2 text-emerald-600" />
              Prizes & Buy-In
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {tripData.buyIn && (
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
                <span>Buy-in: <Badge variant="secondary">${tripData.buyIn}</Badge></span>
              </div>
            )}
            {tripData.payoutStructure && (
              <div className="space-y-1">
                <div className="font-medium text-green-900">Tournament Payouts:</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  {tripData.payoutStructure.champion > 0 && <div>1st: ${tripData.payoutStructure.champion}</div>}
                  {tripData.payoutStructure.runnerUp > 0 && <div>2nd: ${tripData.payoutStructure.runnerUp}</div>}
                  {tripData.payoutStructure.third > 0 && <div>3rd: ${tripData.payoutStructure.third}</div>}
                </div>
              </div>
            )}
            {tripData.contestPrizes && (
              <div className="space-y-1">
                <div className="font-medium text-green-900">Contest Prizes:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {tripData.contestPrizes.longestDrive > 0 && <div>Longest Drive: ${tripData.contestPrizes.longestDrive}</div>}
                  {tripData.contestPrizes.closestToPin > 0 && <div>Closest to Pin: ${tripData.contestPrizes.closestToPin}</div>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Travel & Customization */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tripData.travelInfo && (
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Plane className="h-5 w-5 mr-2 text-emerald-600" />
                Travel Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {tripData.travelInfo.flightTimes && <div>✈️ Flight details included</div>}
              {tripData.travelInfo.accommodations && <div>🏨 Hotel information included</div>}
              {tripData.travelInfo.dailySchedule && <div>📋 Daily schedule included</div>}
            </CardContent>
          </Card>
        )}

        <Card className="border-green-100">
          <CardHeader>
            <CardTitle className="text-lg text-green-900 flex items-center">
              <Palette className="h-5 w-5 mr-2 text-emerald-600" />
              Customization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center">
              {tripData.customization?.isPrivate ? (
                <Lock className="h-4 w-4 mr-2 text-orange-600" />
              ) : (
                <Globe className="h-4 w-4 mr-2 text-blue-600" />
              )}
              <span>{tripData.customization?.isPrivate ? 'Private trip' : 'Public trip'}</span>
            </div>
            {tripData.customization?.logoUrl && <div>🎨 Custom logo added</div>}
            {tripData.customization?.customDomain && (
              <div>🌐 Custom URL: /{tripData.customization.customDomain}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Final Confirmation */}
      <Alert className="border-emerald-200 bg-emerald-50">
        <CheckCircle className="h-4 w-4 text-emerald-600" />
        <AlertDescription className="text-emerald-700">
          <div className="space-y-2">
            <div className="font-semibold">Ready to create your golf trip!</div>
            <div>
              Your trip "{tripData.tripName}" will be created with {tripData.rounds.length} rounds 
              and {tripData.players.length} players. You can edit all details after creation.
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}
