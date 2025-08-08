import React from "react";
import { Heart, ExternalLink } from "lucide-react";

interface TrackTrackFooterProps {
  eventData: {
    name: string;
    location: string;
  };
}

export const TrackTrackFooter: React.FC<TrackTrackFooterProps> = ({
  eventData,
}) => {
  return (
    <footer className="relative bg-gradient-to-br from-gray-900 via-purple-900 to-pink-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-900/50 to-pink-900/50"></div>
        <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          {/* Event Name */}
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {eventData.name}
          </h3>
          <p className="text-xl text-purple-200 mb-8">
            {eventData.location}
          </p>

          {/* Divider */}
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto mb-8 rounded-full"></div>

          {/* Powered by */}
          <div className="flex items-center justify-center space-x-2 text-purple-200">
            <span>Built with</span>
            <Heart className="w-4 h-4 text-pink-400" />
            <span>by</span>
            <a
              href="https://tracktrack.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center font-semibold text-white hover:text-pink-300 transition-colors group"
            >
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                TrackTrack
              </span>
              <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>

          {/* Copyright */}
          <p className="text-sm text-purple-300 mt-6">
            © {new Date().getFullYear()} {eventData.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
