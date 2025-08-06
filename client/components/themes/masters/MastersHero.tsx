import React from 'react';
import { Calendar, ChevronRight, Users } from 'lucide-react';
import { MastersHeaderCard } from './MastersHeaderCard';

interface MastersHeroProps {
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

export const MastersHero: React.FC<MastersHeroProps> = ({
  eventData,
  players,
  courses,
  formatDateRange,
  getDuration,
  getScoringFormat
}) => {
  const renderTitle = () => {
    if (eventData.name.split(' ').length >= 3) {
      const words = eventData.name.split(' ');
      const midPoint = Math.ceil(words.length / 2);
      const firstLine = words.slice(0, midPoint).join(' ');
      const secondLine = words.slice(midPoint).join(' ');
      
      return (
        <>
          <span className="block text-green-900">{firstLine}</span>
          <span className="block text-yellow-600">{secondLine}</span>
        </>
      );
    }
    return eventData.name;
  };

  return (
    <section
      id="overview"
      className="relative overflow-hidden bg-gradient-to-br from-amber-50/30 via-white to-green-50/20"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-green-50/20"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-100/10 rounded-full blur-3xl -translate-y-24 translate-x-24"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-100/10 rounded-full blur-3xl translate-y-24 -translate-x-24"></div>

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 lg:px-16 xl:px-20 pt-20 pb-16 sm:pt-26 sm:pb-20 lg:pt-32 lg:pb-26">
        <div className="text-center space-y-8 max-w-5xl mx-auto">
          {/* Event Badge */}
          <MastersHeaderCard icon={Calendar}>
            {formatDateRange(eventData.start_date, eventData.end_date)}
          </MastersHeaderCard>

          {/* Title & Description */}
          <div className="space-y-6">
            <h1 className="font-serif font-semibold text-green-900 text-3xl md:text-7xl tracking-tight leading-tight">
              {renderTitle()}
            </h1>
            {eventData.description && (
              <p className="font-serif font-medium text-green-800/80 text-base sm:text-lg tracking-wide max-w-5xl mx-auto leading-relaxed">
                {eventData.description}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <a
              href="#courses"
              className="bg-green-800 hover:bg-green-900 text-amber-50 font-medium transition-all duration-300 transform hover:scale-105 px-8 py-4 rounded-xl font-serif text-lg shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <span>View Courses</span>
              <ChevronRight className="h-5 w-5 transition-transform duration-300" />
            </a>
            <a
              href="#players"
              className="bg-transparent border-2 border-yellow-600 text-yellow-600 hover:bg-yellow-50 font-medium transition-all duration-300 px-8 py-4 rounded-xl font-serif text-lg shadow-lg hover:shadow-xl inline-flex items-center gap-2"
            >
              <span>View Players</span>
              <Users className="h-5 w-5 transition-transform duration-300" />
            </a>
          </div>

          {/* Event Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-green-800/20 mt-8">
            {[
              { label: "Courses", value: courses.length.toString() },
              { label: "Players", value: players.length.toString() },
              { label: "Format", value: getScoringFormat() },
              { label: "Duration", value: getDuration(eventData.start_date, eventData.end_date) },
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
        </div>
      </div>
    </section>
  );
};
