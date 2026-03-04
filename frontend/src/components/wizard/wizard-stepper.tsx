"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WizardStep {
  id: number;
  label: string;
  description: string;
}

interface WizardStepperProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
  onStepClick?: (stepId: number) => void;
}

export function WizardStepper({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
}: WizardStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => {
          const isCompleted = completedSteps.has(step.id);
          const isCurrent = currentStep === step.id;
          const isPast = step.id < currentStep;
          // Allow clicking completed steps or the current step
          const isClickable = !!(onStepClick && (isCompleted || isPast || isCurrent));

          return (
            <React.Fragment key={step.id}>
              {/* Step circle + label */}
              <div
                className={cn(
                  "flex flex-col items-center gap-2 min-w-0",
                  isClickable && "cursor-pointer group"
                )}
                onClick={() => isClickable && onStepClick(step.id)}
              >
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300",
                    isCompleted || isPast
                      ? "bg-white border-white text-black"
                      : isCurrent
                      ? "bg-muted border-white text-white shadow-lg shadow-white/10"
                      : "bg-muted border-border text-text-secondary",
                    isClickable &&
                      "group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-white/20"
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check size={18} strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                </div>
                <div className="text-center">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isCurrent
                        ? "text-white"
                        : isPast || isCompleted
                        ? "text-text-secondary"
                        : "text-text-secondary",
                      isClickable && "group-hover:text-white"
                    )}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-text-secondary hidden sm:block mt-0.5">
                    {step.description}
                  </p>
                </div>
              </div>

              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-3 mt-[-28px]">
                  <div className="h-0.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full bg-white rounded-full transition-all duration-500",
                        isPast || isCompleted ? "w-full" : "w-0"
                      )}
                    />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
