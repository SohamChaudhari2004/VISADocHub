"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { WizardStepper, WizardStep } from "@/components/wizard/wizard-stepper";
import { StepUpload } from "@/components/wizard/step-upload";
import { StepProcess } from "@/components/wizard/step-process";
import { StepVerify } from "@/components/wizard/step-verify";
import { StepDS160 } from "@/components/wizard/step-ds160";
import { StepExport } from "@/components/wizard/step-export";
import { VisaSelection } from "@/components/dashboard/VisaSelection";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";

const STEPS: WizardStep[] = [
  { id: 1, label: "Upload", description: "Upload documents" },
  { id: 2, label: "Process", description: "Extract data" },
  { id: 3, label: "Verify", description: "Check consistency" },
  { id: 4, label: "Generate", description: "DS-160 form" },
  { id: 5, label: "Export", description: "Download PDF" },
];

interface UploadedDoc {
  id: number;
  doc_type: string;
  filename: string;
}

export default function DashboardPage() {
  const [visaType, setVisaType] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [finalFormData, setFinalFormData] = useState<Record<string, any>>({});

  const markComplete = (step: number) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
  };

  /* Stepper click — allow jumping to any completed or current step */
  const handleStepClick = (stepId: number) => {
    // Allow clicking to any step that's completed or is the current step
    // Also allow the step immediately after the last completed step
    const maxReachable = Math.max(
      currentStep,
      ...Array.from(completedSteps).map((s) => s + 1)
    );
    if (stepId <= maxReachable) {
      goToStep(stepId);
    }
  };

  const handleUploadComplete = (docs: UploadedDoc[]) => {
    setUploadedDocs(docs);
    markComplete(1);
    goToStep(2);
  };

  const handleProcessComplete = () => {
    markComplete(2);
    goToStep(3);
  };

  const handleVerifyComplete = () => {
    markComplete(3);
    goToStep(4);
  };

  const handleDS160Complete = (formData: Record<string, any>) => {
    setFinalFormData(formData);
    markComplete(4);
    goToStep(5);
  };

  const handleReset = () => {
    setVisaType(null);
    setCurrentStep(1);
    setCompletedSteps(new Set());
    setUploadedDocs([]);
    setFinalFormData({});
  };

  return (
    <AppLayout>
      <div className="space-y-6 sm:space-y-8 animate-fade-in p-4 sm:p-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">DS-160 Application</h1>
            <p className="text-sm sm:text-base text-text-secondary mt-1">
              Follow the steps to generate your visa application form
            </p>
          </div>
          {currentStep > 1 && (
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="text-text-secondary hover:text-text-primary w-full sm:w-auto"
              >
                <RotateCcw size={14} className="mr-2" />
                Start Over
              </Button>
            </div>
          )}
        </div>

        {/* Stepper — now clickable */}
        <WizardStepper
          steps={STEPS}
          currentStep={currentStep}
          completedSteps={completedSteps}
          onStepClick={handleStepClick}
        />

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Step Content */}
        {!visaType ? (
          <VisaSelection onSelect={setVisaType} />
        ) : (
          <div className="min-h-[400px]">
            {currentStep === 1 && <StepUpload visaType={visaType} onComplete={handleUploadComplete} />}
            {currentStep === 2 && (
              <StepProcess uploadedDocs={uploadedDocs} onComplete={handleProcessComplete} />
            )}
            {currentStep === 3 && <StepVerify onComplete={handleVerifyComplete} />}
            {currentStep === 4 && <StepDS160 onComplete={handleDS160Complete} />}
            {currentStep === 5 && <StepExport formData={finalFormData} />}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
