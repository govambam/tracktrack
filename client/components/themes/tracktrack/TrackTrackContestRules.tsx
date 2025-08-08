import React from "react";
import { BookOpen, Target, Trophy, Users } from "lucide-react";

interface TrackTrackContestRulesProps {
  eventData: {
    name: string;
    scoring_format?: string;
  };
  getScoringFormat: () => string;
  getStablefordPoints?: () => Array<{
    score: string;
    points: number;
    description: string;
    icon: any;
  }>;
}

export const TrackTrackContestRules: React.FC<TrackTrackContestRulesProps> = ({
  eventData,
  getScoringFormat,
  getStablefordPoints,
}) => {
  const scoringFormat = getScoringFormat();
  const isStableford = scoringFormat.toLowerCase().includes("stableford");

  return (
    <section id="rules" className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 via-purple-50/50 to-pink-100/50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-20 right-20 w-28 h-28 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-36 h-36 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 backdrop-blur-sm mb-6">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium text-sm">Contest Rules</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            How to <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Win</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {isStableford 
              ? "Points-based scoring system where consistency and good play are rewarded"
              : "Traditional stroke play format where the lowest total score wins"
            }
          </p>
        </div>

        {/* Scoring Format Card */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-purple-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mr-4">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Scoring Format</h3>
            </div>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              <strong>{scoringFormat}</strong>
            </p>
            
            {isStableford ? (
              <div className="text-gray-600">
                <p className="mb-4">
                  In Stableford scoring, you earn points based on your performance relative to par on each hole. 
                  Higher scores are better! Focus on consistent play rather than perfect shots.
                </p>
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-2">Point System:</h4>
                  <div className="text-sm space-y-1">
                    <div>• <strong>Eagle (2 under par):</strong> 4 points</div>
                    <div>• <strong>Birdie (1 under par):</strong> 3 points</div>
                    <div>• <strong>Par:</strong> 2 points</div>
                    <div>• <strong>Bogey (1 over par):</strong> 1 point</div>
                    <div>• <strong>Double Bogey or worse:</strong> 0 points</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-600">
                <p>
                  Traditional stroke play where every shot counts. The player with the lowest total score 
                  across all rounds wins. Focus on minimizing your total strokes throughout the tournament.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* General Rules */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-blue-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mr-4">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">General Rules</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Follow standard USGA rules of golf
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Play from designated tees for your skill level
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Record scores honestly and verify with playing partners
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Maintain pace of play throughout the round
              </li>
            </ul>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border border-pink-100 hover:shadow-lg transition-all duration-300">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mr-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Sportsmanship</h3>
            </div>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Respect your fellow competitors and the course
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Help others find lost balls and read greens
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Celebrate good shots and encourage after bad ones
              </li>
              <li className="flex items-start">
                <span className="w-2 h-2 bg-pink-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Have fun and enjoy the camaraderie!
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
