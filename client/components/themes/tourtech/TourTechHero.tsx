import React from 'react';
import { Calendar, ChevronRight, Users } from 'lucide-react';
import { TourTechHeaderCard } from './TourTechHeaderCard';

interface TourTechHeroProps {
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

export const TourTechHero: React.FC<TourTechHeroProps> = ({
  eventData,
  players,
  courses,
  formatDateRange,
  getDuration,
  getScoringFormat
}) => {
  return (
    <section id="overview" className="bg-white border-b border-slate-200">
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
        <div className="space-y-4">
          {/* Event Badge */}
          <TourTechHeaderCard icon={Calendar}>
            {formatDateRange(eventData.start_date, eventData.end_date)}
          </TourTechHeaderCard>

          {/* Title & Description */}
          <div className="space-y-3">
            <h1 className="text-slate-900 font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              {eventData.name}
            </h1>
            {eventData.description && (
              <p className="text-slate-600 font-normal text-base sm:text-lg max-w-2xl leading-relaxed">
                {eventData.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <a
              href="#courses"
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-md text-sm shadow-sm inline-flex items-center gap-2 font-medium transition-colors"
            >
              <span>View Courses</span>
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="#players"
              className="bg-white border border-gray-300 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-md text-sm shadow-sm inline-flex items-center gap-2 font-medium transition-colors"
            >
              <span>View Players</span>
              <Users className="h-4 w-4" />
            </a>
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-gray-200 mt-6">
            {[
              { label: "Courses", value: courses.length.toString() },
              { label: "Players", value: players.length.toString() },
              { label: "Format", value: getScoringFormat() },
              { label: "Duration", value: getDuration(eventData.start_date, eventData.end_date) },
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
        </div>
      </div>
    </section>
  );
};
