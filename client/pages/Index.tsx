import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar, Trophy, Users, Bug } from "lucide-react";

export default function Index() {
  const [debugEmail, setDebugEmail] = useState("");
  const [debugPassword, setDebugPassword] = useState("");
  const [debugLoading, setDebugLoading] = useState(false);
  const [debugResult, setDebugResult] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  const handleDebugAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debugEmail.trim() || !debugPassword.trim()) return;

    setDebugLoading(true);
    setDebugResult({ type: null, message: '' });

    try {
      const response = await fetch('/api/auth-test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: debugEmail, password: debugPassword }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.details || result.error || `HTTP ${response.status}`);
      }

      setDebugResult({
        type: 'success',
        message: `Auth test successful! User ID: ${result.user?.id}. Email confirmed: ${result.user?.email_confirmed_at ? 'Yes' : 'No'}`
      });
    } catch (error) {
      setDebugResult({
        type: 'error',
        message: `Auth test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    } finally {
      setDebugLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-green-900 mb-6">
              Elevate Your
              <span className="text-emerald-600 block">Golf Experience</span>
            </h1>
            <p className="text-xl text-green-700 mb-8 max-w-3xl mx-auto leading-relaxed">
              Create stunning custom websites for golf events and tournaments.
              Track scores live, manage events, and bring your golf community together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 text-lg">
                <Link to="/signup">
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-green-600 text-green-600 hover:bg-green-50 px-8 py-3 text-lg">
                <Link to="/login">
                  Log In
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        {/* Golf Course Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-4 h-4 bg-green-600 rounded-full"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-emerald-500 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-3 h-3 bg-green-700 rounded-full"></div>
          <div className="absolute bottom-40 right-1/3 w-5 h-5 bg-emerald-600 rounded-full"></div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-green-900 mb-4">
              Everything You Need for Golf Events
            </h2>
            <p className="text-xl text-green-600 max-w-2xl mx-auto">
              Professional tools to create, manage, and showcase your golf events and tournaments
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-xl bg-green-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-4">Build Custom Golf Event Websites</h3>
              <p className="text-green-600">
                Create beautiful, personalized websites for your golf events with custom branding,
                itineraries, and participant information.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-green-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6">
                <Trophy className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-4">Track Scores Live</h3>
              <p className="text-green-600">
                Real-time score tracking and leaderboards keep everyone engaged. 
                Update scores on the go and watch the competition unfold.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-xl bg-green-50 border border-green-100 hover:shadow-lg transition-shadow">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 text-white rounded-full mb-6">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-green-900 mb-4">Manage Tournaments</h3>
              <p className="text-green-600">
                Organize participants, set up brackets, manage tee times, 
                and handle all tournament logistics from one central platform.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Auth Section */}
      <div className="py-16 bg-gradient-to-br from-orange-50 to-red-100">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-orange-200 bg-white shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-orange-900 flex items-center justify-center">
                <Bug className="h-6 w-6 mr-2" />
                🔧 Auth Debug Test
              </CardTitle>
              <CardDescription className="text-orange-600">
                Debug the authentication signup issue
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleDebugAuth} className="space-y-4">
                <div>
                  <Input
                    type="email"
                    value={debugEmail}
                    onChange={(e) => setDebugEmail(e.target.value)}
                    placeholder="Enter test email..."
                    className="border-orange-200 focus:border-orange-500"
                    disabled={debugLoading}
                  />
                </div>
                <div>
                  <Input
                    type="password"
                    value={debugPassword}
                    onChange={(e) => setDebugPassword(e.target.value)}
                    placeholder="Enter test password..."
                    className="border-orange-200 focus:border-orange-500"
                    disabled={debugLoading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={debugLoading || !debugEmail.trim() || !debugPassword.trim()}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {debugLoading ? "Testing..." : "Test Auth Signup"}
                </Button>
              </form>

              {debugResult.type && (
                <Alert className={`mt-4 ${debugResult.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                  <AlertDescription className={debugResult.type === 'success' ? 'text-green-700' : 'text-red-700'}>
                    {debugResult.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Golf Events?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of golf enthusiasts who are already creating amazing experiences
          </p>
          <Button asChild size="lg" className="bg-white text-emerald-600 hover:bg-gray-50 px-8 py-3 text-lg font-semibold">
            <Link to="/signup">
              Start Your First Event <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
