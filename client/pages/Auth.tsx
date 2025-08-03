import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Set initial mode based on URL
  useState(() => {
    if (location.pathname === "/signup") {
      setIsLogin(false);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !password) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    if (!isLogin) {
      if (password !== confirmPassword) {
        setError("Passwords don't match");
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }
    }

    try {
      if (isLogin) {
        // Sign in existing user
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userEmail", data.user.email || "");
          localStorage.setItem("userId", data.user.id);
          navigate("/app");
        }
      } else {
        // Sign up new user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data.user) {
          // For now, since email verification is disabled, sign them in automatically
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userEmail", data.user.email || "");
          localStorage.setItem("userId", data.user.id);
          navigate("/app");
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link 
          to="/" 
          className="inline-flex items-center text-green-600 hover:text-green-700 mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        <Card className="border-green-100">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-green-900">
              {isLogin ? "Welcome Back" : "Create Account"}
            </CardTitle>
            <CardDescription className="text-green-600">
              {isLogin
                ? "Sign in to manage your golf events"
                : "Join us to start creating amazing golf experiences"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-green-800">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-green-200 focus:border-emerald-500"
                  placeholder="Enter your email"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-green-800">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="border-green-200 focus:border-emerald-500 pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 hover:text-green-700"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-green-800">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="border-green-200 focus:border-emerald-500"
                    placeholder="Confirm your password"
                  />
                </div>
              )}

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-600">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {isLogin && (
                <Alert className="border-blue-200 bg-blue-50">
                  <AlertDescription className="text-blue-600 text-sm">
                    Sign in with your account credentials
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={loading}
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-green-600">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                    setEmail("");
                    setPassword("");
                    setConfirmPassword("");
                  }}
                  className="ml-2 text-emerald-600 hover:text-emerald-700 font-medium underline"
                >
                  {isLogin ? "Sign up" : "Sign in"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
