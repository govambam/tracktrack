import React from 'react';
import {
  useNewUIDesign,
  useButtonColor,
  useMaxUsersLimit,
  useWelcomeMessage
} from '@/hooks/useFeatureFlags';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, Eye, Palette } from 'lucide-react';

export const FeatureFlagDemo: React.FC = () => {
  // Example feature flags using typed hooks
  const isNewUIEnabled = useNewUIDesign();
  const buttonColor = useButtonColor();
  const maxUsers = useMaxUsersLimit();
  const welcomeMessage = useWelcomeMessage();

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          <span>GrowthBook Feature Flags Demo</span>
        </CardTitle>
        <CardDescription>
          This demonstrates how feature flags work. These flags can be controlled from the GrowthBook dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Boolean Feature Flag */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Eye className="h-5 w-5 text-blue-500" />
            <div>
              <h4 className="font-medium">New UI Design</h4>
              <p className="text-sm text-slate-600">Toggle new design elements</p>
            </div>
          </div>
          <Badge variant={isNewUIEnabled ? "default" : "secondary"}>
            {isNewUIEnabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>

        {/* String Feature Flag */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div className="flex items-center space-x-3">
            <Palette className="h-5 w-5 text-purple-500" />
            <div>
              <h4 className="font-medium">Button Color Theme</h4>
              <p className="text-sm text-slate-600">Dynamic button styling</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{buttonColor}</Badge>
            <Button 
              size="sm"
              className={
                buttonColor === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
                buttonColor === 'green' ? 'bg-green-600 hover:bg-green-700' :
                buttonColor === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
                '' // default styling
              }
            >
              Example
            </Button>
          </div>
        </div>

        {/* Number Feature Flag */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
          <div>
            <h4 className="font-medium">Max Users Limit</h4>
            <p className="text-sm text-slate-600">Dynamic configuration value</p>
          </div>
          <Badge variant="outline">{maxUsers} users</Badge>
        </div>

        {/* String Feature Flag for Content */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <h4 className="font-medium text-green-800 mb-2">Dynamic Welcome Message</h4>
          <p className="text-green-700">{welcomeMessage}</p>
        </div>

        {/* Conditional Rendering Based on Feature Flag */}
        {isNewUIEnabled && (
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">🎉 New Feature Unlocked!</h4>
            <p className="text-blue-700">
              This content only shows when the 'new-ui-design' feature flag is enabled.
            </p>
          </div>
        )}

        <div className="text-center pt-4 border-t">
          <p className="text-sm text-slate-500">
            Control these flags from your GrowthBook dashboard to see real-time changes!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
