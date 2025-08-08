import React from "react";
import { Trophy, Target } from "lucide-react";

interface TrackTrackPlayerCardProps {
  player: {
    full_name: string;
    handicap?: number;
    profile_image?: string;
    team?: string;
  };
  position?: number;
  score?: number;
  showPosition?: boolean;
}

export const TrackTrackPlayerCard: React.FC<TrackTrackPlayerCardProps> = ({
  player,
  position,
  score,
  showPosition = false,
}) => {
  const getPositionStyle = (pos?: number) => {
    if (!pos) return "";
    if (pos === 1) return "ring-2 ring-yellow-400 shadow-yellow-200";
    if (pos === 2) return "ring-2 ring-gray-400 shadow-gray-200";
    if (pos === 3) return "ring-2 ring-orange-400 shadow-orange-200";
    return "";
  };

  return (
    <div
      className={`relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1 ${getPositionStyle(position)}`}
    >
      {/* Position Badge */}
      {showPosition && position && (
        <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold rounded-full flex items-center justify-center shadow-lg">
          {position}
        </div>
      )}

      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="relative">
          {player.profile_image ? (
            <img
              src={player.profile_image}
              alt={player.full_name}
              className="w-16 h-16 rounded-full object-cover border-2 border-purple-200"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 border-2 border-purple-200 flex items-center justify-center">
              <span className="text-purple-700 font-semibold text-lg">
                {player.full_name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </span>
            </div>
          )}

          {/* Trophy icon for winner */}
          {position === 1 && (
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
              <Trophy className="w-3 h-3 text-white" />
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {player.full_name}
          </h3>
          <div className="flex items-center space-x-4 mt-1">
            {player.handicap !== undefined && (
              <div className="flex items-center text-purple-600">
                <Target className="w-4 h-4 mr-1" />
                <span className="text-sm font-medium">
                  HCP {player.handicap}
                </span>
              </div>
            )}
            {player.team && (
              <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-lg">
                {player.team}
              </div>
            )}
          </div>
        </div>

        {/* Score */}
        {score !== undefined && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{score}</div>
            <div className="text-sm text-gray-500">points</div>
          </div>
        )}
      </div>
    </div>
  );
};
