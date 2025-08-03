import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TripCreationProvider } from "@/contexts/TripCreationContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AppShell from "./pages/App";
import MyTrips from "./pages/MyTrips";
import CreateTrip from "./pages/CreateTrip";
import BasicInfo from "./pages/create/BasicInfo";
import Courses from "./pages/create/Courses";
import Scoring from "./pages/create/Scoring";
import Players from "./pages/create/Players";
import Prizes from "./pages/create/Prizes";
import Travel from "./pages/create/Travel";
import Customization from "./pages/create/Customization";
import Summary from "./pages/create/Summary";
import Settings from "./pages/Settings";
import EventEdit from "./pages/EventEdit";
import BasicInfoEdit from "./pages/edit/BasicInfoEdit";
import CoursesEdit from "./pages/edit/CoursesEdit";
import ScoringEdit from "./pages/edit/ScoringEdit";
import PlayersEdit from "./pages/edit/PlayersEdit";
import PrizesEdit from "./pages/edit/PrizesEdit";
import TravelEdit from "./pages/edit/TravelEdit";
import CustomizationsEdit from "./pages/edit/CustomizationsEdit";
import HomeCustomization from "./pages/edit/customizations/HomeCustomization";
import CoursesCustomization from "./pages/edit/customizations/CoursesCustomization";
import RulesCustomization from "./pages/edit/customizations/RulesCustomization";
import LeaderboardCustomization from "./pages/edit/customizations/LeaderboardCustomization";
import TravelCustomization from "./pages/edit/customizations/TravelCustomization";
import TestCourseSync from "./pages/edit/TestCourseSync";
import SettingsEdit from "./pages/edit/SettingsEdit";
import PublicEvent from "./pages/PublicEvent";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <TripCreationProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Auth />} />
              <Route path="/signup" element={<Auth />} />
              <Route path="/events/:slug" element={<PublicEvent />} />
              <Route path="/app" element={<AppShell />}>
                <Route index element={<MyTrips />} />
                <Route path="create" element={<CreateTrip />} />
                <Route path="create/basic-info" element={<BasicInfo />} />
                <Route path="create/courses" element={<Courses />} />
                <Route path="create/scoring" element={<Scoring />} />
                <Route path="create/players" element={<Players />} />
                <Route path="create/prizes" element={<Prizes />} />
                <Route path="create/travel" element={<Travel />} />
                <Route path="create/customization" element={<Customization />} />
              <Route path="create/summary" element={<Summary />} />
              <Route path="settings" element={<Settings />} />

              {/* Event Editing Routes */}
              <Route path=":eventId" element={<EventEdit />}>
                <Route path="basic" element={<BasicInfoEdit />} />
                <Route path="courses" element={<CoursesEdit />} />
                <Route path="scoring" element={<ScoringEdit />} />
                <Route path="players" element={<PlayersEdit />} />
                <Route path="prizes" element={<PrizesEdit />} />
                <Route path="travel" element={<TravelEdit />} />
                <Route path="customizations" element={<CustomizationsEdit />} />
                <Route path="customizations/home" element={<HomeCustomization />} />
                <Route path="customizations/courses" element={<CoursesCustomization />} />
                <Route path="customizations/rules" element={<RulesCustomization />} />
                <Route path="customizations/leaderboard" element={<LeaderboardCustomization />} />
                <Route path="customizations/travel" element={<TravelCustomization />} />
                <Route path="settings" element={<SettingsEdit />} />
                <Route index element={<BasicInfoEdit />} /> {/* Default to basic info */}
              </Route>
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TripCreationProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
