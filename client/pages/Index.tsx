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
  Zap,
  Target,
  Heart,
  Palette,
  Bot,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentLeaderboardSlide, setCurrentLeaderboardSlide] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState(0);
  const navigate = useNavigate();

  // Hero theme data
  const heroThemes = [
    {
      name: "Tour Tech",
      image:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/Tour_Tech_home.png",
      gradient: "from-white to-orange-500",
    },
    {
      name: "GolfOS",
      image:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/GolfOS_home.png",
      gradient: "from-blue-500 to-purple-600",
    },
    {
      name: "Masters",
      image:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/Masters_home.png",
      gradient: "from-green-500 to-yellow-500",
    },
  ];

  // Leaderboard carousel data
  const leaderboardSlides = [
    {
      title: "Stableford Scoring",
      description: "Points-based competition that keeps everyone in the game",
      image:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/event_site_stableford.png",
      color: "from-blue-500 to-purple-600",
    },
    {
      title: "Prize Money Tracking",
      description: "Real-time money distribution and skill contest winnings",
      image:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/event_site_money.png",
      color: "from-green-500 to-emerald-600",
    },
    {
      title: "Digital Scorecards",
      description: "Track every shot with beautiful, easy-to-use scorecards",
      image:
        "https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/event_site_scorecard.png",
      color: "from-orange-500 to-red-600",
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

  // Auto-advance leaderboard carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentLeaderboardSlide(
        (prev) => (prev + 1) % leaderboardSlides.length,
      );
    }, 4000);
    return () => clearInterval(timer);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/"
                className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                TrackTrack
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  className="text-gray-700 hover:text-purple-600 text-sm font-medium transition-colors relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 transition-all group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
                </div>
              ) : isAuthenticated ? (
                <Button
                  onClick={handleGoToApp}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-full px-6 shadow-lg hover:shadow-xl transition-all"
                >
                  Go to App <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-purple-600 text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="inline-flex items-center px-6 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
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
            <div className="md:hidden border-t border-white/20 py-4 bg-white/90 backdrop-blur-lg">
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                {!isAuthenticated && (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-3 py-2 text-base font-medium bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all"
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
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-50/50 to-orange-100/50"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              Golf trips made effortless
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              It all starts with a{" "}
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                suggestion
              </span>
              <span className="block text-3xl md:text-4xl lg:text-5xl mt-2 text-gray-600">
                (and we'll help you build a very compelling one)
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed max-w-4xl mx-auto">
              Bring friends together more often with AI-assisted planning,
              beautiful custom sites, and seamless tools for unforgettable golf
              trips.
            </p>
            <div className="flex flex-col items-center gap-4 mb-12">
              {isAuthenticated ? (
                <Button
                  onClick={handleGoToApp}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 text-lg h-auto rounded-full shadow-lg hover:shadow-xl transition-all"
                >
                  Go to My Trips <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    Start Planning <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                  <p className="text-sm text-gray-500 flex items-center">
                    <Zap className="w-4 h-4 mr-1 text-yellow-500" />
                    Build your first website in less than 5 minutes
                  </p>
                </>
              )}
            </div>

            {/* Hero Image */}
            <div className="relative max-w-7xl mx-auto">
              <div className="relative w-full">
                {/* Theme Screenshot - Full Width */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl w-full">
                  <img
                    src={heroThemes[selectedTheme].image}
                    alt={`${heroThemes[selectedTheme].name} theme homepage`}
                    className="w-full h-auto transition-all duration-300"
                  />
                </div>
              </div>

              {/* Theme Selector directly below image */}
              <div className="text-center mt-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Trip, Your Style
                </h3>
                <p className="text-gray-600 mb-6">
                  Switch themes instantly to match your vibe
                </p>

                {/* Theme Selector Circles */}
                <div className="flex justify-center gap-4">
                  {heroThemes.map((theme, index) => (
                    <button
                      key={theme.name}
                      onClick={() => setSelectedTheme(index)}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${theme.gradient} shadow-lg transition-all duration-300 border-2 ${
                        selectedTheme === index
                          ? "border-gray-800 scale-110"
                          : "border-gray-300 hover:border-gray-500 hover:scale-105"
                      }`}
                      title={`Switch to ${theme.name} theme`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard Carousel Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-sm font-medium mb-6">
              <Trophy className="w-4 h-4 mr-2" />
              Competition & Scoring
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Competition that brings out your best
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Multiple scoring formats and real-time updates keep everyone
              engaged and the competition fierce.
            </p>
          </div>

          <div className="w-full">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              {leaderboardSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`transition-all duration-500 ${
                    index === currentLeaderboardSlide
                      ? "opacity-100"
                      : "opacity-0 absolute inset-0"
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>

            {/* Carousel indicators */}
            <div className="flex justify-center space-x-2 mt-6">
              {leaderboardSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentLeaderboardSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentLeaderboardSlide
                      ? "bg-purple-600 scale-110"
                      : "bg-gray-300 hover:bg-gray-400"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Clubhouse Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-pink-100 text-orange-700 text-sm font-medium mb-6">
              <MessageSquare className="w-4 h-4 mr-2" />
              Stay Connected
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Your private clubhouse for trip memories
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Keep your group connected before, during, and after your trip.
              Share updates, enter scores, and relive the best moments together.
            </p>
          </div>
          <div className="w-full">
            <img
              src="https://jktbmygutktbjjuzuwgq.supabase.co/storage/v1/object/public/tracktrack/event_site_clubhouse.png"
              alt="Private clubhouse showing group chat and score entry"
              className="w-full h-auto rounded-2xl shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section
        id="features"
        className="py-20 bg-gradient-to-br from-orange-50/50 to-purple-50/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
              Everything you need for epic golf trips
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From planning to playing to celebrating, we've got every aspect
              covered with style and substance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Bot className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  AI-Assisted Planning
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Plan your entire golf trip in minutes. Just enter your
                  preferences and let AI do the work.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Globe className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Custom Trip Websites
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Shareable websites with professional themes and customizable
                  details. Branded, stylish, and built for your group.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Real-Time Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Track scores live and show off your competition with real-time
                  updates and multiple scoring formats.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Private Clubhouse
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  A private hub for your trip group. Enter scores, post
                  announcements, and stay connected via group chat.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-pink-50 to-pink-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Smartphone className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Mobile-First Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Works beautifully on any device. Designed to look great
                  everywhere — phones, tablets, laptops.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Database className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Course Database
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Thousands of courses enriched with detailed info and photos to
                  enhance your trip site.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Custom Scoring Formats
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Support for Stableford, scrambles, and more. Customize points,
                  team formats, and round types.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-indigo-50 to-indigo-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-2 group">
              <CardHeader className="text-center pb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-2xl mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Palette className="h-8 w-8" />
                </div>
                <CardTitle className="text-lg text-gray-900">
                  Themes & Flair
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 text-sm">
                  Choose from pre-built themes and personalize your site with
                  colors, logos, and inside jokes.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-600/90 to-pink-600/90"></div>
          <div className="absolute top-10 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Ready to plan your next golf adventure?
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
            Join thousands of golfers who are already creating unforgettable
            experiences with their friends. Start planning in less than 5
            minutes.
          </p>
          {isAuthenticated ? (
            <Button
              onClick={handleGoToApp}
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg h-auto rounded-full font-semibold shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              Create Your Trip <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          ) : (
            <Link
              to="/signup"
              className="inline-flex items-center justify-center px-8 py-4 rounded-full text-lg font-semibold bg-white text-purple-600 hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
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
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
              TrackTrack
            </div>
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
