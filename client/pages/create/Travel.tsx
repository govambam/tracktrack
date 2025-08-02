import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Plane, Building, Calendar, Info } from "lucide-react";

export default function Travel() {
  const navigate = useNavigate();
  const { state, updateTravel } = useTripCreation();
  const { tripData } = state;

  const [travelInfo, setTravelInfo] = useState({
    flightTimes: tripData.travelInfo?.flightTimes || '',
    accommodations: tripData.travelInfo?.accommodations || '',
    dailySchedule: tripData.travelInfo?.dailySchedule || ''
  });

  const handleNext = () => {
    updateTravel({
      travelInfo: Object.values(travelInfo).some(val => val.trim()) ? travelInfo : undefined
    });
    navigate('/app/create/customization');
  };

  const handlePrevious = () => {
    updateTravel({
      travelInfo: Object.values(travelInfo).some(val => val.trim()) ? travelInfo : undefined
    });
    navigate('/app/create/prizes');
  };

  const updateTravelInfo = (field: keyof typeof travelInfo, value: string) => {
    setTravelInfo(prev => ({ ...prev, [field]: value }));
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
            <Plane className="h-5 w-5 mr-2 text-emerald-600" />
            Travel & Logistics
          </CardTitle>
          <CardDescription className="text-green-600">
            Share travel details and daily schedules for your event (all optional)
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Flight Information */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Plane className="h-5 w-5 mr-2 text-emerald-600" />
                Flight Information
              </CardTitle>
              <CardDescription className="text-green-600">
                Share flight times, airports, or travel recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-800 font-medium">
                  Flight Details & Travel Info
                </Label>
                <Textarea
                  value={travelInfo.flightTimes}
                  onChange={(e) => updateTravelInfo('flightTimes', e.target.value)}
                  placeholder={`Example:
Departure: March 15, 2024 at 7:30 AM (LAX Terminal 6)
Arrival: March 15, 2024 at 10:45 AM (SFO Terminal 1)

Return: March 17, 2024 at 6:00 PM (SFO Terminal 1)
Arrival: March 17, 2024 at 8:30 PM (LAX Terminal 6)

Group rate available with United Airlines (Group Code: ABC123)
Book by February 1st for best rates.`}
                  rows={8}
                  className="border-green-200 focus:border-emerald-500 bg-white"
                />
                <p className="text-sm text-green-600">
                  Include departure/arrival times, airports, airlines, group booking codes, or travel tips
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Accommodations */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Building className="h-5 w-5 mr-2 text-emerald-600" />
                Accommodations
              </CardTitle>
              <CardDescription className="text-green-600">
                Hotel details, booking information, and lodging arrangements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-800 font-medium">
                  Hotel & Lodging Details
                </Label>
                <Textarea
                  value={travelInfo.accommodations}
                  onChange={(e) => updateTravelInfo('accommodations', e.target.value)}
                  placeholder={`Example:
The Lodge at Pebble Beach
1700 17-Mile Drive, Pebble Beach, CA 93953
Phone: (831) 624-3811

Check-in: March 15, 3:00 PM
Check-out: March 17, 12:00 PM

Group Rate: $450/night (mention "Smith Golf Trip")
Includes breakfast and golf course shuttle service.

Reservation deadline: February 15th
Contact Sarah Johnson for group booking: sarah@lodge.com`}
                  rows={8}
                  className="border-green-200 focus:border-emerald-500 bg-white"
                />
                <p className="text-sm text-green-600">
                  Include hotel names, addresses, phone numbers, group rates, and booking deadlines
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Daily Schedule */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-emerald-600" />
                Daily Schedule
              </CardTitle>
              <CardDescription className="text-green-600">
                Detailed itinerary for each day of the trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-800 font-medium">
                  Trip Itinerary
                </Label>
                <Textarea
                  value={travelInfo.dailySchedule}
                  onChange={(e) => updateTravelInfo('dailySchedule', e.target.value)}
                  placeholder={`Example:
FRIDAY, MARCH 15
10:45 AM - Arrive at SFO
12:00 PM - Shuttle to Pebble Beach (arranged transport)
2:00 PM - Check-in at The Lodge
3:30 PM - Welcome drinks at the clubhouse
5:00 PM - Practice round at The Links (optional)
7:30 PM - Group dinner at Stillwater Bar & Grill

SATURDAY, MARCH 16
7:00 AM - Breakfast at The Lodge
8:30 AM - First tee time at Pebble Beach Golf Links
1:00 PM - Lunch at Pebble Beach Pro Shop
2:30 PM - Second round at Spyglass Hill
6:00 PM - Cocktail hour and awards ceremony
8:00 PM - Dinner at Pescadero Point

SUNDAY, MARCH 17
8:00 AM - Breakfast and checkout
10:00 AM - Final round at Monterey Peninsula Country Club
2:00 PM - Farewell lunch
4:00 PM - Depart for airport`}
                  rows={12}
                  className="border-green-200 focus:border-emerald-500 bg-white"
                />
                <p className="text-sm text-green-600">
                  Include tee times, meals, activities, and any special events planned
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Helper Text */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 mr-2 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <strong>Planning tip:</strong> The more details you provide, the smoother your event will run.
              Participants appreciate having all the information in one place, especially for multi-day events.
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              <strong>All optional:</strong> You can skip this section and add travel details later. 
              Some trips work better with less structure and more flexibility.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
