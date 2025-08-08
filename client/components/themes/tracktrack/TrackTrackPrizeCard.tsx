import React from "react";
import { Trophy, Medal, Star, DollarSign, Target } from "lucide-react";

interface TrackTrackPrizeCardProps {
  prize: {
    id: string;
    category: string;
    description: string;
    amount?: number;
  };
  index: number;
}

export const TrackTrackPrizeCard: React.FC<TrackTrackPrizeCardProps> = ({
  prize,
  index,
}) => {
  const getPrizeIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "overall_champion":
      case "winner":
        return Trophy;
      case "runner_up":
      case "second":
        return Medal;
      case "closest_to_pin":
      case "longest_drive":
        return Target;
      default:
        return Star;
    }
  };

  const getPrizeColors = (index: number) => {
    const colors = [
      "from-yellow-400 to-orange-500", // Gold
      "from-gray-400 to-gray-600",     // Silver
      "from-orange-400 to-red-500",    // Bronze
      "from-purple-400 to-pink-500",   // Purple
      "from-blue-400 to-cyan-500",     // Blue
      "from-green-400 to-emerald-500", // Green
    ];
    return colors[index % colors.length];
  };

  const Icon = getPrizeIcon(prize.category);
  const gradientColors = getPrizeColors(index);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-purple-100 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-300 hover:-translate-y-1 group">
      {/* Prize Icon */}
      <div className={`w-16 h-16 bg-gradient-to-br ${gradientColors} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="w-8 h-8 text-white" />
      </div>

      {/* Prize Category */}
      <h3 className="text-2xl font-bold text-gray-900 mb-3 capitalize">
        {prize.category.replace(/_/g, " ")}
      </h3>

      {/* Prize Description */}
      <p className="text-gray-600 leading-relaxed mb-6">
        {prize.description}
      </p>

      {/* Prize Amount */}
      {prize.amount && (
        <div className="flex items-center text-green-600 font-semibold">
          <DollarSign className="w-5 h-5 mr-1" />
          <span className="text-xl">{prize.amount}</span>
        </div>
      )}

      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Icon className="w-12 h-12 text-gray-400" />
      </div>
    </div>
  );
};
