import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Target, TrendingUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Scoring() {
  const navigate = useNavigate();
  const { state, updateScoring } = useTripCreation();
  const { tripData } = state;

  const [scoringFormat, setScoringFormat] = useState<'stroke-play' | 'modified-stableford'>(
    tripData.scoringFormat || 'stroke-play'
  );

  const defaultStablefordPoints = {
    eagle: 4,
    birdie: 2,
    par: 0,
    bogey: -1,
    doubleBogey: -2
  };

  const handleNext = () => {
    const scoringData = {
      scoringFormat,
      ...(scoringFormat === 'modified-stableford' && {
        stablefordPoints: defaultStablefordPoints
      })
    };
    
    updateScoring(scoringData);
    navigate('/app/create/players');
  };

  const handlePrevious = () => {
    updateScoring({ scoringFormat });
    navigate('/app/create/courses');
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
            <Target className="h-5 w-5 mr-2 text-emerald-600" />
            Scoring Format
          </CardTitle>
          <CardDescription className="text-green-600">
            Choose how scores will be calculated for your tournament
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <RadioGroup
            value={scoringFormat}
            onValueChange={(value) => setScoringFormat(value as 'stroke-play' | 'modified-stableford')}
            className="space-y-4"
          >
            {/* Stroke Play Option */}
            <Card className={cn(
              "cursor-pointer transition-all border-2",
              scoringFormat === 'stroke-play' 
                ? "border-emerald-500 bg-emerald-50" 
                : "border-green-100 hover:border-green-200"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem 
                    value="stroke-play" 
                    id="stroke-play"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="stroke-play" 
                      className="text-lg font-semibold text-green-900 cursor-pointer flex items-center"
                    >
                      <TrendingUp className="h-5 w-5 mr-2 text-emerald-600" />
                      Stroke Play (Traditional)
                    </Label>
                    <p className="text-green-600 mt-2">
                      Players compete based on their total number of strokes. 
                      Lowest score wins. This is the most common tournament format.
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-green-800">Best for:</p>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Traditional golf tournaments</li>
                        <li>• Players of similar skill levels</li>
                        <li>• Straightforward scoring</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Modified Stableford Option */}
            <Card className={cn(
              "cursor-pointer transition-all border-2",
              scoringFormat === 'modified-stableford' 
                ? "border-emerald-500 bg-emerald-50" 
                : "border-green-100 hover:border-green-200"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <RadioGroupItem 
                    value="modified-stableford" 
                    id="modified-stableford"
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <Label 
                      htmlFor="modified-stableford" 
                      className="text-lg font-semibold text-green-900 cursor-pointer flex items-center"
                    >
                      <Target className="h-5 w-5 mr-2 text-emerald-600" />
                      Stableford (Points-Based)
                    </Label>
                    <p className="text-green-600 mt-2">
                      Players earn points based on their performance on each hole relative to par. 
                      Highest point total wins. More exciting and forgiving format.
                    </p>
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-green-800">Best for:</p>
                      <ul className="text-sm text-green-600 space-y-1">
                        <li>• Mixed skill level groups</li>
                        <li>• More engaging gameplay</li>
                        <li>• Reward aggressive play</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </RadioGroup>

          {/* Stableford Points System */}
          {scoringFormat === 'modified-stableford' && (
            <Card className="border-blue-100 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg text-blue-900 flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Points System
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Default point values (can be customized later)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="font-bold text-green-700 text-lg">+4</div>
                    <div className="text-sm text-green-600">Eagle</div>
                    <div className="text-xs text-gray-500">(-2 strokes)</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="font-bold text-green-700 text-lg">+2</div>
                    <div className="text-sm text-green-600">Birdie</div>
                    <div className="text-xs text-gray-500">(-1 stroke)</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="font-bold text-blue-700 text-lg">0</div>
                    <div className="text-sm text-blue-600">Par</div>
                    <div className="text-xs text-gray-500">(Even)</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="font-bold text-orange-700 text-lg">-1</div>
                    <div className="text-sm text-orange-600">Bogey</div>
                    <div className="text-xs text-gray-500">(+1 stroke)</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg border">
                    <div className="font-bold text-red-700 text-lg">-2</div>
                    <div className="text-sm text-red-600">Double Bogey+</div>
                    <div className="text-xs text-gray-500">(+2 strokes)</div>
                  </div>
                </div>
                <Alert className="mt-4 border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">
                    This points system encourages aggressive play and keeps everyone engaged throughout the round.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Format Comparison */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              <strong>Quick tip:</strong> You can always change the scoring format later. 
              {scoringFormat === 'stroke-play' 
                ? " Stroke play is perfect for traditional tournaments." 
                : " Modified Stableford keeps everyone engaged and rewards good shots."
              }
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
