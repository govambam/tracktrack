import { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Users,
  Target,
  Calendar,
  Trophy,
  Plane,
  Building,
  Clock,
  Star,
  Award,
  ChevronRight,
  Loader2,
  Sparkles,
  Home,
  BarChart3,
  X,
  MoreHorizontal,
  FileText,
  Info,
  Flag,
  Crosshair,
  Zap,
  Crown,
  Medal,
  CheckCircle,
} from "lucide-react";

interface EventData {
  id: string;
  name: string;
  description?: string;
  start_date: string;
  end_date: string;
  location: string;
  logo_url?: string;
  is_published: boolean;
  is_private: boolean;
  buy_in?: number;
}

interface EventPlayer {
  id: string;
  full_name: string;
  email?: string;
  handicap?: number;
  profile_image?: string;
}

interface EventCourse {
  id: string;
  name: string;
  par?: number;
  yardage?: number;
  image_url?: string;
  display_order?: number;
}

interface EventRound {
  id: string;
  course_name: string;
  round_date: string;
  tee_time?: string;
  scoring_type: string;
  holes: number;
}

interface EventPrize {
  id: string;
  category: string;
  amount: number;
  description: string;
}

interface TravelData {
  flight_info?: string;
  accommodations?: string;
  daily_schedule?: string;
}

interface EventCustomization {
  home_headline?: string;
}

// Custom hook for scroll animations
const useScrollAnimation = () => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: "50px" },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return { isVisible, elementRef };
};

// Theme utility function
const getThemeStyles = (theme: string = "GolfOS") => {
  if (theme === "TourTech") {
    return {
      // Layout & Container - Enterprise clean, no gradients
      heroContainer: "bg-white",
      heroGradient: "bg-white",
      cardBackground: "bg-white",
      sectionBackground: "bg-gray-50",
      modalBackground: "bg-white",

      // Typography - Compact, weight-based hierarchy with monospace emphasis
      heroTitle:
        "text-slate-900 font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight",
      heroSubtitle: "text-slate-600 font-normal text-base sm:text-lg",
      sectionTitle:
        "text-slate-900 font-semibold text-lg sm:text-xl tracking-tight",
      cardTitle: "text-slate-900 font-semibold text-base",
      cardText: "text-slate-600 text-sm",
      dataText: "font-mono text-slate-800 font-medium",
      monoText: "font-mono text-slate-800 font-medium",
      monoLabel: "font-mono text-xs uppercase tracking-wide text-slate-500",
      orangeText: "text-orange-600 font-medium",

      // Buttons - Solid, enterprise-style
      primaryButton:
        "bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors",
      secondaryButton:
        "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium transition-colors",
      accentColor: "text-orange-600",
      accentBackground: "bg-orange-600",

      // Borders & Shadows - Flat, minimal
      cardBorder: "border border-slate-200",
      cardShadow: "shadow-sm",
      cardHover: "hover:shadow-md transition-shadow",
      roundedCorners: "rounded-md",

      // Spacing - Compact, efficient
      containerPadding: "px-4 sm:px-6 lg:px-8",
      sectionPadding: "py-8 sm:py-10",
      cardPadding: "p-4 sm:p-5",
      headerSpacing: "mb-4",

      // Data Display - Monospace for clarity
      scoreFont: "font-mono font-semibold",
      tableHeader: "font-mono text-xs uppercase tracking-wide text-slate-500",
      tableCell: "font-mono text-sm text-slate-900",

      // Layout Constraints
      maxContentWidth: "max-w-4xl",
      textMaxWidth: "max-w-2xl",
    };
  }

  if (theme === "Masters") {
    return {
      // Layout & Container - Elegant with subtle warmth
      heroContainer: "bg-gradient-to-br from-amber-50/30 via-white to-green-50/20",
      heroGradient: "bg-gradient-to-br from-amber-50/20 via-white to-green-50/10",
      cardBackground: "bg-white",
      sectionBackground: "bg-gradient-to-b from-amber-50/20 to-white",
      modalBackground: "bg-white",

      // Typography - Serif elegance with refined hierarchy
      heroTitle: "font-serif font-semibold text-green-900 text-3xl md:text-7xl tracking-tight",
      heroSubtitle: "font-serif font-medium text-green-800/80 text-base sm:text-lg tracking-wide",
      sectionTitle: "font-serif font-semibold text-green-900 text-4xl tracking-tight",
      cardTitle: "font-serif font-semibold text-green-900 text-lg md:text-2xl tracking-tight",
      cardText: "text-green-800/70 text-sm md:text-lg",
      dataText: "font-sans font-semibold text-green-900",
      elegantText: "font-serif font-medium text-green-800 tracking-wide",
      goldText: "text-yellow-600 font-semibold",

      // Buttons - Refined with Masters colors
      primaryButton: "bg-green-800 hover:bg-green-900 text-amber-50 font-medium transition-all duration-300 transform hover:scale-105",
      secondaryButton: "bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-medium transition-all duration-300",
      accentColor: "text-yellow-600",
      accentBackground: "bg-yellow-600",

      // Borders & Shadows - Elegant with gold accents
      cardBorder: "border border-green-800/20",
      cardShadow: "shadow-sm hover:shadow-lg hover:shadow-green-900/10",
      cardHover: "hover:border-yellow-600 hover:scale-105 transition-all duration-300",
      roundedCorners: "rounded-lg",

      // Spacing - Generous, refined
      containerPadding: "px-6 sm:px-8 lg:px-12",
      sectionPadding: "py-20 sm:py-24",
      cardPadding: "p-6 sm:p-8",
      headerSpacing: "mb-6",

      // Data Display - Elegant serif for headings, sans for data
      scoreFont: "font-serif font-semibold",
      tableHeader: "font-serif text-sm font-medium tracking-wide text-green-800",
      tableCell: "font-sans text-base text-green-900",

      // Layout Constraints
      maxContentWidth: "max-w-6xl",
      textMaxWidth: "max-w-4xl",

      // Masters-specific styles
      mastersGreen: "text-green-800",
      mastersGreenDeep: "text-green-900",
      mastersGold: "text-yellow-600",
      mastersGoldLight: "text-yellow-500",
      mastersCream: "bg-amber-50",
      mastersIcon: "h-8 w-8 text-yellow-600",
      mastersIconSmall: "h-4 w-4 text-yellow-600",
    };
  }

  // Default GolfOS theme
  return {
    // Container styles
    heroContainer: "bg-gradient-to-br from-green-50 via-white to-emerald-50",
    heroGradient:
      "bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20",
    cardBackground: "bg-white/90 backdrop-blur-sm",
    sectionBackground:
      "bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20",

    // Typography
    heroTitle: "text-slate-900 font-bold tracking-tight",
    heroSubtitle: "text-slate-600",
    sectionTitle: "text-slate-900 font-bold tracking-tight",
    cardTitle: "text-slate-900 font-bold",
    cardText: "text-slate-600",

    // Buttons and accents
    primaryButton:
      "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white border-0",
    accentColor: "text-green-600",
    accentBackground: "bg-green-600",

    // Borders and shadows
    cardBorder: "border border-slate-200/50",
    cardShadow:
      "shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50",
    roundedCorners: "rounded-3xl",

    // Spacing
    containerPadding: "px-6 sm:px-8 lg:px-12",
    sectionPadding: "py-28",
    cardPadding: "p-8",
  };
};

// Countdown Timer Component
const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <div className="inline-flex items-center space-x-4 bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-2xl px-6 py-4 shadow-lg">
      <Clock className="h-5 w-5 text-green-600" />
      <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.days}
          </div>
          <div className="text-xs">days</div>
        </div>
        <div className="text-green-400">:</div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.hours}
          </div>
          <div className="text-xs">hours</div>
        </div>
        <div className="text-green-400">:</div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.minutes}
          </div>
          <div className="text-xs">mins</div>
        </div>
        <div className="text-green-400">:</div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.seconds}
          </div>
          <div className="text-xs">secs</div>
        </div>
      </div>
    </div>
  );
};

// Sticky Navigation Component
const StickyNavigation = ({
  eventName,
  slug,
}: {
  eventName: string;
  slug: string;
}) => {
  const navItems = [
    { name: "Overview", href: "#overview" },
    { name: "Courses", href: "#courses" },
    { name: "Scoring Format", href: "#scoring" },
    { name: "Players", href: "#players" },
    { name: "Prizes", href: "#prizes" },
    { name: "Travel", href: "#travel" },
    { name: "Leaderboard", href: `/events/${slug}/leaderboard` },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200/50 shadow-lg">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="font-bold text-slate-900">{eventName}</div>
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-green-600 transition-colors"
              >
                {item.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

// Animated components to avoid hooks in loops
const AnimatedStatCard = ({ item, index }: { item: any; index: number }) => {
  const { isVisible, elementRef } = useScrollAnimation();
  const colorClasses = {
    emerald: {
      bg: "from-emerald-100 to-emerald-200",
      text: "text-emerald-600",
    },
    blue: { bg: "from-blue-100 to-blue-200", text: "text-blue-600" },
    purple: { bg: "from-purple-100 to-purple-200", text: "text-purple-600" },
    orange: { bg: "from-orange-100 to-orange-200", text: "text-orange-600" },
  };
  const colors = colorClasses[item.color as keyof typeof colorClasses];
  const delays = ["delay-0", "delay-100", "delay-200", "delay-300"];

  return (
    <div
      ref={elementRef}
      className={`group cursor-pointer transition-all duration-700 ${delays[index] || "delay-0"} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 text-center border border-slate-200/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-2 transition-all duration-300 group-hover:bg-white">
        <div
          className={`w-20 h-20 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}
        >
          <item.icon className={`h-10 w-10 ${colors.text}`} />
        </div>
        <h3 className="font-bold text-slate-900 mb-3 text-lg">{item.title}</h3>
        <p className="text-slate-600 font-medium">{item.value}</p>
      </div>
    </div>
  );
};

// Player Modal Component
const PlayerModal = ({
  player,
  isOpen,
  onClose,
}: {
  player: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !player) return null;

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          <Avatar className="h-24 w-24 mx-auto mb-6 ring-4 ring-green-200">
            {player.profile_image && (
              <AvatarImage src={player.profile_image} alt={player.full_name} />
            )}
            <AvatarFallback className="bg-gradient-to-br from-green-500 to-emerald-600 text-white text-2xl font-bold">
              {getPlayerInitials(player.full_name)}
            </AvatarFallback>
          </Avatar>

          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            {player.full_name}
          </h2>

          {player.handicap !== null && player.handicap !== undefined && (
            <div className="inline-flex items-center space-x-1 bg-slate-100 rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-semibold text-slate-600">
                Handicap: {player.handicap}
              </span>
            </div>
          )}

          {player.bio && player.bio.trim() && (
            <div className="mt-6 text-left">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                About {player.full_name.split(" ")[0]}
              </h3>
              <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                {player.bio}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Course Modal Component
const CourseModal = ({
  course,
  round,
  isOpen,
  onClose,
}: {
  course: any;
  round: any;
  isOpen: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
        >
          <X className="h-5 w-5 text-slate-600" />
        </button>

        {/* Image */}
        {course.image_url && (
          <div className="h-64 overflow-hidden rounded-t-3xl">
            <img
              src={course.image_url}
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-4">
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Round {round?.round_number || 1}
            </Badge>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 mb-6">
            {course.name}
          </h2>

          {course.par && course.yardage && (
            <div className="flex items-center space-x-6 mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-semibold text-slate-700">
                  Par {course.par}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-semibold text-slate-700">
                  {course.yardage?.toLocaleString()} yards
                </span>
              </div>
            </div>
          )}

          {course.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">
                About This Course
              </h3>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {course.description}
              </p>
            </div>
          )}

          {(round?.tee_time || round?.round_date) && (
            <div className="space-y-3 pt-6 border-t border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">
                Round Details
              </h3>
              {round?.round_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-600">
                    {new Date(round.round_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {round?.tee_time && (
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-slate-400" />
                  <span className="text-slate-600">
                    Tee Time: {round.tee_time}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnimatedCourseCard = ({
  course,
  round,
  index,
  onOpenModal,
  theme,
  isTourTech = false,
  isMasters = false,
}: {
  course: any;
  round: any;
  index: number;
  onOpenModal: () => void;
  theme: any;
  isTourTech?: boolean;
  isMasters?: boolean;
}) => {
  const { isVisible, elementRef } = useScrollAnimation();
  const [showSeeMore, setShowSeeMore] = useState(false);

  const hasDescription = course.description && course.description.trim();
  // More conservative character count - checking if text is likely to exceed 4 lines
  const shouldShowSeeMore = hasDescription && course.description.length > 200;

  // Debug logging
  console.log(`Course ${course.name}:`, {
    hasDescription,
    descriptionLength: course.description?.length,
    shouldShowSeeMore,
    index,
  });

  return (
    <div
      ref={elementRef}
      className={`group transition-all duration-700 ${
        index === 0
          ? "delay-0"
          : index === 1
            ? "delay-150"
            : index === 2
              ? "delay-300"
              : "delay-450"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}
      onMouseEnter={() => setShowSeeMore(true)}
      onMouseLeave={() => setShowSeeMore(false)}
    >
      <div
        className={`${isTourTech ? `${theme.cardBackground} border border-gray-300 ${theme.cardShadow}` : isMasters ? `${theme.cardBackground} ${theme.cardBorder} ${theme.cardShadow} ${theme.cardHover}` : "bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-3"} ${isTourTech ? "rounded-lg" : isMasters ? theme.roundedCorners : "rounded-3xl"} overflow-hidden transition-all duration-500 ${hasDescription ? "min-h-[500px]" : ""}`}
      >
        {course.image_url && (
          <div className="h-56 overflow-hidden">
            <img
              src={course.image_url}
              alt={course.name}
              className={`w-full h-full object-cover ${isTourTech ? "" : isMasters ? "group-hover:scale-105 transition-transform duration-500" : "group-hover:scale-110 transition-transform duration-700"}`}
            />
          </div>
        )}

        <div className={`${isTourTech ? "p-6" : isMasters ? theme.cardPadding : "p-8"} relative`}>
          <div
            className={`flex items-start justify-between ${isTourTech ? "mb-4" : isMasters ? "mb-5" : "mb-6"}`}
          >
            <div className="flex-1">
              <div
                className={`flex items-center space-x-2 ${isTourTech ? "mb-2" : isMasters ? "mb-3" : "mb-3"}`}
              >
                <Badge
                  className={`${isTourTech ? "bg-gray-100 text-gray-700 border border-gray-300" : isMasters ? "bg-green-800 text-amber-50 border border-green-800" : "bg-gradient-to-r from-green-600 to-emerald-600 text-white"} text-xs font-semibold px-3 py-1 ${isTourTech ? "rounded-md" : isMasters ? "rounded-md" : "rounded-full"}`}
                >
                  Round {index + 1}
                </Badge>
              </div>
              <h3
                className={`${isTourTech ? "text-xl font-semibold text-slate-900 mb-1" : isMasters ? `${theme.cardTitle} mb-2 group-hover:text-yellow-600 transition-colors` : "text-2xl font-bold text-slate-900 mb-2 group-hover:text-green-700 transition-colors"}`}
              >
                {course.name}
              </h3>
            </div>
          </div>

          {course.par && course.yardage && (
            <div
              className={`flex items-center space-x-6 ${isTourTech ? "mb-4" : isMasters ? "mb-5" : "mb-6"} text-sm`}
            >
              <div className="flex items-center space-x-2">
                {!isTourTech && !isMasters && (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                )}
                <span
                  className={`${isTourTech ? "font-mono text-slate-800" : isMasters ? "font-serif font-medium text-green-800" : "font-semibold text-slate-700"}`}
                >
                  Par {course.par}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {!isTourTech && !isMasters && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
                <span
                  className={`${isTourTech ? "font-mono text-slate-800" : isMasters ? "font-serif font-medium text-green-800" : "font-semibold text-slate-700"}`}
                >
                  {course.yardage?.toLocaleString()} yards
                </span>
              </div>
            </div>
          )}

          {hasDescription && (
            <div className="mb-6 relative">
              <div className="relative">
                <p
                  className={`${isMasters ? "text-green-800/70 font-serif" : "text-slate-600"} leading-relaxed overflow-hidden`}
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 4,
                    WebkitBoxOrient: "vertical",
                    maxHeight: "6rem",
                    lineHeight: "1.5rem",
                  }}
                >
                  {course.description}
                </p>
                {shouldShowSeeMore && (
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
                )}
              </div>
              {shouldShowSeeMore && showSeeMore && (
                <button
                  onClick={onOpenModal}
                  className={`mt-3 ${isMasters ? "text-yellow-600 hover:text-yellow-700 font-serif" : "text-green-600 hover:text-green-700"} font-medium text-sm flex items-center space-x-1 transition-colors`}
                >
                  <span>See more</span>
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              )}
            </div>
          )}

          {(round?.tee_time || round?.round_date) && (
            <div className={`space-y-3 pt-4 border-t ${isMasters ? "border-green-800/20" : "border-slate-200"}`}>
              {round?.round_date && (
                <div className="flex items-center space-x-3">
                  <Calendar className={`h-4 w-4 ${isMasters ? "text-yellow-600" : "text-slate-400"}`} />
                  <span className={`text-sm font-medium ${isMasters ? "text-green-800 font-serif" : "text-slate-600"}`}>
                    {new Date(round.round_date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
              {round?.tee_time && (
                <div className="flex items-center space-x-3">
                  <Clock className={`h-4 w-4 ${isMasters ? "text-yellow-600" : "text-slate-400"}`} />
                  <span className={`text-sm font-medium ${isMasters ? "text-green-800 font-serif" : "text-slate-600"}`}>
                    Tee Time: {round.tee_time}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnimatedPlayerCard = ({
  player,
  index,
  onOpenModal,
  theme,
  isTourTech = false,
}: {
  player: any;
  index: number;
  onOpenModal: () => void;
  theme: any;
  isTourTech?: boolean;
}) => {
  const { isVisible, elementRef } = useScrollAnimation();
  const [showSeeMore, setShowSeeMore] = useState(false);

  const getPlayerInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const hasBio = player.bio && player.bio.trim().length > 0;
  const shouldShowSeeMore = hasBio && player.bio.length > 80; // ~2 lines worth of text
  const isShortBio = hasBio && player.bio.length <= 80;

  return (
    <div
      ref={elementRef}
      className={`group transition-all duration-500 ${
        index < 8 ? `delay-${index * 50}` : "delay-300"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      onMouseEnter={() => setShowSeeMore(true)}
      onMouseLeave={() => setShowSeeMore(false)}
    >
      <div
        className={`${isTourTech ? `${theme.cardBackground} ${theme.cardBorder} ${theme.cardShadow} ${theme.cardHover}` : "bg-white/80 backdrop-blur-sm border border-slate-200/50 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-2"} ${isTourTech ? theme.roundedCorners : "rounded-3xl"} transition-all duration-300 group-hover:bg-white flex flex-col ${!hasBio ? "h-64" : isShortBio ? "h-72" : "h-80"}`}
      >
        {/* Avatar Section - Top */}
        <div
          className={`flex flex-col items-center ${isTourTech ? "pt-4 pb-3" : "pt-6 pb-4"}`}
        >
          <Avatar
            className={`${isTourTech ? "h-16 w-16" : "h-20 w-20"} ring-4 ${isTourTech ? "ring-orange-200" : "ring-white/50 group-hover:ring-green-200"} transition-all duration-300`}
          >
            {player.profile_image && (
              <AvatarImage src={player.profile_image} alt={player.full_name} />
            )}
            <AvatarFallback
              className={`${isTourTech ? theme.accentBackground : "bg-gradient-to-br from-green-500 to-emerald-600"} text-white ${isTourTech ? "text-lg" : "text-xl"} font-bold`}
            >
              {getPlayerInitials(player.full_name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and Handicap Section */}
        <div
          className={`text-center ${isTourTech ? "px-4 pb-3" : "px-6 pb-4"}`}
        >
          <h3
            className={`${isTourTech ? theme.cardTitle : "font-bold text-slate-900 text-lg group-hover:text-green-700"} transition-colors mb-2`}
          >
            {player.full_name}
          </h3>
          {player.handicap !== null && player.handicap !== undefined && (
            <div
              className={`inline-flex items-center space-x-1 ${isTourTech ? "bg-slate-100" : "bg-slate-100"} ${isTourTech ? theme.roundedCorners : "rounded-full"} px-3 py-1`}
            >
              <span
                className={`${isTourTech ? theme.dataText : "text-xs font-semibold text-slate-600"}`}
              >
                HCP: {player.handicap}
              </span>
            </div>
          )}
        </div>

        {/* Bio Section */}
        <div className="flex-1 px-6 pb-6 relative">
          {hasBio && (
            <div className="relative h-full">
              <p
                className="text-sm text-slate-600 leading-relaxed overflow-hidden text-center"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  maxHeight: "2.75rem",
                  lineHeight: "1.375rem",
                }}
              >
                "{player.bio}"
              </p>
              {shouldShowSeeMore && (
                <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white/90 to-transparent pointer-events-none" />
              )}

              {shouldShowSeeMore && showSeeMore && (
                <button
                  onClick={onOpenModal}
                  className="absolute bottom-0 right-0 text-green-600 hover:text-green-700 font-medium text-sm flex items-center space-x-1 transition-colors bg-white/90 px-2 py-1 rounded-md"
                >
                  <span>See more</span>
                  <MoreHorizontal className="h-3 w-3" />
                </button>
              )}
            </div>
          )}

          {!hasBio && (
            <div className="flex items-center justify-center h-full">
              <p className="text-sm text-slate-400 italic">No bio available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AnimatedPrizeCard = ({
  prize,
  index,
  theme,
  isTourTech = false,
}: {
  prize: any;
  index: number;
  theme: any;
  isTourTech?: boolean;
}) => {
  const { isVisible, elementRef } = useScrollAnimation();

  return (
    <div
      ref={elementRef}
      className={`group transition-all duration-700 ${
        index === 0
          ? "delay-0"
          : index === 1
            ? "delay-100"
            : index === 2
              ? "delay-200"
              : "delay-300"
      } ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      <div
        className={`${isTourTech ? `${theme.cardBackground} ${theme.cardBorder} ${theme.cardShadow} ${theme.cardHover}` : "bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-3"} ${isTourTech ? theme.roundedCorners : "rounded-3xl"} ${isTourTech ? theme.cardPadding : "p-8"} text-center transition-all duration-300 group-hover:bg-white h-80 flex flex-col`}
      >
        <div
          className={`${isTourTech ? `w-12 h-12 ${theme.accentBackground} ${theme.roundedCorners} flex items-center justify-center mx-auto mb-4` : "w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-200 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"}`}
        >
          <Trophy
            className={`${isTourTech ? "h-6 w-6 text-white" : "h-10 w-10 text-amber-600"}`}
          />
        </div>

        <h3
          className={`${isTourTech ? theme.cardTitle : "text-xl font-bold text-slate-900 group-hover:text-amber-700 transition-colors"} mb-4 min-h-[3.5rem] flex items-center justify-center`}
        >
          {prize.category
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())}
        </h3>

        <div className="flex-1 flex flex-col justify-center">
          {prize.amount > 0 && (
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-4">
              ${prize.amount}
            </div>
          )}

          <p className="text-slate-600 font-medium leading-relaxed">
            {prize.description}
          </p>
        </div>
      </div>
    </div>
  );
};

const AnimatedTravelCard = ({
  item,
  index,
  theme,
  isTourTech = false,
}: {
  item: any;
  index: number;
  theme: any;
  isTourTech?: boolean;
}) => {
  const { isVisible, elementRef } = useScrollAnimation();
  const colorClasses = {
    blue: { bg: "from-blue-100 to-blue-200", text: "text-blue-600" },
    emerald: {
      bg: "from-emerald-100 to-emerald-200",
      text: "text-emerald-600",
    },
    purple: { bg: "from-purple-100 to-purple-200", text: "text-purple-600" },
  };
  const colors = colorClasses[item.color as keyof typeof colorClasses];
  const delays = ["delay-0", "delay-150", "delay-300"];

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-700 ${delays[index] || "delay-0"} ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
      }`}
    >
      <div
        className={`${isTourTech ? `${theme.cardBackground} ${theme.cardBorder} ${theme.cardShadow} ${theme.cardHover}` : "bg-white/90 backdrop-blur-sm border border-slate-200/50 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-300/50 hover:-translate-y-2"} ${isTourTech ? theme.roundedCorners : "rounded-3xl"} ${isTourTech ? theme.cardPadding : "p-8"} transition-all duration-300 h-full`}
      >
        <div
          className={`${isTourTech ? `w-10 h-10 ${theme.accentBackground} ${theme.roundedCorners} flex items-center justify-center mb-4` : `w-16 h-16 bg-gradient-to-br ${colors.bg} rounded-2xl flex items-center justify-center mb-8`}`}
        >
          <item.icon
            className={`${isTourTech ? "h-5 w-5 text-white" : `h-8 w-8 ${colors.text}`}`}
          />
        </div>

        <h3
          className={`${isTourTech ? theme.cardTitle : "text-2xl font-bold text-slate-900"} ${isTourTech ? "mb-3" : "mb-6"}`}
        >
          {item.title}
        </h3>

        <div className="prose prose-slate max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-xl font-bold text-slate-900 mb-3">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-lg font-semibold text-slate-900 mb-2">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-base font-medium text-slate-900 mb-2">
                  {children}
                </h3>
              ),
              p: ({ children }) => (
                <p className="text-slate-600 leading-relaxed mb-2">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc ml-4 mb-2 text-slate-600">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal ml-4 mb-2 text-slate-600">
                  {children}
                </ol>
              ),
              li: ({ children }) => <li className="mb-1">{children}</li>,
              strong: ({ children }) => (
                <strong className="font-semibold">{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
            }}
          >
            {item.info}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default function PublicEventHome() {
  // Add smooth scrolling to page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = "smooth";
    return () => {
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [players, setPlayers] = useState<EventPlayer[]>([]);
  const [courses, setCourses] = useState<EventCourse[]>([]);
  const [rounds, setRounds] = useState<EventRound[]>([]);
  const [prizes, setPrizes] = useState<EventPrize[]>([]);
  const [travel, setTravel] = useState<TravelData | null>(null);
  const [customization, setCustomization] = useState<EventCustomization | null>(
    null,
  );
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState(false);
  const [customRules, setCustomRules] = useState<any[]>([]);
  const [skillsContests, setSkillsContests] = useState<any[]>([]);
  const [stablefordScoring, setStablefordScoring] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadEventData();
    }
  }, [slug]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Loading event data for slug:", slug);
      console.log("Supabase client:", supabase);

      // Load main event data
      const { data: event, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .eq("is_published", true)
        .single();

      console.log("Event query result:", { event, eventError });

      if (eventError || !event) {
        console.error("Event not found:", eventError);
        setError(
          `Event not found or not published. Slug: ${slug}, Error: ${eventError?.message || "No event data"}`,
        );
        setLoading(false);
        return;
      }

      setEventData(event);

      // Load all related data in parallel
      const [
        playersResult,
        coursesResult,
        roundsResult,
        prizesResult,
        travelResult,
        customizationResult,
        rulesResult,
        contestsResult,
        stablefordResult,
      ] = await Promise.all([
        supabase.from("event_players").select("*").eq("event_id", event.id),
        supabase
          .from("event_courses")
          .select("*")
          .eq("event_id", event.id)
          .order("display_order"),
        supabase
          .from("event_rounds")
          .select("*")
          .eq("event_id", event.id)
          .order("round_date"),
        supabase.from("event_prizes").select("*").eq("event_id", event.id),
        supabase
          .from("event_travel")
          .select("*")
          .eq("event_id", event.id)
          .maybeSingle(),
        supabase
          .from("event_customization")
          .select("*")
          .eq("event_id", event.id)
          .maybeSingle(),
        supabase
          .from("event_rules")
          .select("*")
          .eq("event_id", event.id)
          .order("created_at"),
        supabase.from("skills_contests").select("*").eq("event_id", event.id),
        supabase
          .from("stableford_scoring")
          .select("*")
          .eq("event_id", event.id)
          .maybeSingle(),
      ]);

      // Handle results with error checking
      if (!playersResult.error) setPlayers(playersResult.data || []);
      if (!coursesResult.error) setCourses(coursesResult.data || []);
      if (!roundsResult.error) setRounds(roundsResult.data || []);
      if (!prizesResult.error) setPrizes(prizesResult.data || []);
      if (!travelResult.error) setTravel(travelResult.data || null);
      if (!customizationResult.error)
        setCustomization(customizationResult.data || null);
      if (!rulesResult.error) setCustomRules(rulesResult.data || []);
      if (!contestsResult.error) setSkillsContests(contestsResult.data || []);
      if (!stablefordResult.error)
        setStablefordScoring(stablefordResult.data || null);

      // Log any errors for debugging
      if (playersResult.error)
        console.log("Players error:", playersResult.error);
      if (coursesResult.error)
        console.log("Courses error:", coursesResult.error);
      if (roundsResult.error) console.log("Rounds error:", roundsResult.error);
      if (prizesResult.error) console.log("Prizes error:", prizesResult.error);
      if (travelResult.error) console.log("Travel error:", travelResult.error);
      if (customizationResult.error)
        console.log("Customization error:", customizationResult.error);
    } catch (error) {
      console.error("Error loading event data:", error);
      setError("Failed to load event data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startMonth = start.toLocaleDateString("en-US", { month: "long" });
    const startDay = start.getDate();
    const endMonth = end.toLocaleDateString("en-US", { month: "long" });
    const endDay = end.getDate();
    const year = end.getFullYear();

    if (startMonth === endMonth) {
      return `${startMonth} ${startDay}–${endDay}, ${year}`;
    } else {
      return `${startMonth} ${startDay} ��� ${endMonth} ${endDay}, ${year}`;
    }
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 Day";
    return `${diffDays} Days`;
  };

  const getScoringFormat = () => {
    const formats = [...new Set(rounds.map((r) => r.scoring_type))];
    return (
      formats
        .map((format) => {
          switch (format) {
            case "stroke_play":
              return "Stroke Play";
            case "stableford":
              return "Stableford";
            default:
              return format;
          }
        })
        .join(", ") || "Stroke Play"
    );
  };

  // Enhanced Stableford points system with custom scoring
  const getStablefordPoints = () => {
    // Default values if no custom scoring is set
    const defaultScoring = {
      albatross: 5,
      eagle: 4,
      birdie: 3,
      par: 2,
      bogey: 1,
      double_bogey: 0,
    };

    const scoring = stablefordScoring || defaultScoring;

    return [
      {
        score: "Albatross",
        points: scoring.albatross,
        description: "3 under par",
        detail:
          "Legendary! The rarest score in golf deserves the highest reward.",
        color: "from-purple-500 to-purple-600",
        bgColor: "bg-purple-50",
        textColor: "text-purple-900",
        iconColor: "text-purple-600",
        icon: Crown,
      },
      {
        score: "Eagle",
        points: scoring.eagle,
        description: "2 under par",
        detail:
          "Exceptional performance! Maximum points for being 2 strokes under par.",
        color: "from-yellow-500 to-yellow-600",
        bgColor: "bg-yellow-50",
        textColor: "text-yellow-900",
        iconColor: "text-yellow-600",
        icon: Trophy,
      },
      {
        score: "Birdie",
        points: scoring.birdie,
        description: "1 under par",
        detail: "Great shot! Bonus points for being 1 stroke under par.",
        color: "from-green-500 to-green-600",
        bgColor: "bg-green-50",
        textColor: "text-green-900",
        iconColor: "text-green-600",
        icon: Award,
      },
      {
        score: "Par",
        points: scoring.par,
        description: "Even",
        detail: "Solid golf! Standard points for meeting par.",
        color: "from-blue-500 to-blue-600",
        bgColor: "bg-blue-50",
        textColor: "text-blue-900",
        iconColor: "text-blue-600",
        icon: CheckCircle,
      },
      {
        score: "Bogey",
        points: scoring.bogey,
        description: "1 over par",
        detail: "Still in the game! Points for being 1 stroke over par.",
        color: "from-orange-500 to-orange-600",
        bgColor: "bg-orange-50",
        textColor: "text-orange-900",
        iconColor: "text-orange-600",
        icon: Medal,
      },
      {
        score: "Double Bogey+",
        points: scoring.double_bogey,
        description: "2+ over par",
        detail:
          scoring.double_bogey > 0
            ? `${scoring.double_bogey} points for scores of double bogey or worse.`
            : "No points awarded for scores of double bogey or worse.",
        color: "from-red-500 to-red-600",
        bgColor: "bg-red-50",
        textColor: "text-red-900",
        iconColor: "text-red-600",
        icon: Target,
      },
    ];
  };

  // Helper functions for contests
  const getContestsByType = (type: string) => {
    return skillsContests
      .filter((contest) => contest.contest_type === type)
      .reduce(
        (acc, contest) => {
          const round = rounds.find((r) => r.id === contest.round_id);
          if (round) {
            const existing = acc.find(
              (item) => item.roundName === round.course_name,
            );
            if (existing) {
              existing.holes.push(contest.hole);
            } else {
              acc.push({
                roundName: round.course_name,
                holes: [contest.hole],
              });
            }
          }
          return acc;
        },
        [] as { roundName: string; holes: number[] }[],
      );
  };

  // Get contests organized by round
  const getContestsByRound = () => {
    return rounds
      .map((round, index) => {
        const roundContests = skillsContests.filter(
          (contest) => contest.round_id === round.id,
        );
        const contests = roundContests.map((contest) => ({
          hole: contest.hole,
          type: contest.contest_type,
          emoji: contest.contest_type === "closest_to_pin" ? "🎯" : "🏌️‍♂️",
        }));

        return {
          roundNumber: index + 1,
          courseName: round.course_name,
          contests: contests.sort((a, b) => a.hole - b.hole),
        };
      })
      .filter((round) => round.contests.length > 0);
  };

  const closestToPinGroups = getContestsByType("closest_to_pin");
  const longestDriveGroups = getContestsByType("longest_drive");

  // Get prize amounts for contests
  const closestToPinPrize =
    prizes.find((p) => p.category === "closest_to_pin")?.amount || 0;
  const longestDrivePrize =
    prizes.find((p) => p.category === "longest_drive")?.amount || 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-green-700">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100">
        <div className="text-center max-w-2xl mx-auto p-6">
          <Target className="h-16 w-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-green-900 mb-2">
            Event Not Found
          </h1>
          <p className="text-green-600 mb-4">
            {error ||
              "This event may not be published or the link is incorrect."}
          </p>

          {/* Debug information */}
          <div className="bg-white/50 rounded-lg p-4 text-left text-sm text-gray-700 mt-4">
            <h3 className="font-medium mb-2">Debug Information:</h3>
            <div>Slug: {slug || "undefined"}</div>
            <div>Loading: {loading.toString()}</div>
            <div>Error: {error || "none"}</div>
            <div>Event Data: {eventData ? "found" : "null"}</div>
            <div>URL: {window.location.href}</div>
            <div>Pathname: {window.location.pathname}</div>
          </div>
        </div>
      </div>
    );
  }

  // Get theme styling
  const theme = getThemeStyles(eventData?.theme);

  return (
    <div className={`min-h-screen ${theme.heroContainer}`}>
      <StickyNavigation eventName={eventData.name} slug={slug!} />

      {/* Hero Section */}
      <section
        id="overview"
        className={`${eventData?.theme === "TourTech" ? "bg-white border-b border-slate-200" : eventData?.theme === "Masters" ? "relative overflow-hidden bg-gradient-to-br from-amber-50/30 via-white to-green-50/20" : "relative overflow-hidden"}`}
      >
        {/* Subtle background pattern - GolfOS and Masters */}
        {eventData?.theme === "GolfOS" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/30"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/20 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
          </>
        )}
        {eventData?.theme === "Masters" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-green-50/20"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100/10 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>
          </>
        )}

        <div
          className={`relative ${eventData?.theme === "TourTech" ? `${theme.maxContentWidth} mx-auto ${theme.containerPadding} pt-20 pb-8` : eventData?.theme === "Masters" ? `${theme.maxContentWidth} mx-auto ${theme.containerPadding} pt-20 pb-16 sm:pt-26 sm:pb-20 lg:pt-32 lg:pb-26` : "max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-16 sm:pt-26 sm:pb-20 lg:pt-32 lg:pb-26"}`}
        >
          <div
            className={`${eventData?.theme === "TourTech" ? "space-y-4" : eventData?.theme === "Masters" ? "text-center space-y-8 max-w-5xl mx-auto" : "text-center space-y-10 max-w-4xl mx-auto"}`}
          >
            {/* Event Badge */}
            <div
              className={`inline-flex items-center space-x-2 ${eventData?.theme === "TourTech" ? "bg-gray-100 border border-gray-300 text-gray-700 rounded-md px-3 py-1.5 shadow-none" : eventData?.theme === "Masters" ? "bg-white border border-green-800/20 text-green-800 rounded-lg px-6 py-3 shadow-sm" : "bg-white/80 backdrop-blur-sm border border-green-200/50 rounded-full px-6 py-3 shadow-lg shadow-green-100/50"}`}
            >
              <Calendar
                className={`h-4 w-4 ${eventData?.theme === "TourTech" ? "text-gray-500" : eventData?.theme === "Masters" ? "text-yellow-600" : "text-green-600"}`}
              />
              <span
                className={`text-sm font-medium ${eventData?.theme === "TourTech" ? "text-gray-700 normal-case tracking-normal" : eventData?.theme === "Masters" ? "text-green-800 font-serif tracking-wide" : "text-green-800"}`}
              >
                {formatDateRange(eventData.start_date, eventData.end_date)}
              </span>
            </div>

            {/* Title & Description */}
            <div
              className={`${eventData?.theme === "TourTech" ? "space-y-3" : eventData?.theme === "Masters" ? "space-y-6" : "space-y-6"}`}
            >
              <h1
                className={`${eventData?.theme === "TourTech" ? theme.heroTitle : eventData?.theme === "Masters" ? theme.heroTitle : "text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-slate-900 tracking-tight"} leading-tight`}
              >
                {eventData.name}
              </h1>
              {eventData.description && (
                <p
                  className={`${eventData?.theme === "TourTech" ? `${theme.heroSubtitle} ${theme.textMaxWidth}` : eventData?.theme === "Masters" ? `${theme.heroSubtitle} ${theme.textMaxWidth} mx-auto` : "text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto font-light"} leading-relaxed`}
                >
                  {eventData.description}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div
              className={`flex flex-col sm:flex-row gap-${eventData?.theme === "TourTech" ? "3" : eventData?.theme === "Masters" ? "4" : "6"} ${eventData?.theme === "TourTech" ? "pt-2" : eventData?.theme === "Masters" ? "justify-center pt-4" : "justify-center"}`}
            >
              <a
                href="#courses"
                className={`${eventData?.theme === "TourTech" ? "bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-md text-sm shadow-sm" : eventData?.theme === "Masters" ? `${theme.primaryButton} px-8 py-4 ${theme.roundedCorners} font-serif text-lg shadow-lg hover:shadow-xl` : "group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl shadow-green-600/25 hover:shadow-2xl hover:shadow-green-600/40 hover:-translate-y-1 text-lg"} inline-flex items-center gap-2 font-medium transition-colors`}
              >
                <span>View Courses</span>
                <ChevronRight
                  className={`h-${eventData?.theme === "TourTech" ? "4" : eventData?.theme === "Masters" ? "5" : "5"} w-${eventData?.theme === "TourTech" ? "4" : eventData?.theme === "Masters" ? "5" : "5"} ${eventData?.theme === "TourTech" ? "" : eventData?.theme === "Masters" ? "transition-transform duration-300" : "group-hover:translate-x-1 transition-transform"}`}
                />
              </a>
              <a
                href="#players"
                className={`${eventData?.theme === "TourTech" ? "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-6 py-2.5 rounded-md text-sm shadow-sm" : eventData?.theme === "Masters" ? `${theme.secondaryButton} px-8 py-4 ${theme.roundedCorners} font-serif text-lg shadow-lg hover:shadow-xl` : "group bg-white/80 backdrop-blur-sm border-2 border-green-200 text-green-700 px-10 py-5 rounded-2xl font-semibold hover:bg-green-50 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg"} inline-flex items-center gap-2 font-medium transition-colors`}
              >
                <span>
                  {eventData?.theme === "TourTech"
                    ? "View Players"
                    : eventData?.theme === "Masters"
                      ? "View Players"
                      : "Meet Players"}
                </span>
                <Users
                  className={`h-${eventData?.theme === "TourTech" ? "4" : eventData?.theme === "Masters" ? "5" : "5"} w-${eventData?.theme === "TourTech" ? "4" : eventData?.theme === "Masters" ? "5" : "5"} ${eventData?.theme === "TourTech" ? "" : eventData?.theme === "Masters" ? "transition-transform duration-300" : "group-hover:scale-110 transition-transform"}`}
                />
              </a>
            </div>

            {/* Event Stats */}
            {eventData?.theme === "TourTech" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200 mt-6">
                {[
                  { label: "Courses", value: courses.length.toString() },
                  { label: "Players", value: players.length.toString() },
                  { label: "Format", value: getScoringFormat() },
                  {
                    label: "Duration",
                    value: getDuration(
                      eventData.start_date,
                      eventData.end_date,
                    ),
                  },
                ].map((stat, index) => (
                  <div key={index} className="text-center py-3">
                    <div className="font-mono text-xl font-semibold text-orange-600">
                      {stat.value}
                    </div>
                    <div className="font-mono text-xs font-medium text-slate-500 uppercase tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : eventData?.theme === "Masters" ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-green-800/20 mt-8">
                {[
                  { label: "Courses", value: courses.length.toString() },
                  { label: "Players", value: players.length.toString() },
                  { label: "Format", value: getScoringFormat() },
                  {
                    label: "Duration",
                    value: getDuration(
                      eventData.start_date,
                      eventData.end_date,
                    ),
                  },
                ].map((stat, index) => (
                  <div key={index} className="text-center py-4">
                    <div className="font-serif text-2xl font-semibold text-yellow-600 mb-1">
                      {stat.value}
                    </div>
                    <div className="font-serif text-sm font-medium text-green-800 tracking-wide">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <CountdownTimer targetDate={eventData.start_date} />
            )}
          </div>
        </div>
      </section>

      {/* Summary Cards Section */}
      {eventData?.theme !== "TourTech" && eventData?.theme !== "Masters" && (
        <section className="py-24 px-6 sm:px-8 lg:px-12 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-slate-50/50 to-white"></div>
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: MapPin,
                  title: "Location",
                  value: eventData.location,
                  color: "emerald",
                },
                {
                  icon: Users,
                  title: "Players",
                  value: `${players.length} Registered`,
                  color: "blue",
                },
                {
                  icon: Target,
                  title: "Format",
                  value: getScoringFormat(),
                  color: "purple",
                },
                {
                  icon: Calendar,
                  title: "Duration",
                  value: getDuration(eventData.start_date, eventData.end_date),
                  color: "orange",
                },
              ].map((item, index) => (
                <AnimatedStatCard key={item.title} item={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Courses Overview Section */}
      {courses.length > 0 && (
        <section
          id="courses"
          className={`${eventData?.theme === "TourTech" ? `${theme.sectionBackground} ${theme.sectionPadding} ${theme.containerPadding}` : eventData?.theme === "Masters" ? `${theme.sectionBackground} ${theme.sectionPadding} ${theme.containerPadding} relative overflow-hidden` : "py-28 px-6 sm:px-8 lg:px-12 relative overflow-hidden"}`}
        >
          {/* Background decoration */}
          {eventData?.theme === "TourTech" ? null : eventData?.theme === "Masters" ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-50/20 via-white to-green-50/10"></div>
              <div className="absolute top-20 right-0 w-72 h-72 bg-yellow-100/10 rounded-full blur-3xl"></div>
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/30 via-white to-emerald-50/20"></div>
              <div className="absolute top-20 right-0 w-72 h-72 bg-green-100/10 rounded-full blur-3xl"></div>
            </>
          )}

          <div
            className={`relative ${eventData?.theme === "TourTech" ? theme.maxContentWidth : eventData?.theme === "Masters" ? theme.maxContentWidth : "max-w-6xl"} mx-auto`}
          >
            <div
              className={`text-center ${eventData?.theme === "TourTech" ? theme.headerSpacing : eventData?.theme === "Masters" ? theme.headerSpacing : "mb-20"}`}
            >
              <div
                className={`inline-flex items-center space-x-2 ${eventData?.theme === "TourTech" ? `${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} px-3 py-1.5 ${theme.cardShadow}` : eventData?.theme === "Masters" ? "bg-white border border-green-800/20 rounded-lg px-4 py-2 shadow-sm" : "bg-green-100/80 backdrop-blur-sm rounded-full px-4 py-2"} mb-${eventData?.theme === "TourTech" ? "4" : eventData?.theme === "Masters" ? "4" : "8"}`}
              >
                <Sparkles
                  className={`h-4 w-4 ${eventData?.theme === "TourTech" ? theme.orangeText : eventData?.theme === "Masters" ? "text-yellow-600" : "text-green-600"}`}
                />
                <span
                  className={`text-sm font-medium ${eventData?.theme === "TourTech" ? theme.monoLabel : eventData?.theme === "Masters" ? "text-green-800 font-serif tracking-wide" : "text-green-800"}`}
                >
                  {eventData?.theme === "TourTech"
                    ? "VENUES"
                    : eventData?.theme === "Masters"
                      ? "Championship Venues"
                      : "Championship Venues"}
                </span>
              </div>

              <h2
                className={`${eventData?.theme === "TourTech" ? theme.sectionTitle : eventData?.theme === "Masters" ? theme.sectionTitle : "text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"} mb-${eventData?.theme === "TourTech" ? theme.headerSpacing : eventData?.theme === "Masters" ? theme.headerSpacing : "8"}`}
              >
                {courses.length > 1 ? "Golf Courses" : "Golf Course"}
              </h2>

              <p
                className={`${eventData?.theme === "TourTech" ? `${theme.heroSubtitle} ${theme.textMaxWidth}` : eventData?.theme === "Masters" ? `${theme.heroSubtitle} ${theme.textMaxWidth}` : "text-xl sm:text-2xl text-slate-600 max-w-4xl font-light"} mx-auto leading-relaxed`}
              >
                {rounds.reduce(
                  (total, round) => total + (round.holes || 18),
                  0,
                )}{" "}
                {eventData?.theme === "TourTech"
                  ? "holes"
                  : eventData?.theme === "Masters"
                    ? "championship holes"
                    : "world class holes"}{" "}
                played over{" "}
                {getDuration(
                  eventData.start_date,
                  eventData.end_date,
                ).toLowerCase()}
              </p>
            </div>

            <div className="flex justify-center">
              <div
                className={`grid gap-10 ${
                  courses.length === 1
                    ? "grid-cols-1 max-w-2xl"
                    : courses.length === 2
                      ? "grid-cols-1 lg:grid-cols-2 max-w-5xl"
                      : "grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-w-7xl"
                }`}
              >
                {courses.map((course, index) => {
                  const round = rounds.find(
                    (r) => r.course_name === course.name,
                  );
                  return (
                    <AnimatedCourseCard
                      key={course.id}
                      course={course}
                      round={round}
                      index={index}
                      theme={theme}
                      isTourTech={eventData?.theme === "TourTech"}
                      isMasters={eventData?.theme === "Masters"}
                      onOpenModal={() => {
                        setSelectedCourse({ course, round });
                        setIsModalOpen(true);
                      }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Scoring Format Section */}
      {rounds.length > 0 && (
        <section
          id="scoring"
          className={`${eventData?.theme === "TourTech" ? `${theme.sectionBackground} ${theme.sectionPadding} ${theme.containerPadding}` : eventData?.theme === "Masters" ? `${theme.sectionBackground} ${theme.sectionPadding} ${theme.containerPadding} relative` : "py-28 px-6 sm:px-8 lg:px-12 relative"}`}
        >
          {/* Background decoration */}
          {eventData?.theme === "TourTech" ? null : eventData?.theme === "Masters" ? (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 via-white to-green-50/10"></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-white to-slate-50/30"></div>
          )}
          <div
            className={`relative ${eventData?.theme === "TourTech" ? theme.maxContentWidth : eventData?.theme === "Masters" ? theme.maxContentWidth : "max-w-6xl"} mx-auto`}
          >
            <div
              className={`text-center ${eventData?.theme === "TourTech" ? theme.headerSpacing : eventData?.theme === "Masters" ? theme.headerSpacing : "mb-20"}`}
            >
              <div
                className={`inline-flex items-center space-x-2 ${eventData?.theme === "TourTech" ? `${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} px-3 py-1.5 ${theme.cardShadow}` : eventData?.theme === "Masters" ? "bg-white border border-green-800/20 rounded-lg px-4 py-2 shadow-sm" : "bg-blue-100/80 backdrop-blur-sm rounded-full px-4 py-2"} mb-${eventData?.theme === "TourTech" ? "4" : eventData?.theme === "Masters" ? "4" : "8"}`}
              >
                <Target
                  className={`h-4 w-4 ${eventData?.theme === "TourTech" ? theme.accentColor : eventData?.theme === "Masters" ? "text-yellow-600" : "text-blue-600"}`}
                />
                <span
                  className={`text-sm font-medium ${eventData?.theme === "TourTech" ? theme.tableHeader : eventData?.theme === "Masters" ? "text-green-800 font-serif tracking-wide" : "text-blue-800"}`}
                >
                  {eventData?.theme === "TourTech"
                    ? "SCORING"
                    : eventData?.theme === "Masters"
                      ? "Competition Rules"
                      : "Competition Rules"}
                </span>
              </div>

              <h2
                className={`${eventData?.theme === "TourTech" ? theme.sectionTitle : eventData?.theme === "Masters" ? theme.sectionTitle : "text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"} mb-${eventData?.theme === "TourTech" ? theme.headerSpacing : eventData?.theme === "Masters" ? theme.headerSpacing : "8"}`}
              >
                Scoring Format
              </h2>

              <div
                className={`${eventData?.theme === "TourTech" ? `${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} ${theme.cardPadding} ${theme.cardShadow} ${theme.textMaxWidth}` : eventData?.theme === "Masters" ? `${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} ${theme.cardPadding} ${theme.cardShadow} ${theme.textMaxWidth}` : "bg-white/90 backdrop-blur-sm rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200/50 border border-slate-200/50 max-w-2xl"} mx-auto mb-${eventData?.theme === "TourTech" ? "8" : eventData?.theme === "Masters" ? "8" : "16"}`}
              >
                <div
                  className={`${eventData?.theme === "TourTech" ? `w-12 h-12 ${theme.accentBackground} ${theme.roundedCorners}` : eventData?.theme === "Masters" ? "w-12 h-12 bg-yellow-600 rounded-lg" : "w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-200 rounded-2xl"} flex items-center justify-center mx-auto mb-${eventData?.theme === "TourTech" ? "4" : eventData?.theme === "Masters" ? "4" : "6"}`}
                >
                  <Target
                    className={`${eventData?.theme === "TourTech" ? "h-5 w-5 text-white" : eventData?.theme === "Masters" ? "h-5 w-5 text-white" : "h-8 w-8 text-green-600"}`}
                  />
                </div>

                <h3
                  className={`${eventData?.theme === "TourTech" ? theme.cardTitle : eventData?.theme === "Masters" ? theme.cardTitle : "text-2xl sm:text-3xl font-bold text-slate-900"} mb-${eventData?.theme === "TourTech" ? "2" : eventData?.theme === "Masters" ? "3" : "4"}`}
                >
                  {getScoringFormat()}
                </h3>
                <p
                  className={`${eventData?.theme === "TourTech" ? theme.cardText : eventData?.theme === "Masters" ? theme.cardText : "text-lg text-slate-600 font-light"} leading-relaxed`}
                >
                  {getScoringFormat().includes("Stableford")
                    ? eventData?.theme === "TourTech"
                      ? "Modified Stableford scoring system with preset competition and team scramble format."
                      : eventData?.theme === "Masters"
                        ? "Traditional modified Stableford system where points are awarded based on performance relative to par on each hole."
                        : "Modified Stableford scoring system with preset competition and a team scramble format for added excitement."
                    : eventData?.theme === "TourTech"
                      ? "Traditional stroke play format where every shot counts. Lowest total score wins."
                      : eventData?.theme === "Masters"
                        ? "Classic stroke play format where precision and consistency determine the champion."
                        : "Traditional stroke play format where every shot counts. Lowest total score wins the championship."}
                </p>
              </div>
            </div>

            {/* Enhanced Stableford Points System */}
            {getScoringFormat().includes("Stableford") && (
              <div className="mb-8">
                <div className={`text-center ${theme.headerSpacing}`}>
                  <h3 className={`${eventData?.theme === "Masters" ? "font-serif font-semibold text-green-900 text-2xl tracking-tight" : theme.sectionTitle} mb-2`}>Point Values</h3>
                  <p className={`${eventData?.theme === "Masters" ? "font-serif text-green-800/70" : theme.cardText}`}>
                    Points awarded based on performance relative to par
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {getStablefordPoints().map((scoring, index) => {
                    const IconComponent = scoring.icon;
                    return (
                      <div
                        key={scoring.score}
                        className={`${eventData?.theme === "TourTech" ? `${theme.cardBackground} ${theme.cardBorder}` : eventData?.theme === "Masters" ? "bg-white border border-green-800/20" : `${scoring.bgColor} border-2 border-opacity-20`} ${eventData?.theme === "Masters" ? "rounded-lg" : theme.roundedCorners} ${theme.cardPadding} ${theme.cardShadow} ${eventData?.theme === "TourTech" ? theme.cardHover : eventData?.theme === "Masters" ? "hover:border-yellow-600 hover:shadow-lg transition-all duration-300" : "hover:scale-105 transition-transform duration-200"}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className={`${eventData?.theme === "TourTech" ? `w-8 h-8 ${theme.accentBackground} flex items-center justify-center ${theme.roundedCorners}` : eventData?.theme === "Masters" ? "w-10 h-10 rounded-lg bg-yellow-600 flex items-center justify-center shadow-sm" : `w-12 h-12 rounded-full bg-gradient-to-r ${scoring.color} flex items-center justify-center shadow-lg`}`}
                          >
                            <span
                              className={`${eventData?.theme === "TourTech" ? `${theme.scoreFont} text-sm text-white` : eventData?.theme === "Masters" ? "font-serif text-lg font-semibold text-white" : "text-2xl font-bold text-white"}`}
                            >
                              {scoring.points}
                            </span>
                          </div>
                          <IconComponent
                            className={`h-4 w-4 ${eventData?.theme === "TourTech" ? theme.accentColor : eventData?.theme === "Masters" ? "text-green-800" : scoring.iconColor}`}
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-2">
                            <h4
                              className={`${eventData?.theme === "TourTech" ? theme.cardTitle : eventData?.theme === "Masters" ? "font-serif font-semibold text-green-900 text-lg" : `text-lg font-bold ${scoring.textColor}`}`}
                            >
                              {scoring.score}
                            </h4>
                            <Badge
                              variant="outline"
                              className={`${eventData?.theme === "TourTech" ? `${theme.cardText} border-slate-300` : eventData?.theme === "Masters" ? "text-green-800 border-green-800/30 font-serif" : `${scoring.textColor} border-current`} text-xs`}
                            >
                              {scoring.description}
                            </Badge>
                          </div>

                          <p
                            className={`${eventData?.theme === "TourTech" ? theme.cardText : eventData?.theme === "Masters" ? "text-sm text-green-800/70 font-serif" : `text-sm ${scoring.textColor} opacity-80`} leading-relaxed`}
                          >
                            {scoring.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div
                  className={`mt-6 ${eventData?.theme === "TourTech" ? "bg-gray-50 border border-gray-200 rounded-md p-4" : eventData?.theme === "Masters" ? "bg-green-50/30 border border-green-800/20 rounded-lg p-6" : "bg-emerald-50 border border-emerald-200 rounded-2xl p-6"}`}
                >
                  <div
                    className={`${eventData?.theme === "TourTech" ? "space-y-2" : eventData?.theme === "Masters" ? "flex items-start space-x-3" : "flex items-start space-x-3"}`}
                  >
                    {eventData?.theme !== "TourTech" && (
                      <Target className={`h-5 w-5 ${eventData?.theme === "Masters" ? "text-yellow-600" : "text-emerald-600"} mt-0.5`} />
                    )}
                    <div>
                      <div
                        className={`${eventData?.theme === "TourTech" ? "font-semibold text-slate-900 text-sm mb-1" : eventData?.theme === "Masters" ? "font-serif font-semibold text-green-900 mb-2" : "font-semibold text-emerald-900 mb-2"}`}
                      >
                        Why Stableford?
                      </div>
                      <ul
                        className={`${eventData?.theme === "TourTech" ? "text-xs text-slate-600 space-y-0.5" : eventData?.theme === "Masters" ? "text-sm text-green-800 space-y-1 font-serif" : "text-sm text-emerald-700 space-y-1"}`}
                      >
                        <li>��� Encourages aggressive, exciting play</li>
                        <li>
                          • Keeps all players engaged throughout the round
                        </li>
                        <li>• Reduces the impact of one bad hole</li>
                        <li>• Perfect for mixed skill level groups</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Custom Rules Section */}
            {customRules.length > 0 && (
              <div className={`${eventData?.theme === "Masters" ? "bg-green-50/20 rounded-lg p-8 sm:p-12 border border-green-800/20" : "bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200"}`}>
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center space-x-2 ${eventData?.theme === "Masters" ? "bg-white border border-green-800/20 rounded-lg" : "bg-slate-200 rounded-full"} px-4 py-2 mb-4`}>
                    <FileText className={`h-4 w-4 ${eventData?.theme === "Masters" ? "text-yellow-600" : "text-slate-600"}`} />
                    <span className={`text-sm font-medium ${eventData?.theme === "Masters" ? "text-green-800 font-serif tracking-wide" : "text-slate-700"}`}>
                      Tournament Guidelines
                    </span>
                  </div>
                  <h3 className={`${eventData?.theme === "Masters" ? "font-serif font-semibold text-green-900 text-2xl" : "text-2xl sm:text-3xl font-bold text-slate-900"}`}>
                    Custom Rules
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {customRules.map((rule, index) => (
                    <div
                      key={rule.id}
                      className={`${eventData?.theme === "TourTech" ? `${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} ${theme.cardPadding} ${theme.cardShadow}` : eventData?.theme === "Masters" ? "bg-white rounded-lg p-6 border border-green-800/20 shadow-sm" : "bg-white rounded-2xl p-6 border border-slate-200 shadow-sm"}`}
                    >
                      {rule.rule_title && (
                        <h4 className={`${eventData?.theme === "Masters" ? "font-serif font-semibold text-green-900" : "font-semibold text-slate-900"} mb-3 text-lg`}>
                          {rule.rule_title}
                        </h4>
                      )}
                      <div className="text-slate-700 prose prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="text-lg font-bold text-slate-800 mb-2">
                                {children}
                              </h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="text-base font-bold text-slate-800 mb-2">
                                {children}
                              </h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="text-sm font-bold text-slate-800 mb-1">
                                {children}
                              </h3>
                            ),
                            p: ({ children }) => (
                              <p className="text-slate-700 mb-2 last:mb-0 leading-relaxed">
                                {children}
                              </p>
                            ),
                            ul: ({ children }) => (
                              <ul className="text-slate-700 ml-6 mb-2 last:mb-0 list-disc">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="text-slate-700 ml-6 mb-2 last:mb-0 list-decimal">
                                {children}
                              </ol>
                            ),
                            li: ({ children }) => (
                              <li className="mb-1 last:mb-0">{children}</li>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-bold text-slate-800">
                                {children}
                              </strong>
                            ),
                            em: ({ children }) => (
                              <em className="italic">{children}</em>
                            ),
                          }}
                        >
                          {rule.rule_text}
                        </ReactMarkdown>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Players Section */}
      {players.length > 0 && (
        <section
          id="players"
          className={`${eventData?.theme === "TourTech" ? theme.sectionBackground : "relative overflow-hidden"} ${theme.sectionPadding} ${theme.containerPadding}`}
        >
          {/* Background decoration - only for GolfOS */}
          {eventData?.theme !== "TourTech" && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-green-50/20 via-white to-emerald-50/10"></div>
              <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-green-100/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
            </>
          )}

          <div className={`relative ${theme.maxContentWidth} mx-auto`}>
            <div className={`text-center ${theme.headerSpacing}`}>
              <div
                className={`inline-flex items-center gap-2 ${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} px-3 py-1.5 ${theme.cardShadow} mb-4`}
              >
                <Users className={`h-3.5 w-3.5 ${theme.accentColor}`} />
                <span
                  className={`${eventData?.theme === "TourTech" ? theme.tableHeader : "text-sm font-medium text-purple-800"}`}
                >
                  {eventData?.theme === "TourTech" ? "PLAYERS" : "Competitors"}
                </span>
              </div>

              <h2 className={`${theme.sectionTitle} ${theme.headerSpacing}`}>
                Players
              </h2>
              <p className={`${theme.heroSubtitle}`}>
                Tournament starts{" "}
                {
                  formatDateRange(
                    eventData.start_date,
                    eventData.end_date,
                  ).split(",")[0]
                }{" "}
                • {players.length} players registered
              </p>
            </div>

            <div className="flex justify-center">
              <div
                className={`grid gap-8 ${
                  players.length === 1
                    ? "grid-cols-1 max-w-sm"
                    : players.length === 2
                      ? "grid-cols-1 sm:grid-cols-2 max-w-3xl"
                      : players.length === 3
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-7xl"
                }`}
              >
                {players.map((player, index) => (
                  <AnimatedPlayerCard
                    key={player.id}
                    player={player}
                    index={index}
                    theme={theme}
                    isTourTech={eventData?.theme === "TourTech"}
                    onOpenModal={() => {
                      setSelectedPlayer(player);
                      setIsPlayerModalOpen(true);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Prizes Section */}
      {(prizes.length > 0 || skillsContests.length > 0) && (
        <section
          id="prizes"
          className={`${eventData?.theme === "TourTech" ? theme.sectionBackground : eventData?.theme === "Masters" ? `${theme.sectionBackground} relative` : "relative"} ${theme.sectionPadding} ${theme.containerPadding}`}
        >
          {/* Background decoration */}
          {eventData?.theme === "GolfOS" && (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-50/30 via-white to-slate-50/50"></div>
          )}
          {eventData?.theme === "Masters" && (
            <div className="absolute inset-0 bg-gradient-to-b from-amber-50/20 via-white to-green-50/10"></div>
          )}
          <div
            className={`relative ${theme.maxContentWidth} mx-auto space-y-${eventData?.theme === "TourTech" ? "12" : eventData?.theme === "Masters" ? "12" : "20"}`}
          >
            {/* Header and Buy-in */}
            <div className={`text-center ${theme.headerSpacing}`}>
              <div
                className={`inline-flex items-center gap-2 ${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} px-3 py-1.5 ${theme.cardShadow} mb-4`}
              >
                <Trophy
                  className={`h-3.5 w-3.5 ${eventData?.theme === "TourTech" ? theme.orangeText : eventData?.theme === "Masters" ? "text-yellow-600" : "text-amber-600"}`}
                />
                <span
                  className={`${eventData?.theme === "TourTech" ? theme.monoLabel : eventData?.theme === "Masters" ? "text-sm font-medium text-green-800 font-serif tracking-wide" : "text-sm font-medium text-amber-800"}`}
                >
                  {eventData?.theme === "TourTech" ? "PRIZES" : eventData?.theme === "Masters" ? "Prize Pool" : "Prize Pool"}
                </span>
              </div>

              <h2 className={`${theme.sectionTitle} ${theme.headerSpacing}`}>
                {eventData?.theme === "TourTech"
                  ? "Tournament Prizes"
                  : "High Stakes, Higher Handicaps"}
              </h2>

              {eventData.buy_in && eventData.buy_in > 0 && (
                <div
                  className={`${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} ${theme.cardPadding} ${theme.cardShadow} ${theme.textMaxWidth} mx-auto`}
                >
                  <p className={`${theme.cardText} mb-2`}>Tournament Buy-in</p>
                  <div
                    className={`${eventData?.theme === "TourTech" ? `${theme.monoText} text-3xl text-orange-600` : "text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent"}`}
                  >
                    ${eventData.buy_in}
                  </div>
                </div>
              )}
            </div>

            {/* Prize Cards */}
            {prizes.length > 0 && (
              <div
                className={`flex justify-center ${eventData?.theme === "TourTech" ? "mt-12" : "mt-16"}`}
              >
                <div
                  className={`grid gap-8 ${
                    prizes.length === 1
                      ? "grid-cols-1 max-w-sm"
                      : prizes.length === 2
                        ? "grid-cols-1 sm:grid-cols-2 max-w-2xl"
                        : prizes.length === 3
                          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl"
                          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl"
                  }`}
                >
                  {prizes.map((prize, index) => (
                    <AnimatedPrizeCard
                      key={prize.id}
                      prize={prize}
                      index={index}
                      theme={theme}
                      isTourTech={eventData?.theme === "TourTech"}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Hole Contests Summary */}
            {skillsContests.length > 0 && (
              <div
                className={`${eventData?.theme === "TourTech" ? "bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200 mt-20" : "bg-indigo-50 rounded-3xl p-8 sm:p-12 border border-indigo-200 mt-16"}`}
              >
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center space-x-2 ${eventData?.theme === "TourTech" ? "bg-gray-200 rounded-md" : "bg-indigo-200 rounded-full"} px-4 py-2 mb-4`}
                  >
                    <Target
                      className={`h-4 w-4 ${eventData?.theme === "TourTech" ? "text-gray-600" : "text-indigo-600"}`}
                    />
                    <span
                      className={`text-sm font-medium ${eventData?.theme === "TourTech" ? "text-gray-700" : "text-indigo-700"}`}
                    >
                      {eventData?.theme === "TourTech"
                        ? "SKILLS CONTESTS"
                        : "Skills Contests"}
                    </span>
                  </div>
                  <h3
                    className={`${eventData?.theme === "TourTech" ? "text-xl font-semibold text-slate-900" : "text-2xl sm:text-3xl font-bold text-indigo-900"}`}
                  >
                    Hole Contests
                  </h3>
                  <p
                    className={`${eventData?.theme === "TourTech" ? "text-sm text-slate-600" : "text-lg text-indigo-600 font-light"}`}
                  >
                    Extra prizes on designated holes
                  </p>
                </div>

                <div className="space-y-6">
                  {getContestsByRound().map((round, index) => (
                    <div
                      key={index}
                      className={`${eventData?.theme === "TourTech" ? "bg-white rounded-md p-4 border border-gray-200 shadow-sm" : "bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm"}`}
                    >
                      <h4 className="text-xl font-bold text-indigo-900 mb-4">
                        Round {round.roundNumber} ({round.courseName})
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {round.contests.map((contest, contestIndex) => (
                          <div
                            key={contestIndex}
                            className="flex items-center space-x-2 bg-indigo-50 rounded-lg px-3 py-2"
                          >
                            <span
                              className="text-lg"
                              role="img"
                              aria-label={
                                contest.type === "closest_to_pin"
                                  ? "target"
                                  : "golf swing"
                              }
                            >
                              {contest.emoji}
                            </span>
                            <span className="font-medium text-indigo-900 text-sm">
                              Hole {contest.hole}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Prize Information */}
                  {(closestToPinPrize > 0 || longestDrivePrize > 0) && (
                    <div
                      className={`${eventData?.theme === "TourTech" ? "bg-white rounded-md p-4 border border-gray-200 shadow-sm" : "bg-white rounded-2xl p-6 border border-indigo-200 shadow-sm"}`}
                    >
                      <h4 className="text-lg font-semibold text-indigo-900 mb-4">
                        Prize Information
                      </h4>
                      <div className="flex flex-wrap gap-4">
                        {closestToPinPrize > 0 && (
                          <div className="flex items-center space-x-2">
                            <span
                              className="text-lg"
                              role="img"
                              aria-label="target"
                            >
                              �����
                            </span>
                            <span className="text-sm text-green-700 font-medium">
                              Closest to Pin: ${closestToPinPrize} per hole
                            </span>
                          </div>
                        )}
                        {longestDrivePrize > 0 && (
                          <div className="flex items-center space-x-2">
                            <span
                              className="text-lg"
                              role="img"
                              aria-label="golf swing"
                            >
                              🏌️�����️
                            </span>
                            <span className="text-sm text-orange-700 font-medium">
                              Long Drive: ${longestDrivePrize} per hole
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Contest Rules */}
            {(closestToPinGroups.length > 0 ||
              longestDriveGroups.length > 0) && (
              <div
                className={`${eventData?.theme === "TourTech" ? "bg-gray-50 rounded-lg p-6 sm:p-8 border border-gray-200 mt-20" : "bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 mt-16"}`}
              >
                <div className="text-center mb-8">
                  <div
                    className={`inline-flex items-center space-x-2 ${eventData?.theme === "TourTech" ? "bg-gray-200 rounded-md" : "bg-slate-200 rounded-full"} px-4 py-2 mb-4`}
                  >
                    <Info className="h-4 w-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">
                      {eventData?.theme === "TourTech"
                        ? "CONTEST RULES"
                        : "Official Guidelines"}
                    </span>
                  </div>
                  <h3
                    className={`${eventData?.theme === "TourTech" ? "text-xl font-semibold text-slate-900" : "text-2xl sm:text-3xl font-bold text-slate-900"}`}
                  >
                    Contest Rules
                  </h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Closest to Pin Rules */}
                  {closestToPinGroups.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Crosshair className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-green-900">
                            Closest to the Pin
                          </h4>
                          {closestToPinPrize > 0 && (
                            <p className="text-sm text-green-600">
                              ${closestToPinPrize} per hole
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-lg p-4">
                        <h5 className="font-semibold text-green-900 text-sm mb-3">
                          Rules
                        </h5>
                        <ul className="text-sm text-green-700 space-y-2">
                          <li>
                            • Must be <strong>ON THE GREEN</strong> to win
                          </li>
                          <li>• Measured to the inch for ties</li>
                          <li>• Ball must come to rest on putting surface</li>
                          <li>
                            <span className="inline-flex items-center space-x-1">
                              <span role="img" aria-label="trophy">
                                🏆
                              </span>
                              <span>Winner takes the full prize amount</span>
                            </span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Long Drive Rules */}
                  {longestDriveGroups.length > 0 && (
                    <div className="bg-white rounded-2xl p-6 border-2 border-orange-200 shadow-sm">
                      <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                          <Zap className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-orange-900">
                            Long Drive
                          </h4>
                          {longestDrivePrize > 0 && (
                            <p className="text-sm text-orange-600">
                              ${longestDrivePrize} per hole
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-orange-50 rounded-lg p-4">
                          <h5 className="font-semibold text-orange-900 text-sm mb-3">
                            Rules
                          </h5>
                          <ul className="text-sm text-orange-700 space-y-2">
                            <li>
                              • Must be <strong>IN THE FAIRWAY</strong> to win
                            </li>
                            <li>
                              • Winner = shortest distance to flag from approach
                            </li>
                            <li>• Placement beats pure distance</li>
                            <li>• Measured to the yard for ties</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Administration Guidelines */}
                <div className="mt-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-start space-x-3">
                    <Flag className="h-5 w-5 text-slate-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-slate-900 mb-3">
                        Contest Administration
                      </div>
                      <ul className="text-sm text-slate-700 space-y-2">
                        <li>
                          • All measurements are final when agreed upon by the
                          group
                        </li>
                        <li>
                          • In case of disputes, tournament organizer has final
                          say
                        </li>
                        <li>��� Prizes paid out after round completion</li>
                        <li>• Have fun and play with integrity!</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Travel & Accommodation Section */}
      {travel &&
        (travel.flight_info ||
          travel.accommodations ||
          travel.daily_schedule) && (
          <section
            id="travel"
            className={`${eventData?.theme === "TourTech" ? `${theme.sectionBackground} pt-16 pb-8` : "relative overflow-hidden"} ${eventData?.theme === "TourTech" ? "" : theme.sectionPadding} ${theme.containerPadding}`}
          >
            {/* Background decoration - only for GolfOS */}
            {eventData?.theme !== "TourTech" && (
              <>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-white to-slate-50/30"></div>
                <div className="absolute top-0 left-0 w-80 h-80 bg-blue-100/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
              </>
            )}

            <div className={`relative ${theme.maxContentWidth} mx-auto`}>
              <div className={`text-center ${theme.headerSpacing}`}>
                <div
                  className={`inline-flex items-center gap-2 ${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} px-3 py-1.5 ${theme.cardShadow} mb-4`}
                >
                  <Plane
                    className={`h-3.5 w-3.5 ${eventData?.theme === "TourTech" ? theme.orangeText : "text-blue-600"}`}
                  />
                  <span
                    className={`${eventData?.theme === "TourTech" ? theme.monoLabel : "text-sm font-medium text-blue-800"}`}
                  >
                    {eventData?.theme === "TourTech" ? "TRAVEL" : "Logistics"}
                  </span>
                </div>

                <h2 className={`${theme.sectionTitle} ${theme.headerSpacing}`}>
                  Travel & Accommodation
                </h2>
                <p
                  className={`${theme.heroSubtitle} ${theme.textMaxWidth} mx-auto`}
                >
                  Everything you need to have a smooth and comfortable trip
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {[
                  {
                    info: travel.flight_info,
                    icon: Plane,
                    title: "Getting There",
                    color: "blue",
                  },
                  {
                    info: travel.accommodations,
                    icon: Building,
                    title: "Accommodation",
                    color: "emerald",
                  },
                  {
                    info: travel.daily_schedule,
                    icon: Clock,
                    title: "Daily Schedule",
                    color: "purple",
                  },
                ]
                  .filter((item) => item.info)
                  .map((item, index) => (
                    <AnimatedTravelCard
                      key={item.title}
                      item={item}
                      index={index}
                      theme={theme}
                      isTourTech={eventData?.theme === "TourTech"}
                    />
                  ))}
              </div>
            </div>
          </section>
        )}

      {/* Footer */}
      <footer
        className={`relative ${eventData?.theme === "TourTech" ? "pt-16 pb-12 px-6 sm:px-8 lg:px-12 bg-gray-50 border-t border-gray-200 mt-12" : "py-20 px-6 sm:px-8 lg:px-12 overflow-hidden"}`}
      >
        {/* Background decoration - only for GolfOS */}
        {eventData?.theme !== "TourTech" && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(34,197,94,0.1),_transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_rgba(6,182,212,0.1),_transparent_70%)]"></div>
          </>
        )}

        <div
          className={`relative ${theme.maxContentWidth} mx-auto text-center`}
        >
          <div
            className={`${eventData?.theme === "TourTech" ? `w-16 h-16 ${theme.accentBackground} ${theme.roundedCorners} flex items-center justify-center mx-auto mb-6` : "w-24 h-24 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mx-auto mb-8 border border-white/20"}`}
          >
            <Target
              className={`${eventData?.theme === "TourTech" ? "h-8 w-8 text-white" : "h-12 w-12 text-white"}`}
            />
          </div>

          <h3
            className={`${eventData?.theme === "TourTech" ? `${theme.sectionTitle} text-slate-900 mb-3` : "text-3xl sm:text-4xl font-bold mb-6 text-white"}`}
          >
            {eventData.name}
          </h3>

          <p
            className={`${eventData?.theme === "TourTech" ? `${theme.monoText} text-slate-600 mb-6` : "text-xl text-green-200 mb-12 font-light"}`}
          >
            {eventData.location} •{" "}
            {formatDateRange(eventData.start_date, eventData.end_date)}
          </p>

          <div
            className={`${eventData?.theme === "TourTech" ? `${theme.cardBackground} ${theme.cardBorder} ${theme.roundedCorners} p-4` : "bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10"}`}
          >
            <p
              className={`${eventData?.theme === "TourTech" ? `${theme.monoText} text-slate-500 text-sm` : "text-green-200 text-lg font-medium"}`}
            >
              Powered by TrackTrack Golf
            </p>
          </div>
        </div>
      </footer>

      {/* Course Modal */}
      {selectedCourse && (
        <CourseModal
          course={selectedCourse.course}
          round={selectedCourse.round}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedCourse(null);
          }}
        />
      )}

      {/* Player Modal */}
      {selectedPlayer && (
        <PlayerModal
          player={selectedPlayer}
          isOpen={isPlayerModalOpen}
          onClose={() => {
            setIsPlayerModalOpen(false);
            setSelectedPlayer(null);
          }}
        />
      )}
    </div>
  );
}
