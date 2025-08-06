import React from "react";
import { LucideIcon } from "lucide-react";

interface TourTechHeaderCardProps {
  icon: LucideIcon;
  children: string;
}

export const TourTechHeaderCard: React.FC<TourTechHeaderCardProps> = ({
  icon: Icon,
  children,
}) => {
  return (
    <div className="inline-flex items-center space-x-2 bg-white border border-slate-300 rounded-md px-3 py-1.5 shadow-sm mb-4">
      <Icon className="h-4 w-4 text-orange-600" />
      <span className="font-mono text-xs uppercase tracking-wide text-slate-500">
        {children}
      </span>
    </div>
  );
};
