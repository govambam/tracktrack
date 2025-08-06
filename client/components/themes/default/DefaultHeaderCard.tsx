import React from "react";
import { LucideIcon } from "lucide-react";

interface DefaultHeaderCardProps {
  icon: LucideIcon;
  children: string;
  color?: "green" | "blue" | "amber" | "purple" | "indigo";
}

export const DefaultHeaderCard: React.FC<DefaultHeaderCardProps> = ({
  icon: Icon,
  children,
  color = "green",
}) => {
  const colorClasses = {
    green:
      "bg-green-100/80 backdrop-blur-sm rounded-full px-4 py-2 text-green-800",
    blue: "bg-blue-100/80 backdrop-blur-sm rounded-full px-4 py-2 text-blue-800",
    amber:
      "bg-amber-100/80 backdrop-blur-sm rounded-full px-4 py-2 text-amber-800",
    purple:
      "bg-purple-100/80 backdrop-blur-sm rounded-full px-4 py-2 text-purple-800",
    indigo:
      "bg-indigo-100/80 backdrop-blur-sm rounded-full px-4 py-2 text-indigo-800",
  };

  const iconColorClasses = {
    green: "text-green-600",
    blue: "text-blue-600",
    amber: "text-amber-600",
    purple: "text-purple-600",
    indigo: "text-indigo-600",
  };

  return (
    <div
      className={`inline-flex items-center space-x-2 ${colorClasses[color]} mb-4`}
    >
      <Icon className={`h-4 w-4 ${iconColorClasses[color]}`} />
      <span className="text-sm font-medium">{children}</span>
    </div>
  );
};
