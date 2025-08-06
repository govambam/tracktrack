import React from 'react';
import { FeatureFlagAdmin } from '@/components/FeatureFlagAdmin';
import { FeatureFlagDemo } from '@/components/FeatureFlagDemo';
import { DebugFeatureFlags } from '@/components/DebugFeatureFlags';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Eye } from 'lucide-react';

export default function Admin() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              GrowthBook Administration
            </h1>
          </div>
          <p className="text-lg text-slate-600">
            Manage feature flags, run experiments, and control feature rollouts in real-time.
          </p>
        </div>

        {/* Debug Section - Remove in production */}
        <div className="mb-8">
          <DebugFeatureFlags />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Admin Panel */}
          <div className="space-y-6">
            <FeatureFlagAdmin />
          </div>

          {/* Live Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <span>Live Preview</span>
                </CardTitle>
                <CardDescription>
                  See how your feature flag changes affect the user interface in real-time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FeatureFlagDemo />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  <span>Quick Actions</span>
                </CardTitle>
                <CardDescription>
                  Common feature flag management tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-2">Test Environment</h4>
                    <p className="text-sm text-blue-700">
                      Feature flags are currently configured for the production environment. 
                      Changes here will affect live users immediately.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-medium text-green-900 mb-2">Best Practices</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• Test flags in development before enabling in production</li>
                      <li>• Use descriptive flag names and descriptions</li>
                      <li>• Clean up unused flags regularly</li>
                      <li>• Monitor flag performance impact</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <h4 className="font-medium text-amber-900 mb-2">Security Note</h4>
                    <p className="text-sm text-amber-700">
                      This admin interface uses your secret API key. In production, 
                      ensure this page is properly secured and only accessible to authorized users.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
