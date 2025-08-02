import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Palette, Lock, Globe, Upload, Eye, EyeOff } from "lucide-react";

export default function Customization() {
  const navigate = useNavigate();
  const { state, updateCustomization } = useTripCreation();
  const { tripData } = state;

  const [customization, setCustomization] = useState({
    isPrivate: tripData.customization?.isPrivate ?? false,
    logoUrl: tripData.customization?.logoUrl || '',
    customDomain: tripData.customization?.customDomain || ''
  });

  const handleNext = () => {
    updateCustomization({ customization });
    navigate('/app/create/summary');
  };

  const handlePrevious = () => {
    updateCustomization({ customization });
    navigate('/app/create/travel');
  };

  const updateCustomizationField = (field: keyof typeof customization, value: boolean | string) => {
    setCustomization(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleNext}
        onPrevious={handlePrevious}
        nextDisabled={false}
      />

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center">
            <Palette className="h-5 w-5 mr-2 text-emerald-600" />
            Customization & Branding
          </CardTitle>
          <CardDescription className="text-green-600">
            Personalize your trip website with custom branding and privacy settings
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Privacy Settings */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Lock className="h-5 w-5 mr-2 text-emerald-600" />
                Privacy Settings
              </CardTitle>
              <CardDescription className="text-green-600">
                Control who can view your trip website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  {customization.isPrivate ? (
                    <EyeOff className="h-5 w-5 text-orange-600 mt-0.5" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-600 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-medium text-green-900">
                      {customization.isPrivate ? 'Private Trip' : 'Public Trip'}
                    </h3>
                    <p className="text-sm text-green-600 mt-1">
                      {customization.isPrivate 
                        ? 'Only invited participants can view trip details'
                        : 'Anyone with the link can view trip information'
                      }
                    </p>
                    <div className="mt-2">
                      <Badge variant={customization.isPrivate ? "secondary" : "outline"}>
                        {customization.isPrivate ? 'Invitation Only' : 'Public Access'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Switch
                  checked={customization.isPrivate}
                  onCheckedChange={(checked) => updateCustomizationField('isPrivate', checked)}
                />
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-700">
                  <strong>Recommendation:</strong> Most golf trips work well as private. 
                  You can always change this setting later and send invite links to participants.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Logo Upload */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Upload className="h-5 w-5 mr-2 text-emerald-600" />
                Trip Logo
              </CardTitle>
              <CardDescription className="text-green-600">
                Add a custom logo to personalize your trip website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-800 font-medium">
                  Logo Image URL
                </Label>
                <Input
                  type="url"
                  value={customization.logoUrl}
                  onChange={(e) => updateCustomizationField('logoUrl', e.target.value)}
                  placeholder="https://example.com/your-logo.png"
                  className="border-green-200 focus:border-emerald-500 bg-white"
                />
                <p className="text-sm text-green-600">
                  Upload your logo to a service like Imgur, Dropbox, or your website and paste the URL here
                </p>
              </div>

              {customization.logoUrl && (
                <div className="space-y-2">
                  <Label className="text-green-800 font-medium">Logo Preview</Label>
                  <div className="p-4 bg-white rounded-lg border border-green-200">
                    <img 
                      src={customization.logoUrl} 
                      alt="Trip logo preview" 
                      className="max-h-20 max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                </div>
              )}

              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  <strong>Logo tips:</strong> Use a PNG or JPG file. Square logos work best. 
                  Keep file size under 1MB for fast loading.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Custom Domain */}
          <Card className="border-green-100 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <Globe className="h-5 w-5 mr-2 text-emerald-600" />
                Custom URL
              </CardTitle>
              <CardDescription className="text-green-600">
                Create a memorable web address for your trip
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-green-800 font-medium">
                  Custom URL Ending
                </Label>
                <div className="flex items-center space-x-2">
                  <span className="text-green-600 text-sm">golftrips.app/</span>
                  <Input
                    value={customization.customDomain}
                    onChange={(e) => updateCustomizationField('customDomain', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="pebble-beach-2024"
                    className="border-green-200 focus:border-emerald-500 bg-white flex-1"
                  />
                </div>
                <p className="text-sm text-green-600">
                  Only letters, numbers, and hyphens allowed. Must be unique.
                </p>
              </div>

              {customization.customDomain && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-700">
                    Your trip will be available at: <Badge variant="secondary">
                      golftrips.app/{customization.customDomain}
                    </Badge>
                  </AlertDescription>
                </Alert>
              )}

              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertDescription className="text-yellow-700">
                  <strong>Coming soon:</strong> Custom domains are not yet active but your preference will be saved.
                  For now, trips will use auto-generated URLs.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Customization Summary */}
          <Alert className="border-emerald-200 bg-emerald-50">
            <AlertDescription className="text-emerald-700">
              <div className="space-y-1">
                <div className="font-semibold">Your Customization Settings:</div>
                <div>Privacy: <Badge variant="secondary">{customization.isPrivate ? 'Private' : 'Public'}</Badge></div>
                {customization.logoUrl && <div>Custom logo: <Badge variant="secondary">✓ Added</Badge></div>}
                {customization.customDomain && <div>Custom URL: <Badge variant="secondary">/{customization.customDomain}</Badge></div>}
              </div>
            </AlertDescription>
          </Alert>

          {/* Helper Text */}
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-700">
              <strong>All optional:</strong> These settings help make your trip feel more professional and branded, 
              but aren't required for a great golf trip experience.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
