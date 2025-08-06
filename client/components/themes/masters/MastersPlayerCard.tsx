import React from "react";
import { Users } from "lucide-react";

interface MastersPlayerCardProps {
  players: any[];
}

export const MastersPlayerCard: React.FC<MastersPlayerCardProps> = ({
  players,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
      {players.map((player, index) => {
        // Parse bio for tags if present
        const bio = player.bio || "";
        const tags = bio
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        return (
          <div
            key={player.id}
            className="bg-white rounded-xl p-6 border border-green-800/20 shadow-sm hover:border-yellow-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 text-center"
          >
            {/* Gold User Icon */}
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Users className="h-6 w-6 text-white" />
            </div>

            {/* Player Name */}
            <h3 className="font-serif font-semibold text-green-900 text-lg mb-2">
              {player.full_name}
            </h3>

            {/* Tags from bio */}
            {tags.length > 0 && (
              <div className="space-y-1">
                {tags.map((tag, tagIndex) => (
                  <span
                    key={tagIndex}
                    className="inline-block text-sm text-green-800/70 font-serif"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Handicap if available */}
            {player.handicap !== null && player.handicap !== undefined && (
              <div className="mt-2">
                <span className="text-xs text-green-800/50 font-serif">
                  HCP: {player.handicap}
                </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
