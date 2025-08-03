import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Bell, Shield, CreditCard } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Settings() {
  const [userEmail, setUserEmail] = useState("");
  const [userDisplayName, setUserDisplayName] = useState("");
  const [joinDate, setJoinDate] = useState("");

  useEffect(() => {
    const getUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setUserEmail(user.email || "");
        setUserDisplayName(user.email?.split('@')[0] || "User");
        setJoinDate(new Date(user.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long'
        }));
      } else {
        // Fallback to localStorage
        const email = localStorage.getItem("userEmail") || "";
        setUserEmail(email);
        setUserDisplayName(email.split('@')[0] || "User");
        setJoinDate("Recently joined");
      }
    };

    getUserInfo();
  }, []);

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
                    {userEmail ? userEmail.substring(0, 2).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-green-900">{userDisplayName}</h3>
                  <p className="text-green-600">Golf Enthusiast & Event Organizer</p>
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
                      <p className="font-medium">test@example.com</p>
                    </div>
                  </div>
                  <div className="flex items-center text-green-700">
                    <Calendar className="h-4 w-4 mr-3 text-emerald-600" />
                    <div>
                      <p className="text-sm text-green-600">Member Since</p>
                      <p className="font-medium">January 2024</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-green-700">
                    <User className="h-4 w-4 mr-3 text-emerald-600" />
                    <div>
                      <p className="text-sm text-green-600">Handicap</p>
                      <p className="font-medium">12.4</p>
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
              
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                Edit Profile
              </Button>
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
