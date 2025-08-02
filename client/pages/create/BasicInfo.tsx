import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TripCreationStepper } from "@/components/TripCreationStepper";
import { useTripCreation } from "@/contexts/TripCreationContext";
import { Calendar, MapPin, FileText, Image } from "lucide-react";

export default function BasicInfo() {
  const navigate = useNavigate();
  const { state, updateBasicInfo } = useTripCreation();
  const { tripData } = state;

  const [formData, setFormData] = useState({
    tripName: tripData.tripName || '',
    startDate: tripData.startDate || '',
    endDate: tripData.endDate || '',
    location: tripData.location || '',
    description: tripData.description || '',
    bannerImage: tripData.bannerImage || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.tripName.trim()) {
      newErrors.tripName = 'Trip name is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      updateBasicInfo(formData);
      navigate('/app/create/courses');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <TripCreationStepper
        onNext={handleNext}
        nextDisabled={false}
      />

      <Card className="border-green-100">
        <CardHeader>
          <CardTitle className="text-xl text-green-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-emerald-600" />
            Event Details
          </CardTitle>
          <CardDescription className="text-green-600">
            Enter the basic information for your golf event
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Trip Name */}
          <div className="space-y-2">
            <Label htmlFor="tripName" className="text-green-800 font-medium">
              Event Name *
            </Label>
            <Input
              id="tripName"
              value={formData.tripName}
              onChange={(e) => handleInputChange('tripName', e.target.value)}
              placeholder="e.g., Pebble Beach Golf Weekend"
              className={`border-green-200 focus:border-emerald-500 ${errors.tripName ? 'border-red-300' : ''}`}
            />
            {errors.tripName && (
              <p className="text-sm text-red-600">{errors.tripName}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-green-800 font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-emerald-600" />
                Start Date *
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className={`border-green-200 focus:border-emerald-500 ${errors.startDate ? 'border-red-300' : ''}`}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600">{errors.startDate}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-green-800 font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-emerald-600" />
                End Date *
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className={`border-green-200 focus:border-emerald-500 ${errors.endDate ? 'border-red-300' : ''}`}
              />
              {errors.endDate && (
                <p className="text-sm text-red-600">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="text-green-800 font-medium flex items-center">
              <MapPin className="h-4 w-4 mr-1 text-emerald-600" />
              Location (City, State) *
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Pebble Beach, CA"
              className={`border-green-200 focus:border-emerald-500 ${errors.location ? 'border-red-300' : ''}`}
            />
            {errors.location && (
              <p className="text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Description (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-green-800 font-medium">
              Event Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your golf event, what makes it special, activities planned..."
              rows={4}
              className="border-green-200 focus:border-emerald-500"
            />
            <p className="text-sm text-green-600">
              Help participants know what to expect at this event
            </p>
          </div>

          {/* Banner Image (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="bannerImage" className="text-green-800 font-medium flex items-center">
              <Image className="h-4 w-4 mr-1 text-emerald-600" />
              Banner Image URL (Optional)
            </Label>
            <Input
              id="bannerImage"
              type="url"
              value={formData.bannerImage}
              onChange={(e) => handleInputChange('bannerImage', e.target.value)}
              placeholder="https://example.com/your-banner-image.jpg"
              className="border-green-200 focus:border-emerald-500"
            />
            <p className="text-sm text-green-600">
              Add a banner image to make your trip page more appealing
            </p>
          </div>

          {/* Required Fields Notice */}
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-700">
              Fields marked with * are required. You can always edit these details later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Preview Card */}
      {(formData.tripName || formData.location) && (
        <Card className="border-green-100 bg-green-50">
          <CardHeader>
            <CardTitle className="text-lg text-green-900">Preview</CardTitle>
            <CardDescription className="text-green-600">
              How your trip will appear on the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-start space-x-4">
              <div className="text-3xl">🏌️‍♂️</div>
              <div>
                <h3 className="font-semibold text-green-900">
                  {formData.tripName || 'Your Trip Name'}
                </h3>
                <p className="text-green-600 text-sm">
                  {formData.location || 'Location'} 
                  {formData.startDate && formData.endDate && (
                    <> • {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}</>
                  )}
                </p>
                {formData.description && (
                  <p className="text-green-700 text-sm mt-1 line-clamp-2">
                    {formData.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
