import React, { useState, useEffect } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  targetDate: string;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
}) => {
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
    <div className="inline-flex items-center space-x-4 bg-white/90 backdrop-blur-sm border border-green-200/50 rounded-2xl px-6 py-4 shadow-lg">
      <Clock className="h-5 w-5 text-green-600" />
      <div className="flex items-center space-x-3 text-sm font-medium text-slate-700">
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.days}
          </div>
          <div className="text-xs">days</div>
        </div>
        <div className="text-green-400">:</div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.hours}
          </div>
          <div className="text-xs">hours</div>
        </div>
        <div className="text-green-400">:</div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.minutes}
          </div>
          <div className="text-xs">mins</div>
        </div>
        <div className="text-green-400">:</div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {timeLeft.seconds}
          </div>
          <div className="text-xs">secs</div>
        </div>
      </div>
    </div>
  );
};
