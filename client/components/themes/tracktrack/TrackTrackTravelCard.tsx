import React from "react";
import { Plane, Hotel, Calendar, MapPin } from "lucide-react";

interface TrackTrackTravelCardProps {
  travelData: {
    flight_info?: string;
    accommodations?: string;
    daily_schedule?: string;
  };
  eventData: {
    location: string;
    start_date: string;
    end_date: string;
  };
  formatDateRange: (start: string, end: string) => string;
}

export const TrackTrackTravelCard: React.FC<TrackTrackTravelCardProps> = ({
  travelData,
  eventData,
  formatDateRange,
}) => {
  return (
    <section id="travel" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/50 via-pink-50/50 to-purple-100/50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-16 right-16 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-pink-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-16 left-16 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Trip{" "}
            <span className="bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
              Details
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to know for an amazing golf adventure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Getting There */}
          {travelData.flight_info && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-orange-100 hover:shadow-lg hover:shadow-orange-100/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Getting There
                </h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {travelData.flight_info}
                </div>
              </div>
            </div>
          )}

          {/* Accommodations */}
          {travelData.accommodations && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                  <Hotel className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Accommodations
                </h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {travelData.accommodations}
                </div>
              </div>
            </div>
          )}

          {/* Daily Schedule */}
          {travelData.daily_schedule && (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 hover:shadow-lg hover:shadow-pink-100/50 transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Daily Schedule
                </h3>
              </div>
              <div className="prose prose-gray max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {travelData.daily_schedule}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Location & Dates Summary */}
        <div className="mt-12 text-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-gray-200 max-w-2xl mx-auto">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-purple-600 mr-2" />
              <h4 className="text-xl font-semibold text-gray-900">
                {eventData.location}
              </h4>
            </div>
            <p className="text-lg text-gray-600">
              {formatDateRange(eventData.start_date, eventData.end_date)}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
