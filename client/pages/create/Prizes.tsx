import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { useToast } from "@/hooks/use-toast";
import { Trophy, DollarSign, Gift, Target } from "lucide-react";

export default function Prizes() {
  const navigate = useNavigate();
  const { state, updatePrizes, saveEvent } = useTripCreation();
  const { tripData } = state;

  const [buyIn, setBuyIn] = useState<number | undefined>(tripData.buyIn);
  const [enablePayout, setEnablePayout] = useState(!!tripData.payoutStructure);
  const [enableContests, setEnableContests] = useState(!!tripData.contestPrizes);

  // Auto-enable payouts when buy-in is entered
  useEffect(() => {
    setEnablePayout(!!buyIn && buyIn > 0);
  }, [buyIn]);

  // Get skills contests from courses
  const getSkillsContestsFromCourses = () => {
    const contests: { hole: number; type: string; roundName: string }[] = [];
    tripData.rounds.forEach(round => {
      if (round.skillsContests) {
        round.skillsContests.forEach(contest => {
          contests.push({
            hole: contest.hole,
            type: contest.type === 'longest_drive' ? 'Longest Drive' : 'Closest to Pin',
            roundName: round.courseName
          });
        });
      }
    });
    return contests;
  };

  const skillsContestsFromCourses = getSkillsContestsFromCourses();
  const longestDriveCount = skillsContestsFromCourses.filter(c => c.type === 'Longest Drive').length;
  const closestToPinCount = skillsContestsFromCourses.filter(c => c.type === 'Closest to Pin').length;

  const [payoutStructure, setPayoutStructure] = useState({
    champion: tripData.payoutStructure?.champion || 0,
    runnerUp: tripData.payoutStructure?.runnerUp || 0,
    third: tripData.payoutStructure?.third || 0
  });

  const [contestPrizes, setContestPrizes] = useState({
    longestDrive: tripData.contestPrizes?.longestDrive || 0,
    closestToPin: tripData.contestPrizes?.closestToPin || 0,
    other: tripData.contestPrizes?.other || ''
  });

  const totalPayout = payoutStructure.champion + payoutStructure.runnerUp + payoutStructure.third;
  const totalContestPrizes = (contestPrizes.longestDrive * longestDriveCount) + (contestPrizes.closestToPin * closestToPinCount);
  const totalPrizes = totalPayout + totalContestPrizes;
  const playerCount = tripData.players.length || 1;
  const totalBuyIns = (buyIn || 0) * playerCount;

  const handleNext = async () => {
    const prizesData = {
      buyIn: buyIn || undefined,
      payoutStructure: enablePayout ? payoutStructure : undefined,
      contestPrizes: enableContests ? contestPrizes : undefined
    };

    // Update context first
    updatePrizes(prizesData);

    // Save buy-in to database immediately
    if (buyIn !== tripData.buyIn) {
      console.log('Saving buy-in to database:', buyIn);
      const result = await saveEvent({ buyIn: buyIn });
      if (!result.success) {
        console.error('Failed to save buy-in:', result.error);
      }
    }

    navigate('/app/create/travel');
  };

  const handlePrevious = async () => {
    const prizesData = {
      buyIn: buyIn || undefined,
      payoutStructure: enablePayout ? payoutStructure : undefined,
      contestPrizes: enableContests ? contestPrizes : undefined
    };

    // Update context first
    updatePrizes(prizesData);

    // Save buy-in to database immediately
    if (buyIn !== tripData.buyIn) {
      console.log('Saving buy-in to database:', buyIn);
      const result = await saveEvent({ buyIn: buyIn });
      if (!result.success) {
        console.error('Failed to save buy-in:', result.error);
      }
    }

    navigate('/app/create/players');
  };

  const updatePayoutStructure = (field: keyof typeof payoutStructure, value: number) => {
    setPayoutStructure(prev => ({ ...prev, [field]: value }));
  };

  const updateContestPrizes = (field: keyof typeof contestPrizes, value: number | string) => {
    setContestPrizes(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleNext}
        onPrevious={handlePrevious}
        nextDisabled={false}
      />

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-emerald-600" />
            Prizes & Buy-In
          </CardTitle>
          <CardDescription className="text-green-600">
            Set up prize money and tournament entry fees (all optional)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Buy-In Section */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                Entry Buy-In
              </CardTitle>
              <CardDescription className="text-green-600">
                Optional entry fee per player
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-800 font-medium">
                  Buy-In Amount ($)
                </Label>
                <Input
                  type="number"
                  min="0"
                  step="1"
                  value={buyIn || ''}
                  onChange={(e) => setBuyIn(e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="e.g., 50"
                  className="border-green-200 focus:border-emerald-500 bg-white max-w-48"
                />
                <p className="text-sm text-green-600">
                  This will be used to fund the prize pool
                </p>
              </div>

              {buyIn && buyIn > 0 && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">
                    <div className="space-y-1">
                      <div>Buy-in per player: <Badge variant="secondary">${buyIn}</Badge></div>
                      <div>Total prize pool: <Badge variant="secondary">${totalBuyIns}</Badge> ({playerCount} players)</div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Payout Structure */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-green-900 flex items-center">
                    <Gift className="h-5 w-5 mr-2 text-emerald-600" />
                    Prize Payouts
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Prize money for tournament winners
                  </CardDescription>
                </div>
                <Switch
                  checked={enablePayout}
                  onCheckedChange={setEnablePayout}
                  disabled={!!buyIn && buyIn > 0} // Disable when buy-in is set
                />
              </div>
            </CardHeader>
            
            {enablePayout && (
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Champion ($)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={payoutStructure.champion || ''}
                      onChange={(e) => updatePayoutStructure('champion', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="border-green-200 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Runner-Up ($)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={payoutStructure.runnerUp || ''}
                      onChange={(e) => updatePayoutStructure('runnerUp', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="border-green-200 focus:border-emerald-500 bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-green-800 font-medium">
                      Third Place ($)
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={payoutStructure.third || ''}
                      onChange={(e) => updatePayoutStructure('third', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className="border-green-200 focus:border-emerald-500 bg-white"
                    />
                  </div>
                </div>

                {totalPayout > 0 && buyIn && (
                  <Alert className={`${totalBuyIns - totalPayout >= 0 ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <AlertDescription className={totalBuyIns - totalPayout >= 0 ? 'text-green-700' : 'text-orange-700'}>
                      {totalBuyIns - totalPrizes >= 0
                        ? <>Remaining in pool: <Badge variant="secondary">${totalBuyIns - totalPrizes}</Badge></>
                        : <>⚠️ Exceeds pool by: <Badge variant="destructive">${totalPrizes - totalBuyIns}</Badge></>
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>

          {/* Skills Contest Prizes */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg text-green-900 flex items-center">
                    <Target className="h-5 w-5 mr-2 text-emerald-600" />
                    Skills Contest Prizes
                  </CardTitle>
                  <CardDescription className="text-green-600">
                    Prizes for closest to pin, longest drive, etc.
                  </CardDescription>
                </div>
                <Switch
                  checked={enableContests}
                  onCheckedChange={setEnableContests}
                />
              </div>
            </CardHeader>
            
            {enableContests && (
              <CardContent className="space-y-4">
                {skillsContestsFromCourses.length > 0 ? (
                  <>
                    <Alert className="border-blue-200 bg-blue-50">
                      <AlertDescription className="text-blue-700">
                        <div className="font-medium mb-2">Skills Contests from Courses:</div>
                        <div className="space-y-1 text-sm">
                          {skillsContestsFromCourses.map((contest, index) => (
                            <div key={index}>
                              • {contest.roundName} - Hole {contest.hole}: {contest.type}
                            </div>
                          ))}
                        </div>
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">
                          Longest Drive Prize ($) {longestDriveCount > 0 && `× ${longestDriveCount} contests`}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={contestPrizes.longestDrive || ''}
                          onChange={(e) => updateContestPrizes('longestDrive', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="border-green-200 focus:border-emerald-500 bg-white"
                          disabled={longestDriveCount === 0}
                        />
                        {longestDriveCount === 0 && (
                          <p className="text-sm text-gray-500">No longest drive contests set up in courses</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-green-800 font-medium">
                          Closest to Pin Prize ($) {closestToPinCount > 0 && `× ${closestToPinCount} contests`}
                        </Label>
                        <Input
                          type="number"
                          min="0"
                          value={contestPrizes.closestToPin || ''}
                          onChange={(e) => updateContestPrizes('closestToPin', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="border-green-200 focus:border-emerald-500 bg-white"
                          disabled={closestToPinCount === 0}
                        />
                        {closestToPinCount === 0 && (
                          <p className="text-sm text-gray-500">No closest to pin contests set up in courses</p>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <Alert className="border-yellow-200 bg-yellow-50">
                    <AlertDescription className="text-yellow-700">
                      No skills contests have been set up in the Courses section yet.
                      Go back to add some contests to configure prizes here.
                    </AlertDescription>
                  </Alert>
                )}

                {totalContestPrizes > 0 && buyIn && (
                  <Alert className={`${totalBuyIns - totalPrizes >= 0 ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
                    <AlertDescription className={totalBuyIns - totalPrizes >= 0 ? 'text-green-700' : 'text-orange-700'}>
                      {totalBuyIns - totalPrizes >= 0
                        ? <>Remaining in pool: <Badge variant="secondary">${totalBuyIns - totalPrizes}</Badge></>
                        : <>⚠️ Exceeds pool by: <Badge variant="destructive">${totalPrizes - totalBuyIns}</Badge></>
                      }
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>

          {/* Prize Summary */}
          {(buyIn || totalPrizes > 0) && (
            <Alert className="border-emerald-200 bg-emerald-50">
              <AlertDescription className="text-emerald-700">
                <div className="space-y-2">
                  <div className="font-semibold">Prize Pool Summary:</div>
                  {buyIn && <div>Prize pool funding: <Badge variant="secondary">${totalBuyIns}</Badge></div>}
                  {totalPrizes > 0 && <div>Total prizes: <Badge variant="secondary">${totalPrizes}</Badge></div>}
                  {buyIn && totalPrizes > 0 && (
                    <div className={`text-sm ${totalPrizes > totalBuyIns ? 'text-orange-700' : 'text-emerald-700'}`}>
                      {totalPrizes > totalBuyIns 
                        ? `⚠️ Prizes exceed buy-in pool by $${totalPrizes - totalBuyIns}` 
                        : `✅ ${totalBuyIns - totalPrizes > 0 ? `$${totalBuyIns - totalPrizes} remaining in pool` : 'Prize pool fully allocated'}`
                      }
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Helper Text */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              <strong>All optional:</strong> You can run a great tournament without any money involved.
              Prizes add excitement but aren't required for a successful golf event.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
