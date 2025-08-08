import { useEffect, useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Plus, Settings, LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function AppShell() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check for existing session
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || "");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", session.user.email || "");
        localStorage.setItem("userId", session.user.id);
      } else {
        // Check localStorage as fallback
        const authStatus = localStorage.getItem("isAuthenticated");
        const email = localStorage.getItem("userEmail");

        if (!authStatus) {
          navigate("/login");
        } else {
          setIsAuthenticated(true);
          setUserEmail(email || "");
        }
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setIsAuthenticated(false);
        setUserEmail("");
        localStorage.removeItem("isAuthenticated");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userId");
        navigate("/");
      } else if (session?.user) {
        setIsAuthenticated(true);
        setUserEmail(session.user.email || "");
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userEmail", session.user.email || "");
        localStorage.setItem("userId", session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    // The auth state change listener will handle the cleanup
  };

  const navigationItems = [
    { path: "/app", label: "My Events", icon: Calendar },
    { path: "/app/create", label: "Create Event", icon: Plus },
    { path: "/app/settings", label: "Settings", icon: Settings },
  ];

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to="/app"
                className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
              >
                TrackTrack
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium transition-colors relative group",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-semibold"
                        : "text-gray-700 hover:text-purple-600",
                    )}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {item.label}
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        {userEmail
                          ? userEmail.substring(0, 2).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {userEmail.split("@")[0] || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/app/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-white/20 bg-white/90 backdrop-blur-lg">
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center px-3 py-2 text-base font-medium transition-colors relative",
                        isActive
                          ? "text-purple-900 font-semibold"
                          : "text-gray-700 hover:text-purple-600",
                      )}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                      {isActive && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"></span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 right-10 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-32 left-10 w-32 h-32 bg-pink-500/5 rounded-full blur-2xl"></div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
