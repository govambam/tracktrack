import React from "react";
import { Calendar, ChevronRight, Users } from "lucide-react";
import { DefaultHeaderCard } from "./DefaultHeaderCard";
import { CountdownTimer } from "./CountdownTimer";

interface DefaultHeroProps {
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

export const DefaultHero: React.FC<DefaultHeroProps> = ({
  eventData,
  players,
  courses,
  formatDateRange,
  getDuration,
  getScoringFormat,
}) => {
  return (
    <section id="overview" className="relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-transparent to-emerald-50/30"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-100/20 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-100/20 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 pt-20 pb-16 sm:pt-26 sm:pb-20 lg:pt-32 lg:pb-26">
        <div className="text-center space-y-10 max-w-4xl mx-auto">
          {/* Event Badge */}
          <DefaultHeaderCard icon={Calendar} color="green">
            {formatDateRange(eventData.start_date, eventData.end_date)}
          </DefaultHeaderCard>

          {/* Title & Description */}
          <div className="space-y-6">
            <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold leading-[0.9] text-slate-900 tracking-tight">
              {eventData.name}
            </h1>
            {eventData.description && (
              <p className="text-xl sm:text-2xl text-slate-600 max-w-3xl mx-auto font-light leading-relaxed">
                {eventData.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a
              href="#courses"
              className="group bg-gradient-to-r from-green-600 to-emerald-600 text-white px-10 py-5 rounded-2xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-300 shadow-xl shadow-green-600/25 hover:shadow-2xl hover:shadow-green-600/40 hover:-translate-y-1 text-lg inline-flex items-center gap-2"
            >
              <span>View Courses</span>
              <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#players"
              className="group bg-white/80 backdrop-blur-sm border-2 border-green-200 text-green-700 px-10 py-5 rounded-2xl font-semibold hover:bg-green-50 hover:border-green-300 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg inline-flex items-center gap-2"
            >
              <span>Meet Players</span>
              <Users className="h-5 w-5 group-hover:scale-110 transition-transform" />
            </a>
          </div>

          {/* Countdown Timer */}
          <CountdownTimer targetDate={eventData.start_date} />
        </div>
      </div>
    </section>
  );
};
