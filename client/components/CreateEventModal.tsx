import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, FileText, Zap, Clock } from "lucide-react";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQuickStart: () => void;
  onManualCreate: () => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onQuickStart,
  onManualCreate,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            <span>Create New Golf Event</span>
          </DialogTitle>
          <DialogDescription>
            Choose how you'd like to create your golf event. You can use AI to
            quickly generate everything or enter details manually.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Quick Start with AI */}
          <Card
            className="border-2 border-emerald-200 hover:border-emerald-300 transition-colors cursor-pointer"
            onClick={onQuickStart}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-emerald-900">
                Quick Start with AI
              </CardTitle>
              <div className="flex items-center justify-center space-x-1 text-sm text-emerald-600">
                <Clock className="h-4 w-4" />
                <span>2-3 minutes</span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-slate-600 mb-4">
                Answer a few quick questions and let AI generate your event
                details, descriptions, and itinerary automatically.
              </CardDescription>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>AI-generated event details</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Automatic itinerary creation</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <span>Smart travel suggestions</span>
                </div>
              </div>
              <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                Start Quick Setup
              </Button>
            </CardContent>
          </Card>

          {/* Manual Entry */}
          <Card
            className="border-2 border-slate-200 hover:border-slate-300 transition-colors cursor-pointer"
            onClick={onManualCreate}
          >
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center mb-4">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl text-slate-900">
                Enter Details Manually
              </CardTitle>
              <div className="flex items-center justify-center space-x-1 text-sm text-slate-600">
                <Clock className="h-4 w-4" />
                <span>10-15 minutes</span>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <CardDescription className="text-slate-600 mb-4">
                Have full control over every detail of your event. Perfect for
                complex events or specific requirements.
              </CardDescription>
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Step-by-step customization</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Advanced scoring options</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                  <span>Custom rules and prizes</span>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline">
                Manual Setup
              </Button>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
