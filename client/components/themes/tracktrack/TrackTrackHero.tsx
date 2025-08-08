import React from "react";
import { Calendar, ChevronRight, Users } from "lucide-react";
import { TrackTrackHeaderCard } from "./TrackTrackHeaderCard";
import { CountdownTimer } from "../default/CountdownTimer";

interface TrackTrackHeroProps {
  eventData: {
    name: string;
    description?: string;
    start_date: string;
    end_date: string;
    location: string;
  };
  players: any[];
  courses: any[];
  formatDateRange: (start: string, end: string) => string;
  getDuration: (start: string, end: string) => string;
  getScoringFormat: () => string;
}

export const TrackTrackHero: React.FC<TrackTrackHeroProps> = ({
  eventData,
  players,
  courses,
  formatDateRange,
  getDuration,
  getScoringFormat,
}) => {
  return (
    <section id="overview" className="relative overflow-hidden">
      {/* Background with gradient and floating elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 via-pink-50/50 to-orange-100/50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-400/20 to-yellow-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-28 h-28 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-26 sm:pb-20 lg:pt-32 lg:pb-26">
        <div className="text-center space-y-10 max-w-5xl mx-auto">
          {/* Event Badge */}
          <TrackTrackHeaderCard icon={Calendar}>
            {formatDateRange(eventData.start_date, eventData.end_date)}
          </TrackTrackHeaderCard>

          {/* Title & Description */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-gray-900 tracking-tight">
              <span className="block">{eventData.name.split(' ').slice(0, -1).join(' ')}</span>
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {eventData.name.split(' ').slice(-1)[0]}
              </span>
            </h1>
            {eventData.description && (
              <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto font-light leading-relaxed">
                {eventData.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="#courses"
              className="group bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-5 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg inline-flex items-center gap-2"
            >
              <span>View Courses</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#players"
              className="group bg-white/90 backdrop-blur-sm border-2 border-purple-200 text-purple-700 px-10 py-5 rounded-full font-semibold hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg inline-flex items-center gap-2"
            >
              <span>Meet Players</span>
              <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          {/* Trip Details Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-medium text-purple-600 mb-1">Location</div>
              <div className="text-lg font-semibold text-gray-900">{eventData.location}</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-medium text-purple-600 mb-1">Players</div>
              <div className="text-lg font-semibold text-gray-900">{players.length} Golfers</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg transition-all duration-300">
              <div className="text-sm font-medium text-purple-600 mb-1">Format</div>
              <div className="text-lg font-semibold text-gray-900">{getScoringFormat()}</div>
            </div>
          </div>

          {/* Countdown Timer */}
          <div className="mt-12">
            <CountdownTimer targetDate={eventData.start_date} />
          </div>
        </div>
      </div>
    </section>
  );
};
