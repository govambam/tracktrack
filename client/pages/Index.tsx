import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Trophy, Users } from "lucide-react";

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-6">
              Elevate Your
              <span className="text-emerald-600 block">Golf Experience</span>
            </h1>
            <p className="text-xl text-green-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning custom websites for golf events and tournaments.
              Track scores live, manage events, and bring your golf community together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg">
                <Link to="/login">
                  Log In
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Golf Course Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-4 h-4 bg-green-600 rounded-full"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-emerald-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-green-700 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-5 h-5 bg-emerald-600 rounded-full"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
              Everything You Need for Golf Events
            </h2>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Professional tools to create, manage, and showcase your golf events and tournaments
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-green-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-4">Build Custom Golf Event Websites</h3>
              <p className="text-green-600">
                Create beautiful, personalized websites for your golf events with custom branding,
                itineraries, and participant information.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-green-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-4">Track Scores Live</h3>
              <p className="text-green-600">
                Real-time score tracking and leaderboards keep everyone engaged. 
                Update scores on the go and watch the competition unfold.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-green-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-4">Manage Tournaments</h3>
              <p className="text-green-600">
                Organize participants, set up brackets, manage tee times, 
                and handle all tournament logistics from one central platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Golf Events?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of golf enthusiasts who are already creating amazing experiences
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
            <Link to="/signup">
              Start Your First Trip <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
