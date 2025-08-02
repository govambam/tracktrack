import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Plus, Trophy } from "lucide-react";

export default function MyTrips() {
  const trips = [
    {
      id: 1,
      title: "Pebble Beach Weekend",
      description: "Annual company golf retreat at the iconic Pebble Beach Golf Links",
      dates: "March 15-17, 2024",
      location: "Pebble Beach, CA",
      participants: 12,
      status: "upcoming",
      course: "Pebble Beach Golf Links",
      image: "🏌️‍♂️"
    },
    {
      id: 2,
      title: "Augusta Masters Experience",
      description: "VIP Masters Tournament experience with practice rounds",
      dates: "April 8-12, 2024",
      location: "Augusta, GA",
      participants: 8,
      status: "planning",
      course: "Augusta National Golf Club",
      image: "🏆"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "planning":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-green-900">My Golf Trips</h1>
          <p className="text-green-600 mt-1">Manage and track your golf adventures</p>
        </div>
        <Button asChild className="mt-4 sm:mt-0 bg-emerald-600 hover:bg-emerald-700">
          <Link to="/app/create">
            <Plus className="h-4 w-4 mr-2" />
            Create New Trip
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Trips</CardTitle>
            <Calendar className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">2</div>
            <p className="text-xs text-green-600">+1 from last month</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Participants</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">20</div>
            <p className="text-xs text-green-600">Across all trips</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Upcoming Events</CardTitle>
            <Trophy className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">1</div>
            <p className="text-xs text-green-600">Next 30 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Trips Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trips.map((trip) => (
          <Card key={trip.id} className="border-green-100 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="text-3xl">{trip.image}</div>
                  <div>
                    <CardTitle className="text-xl text-green-900">{trip.title}</CardTitle>
                    <CardDescription className="text-green-600">{trip.description}</CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(trip.status)}>
                  {trip.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center text-green-700">
                  <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                  {trip.dates}
                </div>
                <div className="flex items-center text-green-700">
                  <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                  {trip.location}
                </div>
                <div className="flex items-center text-green-700">
                  <Users className="h-4 w-4 mr-2 text-emerald-600" />
                  {trip.participants} participants
                </div>
                <div className="flex items-center text-green-700">
                  <Trophy className="h-4 w-4 mr-2 text-emerald-600" />
                  {trip.course}
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                  View Details
                </Button>
                <Button variant="outline" size="sm" className="border-green-200 text-green-700 hover:bg-green-50">
                  Edit Trip
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State (if no trips) */}
      {trips.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-green-400 mb-4" />
          <h3 className="text-xl font-medium text-green-900 mb-2">No trips yet</h3>
          <p className="text-green-600 mb-6">Create your first golf trip to get started</p>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
            <Link to="/app/create">
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Trip
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
