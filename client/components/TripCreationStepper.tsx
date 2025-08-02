import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  path: string;
  description: string;
}

const steps: Step[] = [
  {
    id: "basic-info",
    title: "Basic Info",
    path: "/app/create/basic-info",
    description: "Event details and dates"
  },
  {
    id: "courses",
    title: "Courses",
    path: "/app/create/courses",
    description: "Golf rounds and venues"
  },
  {
    id: "scoring",
    title: "Scoring",
    path: "/app/create/scoring",
    description: "Tournament format"
  },
  {
    id: "players",
    title: "Players",
    path: "/app/create/players",
    description: "Participants and handicaps"
  },
  {
    id: "prizes",
    title: "Prizes",
    path: "/app/create/prizes",
    description: "Buy-ins and payouts"
  },
  {
    id: "travel",
    title: "Travel",
    path: "/app/create/travel",
    description: "Logistics and schedule"
  },
  {
    id: "customization",
    title: "Customization",
    path: "/app/create/customization",
    description: "Branding and privacy"
  },
  {
    id: "summary",
    title: "Summary",
    path: "/app/create/summary",
    description: "Review and confirm"
  }
];

interface TripCreationStepperProps {
  onNext?: () => void;
  onPrevious?: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
  showNavigation?: boolean;
}

export function TripCreationStepper({ 
  onNext, 
  onPrevious, 
  nextDisabled = false, 
  nextLabel = "Next",
  showNavigation = true 
}: TripCreationStepperProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const currentStepIndex = steps.findIndex(step => step.path === currentPath);
  const currentStep = steps[currentStepIndex];

  const getStepStatus = (stepIndex: number) => {
    if (stepIndex < currentStepIndex) return "completed";
    if (stepIndex === currentStepIndex) return "current";
    return "upcoming";
  };

  return (
    <div className="space-y-6">
      {/* Stepper Header */}
      <div className="bg-white border border-green-100 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            to="/app/create"
            className="flex items-center text-green-600 hover:text-green-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Create Event
          </Link>
          <div className="text-sm text-green-600">
            Step {currentStepIndex + 1} of {steps.length}
          </div>
        </div>

        {/* Current Step Info */}
        {currentStep && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-green-900 mb-1">
              {currentStep.title}
            </h1>
            <p className="text-green-600">{currentStep.description}</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="relative">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isClickable = status === "completed" || status === "current";
              
              const StepComponent = isClickable ? Link : "div";
              const stepProps = isClickable ? { to: step.path } : {};
              
              return (
                <StepComponent
                  key={step.id}
                  {...stepProps}
                  className={cn(
                    "flex flex-col items-center relative z-10",
                    isClickable && "cursor-pointer group"
                  )}
                >
                  <div
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                      status === "completed" && "bg-emerald-600 text-white",
                      status === "current" && "bg-emerald-600 text-white ring-4 ring-emerald-100",
                      status === "upcoming" && "bg-gray-200 text-gray-500"
                    )}
                  >
                    {status === "completed" ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="mt-2 text-center max-w-20">
                    <div
                      className={cn(
                        "text-xs font-medium",
                        status === "current" && "text-emerald-600",
                        status === "completed" && "text-green-700",
                        status === "upcoming" && "text-gray-500",
                        isClickable && "group-hover:text-emerald-700"
                      )}
                    >
                      {step.title}
                    </div>
                  </div>
                </StepComponent>
              );
            })}
          </div>
          
          {/* Progress Line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 -z-10">
            <div
              className="h-full bg-emerald-600 transition-all duration-500"
              style={{
                width: `${(currentStepIndex / (steps.length - 1)) * 100}%`
              }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      {showNavigation && (
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={currentStepIndex === 0}
            className="border-green-200 text-green-700 hover:bg-green-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          
          <Button
            onClick={onNext}
            disabled={nextDisabled}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {nextLabel}
            {nextLabel === "Next" && <ArrowRight className="h-4 w-4 ml-2" />}
          </Button>
        </div>
      )}
    </div>
  );
}
