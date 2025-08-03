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
