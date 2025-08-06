import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { growthbookApi, featureFlagUtils, FeatureFlag, CreateFeatureFlagRequest } from '@/lib/growthbookApi';
import {
  Settings,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Eye,
  EyeOff,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

export const FeatureFlagAdmin: React.FC = () => {
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newFlag, setNewFlag] = useState<CreateFeatureFlagRequest>({
    key: '',
    description: '',
    valueType: 'boolean',
    defaultValue: false,
  });

  const loadFlags = async () => {
    setLoading(true);
    setError(null);
    try {
      const flagsData = await growthbookApi.getFeatures();
      // Ensure flagsData is an array
      const validFlags = Array.isArray(flagsData) ? flagsData : [];
      setFlags(validFlags);
      toast({
        title: "Success",
        description: `Loaded ${validFlags.length} feature flags`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load flags';
      setError(errorMessage);
      // Ensure flags is still an array even on error
      setFlags([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDemoFlags = async () => {
    setLoading(true);
    try {
      const createdFlags = await featureFlagUtils.setupDemoFlags();
      const validCreatedFlags = Array.isArray(createdFlags) ? createdFlags : [];
      toast({
        title: "Demo Flags Created",
        description: `Created ${validCreatedFlags.length} demo feature flags`,
      });
      await loadFlags();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create demo flags';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createFlag = async () => {
    if (!newFlag.key || !newFlag.description) {
      toast({
        title: "Validation Error",
        description: "Key and description are required",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await growthbookApi.createFeature(newFlag);
      setFlags(prev => [...prev, created]);
      setNewFlag({
        key: '',
        description: '',
        valueType: 'boolean',
        defaultValue: false,
      });
      setShowCreateForm(false);
      toast({
        title: "Success",
        description: `Created feature flag: ${created.key}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create feature flag",
        variant: "destructive",
      });
    }
  };

  const toggleFlag = async (flag: FeatureFlag, environment: string = 'production') => {
    try {
      const currentEnabled = flag.environments[environment]?.enabled || false;
      await featureFlagUtils.enable(flag.id, environment);
      
      // Update local state
      setFlags(prev => prev.map(f => 
        f.id === flag.id 
          ? {
              ...f,
              environments: {
                ...f.environments,
                [environment]: {
                  ...f.environments[environment],
                  enabled: !currentEnabled,
                },
              },
            }
          : f
      ));

      toast({
        title: "Success",
        description: `${flag.key} ${!currentEnabled ? 'enabled' : 'disabled'}`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to toggle feature flag",
        variant: "destructive",
      });
    }
  };

  const updateFlagValue = async (flag: FeatureFlag, newValue: any) => {
    try {
      await growthbookApi.setFeatureValue(flag.id, newValue);
      
      // Update local state
      setFlags(prev => prev.map(f => 
        f.id === flag.id ? { ...f, defaultValue: newValue } : f
      ));

      toast({
        title: "Success",
        description: `Updated ${flag.key} value`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update flag value",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadFlags();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Feature Flag Administration</span>
          </CardTitle>
          <CardDescription>
            Manage feature flags directly from your application. Changes take effect immediately.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-6">
            <Button onClick={loadFlags} disabled={loading} variant="outline">
              <RotateCcw className="h-4 w-4 mr-2" />
              Refresh Flags
            </Button>
            <Button onClick={createDemoFlags} disabled={loading}>
              <Zap className="h-4 w-4 mr-2" />
              Create Demo Flags
            </Button>
            <Button 
              onClick={() => setShowCreateForm(!showCreateForm)} 
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Flag
            </Button>
          </div>

          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md mb-4">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-red-700">{error}</span>
            </div>
          )}

          {showCreateForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Create New Feature Flag</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="flag-key">Flag Key</Label>
                  <Input
                    id="flag-key"
                    value={newFlag.key}
                    onChange={(e) => setNewFlag(prev => ({ ...prev, key: e.target.value }))}
                    placeholder="my-new-feature"
                  />
                </div>
                <div>
                  <Label htmlFor="flag-description">Description</Label>
                  <Textarea
                    id="flag-description"
                    value={newFlag.description}
                    onChange={(e) => setNewFlag(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this flag controls..."
                  />
                </div>
                <div>
                  <Label htmlFor="flag-type">Value Type</Label>
                  <Select 
                    value={newFlag.valueType} 
                    onValueChange={(value: 'boolean' | 'string' | 'number') => 
                      setNewFlag(prev => ({ 
                        ...prev, 
                        valueType: value,
                        defaultValue: value === 'boolean' ? false : value === 'number' ? 0 : ''
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Boolean</SelectItem>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-3">
                  <Button onClick={createFlag}>
                    <Save className="h-4 w-4 mr-2" />
                    Create Flag
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Loading flags...</span>
            </div>
          )}

          <div className="space-y-4">
            {Array.isArray(flags) && flags.map((flag) => {
              const isEnabled = flag.environments.production?.enabled || false;
              
              return (
                <Card key={flag.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{flag.key}</h4>
                          <Badge variant={isEnabled ? "default" : "secondary"}>
                            {isEnabled ? "Enabled" : "Disabled"}
                          </Badge>
                          <Badge variant="outline">
                            {flag.valueType}
                          </Badge>
                        </div>
                        <p className="text-slate-600 mb-3">{flag.description}</p>
                        
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={() => toggleFlag(flag)}
                            />
                            <Label className="text-sm">
                              {isEnabled ? "Enabled" : "Disabled"}
                            </Label>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Label className="text-sm">Current Value:</Label>
                            <Badge variant="outline">
                              {String(flag.defaultValue)}
                            </Badge>
                          </div>
                        </div>

                        {flag.valueType === 'string' && (
                          <div className="mt-3 flex items-center space-x-2">
                            <Input
                              className="max-w-xs"
                              defaultValue={flag.defaultValue}
                              onBlur={(e) => updateFlagValue(flag, e.target.value)}
                              placeholder="Enter string value"
                            />
                          </div>
                        )}

                        {flag.valueType === 'number' && (
                          <div className="mt-3 flex items-center space-x-2">
                            <Input
                              type="number"
                              className="max-w-xs"
                              defaultValue={flag.defaultValue}
                              onBlur={(e) => updateFlagValue(flag, Number(e.target.value))}
                              placeholder="Enter number value"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {flags.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No feature flags found</h3>
              <p className="text-slate-600 mb-4">Create your first feature flag to get started</p>
              <Button onClick={createDemoFlags}>
                <Zap className="h-4 w-4 mr-2" />
                Create Demo Flags
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
