import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Trophy,
  Users,
  ChevronRight,
  TrendingUp,
  Star,
} from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-green-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-green-900">
                TrackTrack
              </Link>
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-green-700 hover:text-emerald-600 text-sm font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-6">
              Elevate Your
              <span className="text-emerald-600 block">Golf Experience</span>
            </h1>
            <p className="text-xl text-green-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning custom websites for golf events and tournaments.
              Track scores live, manage events, and bring your golf community
              together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 rounded-md text-lg font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Get Started <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-3 rounded-md text-lg font-medium border border-green-100 bg-white text-green-700 hover:bg-green-50 transition-colors cursor-pointer"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
              Everything You Need for Golf Events
            </h2>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Professional tools to create, manage, and showcase your golf
              events and tournaments
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-lg mb-4 mx-auto">
                  <Calendar className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-green-900">
                  Build Custom Golf Event Websites
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-600">
                  Create beautiful, personalized websites for your golf events
                  with custom branding, itineraries, and participant
                  information.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-lg mb-4 mx-auto">
                  <Trophy className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-green-900">
                  Track Scores Live
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-600">
                  Real-time score tracking and leaderboards keep everyone
                  engaged. Update scores on the go and watch the competition
                  unfold.
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-100 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-lg mb-4 mx-auto">
                  <Users className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-green-900">
                  Manage Tournaments
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-green-600">
                  Organize participants, set up brackets, manage tee times, and
                  handle all tournament logistics from one central platform.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Events Created
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">10,000+</div>
                <p className="text-xs text-green-600">Golf events managed</p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Active Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">5,000+</div>
                <p className="text-xs text-green-600">Golf enthusiasts</p>
              </CardContent>
            </Card>

            <Card className="border-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">98%</div>
                <p className="text-xs text-green-600">Customer rating</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-green-100 bg-gradient-to-r from-emerald-50 to-green-50">
            <CardContent className="text-center py-16">
              <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-6">
                Ready to Transform Your Golf Events?
              </h2>
              <p className="text-xl text-green-600 mb-8">
                Join thousands of golf enthusiasts who are already creating
                amazing experiences
              </p>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center px-8 py-3 rounded-md text-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                Start Your First Event <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
