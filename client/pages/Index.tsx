import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Calendar,
  Trophy,
  Users,
  ChevronRight,
  TrendingUp,
  Star,
  Sparkles,
  Globe,
  Smartphone,
  BarChart3,
  MessageSquare,
  Database,
  Menu,
  X,
  Play,
  Check,
  ChevronLeft,
  ChevronDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState(0);
  const navigate = useNavigate();

  // Theme showcase data
  const themes = [
    {
      name: "Default",
      description: "Clean & Professional",
      mobileImage:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/Screenshot%202025-08-08%20at%2012.21.33%20AM-portrait.png",
      colors: { primary: "emerald", accent: "green" },
    },
    {
      name: "Masters",
      description: "Classic & Elegant",
      mobileImage:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/Screenshot%202025-08-08%20at%2012.22.15%20AM-portrait.png",
      colors: { primary: "amber", accent: "green" },
    },
    {
      name: "TourTech",
      description: "Modern & Sleek",
      mobileImage:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/Screenshot%202025-08-08%20at%2012.22.46%20AM-portrait.png",
      colors: { primary: "orange", accent: "slate" },
    },
  ];

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);
      } else {
        // Check localStorage as fallback
        const authStatus = localStorage.getItem("isAuthenticated");
        if (authStatus === "true") {
          setIsAuthenticated(true);
        }
      }
      setLoading(false);
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false);
      } else if (session?.user) {
        setIsAuthenticated(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGoToApp = () => {
    navigate("/app");
  };

  const navigationItems = [
    { label: "Product", href: "#features" },
    { label: "How it Works", href: "#how-it-works" },
    { label: "Templates", href: "#themes" },
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                TrackTrack
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-20 bg-gray-200 rounded"></div>
                </div>
              ) : isAuthenticated ? (
                <Button
                  onClick={handleGoToApp}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Go to App <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-100 py-4">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                  >
                    {item.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700 rounded-md"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-green-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Make Golf Trips
              <span className="text-emerald-600 block">Effortless.</span>
              <span className="text-gray-900 block">And Unforgettable.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Remove the friction from organizing golf trips with friends.
              AI-assisted planning, custom websites, real-time scoring, and
              everything you need to create memorable experiences.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {isAuthenticated ? (
                <Button
                  onClick={handleGoToApp}
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg h-auto rounded-xl"
                >
                  Go to My Trips <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Plan a Trip <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <Button
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg h-auto rounded-xl border-2 border-gray-200 hover:border-gray-300"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Watch Demo
                  </Button>
                </>
              )}
            </div>
            <p className="text-sm text-gray-500">
              ✨ Build your first website in less than 5 minutes
            </p>
          </div>
        </div>
      </section>

      {/* Theme Showcase Section */}
      <section id="themes" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Dynamic Themes That Wow
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from professional themes that look amazing on both desktop
              and mobile. Each theme creates a unique experience for your golf
              trip.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Theme Preview */}
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 left-4 flex space-x-2 z-10">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                </div>

                {/* Mobile Frame */}
                <div className="mx-auto max-w-sm">
                  <div className="relative bg-black rounded-[3rem] p-2 shadow-xl">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden">
                      <img
                        src={themes[currentTheme].mobileImage}
                        alt={`${themes[currentTheme].name} theme preview`}
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                </div>

                {/* Theme Indicators */}
                <div className="flex justify-center mt-8 space-x-2">
                  {themes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTheme(index)}
                      className={`w-3 h-3 rounded-full transition-colors ${
                        index === currentTheme
                          ? "bg-emerald-600"
                          : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating theme info */}
              <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-xl shadow-lg px-6 py-4 border">
                <div className="text-center">
                  <h3 className="font-semibold text-gray-900">
                    {themes[currentTheme].name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {themes[currentTheme].description}
                  </p>
                </div>
              </div>
            </div>

            {/* Theme Features */}
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Mobile & Desktop Friendly
                </h3>
                <p className="text-gray-600 mb-6">
                  Every theme is designed to look stunning on all devices. Your
                  golf trip website will provide an amazing experience whether
                  your friends are browsing on their phone or computer.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Instant Customization
                    </h4>
                    <p className="text-gray-600">
                      Switch themes with one click - no coding required
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Responsive Design
                    </h4>
                    <p className="text-gray-600">
                      Perfect experience on mobile, tablet, and desktop
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Check className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Brand Your Trip
                    </h4>
                    <p className="text-gray-600">
                      Add your logo, colors, and custom messaging
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need for Epic Golf Trips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From planning to playing to celebrating, we've got every aspect of
              your golf trip covered.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-600 rounded-xl mb-4 mx-auto">
                  <Sparkles className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  AI-Assisted Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Tell us your preferences and let AI create the perfect
                  itinerary, suggest courses, and plan your entire trip in
                  minutes.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 text-blue-600 rounded-xl mb-4 mx-auto">
                  <Globe className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Custom Trip Websites
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Create beautiful, shareable websites for your golf trips with
                  professional themes, custom branding, and all trip details.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 text-purple-600 rounded-xl mb-4 mx-auto">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Real-Time Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Track scores live with multiple formats: stroke play, match
                  play, Stableford, and custom competitions that keep everyone
                  engaged.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 text-orange-600 rounded-xl mb-4 mx-auto">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Private Clubhouse
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Members-only area for score entry, trip announcements, group
                  chat, and sharing memories from your golf adventure.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 text-green-600 rounded-xl mb-4 mx-auto">
                  <Database className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Course Database
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Access thousands of enriched golf courses with detailed info,
                  photos, hole layouts, and everything you need to plan your
                  rounds.
                </p>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-600 rounded-xl mb-4 mx-auto">
                  <Smartphone className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl text-gray-900">
                  Mobile-First Design
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600">
                  Perfect experience on every device with shareable, dynamic
                  pages that work seamlessly on mobile, tablet, and desktop.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              From Idea to Unforgettable Trip
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes organizing golf trips with friends
              easier than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6 mx-auto text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Plan with AI
              </h3>
              <p className="text-gray-600">
                Tell our AI your dates, location preferences, and group size.
                Get a complete itinerary with course recommendations in minutes.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6 mx-auto text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Create & Share
              </h3>
              <p className="text-gray-600">
                Build a beautiful trip website, invite your friends, and let
                them RSVP and see all the details in one place.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6 mx-auto text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Play & Track
              </h3>
              <p className="text-gray-600">
                Enjoy your trip with live scoring, leaderboards, and a private
                clubhouse to share memories and stay connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                10K+
              </div>
              <p className="text-gray-600">Golf Trips Planned</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                25K+
              </div>
              <p className="text-gray-600">Happy Golfers</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                5000+
              </div>
              <p className="text-gray-600">Golf Courses</p>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-emerald-600 mb-2">
                98%
              </div>
              <p className="text-gray-600">Satisfaction Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to Plan Your Next Golf Adventure?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Join thousands of golfers who are already creating unforgettable
            experiences with their friends. Start planning in less than 5
            minutes.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={handleGoToApp}
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg h-auto rounded-xl font-semibold"
            >
              Create Your Trip <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl text-lg font-semibold bg-white text-emerald-600 hover:bg-gray-100 transition-colors shadow-lg"
            >
              Start Planning Now <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">TrackTrack</div>
            <p className="text-gray-400 mb-8">
              Making golf trips effortless and unforgettable.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
              <Link to="/terms" className="hover:text-white transition-colors">
                Terms
              </Link>
              <Link
                to="/support"
                className="hover:text-white transition-colors"
              >
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
