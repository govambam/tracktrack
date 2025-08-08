import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface TrackTrackCountdownTimerProps {
  targetDate: string;
}

export const TrackTrackCountdownTimer: React.FC<
  TrackTrackCountdownTimerProps
> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return null;
  }

  return (
    <div className="inline-flex items-center space-x-6 bg-white/90 backdrop-blur-sm border border-purple-200/50 rounded-3xl px-8 py-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
        <Clock className="h-6 w-6 text-white" />
      </div>

      <div className="flex items-center space-x-4 text-sm font-medium">
        <div className="text-center">
          <div className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {timeLeft.days}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            days
          </div>
        </div>
        <div className="text-purple-300 text-xl">:</div>
        <div className="text-center">
          <div className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {timeLeft.hours}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            hours
          </div>
        </div>
        <div className="text-purple-300 text-xl">:</div>
        <div className="text-center">
          <div className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {timeLeft.minutes}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            mins
          </div>
        </div>
        <div className="text-purple-300 text-xl">:</div>
        <div className="text-center">
          <div className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {timeLeft.seconds}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">
            secs
          </div>
        </div>
      </div>
    </div>
  );
};
