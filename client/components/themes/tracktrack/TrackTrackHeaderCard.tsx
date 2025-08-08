import React from "react";
import { LucideIcon } from "lucide-react";

interface TrackTrackHeaderCardProps {
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}

export const TrackTrackHeaderCard: React.FC<TrackTrackHeaderCardProps> = ({
  icon: Icon,
  children,
  className = "",
}) => {
  return (
    <div className={`inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 backdrop-blur-sm ${className}`}>
      <Icon className="h-5 w-5 text-purple-600 mr-2" />
      <span className="text-purple-700 font-medium text-sm">{children}</span>
    </div>
  );
};
