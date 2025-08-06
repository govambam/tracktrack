import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { growthbookApi } from '@/lib/growthbookApi';
import { useFeatureFlag, useFeatureEnabled } from '@/contexts/GrowthBookContext';

export const DebugFeatureFlags: React.FC = () => {
  const [apiStatus, setApiStatus] = useState<string>('Not tested');
  const [apiResponse, setApiResponse] = useState<any>(null);

  // Test feature flags from context
  const newUIEnabled = useFeatureEnabled('new-ui-design');
  const buttonColor = useFeatureFlag('button-color', 'default');

  const testAPI = async () => {
    setApiStatus('Testing...');
    try {
      const flags = await growthbookApi.getFeatures();
      setApiResponse(flags);
      setApiStatus(`Success: Found ${Array.isArray(flags) ? flags.length : 'invalid'} flags`);
    } catch (error) {
      setApiStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setApiResponse(null);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🐛 Feature Flag Debug Console</CardTitle>
        <CardDescription>
          Quick debugging for GrowthBook integration issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Context Test */}
        <div>
          <h4 className="font-medium mb-3">Feature Flag Context Test</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <div className="text-sm text-slate-600">new-ui-design</div>
              <Badge variant={newUIEnabled ? "default" : "secondary"}>
                {newUIEnabled ? "Enabled" : "Disabled"}
              </Badge>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <div className="text-sm text-slate-600">button-color</div>
              <Badge variant="outline">{buttonColor}</Badge>
            </div>
          </div>
        </div>

        {/* API Test */}
        <div>
          <h4 className="font-medium mb-3">API Connection Test</h4>
          <div className="space-y-3">
            <Button onClick={testAPI} variant="outline">
              Test GrowthBook API
            </Button>
            <div className="p-3 bg-slate-50 rounded">
              <div className="text-sm text-slate-600 mb-1">API Status:</div>
              <div className="font-mono text-sm">{apiStatus}</div>
            </div>
            {apiResponse && (
              <div className="p-3 bg-slate-50 rounded">
                <div className="text-sm text-slate-600 mb-1">Response Type:</div>
                <div className="font-mono text-sm">
                  {Array.isArray(apiResponse) ? `Array[${apiResponse.length}]` : typeof apiResponse}
                </div>
                <details className="mt-2">
                  <summary className="text-sm cursor-pointer">Raw Response</summary>
                  <pre className="text-xs mt-2 p-2 bg-white rounded border overflow-auto max-h-32">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>

        {/* Environment Info */}
        <div>
          <h4 className="font-medium mb-3">Environment Info</h4>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Client Key:</span>
              <code className="text-xs">{import.meta.env.VITE_GROWTHBOOK_CLIENT_KEY?.slice(0, 10)}...</code>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>API Host:</span>
              <code className="text-xs">{import.meta.env.VITE_GROWTHBOOK_API_HOST}</code>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded">
              <span>Dev Mode:</span>
              <code className="text-xs">{String(import.meta.env.DEV)}</code>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
