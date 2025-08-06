import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  PartyPopper,
  ArrowLeft,
  Loader2,
  CheckCircle,
  Wand2
} from 'lucide-react';

interface Course {
  id: string;
  name: string;
  location?: string;
  par?: number;
}

interface AIQuickstartFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (eventSlug: string) => void;
}

interface QuickstartData {
  courses: string[];
  startDate: string;
  endDate: string;
  players: string[];
  occasion: string;
}

const OCCASIONS = [
  'Birthday',
  'Bachelor Party',
  'Annual Trip',
  'Guys Trip',
  'Family Reunion',
  'Work Trip',
  'Charity Event',
  'Tournament',
  'Celebration',
  'Weekend Getaway',
  'Other'
];

export const AIQuickstartForm: React.FC<AIQuickstartFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState<'form' | 'generating' | 'complete'>('form');
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [newPlayerInput, setNewPlayerInput] = useState('');
  const [formData, setFormData] = useState<QuickstartData>({
    courses: [],
    startDate: '',
    endDate: '',
    players: [],
    occasion: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadCourses();
    }
  }, [isOpen]);

  const loadCourses = async () => {
    setLoadingCourses(true);
    try {
      const { data: coursesData, error } = await supabase
        .from('courses')
        .select('id, name, location, par')
        .order('name');

      if (error) throw error;
      setCourses(coursesData || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setLoadingCourses(false);
    }
  };

  const addPlayer = () => {
    if (newPlayerInput.trim() && !formData.players.includes(newPlayerInput.trim())) {
      setFormData(prev => ({
        ...prev,
        players: [...prev.players, newPlayerInput.trim()]
      }));
      setNewPlayerInput('');
    }
  };

  const removePlayer = (player: string) => {
    setFormData(prev => ({
      ...prev,
      players: prev.players.filter(p => p !== player)
    }));
  };

  const toggleCourse = (courseId: string) => {
    setFormData(prev => ({
      ...prev,
      courses: prev.courses.includes(courseId)
        ? prev.courses.filter(id => id !== courseId)
        : [...prev.courses, courseId]
    }));
  };

  const canSubmit = () => {
    return (
      formData.courses.length > 0 &&
      formData.startDate &&
      formData.endDate &&
      formData.players.length > 0 &&
      formData.occasion
    );
  };

  const generateEventName = (occasion: string, courses: Course[]) => {
    const courseNames = courses.map(c => c.name);
    const mainCourse = courseNames[0];
    
    const templates = {
      'Birthday': [`Birthday Golf Getaway`, `${occasion} Golf Celebration`],
      'Bachelor Party': [`Bachelor Golf Weekend`, `Last Swing Before the Ring`],
      'Annual Trip': [`Annual Golf Adventure`, `${new Date().getFullYear()} Golf Trip`],
      'Guys Trip': [`Guys Golf Weekend`, `The Boys Golf Getaway`],
      'Family Reunion': [`Family Golf Reunion`, `Family Links & Laughs`],
      'Work Trip': [`Company Golf Outing`, `Team Golf Retreat`],
      'Tournament': [`Golf Tournament`, `${mainCourse} Tournament`],
      'default': [`Golf Adventure`, `Weekend Golf Trip`]
    };

    const names = templates[occasion as keyof typeof templates] || templates.default;
    return names[Math.floor(Math.random() * names.length)];
  };

  const generateEventDescription = (occasion: string, courses: Course[], dates: { start: string, end: string }) => {
    const coursesText = courses.length === 1 
      ? courses[0].name 
      : `${courses.length} amazing courses`;
    
    const startDate = new Date(dates.start).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    const endDate = new Date(dates.end).toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
    
    return `Join us for an unforgettable ${occasion.toLowerCase()} golf experience from ${startDate} to ${endDate}. We'll be playing ${coursesText} and creating memories that will last a lifetime.`;
  };

  const generateAIContent = async () => {
    setCurrentStep('generating');
    
    try {
      // Simulate AI generation delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get selected courses data
      const selectedCourses = courses.filter(c => formData.courses.includes(c.id));
      
      // Generate event data
      const eventName = generateEventName(formData.occasion, selectedCourses);
      const eventDescription = generateEventDescription(formData.occasion, selectedCourses, {
        start: formData.startDate,
        end: formData.endDate
      });

      // Create event in database
      const { data: eventData, error: eventError } = await supabase
        .from('events')
        .insert({
          name: eventName,
          description: eventDescription,
          start_date: formData.startDate,
          end_date: formData.endDate,
          location: selectedCourses[0]?.location || 'TBD',
          is_published: true,
          is_private: false,
          theme: 'GolfOS',
          slug: eventName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36)
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Add courses to event
      if (selectedCourses.length > 0) {
        const eventCourses = selectedCourses.map((course, index) => ({
          event_id: eventData.id,
          course_id: course.id,
          display_order: index + 1
        }));

        const { error: coursesError } = await supabase
          .from('event_courses')
          .insert(eventCourses);

        if (coursesError) throw coursesError;
      }

      // Add players to event
      if (formData.players.length > 0) {
        const eventPlayers = formData.players.map(playerName => ({
          event_id: eventData.id,
          full_name: playerName,
          email: `${playerName.toLowerCase().replace(/\s+/g, '.')}@example.com` // Placeholder email
        }));

        const { error: playersError } = await supabase
          .from('event_players')
          .insert(eventPlayers);

        if (playersError) throw playersError;
      }

      // Add default travel information
      const { error: travelError } = await supabase
        .from('event_travel')
        .insert({
          event_id: eventData.id,
          flight_info: `# Getting There\n\nYour golf adventure awaits! We recommend arriving at least one day before the first round to settle in and get excited for the golf ahead.\n\n## Transportation Options\n- **Fly:** Check nearby airports for the best deals\n- **Drive:** Perfect for bringing extra gear and snacks\n- **Charter:** Split the cost with the group for a fun ride`,
          accommodations: `# Where to Stay\n\nWe've scouted some great accommodation options for your ${formData.occasion.toLowerCase()}:\n\n## Recommended Hotels\n- Local golf resorts with course access\n- Hotels with group rates and amenities\n- Vacation rentals for larger groups\n\n*Specific recommendations will be shared based on your group size and preferences.*`,
          daily_schedule: `# Daily Itinerary\n\n## Day-by-Day Schedule\n\n${selectedCourses.map((course, index) => `**Day ${index + 1}:** ${course.name}\n- Morning: Arrival and check-in\n- Golf: 18 holes of championship golf\n- Evening: Group dinner and stories`).join('\n\n')}\n\n*Schedule subject to weather and group preferences. Flexibility is key to a great golf trip!*`
        });

      if (travelError) throw travelError;

      setCurrentStep('complete');
      
      toast({
        title: 'Success!',
        description: 'Your golf event has been created with AI magic!',
      });

      // Redirect after a brief delay
      setTimeout(() => {
        onSuccess(eventData.slug);
      }, 1500);

    } catch (error) {
      console.error('Error generating event:', error);
      toast({
        title: 'Error',
        description: 'Failed to create event. Please try again.',
        variant: 'destructive',
      });
      setCurrentStep('form');
    }
  };

  const renderFormStep = () => (
    <div className="space-y-6">
      {/* Courses Selection */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-3">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <span>Courses to Play</span>
        </Label>
        <div className="space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {loadingCourses ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Loading courses...</span>
            </div>
          ) : (
            courses.map((course) => (
              <div key={course.id} className="flex items-center space-x-2">
                <Checkbox
                  id={course.id}
                  checked={formData.courses.includes(course.id)}
                  onCheckedChange={() => toggleCourse(course.id)}
                />
                <Label htmlFor={course.id} className="flex-1 cursor-pointer">
                  <div>
                    <div className="font-medium">{course.name}</div>
                    {course.location && (
                      <div className="text-sm text-slate-500">{course.location}</div>
                    )}
                  </div>
                </Label>
                {course.par && (
                  <Badge variant="outline">Par {course.par}</Badge>
                )}
              </div>
            ))
          )}
        </div>
        {formData.courses.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-slate-600">
              Selected {formData.courses.length} course{formData.courses.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-base font-medium flex items-center space-x-2 mb-2">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Start Date</span>
          </Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
          />
        </div>
        <div>
          <Label className="text-base font-medium mb-2">End Date</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
            min={formData.startDate}
          />
        </div>
      </div>

      {/* Players */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-3">
          <Users className="h-4 w-4 text-emerald-600" />
          <span>Players</span>
        </Label>
        <div className="space-y-3">
          <div className="flex space-x-2">
            <Input
              placeholder="Enter player name..."
              value={newPlayerInput}
              onChange={(e) => setNewPlayerInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
            />
            <Button onClick={addPlayer} disabled={!newPlayerInput.trim()}>
              Add
            </Button>
          </div>
          {formData.players.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.players.map((player) => (
                <Badge key={player} variant="secondary" className="px-3 py-1">
                  {player}
                  <button
                    onClick={() => removePlayer(player)}
                    className="ml-2 text-slate-500 hover:text-slate-700"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Occasion */}
      <div>
        <Label className="text-base font-medium flex items-center space-x-2 mb-2">
          <PartyPopper className="h-4 w-4 text-emerald-600" />
          <span>Occasion</span>
        </Label>
        <Select value={formData.occasion} onValueChange={(value) => setFormData(prev => ({ ...prev, occasion: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="What's the occasion?" />
          </SelectTrigger>
          <SelectContent>
            {OCCASIONS.map((occasion) => (
              <SelectItem key={occasion} value={occasion}>
                {occasion}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-3 pt-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button 
          className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
          onClick={generateAIContent}
          disabled={!canSubmit()}
        >
          <Wand2 className="h-4 w-4 mr-2" />
          Generate with AI
        </Button>
      </div>
    </div>
  );

  const renderGeneratingStep = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mb-6">
        <Loader2 className="h-8 w-8 text-white animate-spin" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        Building your event site with AI magic...
      </h3>
      <p className="text-slate-600 max-w-md mx-auto">
        We're creating your event details, generating an itinerary, and setting up your personalized golf event site.
      </p>
      <div className="mt-6 space-y-2 text-sm text-slate-500">
        <div className="flex items-center justify-center space-x-2">
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span>Generating event name and description</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Creating itinerary and travel details</span>
        </div>
        <div className="flex items-center justify-center space-x-2">
          <div className="h-4 w-4 border-2 border-slate-300 rounded-full"></div>
          <span>Setting up your event site</span>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center py-12">
      <div className="mx-auto w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
        <CheckCircle className="h-8 w-8 text-white" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        Your golf event is ready! 🎉
      </h3>
      <p className="text-slate-600 max-w-md mx-auto">
        AI has generated all the details for your event. You'll be redirected to your new event site in just a moment.
      </p>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <span>
              {currentStep === 'form' && 'Quick Start with AI'}
              {currentStep === 'generating' && 'Creating Your Event'}
              {currentStep === 'complete' && 'Event Created!'}
            </span>
          </DialogTitle>
          {currentStep === 'form' && (
            <DialogDescription>
              Tell us a few details about your golf event and we'll generate everything else with AI.
            </DialogDescription>
          )}
        </DialogHeader>

        {currentStep === 'form' && renderFormStep()}
        {currentStep === 'generating' && renderGeneratingStep()}
        {currentStep === 'complete' && renderCompleteStep()}
      </DialogContent>
    </Dialog>
  );
};
