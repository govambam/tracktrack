import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  Globe,
  BarChart3,
  MessageSquare,
  Database,
  Smartphone,
  Users,
  Calendar,
  Trophy,
  Star,
  Check,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      category: "Trip Planning",
      items: [
        {
          icon: Sparkles,
          title: "AI-Powered Itinerary Creation",
          description: "Get personalized golf trip recommendations based on your preferences, budget, and group size.",
          benefits: ["Smart course selection", "Optimal routing", "Weather considerations", "Group preferences"]
        },
        {
          icon: Calendar,
          title: "Smart Scheduling",
          description: "Coordinate tee times, meals, and activities with intelligent scheduling that works for everyone.",
          benefits: ["Tee time optimization", "Restaurant reservations", "Activity planning", "Travel coordination"]
        },
        {
          icon: Database,
          title: "Comprehensive Course Database",
          description: "Access detailed information on thousands of golf courses worldwide with photos and reviews.",
          benefits: ["Course photos & videos", "Hole-by-hole guides", "Player reviews", "Pricing information"]
        }
      ]
    },
    {
      category: "Trip Experience",
      items: [
        {
          icon: Globe,
          title: "Custom Trip Websites",
          description: "Create stunning, branded websites for your golf trips with professional themes and layouts.",
          benefits: ["Professional themes", "Custom branding", "Mobile optimization", "Easy sharing"]
        },
        {
          icon: BarChart3,
          title: "Live Scoring & Leaderboards",
          description: "Track scores in real-time with multiple formats and keep everyone engaged throughout the trip.",
          benefits: ["Multiple scoring formats", "Live updates", "Skill contests", "Historical tracking"]
        },
        {
          icon: MessageSquare,
          title: "Private Clubhouse",
          description: "Members-only area for communication, score entry, and sharing trip memories.",
          benefits: ["Group messaging", "Photo sharing", "Announcements", "Score entry"]
        }
      ]
    },
    {
      category: "Management",
      items: [
        {
          icon: Users,
          title: "Player Management",
          description: "Easily manage invitations, RSVPs, and player information for your golf trips.",
          benefits: ["Easy invitations", "RSVP tracking", "Player profiles", "Group communication"]
        },
        {
          icon: Smartphone,
          title: "Mobile-First Design",
          description: "Perfect experience on all devices with responsive design and mobile apps.",
          benefits: ["Native mobile apps", "Offline capabilities", "Push notifications", "Cross-platform sync"]
        },
        {
          icon: Trophy,
          title: "Competition Formats",
          description: "Support for various tournament formats and custom competitions to add excitement.",
          benefits: ["Stroke play", "Match play", "Stableford", "Custom formats"]
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              TrackTrack
            </Link>
            <div className="flex items-center space-x-4">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
              >
                Back to Home
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-emerald-50 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="text-emerald-600 block">Unforgettable Golf Trips</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Everything you need to plan, organize, and enjoy the perfect golf trip with friends. 
            From AI-powered planning to real-time scoring, we've got you covered.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg"
          >
            Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Features Sections */}
      {features.map((category, categoryIndex) => (
        <section key={category.category} className={`py-20 ${categoryIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {category.category}
              </h2>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {category.items.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="border-gray-200 hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 text-emerald-600 rounded-lg mb-4">
                        <Icon className="h-6 w-6" />
                      </div>
                      <CardTitle className="text-xl text-gray-900 mb-2">
                        {feature.title}
                      </CardTitle>
                      <p className="text-gray-600">
                        {feature.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, benefitIndex) => (
                          <li key={benefitIndex} className="flex items-center space-x-2">
                            <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TrackTrack?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare us to traditional golf trip planning methods and see the difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 text-center">
                  Traditional Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-red-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>Hours of research and coordination</span>
                </div>
                <div className="flex items-center space-x-3 text-red-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>Multiple spreadsheets and documents</span>
                </div>
                <div className="flex items-center space-x-3 text-red-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>Manual score tracking on paper</span>
                </div>
                <div className="flex items-center space-x-3 text-red-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>Scattered communication across platforms</span>
                </div>
                <div className="flex items-center space-x-3 text-red-600">
                  <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                  <span>No centralized trip information</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle className="text-xl text-gray-900 text-center flex items-center justify-center">
                  <Star className="h-5 w-5 text-emerald-600 mr-2" />
                  TrackTrack
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3 text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>AI-powered planning in minutes</span>
                </div>
                <div className="flex items-center space-x-3 text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>All-in-one platform for everything</span>
                </div>
                <div className="flex items-center space-x-3 text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Real-time digital scoring and leaderboards</span>
                </div>
                <div className="flex items-center space-x-3 text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Integrated communication and updates</span>
                </div>
                <div className="flex items-center space-x-3 text-emerald-600">
                  <Check className="h-4 w-4" />
                  <span>Beautiful trip website for sharing</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Start your free trial today and see how easy it is to plan the perfect golf trip.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-white text-emerald-600 hover:bg-gray-100 transition-colors shadow-lg"
          >
            Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
