import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUserAttributes } from "@/contexts/GrowthBookContext";
import { RefreshCw, User, Database } from "lucide-react";

export const UserAttributesDebug: React.FC = () => {
  const { attributes, updateAttributes } = useUserAttributes();

  const formatAttributeValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return value.toString();
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  };

  const getAttributeType = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "boolean") return "boolean";
    if (typeof value === "number") return "number";
    if (typeof value === "string") return "string";
    if (typeof value === "object") return "object";
    return "unknown";
  };

  const categorizeAttributes = (attrs: any) => {
    const categories = {
      user: {} as any,
      device: {} as any,
      location: {} as any,
      activity: {} as any,
      session: {} as any,
    };

    Object.entries(attrs).forEach(([key, value]) => {
      if (
        [
          "id",
          "email",
          "emailDomain",
          "name",
          "fullName",
          "handicap",
          "hasHandicap",
          "handicapRange",
          "location",
          "bio",
          "hasProfileImage",
          "isAuthenticated",
        ].includes(key)
      ) {
        categories.user[key] = value;
      } else if (
        [
          "deviceType",
          "browser",
          "os",
          "userAgent",
          "screenWidth",
          "screenHeight",
          "viewportWidth",
          "viewportHeight",
        ].includes(key)
      ) {
        categories.device[key] = value;
      } else if (["timezone", "country", "language"].includes(key)) {
        categories.location[key] = value;
      } else if (
        [
          "totalEvents",
          "hasCreatedEvents",
          "userType",
          "engagementLevel",
          "accountAgeInDays",
          "accountAgeCategory",
        ].includes(key)
      ) {
        categories.activity[key] = value;
      } else {
        categories.session[key] = value;
      }
    });

    return categories;
  };

  const categories = categorizeAttributes(attributes);

  const renderAttributeSection = (
    title: string,
    icon: React.ReactNode,
    attrs: any,
  ) => {
    if (Object.keys(attrs).length === 0) return null;

    return (
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          {icon}
          <h4 className="font-medium text-slate-900">{title}</h4>
        </div>
        <div className="space-y-2">
          {Object.entries(attrs).map(([key, value]) => (
            <div
              key={key}
              className="flex items-center justify-between p-2 bg-slate-50 rounded"
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm font-mono text-slate-700">{key}</span>
                <Badge variant="outline" className="text-xs">
                  {getAttributeType(value)}
                </Badge>
              </div>
              <span className="text-sm text-slate-600 max-w-48 truncate">
                {formatAttributeValue(value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-blue-200">
      <CardHeader>
        <CardTitle className="text-xl text-blue-900 flex items-center">
          <Database className="h-5 w-5 mr-2 text-blue-600" />
          GrowthBook User Attributes
        </CardTitle>
        <CardDescription className="text-blue-600">
          Current user attributes available for feature flag targeting. Total:{" "}
          {Object.keys(attributes).length} attributes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <Button onClick={updateAttributes} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Attributes
          </Button>
          <Badge variant="secondary">
            Last Updated: {new Date().toLocaleTimeString()}
          </Badge>
        </div>

        {renderAttributeSection(
          "User Profile",
          <User className="h-4 w-4 text-green-600" />,
          categories.user,
        )}

        {renderAttributeSection(
          "Device & Browser",
          <RefreshCw className="h-4 w-4 text-blue-600" />,
          categories.device,
        )}

        {renderAttributeSection(
          "Location & Language",
          <Database className="h-4 w-4 text-purple-600" />,
          categories.location,
        )}

        {renderAttributeSection(
          "Activity & Engagement",
          <Database className="h-4 w-4 text-orange-600" />,
          categories.activity,
        )}

        {renderAttributeSection(
          "Session & Context",
          <Database className="h-4 w-4 text-gray-600" />,
          categories.session,
        )}

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Targeting Examples</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <div>
              • Target mobile users: <code>deviceType = "mobile"</code>
            </div>
            <div>
              • Target power users: <code>userType = "power_user"</code>
            </div>
            <div>
              • Target new accounts: <code>accountAgeCategory = "new"</code>
            </div>
            <div>
              • Target by handicap: <code>handicapRange = "low"</code>
            </div>
            <div>
              • Target by time: <code>hourOfDay &gt; 18</code> (evening users)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
