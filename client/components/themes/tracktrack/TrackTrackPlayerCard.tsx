import React from "react";
import { Trophy, Target } from "lucide-react";

interface TrackTrackPlayerCardProps {
  players: {
    id: string;
    full_name: string;
    handicap?: number;
    profile_image?: string;
    team?: string;
    bio?: string;
  }[];
}

export const TrackTrackPlayerCard: React.FC<TrackTrackPlayerCardProps> = ({
  players,
}) => {
  return (
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
          <div
            key={player.id}
            className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Player Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                {player?.profile_image ? (
                  <img
                    src={player.profile_image}
                    alt={player.full_name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{player?.full_name?.charAt(0)?.toUpperCase()}</span>
                )}
              </div>
            </div>

            {/* Player Info */}
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {player.full_name}
              </h3>
              
              {player.handicap !== undefined && (
                <div className="mt-2">
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200">
                    <Target className="h-3 w-3 text-purple-600 mr-1" />
                    <span className="text-sm font-medium">
                      HCP {player.handicap}
                    </span>
                  </div>
                </div>
              )}

              {player.team && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                    {player.team}
                  </span>
                </div>
              )}

              {player.bio && (
                <div className="mt-3">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {player.bio}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
