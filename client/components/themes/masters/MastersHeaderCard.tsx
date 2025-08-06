import React from "react";
import { LucideIcon } from "lucide-react";

interface MastersHeaderCardProps {
  icon: LucideIcon;
  children: string;
}

export const MastersHeaderCard: React.FC<MastersHeaderCardProps> = ({
  icon: Icon,
  children,
}) => {
  return (
    <div className="inline-flex items-center space-x-2 bg-white border border-green-800/20 text-green-800 rounded-lg px-6 py-3 shadow-sm mb-4">
      <Icon className="h-4 w-4 text-yellow-600" />
      <span className="text-sm font-medium text-green-800 font-serif tracking-wide">
        {children}
      </span>
    </div>
  );
};
