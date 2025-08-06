import { useState, useEffect } from "react";
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Target,
  DollarSign,
  FileText,
  Medal,
  Crown,
  Award,
  ArrowLeft,
  BarChart3,
  Users,
} from "lucide-react";

interface PublicLeaderboardProps {
  hideNavigation?: boolean;
}

export default function PublicLeaderboard({
  hideNavigation = false,
}: PublicLeaderboardProps = {}) {
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [loading, setLoading] = useState(true);
  const [eventData, setEventData] = useState<any>(null);
  const [rounds, setRounds] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [courseHoles, setCourseHoles] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Navigation items for consistency with home page
  const navItems = [
    { name: "Overview", href: `/events/${slug}#overview` },
    { name: "Courses", href: `/events/${slug}#courses` },
    { name: "Scoring Format", href: `/events/${slug}#scoring` },
    { name: "Players", href: `/events/${slug}#players` },
    { name: "Prizes", href: `/events/${slug}#prizes` },
    { name: "Travel", href: `/events/${slug}#travel` },
    { name: "Leaderboard", href: `/events/${slug}/leaderboard` },
  ];

  // Mock data for demonstration
  const mockPlayers = [
    {
      name: "Patrick",
      position: 1,
      points: 8,
      badge: "Current Leader",
      money: 120,
    },
    { name: "Ivan", position: 2, points: 6, money: 80 },
    { name: "Marshall", position: 3, points: 4, money: 60 },
    { name: "Jack", position: 4, points: 3, money: 40 },
  ];

  const mockCourses = [
    { name: "Scarecrow", holes: 18, format: "Individual Stroke Play" },
    { name: "Gamble Sands", holes: 18, format: "Individual Stroke Play" },
    { name: "Quicksands", holes: 14, format: "Team Scramble" },
  ];

  const mockScorecard = [
    { hole: 1, par: 4, scores: { Patrick: 3, Ivan: 3, Marshall: 4, Jack: 5 } },
    { hole: 2, par: 3, scores: { Patrick: 2, Ivan: 3, Marshall: 3, Jack: 3 } },
    { hole: 3, par: 5, scores: { Patrick: 5, Ivan: 3, Marshall: 3, Jack: 4 } },
    { hole: 4, par: 4, scores: { Patrick: 4, Ivan: 4, Marshall: 4, Jack: 4 } },
    { hole: 5, par: 4, scores: { Patrick: 3, Ivan: 4, Marshall: 4, Jack: 4 } },
    { hole: 6, par: 3, scores: { Patrick: 3, Ivan: 3, Marshall: 3, Jack: 3 } },
  ];

  const contestIcons = {
    heart: "♥",
    club: "♣",
    diamond: "♦",
    star: "⭐",
  };

  const renderLeaderboardTab = () => (
    <div className="space-y-8">
      {/* Overall Stableford Leaderboard */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Target className="h-5 w-5 text-green-600" />
          <h3 className="text-2xl font-bold text-slate-900">
            Overall Stableford Leaderboard
          </h3>
        </div>
        <p className="text-slate-600 mb-8">
          Combined points from all rounds (individual + team)
        </p>

        <div className="space-y-4">
          {mockPlayers.map((player, index) => (
            <div
              key={player.name}
              className={`bg-white rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-lg ${
                index === 0
                  ? "border-yellow-300 bg-gradient-to-r from-yellow-50 to-amber-50"
                  : "border-slate-200 hover:border-green-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                      index === 0
                        ? "bg-yellow-500 text-white"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {player.position}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-lg">
                        {player.name}
                      </span>
                      {player.badge && (
                        <Badge className="bg-yellow-500 text-white text-xs">
                          {player.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {player.points}
                  </div>
                  <div className="text-sm text-slate-500">points</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team Scramble Scores */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Users className="h-5 w-5 text-green-600" />
          <h3 className="text-2xl font-bold text-slate-900">
            Team Scramble Scores
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-bold text-slate-900">IG + JC</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">0</div>
            </div>
            <p className="text-sm text-slate-500">Quicksands points</p>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="font-bold text-slate-900">PT + MR</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">0</div>
            </div>
            <p className="text-sm text-slate-500">Quicksands points</p>
          </div>
        </div>
      </div>

      {/* Prize Structure */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <Trophy className="h-5 w-5 text-green-600" />
          <h3 className="text-2xl font-bold text-slate-900">
            Prize Structure (Final)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-yellow-200">
            <div className="flex items-center space-x-3 mb-2">
              <Crown className="h-6 w-6 text-yellow-600" />
              <span className="font-bold text-slate-900">
                Overall Champion:
              </span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">$120</div>
          </div>

          <div className="bg-white rounded-2xl p-6 border-2 border-orange-200">
            <div className="flex items-center space-x-3 mb-2">
              <Trophy className="h-6 w-6 text-orange-600" />
              <span className="font-bold text-slate-900">Team Champions:</span>
            </div>
            <div className="text-lg font-bold text-orange-600">$25 each</div>
            <div className="text-sm text-slate-500">
              Awarded after all rounds complete
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMoneyTab = () => (
    <div className="space-y-8">
      <div className="flex items-center space-x-2 mb-6">
        <DollarSign className="h-5 w-5 text-green-600" />
        <h3 className="text-2xl font-bold text-slate-900">Money Earned</h3>
      </div>
      <p className="text-slate-600 mb-8">
        Current winnings from skills contests ($10 each)
      </p>

      <div className="space-y-4">
        {mockPlayers.map((player, index) => (
          <div
            key={player.name}
            className="bg-white rounded-2xl p-6 border-2 border-slate-200"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <span className="font-bold text-slate-900 text-lg">
                    {player.name}
                  </span>
                  <div className="text-sm text-slate-500">
                    {player.name === "Ivan"
                      ? "Scarecrow holes 2"
                      : "No prizes yet"}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ${player.money}
                </div>
                <div className="text-sm text-slate-500">
                  {player.name === "Ivan"
                    ? "1 contests won"
                    : "No contests won yet"}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Skills Contests & Final Prizes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-green-600" />
            Skills Contests
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center space-x-2">
                <span className="text-red-500">♥</span>
                <span className="text-sm">Closest to Pin:</span>
              </div>
              <span className="font-semibold">$10 per hole</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <div className="flex items-center space-x-2">
                <span className="text-orange-500">♦</span>
                <span className="text-sm">Long Drive:</span>
              </div>
              <span className="font-semibold">$10 per hole</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Must land on green (CTP) or in fairway (LD) to win
          </p>
        </div>

        <div>
          <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-green-600" />
            Final Prizes
          </h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <span className="text-sm">Overall Winner:</span>
              <span className="font-semibold">$120</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <span className="text-sm">Overall Runner-up:</span>
              <span className="font-semibold">$60</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-white rounded-lg border">
              <span className="text-sm">Team Champions:</span>
              <span className="font-semibold">$25 each</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Awarded after tournament completion
          </p>
        </div>
      </div>
    </div>
  );

  const renderScorecardsTab = () => (
    <div className="space-y-8">
      {mockCourses.map((course, courseIndex) => (
        <div key={course.name}>
          <div className="flex items-center space-x-2 mb-6">
            <Target className="h-5 w-5 text-green-600" />
            <h3 className="text-2xl font-bold text-slate-900">{course.name}</h3>
          </div>
          <p className="text-slate-600 mb-6">
            {course.holes} holes • {course.format}
          </p>

          <div className="bg-white rounded-2xl overflow-hidden border-2 border-slate-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                      Hole
                    </th>
                    {Array.from(
                      { length: Math.min(6, course.holes) },
                      (_, i) => (
                        <th
                          key={i + 1}
                          className="px-3 py-3 text-center text-sm font-semibold text-slate-900"
                        >
                          {i + 1}
                        </th>
                      ),
                    )}
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Total
                    </th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-900">
                      Stableford
                    </th>
                  </tr>
                </thead>

                <tbody>
                  <tr className="border-b border-slate-200">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Par
                    </td>
                    {mockScorecard.map((hole) => (
                      <td
                        key={hole.hole}
                        className="px-3 py-3 text-center font-semibold text-slate-600"
                      >
                        {hole.par}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      72
                    </td>
                    <td className="px-4 py-3 text-center font-bold text-slate-900">
                      36
                    </td>
                  </tr>

                  {mockPlayers.map((player) => (
                    <tr
                      key={player.name}
                      className="border-b border-slate-100 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {player.name}
                      </td>
                      {mockScorecard.map((hole) => {
                        const score =
                          hole.scores[player.name as keyof typeof hole.scores];
                        const par = hole.par;
                        const isGoodScore = score < par;
                        const isBadScore = score > par;

                        return (
                          <td
                            key={hole.hole}
                            className="px-3 py-3 text-center relative"
                          >
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold ${
                                isGoodScore
                                  ? "bg-green-100 text-green-800 border-2 border-green-400"
                                  : isBadScore
                                    ? "bg-red-100 text-red-800"
                                    : "text-slate-700"
                              }`}
                            >
                              {score}
                            </span>
                            {hole.hole === 2 && player.name === "Ivan" && (
                              <span className="absolute -top-1 -right-1 text-red-500 text-xs">
                                ♥
                              </span>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-center font-bold text-slate-900">
                        {courseIndex === 0
                          ? player.name === "Patrick"
                            ? "72"
                            : player.name === "Ivan"
                              ? "73"
                              : "75"
                          : "-"}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-green-600">
                        {courseIndex === 0 ? player.points : "-"}
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      Contest
                    </td>
                    {mockScorecard.map((hole, index) => (
                      <td key={hole.hole} className="px-3 py-3 text-center">
                        {index === 1 ? (
                          <span className="text-red-500">♥</span>
                        ) : (
                          "-"
                        )}
                      </td>
                    ))}
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-green-50/30">
      {/* Header Navigation */}
      {!hideNavigation && (
        <nav className="bg-white/95 backdrop-blur-sm border-b border-slate-200/50 shadow-lg sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-900">
                Tournament Leaderboard
              </div>
              <div className="hidden md:flex items-center space-x-8">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`text-sm font-medium transition-colors ${
                      item.name === "Leaderboard"
                        ? "text-green-600 font-semibold"
                        : "text-slate-600 hover:text-green-600"
                    }`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 pt-8 pb-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-4">
            Live Scoring
          </h1>
          <p className="text-xl text-green-600 font-semibold mb-2">
            & Prize Tracker
          </p>
          <p className="text-slate-600">
            Track scorecards, Stableford points, and prize money across all
            three rounds
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex bg-white/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/50 shadow-lg">
            {[
              { id: "leaderboard", label: "Stableford Board", icon: BarChart3 },
              { id: "money", label: "Money Leaders", icon: DollarSign },
              { id: "scorecards", label: "Scorecards", icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-green-600 text-white shadow-lg"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="min-h-96">
          {activeTab === "leaderboard" && renderLeaderboardTab()}
          {activeTab === "money" && renderMoneyTab()}
          {activeTab === "scorecards" && renderScorecardsTab()}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-slate-200">
          <p className="text-slate-500">
            Live tournament data powered by TrackTrack Golf
          </p>
        </div>
      </div>
    </div>
  );
}
