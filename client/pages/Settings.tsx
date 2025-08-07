import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { User, Mail, Calendar, Bell, Shield, CreditCard, Edit, Save, X, Trash2, AlertTriangle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useFeatureEnabled } from "@/contexts/GrowthBookContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  handicap: number | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function Settings() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingProjects, setDeletingProjects] = useState(false);
  const { toast } = useToast();

  // Feature flag for delete projects functionality
  const deleteProjectsEnabled = useFeatureEnabled('delete_projects');
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: '',
    handicap: '',
    bio: '',
    location: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('No user found');
      }

      // Get profile from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      const profileInfo: ProfileData = {
        id: user.id,
        email: user.email!,
        full_name: profileData?.full_name || null,
        handicap: profileData?.handicap || null,
        bio: profileData?.bio || null,
        location: profileData?.location || null,
        avatar_url: profileData?.avatar_url || null,
        created_at: user.created_at
      };

      setProfile(profileInfo);
      
      // Set edit form with current values
      setEditForm({
        full_name: profileInfo.full_name || '',
        handicap: profileInfo.handicap?.toString() || '',
        bio: profileInfo.bio || '',
        location: profileInfo.location || ''
      });
      
    } catch (error) {
      console.error('Error loading profile:', error);

      // Get detailed error message
      let errorMessage = "Failed to load profile data";
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = error.message;
        } else if ('error' in error) {
          errorMessage = error.error;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      const updates = {
        full_name: editForm.full_name || null,
        handicap: editForm.handicap ? parseFloat(editForm.handicap) : null,
        bio: editForm.bio || null,
        location: editForm.location || null,
        updated_at: new Date().toISOString()
      };

      const upsertData = {
        id: profile.id,
        email: profile.email,
        ...updates
      };

      console.log('Updating profile with data:', upsertData);

      const { data, error } = await supabase
        .from('profiles')
        .upsert(upsertData);

      console.log('Supabase upsert response:', { data, error });

      if (error) throw error;

      // Update local state
      setProfile({ ...profile, ...updates });
      setEditDialogOpen(false);
      
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);

      // Get detailed error message
      let errorMessage = "Failed to update profile";
      if (error && typeof error === 'object') {
        if ('message' in error) {
          errorMessage = error.message;
        } else if ('error' in error) {
          errorMessage = error.error;
        } else {
          errorMessage = JSON.stringify(error);
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAllProjects = async () => {
    try {
      setDeletingProjects(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      // Delete all events for the current user
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('created_by', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Projects Deleted",
        description: "All your projects have been successfully deleted.",
        variant: "default",
      });

    } catch (error) {
      console.error('Error deleting projects:', error);
      toast({
        title: "Error",
        description: "Failed to delete projects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingProjects(false);
    }
  };

  const formatJoinDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Settings</h1>
          <p className="text-green-600 mt-1">Loading...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-green-900">Settings</h1>
          <p className="text-red-600 mt-1">Failed to load profile</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-green-900">Settings</h1>
        <p className="text-green-600 mt-1">Manage your account and preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-xl text-green-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-emerald-600" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-green-600">
                Your personal information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="bg-emerald-600 text-white text-xl">
                    {profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : profile.email.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-green-900">
                    {profile.full_name || profile.email.split('@')[0]}
                  </h3>
                  <p className="text-green-600">
                    {profile.bio || 'Golf Enthusiast & Event Organizer'}
                  </p>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    Member
                  </Badge>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center text-green-700">
                    <Mail className="h-4 w-4 mr-3 text-emerald-600" />
                    <div>
                      <p className="text-sm text-green-600">Email</p>
                      <p className="font-medium">{profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-700">
                    <Calendar className="h-4 w-4 mr-3 text-emerald-600" />
                    <div>
                      <p className="text-sm text-green-600">Member Since</p>
                      <p className="font-medium">{formatJoinDate(profile.created_at)}</p>
                    </div>
                  </div>
                  {profile.location && (
                    <div className="flex items-center text-green-700">
                      <User className="h-4 w-4 mr-3 text-emerald-600" />
                      <div>
                        <p className="text-sm text-green-600">Location</p>
                        <p className="font-medium">{profile.location}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-green-700">
                    <User className="h-4 w-4 mr-3 text-emerald-600" />
                    <div>
                      <p className="text-sm text-green-600">Handicap</p>
                      <p className="font-medium">{profile.handicap || 'Not set'}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-700">
                    <Shield className="h-4 w-4 mr-3 text-emerald-600" />
                    <div>
                      <p className="text-sm text-green-600">Account Status</p>
                      <p className="font-medium">Active</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle className="text-green-900">Edit Profile</DialogTitle>
                    <DialogDescription className="text-green-600">
                      Update your profile information
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="full_name" className="text-green-700">Full Name</Label>
                      <Input
                        id="full_name"
                        value={editForm.full_name}
                        onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                        placeholder="Enter your full name"
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="handicap" className="text-green-700">Golf Handicap</Label>
                      <Input
                        id="handicap"
                        type="number"
                        step="0.1"
                        value={editForm.handicap}
                        onChange={(e) => setEditForm({ ...editForm, handicap: e.target.value })}
                        placeholder="e.g. 12.4"
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location" className="text-green-700">Location</Label>
                      <Input
                        id="location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        placeholder="City, State"
                        className="border-green-200 focus:border-green-500"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="bio" className="text-green-700">Bio</Label>
                      <Textarea
                        id="bio"
                        value={editForm.bio}
                        onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        placeholder="Tell us about yourself..."
                        className="border-green-200 focus:border-green-500 min-h-[80px]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => setEditDialogOpen(false)}
                      disabled={saving}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-xl text-green-900 flex items-center">
                <Bell className="h-5 w-5 mr-2 text-emerald-600" />
                Notifications
              </CardTitle>
              <CardDescription className="text-green-600">
                Manage how you receive updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Trip Updates</p>
                    <p className="text-sm text-green-600">Get notified about trip changes and updates</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Score Notifications</p>
                    <p className="text-sm text-green-600">Live score updates during tournaments</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-green-200 text-green-700">
                    Enabled
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">Marketing Emails</p>
                    <p className="text-sm text-green-600">Tips, features, and special offers</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-gray-200 text-gray-700">
                    Disabled
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Account Overview */}
        <div className="space-y-6">
          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-lg text-green-900">Account Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">2</div>
                <p className="text-sm text-green-600">Active Trips</p>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">20</div>
                <p className="text-sm text-green-600">Total Participants</p>
              </div>
              <Separator />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-900">5</div>
                <p className="text-sm text-green-600">Tournaments Hosted</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-100">
            <CardHeader>
              <CardTitle className="text-lg text-green-900 flex items-center">
                <CreditCard className="h-5 w-5 mr-2 text-emerald-600" />
                Subscription
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-green-900">Pro Plan</span>
                  <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                    Active
                  </Badge>
                </div>
                <p className="text-sm text-green-600 mb-4">
                  Unlimited trips, advanced analytics, and priority support
                </p>
                <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                  Manage Subscription
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Delete All Projects - Feature Flag Controlled */}
          {deleteProjectsEnabled && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-lg text-red-900 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                  Danger Zone
                </CardTitle>
                <CardDescription className="text-red-600">
                  Irreversible actions that affect your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-red-900 mb-2">Delete All Projects</h4>
                  <p className="text-sm text-red-600 mb-4">
                    This will permanently delete all your events, rounds, scorecards, and associated data. This action cannot be undone.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        disabled={deletingProjects}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {deletingProjects ? 'Deleting...' : 'Delete All Projects'}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-900">Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-red-600">
                          This action cannot be undone. This will permanently delete all your projects, events,
                          rounds, scorecards, and all associated data. All participants will lose access to
                          these events immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAllProjects}
                          className="bg-red-600 hover:bg-red-700"
                          disabled={deletingProjects}
                        >
                          {deletingProjects ? 'Deleting...' : 'Yes, delete all projects'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-gray-200">
            <CardContent className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
              <p className="text-gray-600 text-sm mb-4">
                Contact our support team for assistance with your account or features.
              </p>
              <Button variant="outline" size="sm" className="w-full">
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
