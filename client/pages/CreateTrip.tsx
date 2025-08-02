import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, ArrowLeft, Calendar, MapPin, Users, Trophy } from "lucide-react";

export default function CreateTrip() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="outline" size="sm" asChild className="border-green-200 text-green-700 hover:bg-green-50">
          <Link to="/app">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to My Trips
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-green-900">Create New Trip</h1>
          <p className="text-green-600 mt-1">Set up your next golf adventure</p>
        </div>
      </div>

      {/* Placeholder Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-xl text-green-900 flex items-center">
                <Plus className="h-5 w-5 mr-2 text-emerald-600" />
                Trip Creation Coming Soon
              </CardTitle>
              <CardDescription className="text-green-600">
                We're building an amazing trip creation experience for you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-green-700">
                Soon you'll be able to create custom golf trips with features like:
              </p>
              <ul className="space-y-3">
                <li className="flex items-center text-green-700">
                  <Calendar className="h-4 w-4 mr-3 text-emerald-600" />
                  Trip dates and itinerary planning
                </li>
                <li className="flex items-center text-green-700">
                  <MapPin className="h-4 w-4 mr-3 text-emerald-600" />
                  Golf course selection and booking
                </li>
                <li className="flex items-center text-green-700">
                  <Users className="h-4 w-4 mr-3 text-emerald-600" />
                  Participant management and invitations
                </li>
                <li className="flex items-center text-green-700">
                  <Trophy className="h-4 w-4 mr-3 text-emerald-600" />
                  Tournament format and scoring setup
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Want to help shape this feature?</h3>
              <p className="text-blue-700 text-sm mb-4">
                We'd love to hear about your golf trip planning needs and preferences.
              </p>
              <Button variant="outline" size="sm" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Share Feedback
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Preview: Trip Creation Flow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">1. Basic Details</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">2. Course Selection</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">3. Participants</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">4. Tournament Format</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Coming Soon</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-green-800 font-medium">5. Publish & Share</span>
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">Coming Soon</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
