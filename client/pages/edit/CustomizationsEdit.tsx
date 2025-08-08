import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Palette,
  Home,
  MapPin,
  Target,
  Trophy,
  Plane,
  Info,
} from "lucide-react";

export default function CustomizationsEdit() {
  return (
    <div className="space-y-6">
      <Card className="border-purple-100">
        <CardHeader>
          <CardTitle className="text-lg text-purple-900 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-purple-600" />
            Event Website Customization
          </CardTitle>
          <CardDescription className="text-purple-600">
            Customize the content and appearance of your public event website.
            Use the navigation menu to access different customization sections.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-700">
              <div className="font-semibold">Getting Started</div>
              <div className="mt-1">
                Select a customization section from the left navigation menu to
                begin customizing your event website:
              </div>
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-purple-100 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Home className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Home</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Set the homepage headline and enable/disable the home page for
                  your event website.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <MapPin className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Courses</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Add course descriptions, images, yardage, par, and weather
                  notes for each course in your event.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Target className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Rules</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Define tournament rules and scoring guidelines that will be
                  displayed to participants.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Trophy className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Leaderboard</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Configure leaderboard settings. Live scoring functionality
                  coming soon.
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-100 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Plane className="h-5 w-5 text-purple-600" />
                  <h3 className="font-medium text-purple-900">Travel</h3>
                </div>
                <p className="text-sm text-purple-700">
                  Provide lodging, airport, and travel information for attendees
                  visiting your event.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
