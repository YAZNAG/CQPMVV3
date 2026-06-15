"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdmissionStepId = "filiere" | "centre" | "conditions" | "documents" | "confirmation";

interface AdmissionStepperProps {
  steps: { id: AdmissionStepId; label: string }[];
  currentStep: number;
}

export function AdmissionStepper({ steps, currentStep }: AdmissionStepperProps) {
  return (
    <nav aria-label="Progression inscription" className="w-full">
      <ol className="flex items-start justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;

          return (
            <li key={step.id} className="relative flex flex-1 flex-col items-center">
              {index < steps.length - 1 && (
                <span
                  className={cn(
                    "absolute left-[calc(50%+1.25rem)] top-5 hidden h-0.5 w-[calc(100%-2.5rem)] sm:block",
                    isCompleted ? "bg-sky-500" : "bg-slate-200"
                  )}
                  aria-hidden
                />
              )}

              <span
                className={cn(
                  "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors",
                  isCompleted && "bg-sky-500 text-white shadow-md shadow-sky-500/30",
                  isActive && "bg-navy-900 text-white shadow-md shadow-navy-900/25",
                  !isCompleted && !isActive && "border-2 border-slate-200 bg-white text-slate-400"
                )}
              >
                {isCompleted ? <Check className="h-5 w-5" strokeWidth={2.5} /> : stepNumber}
              </span>

              <span
                className={cn(
                  "mt-2 hidden max-w-[7rem] text-center text-[11px] font-semibold leading-tight sm:block sm:text-xs",
                  isActive ? "text-navy-900" : isCompleted ? "text-sky-600" : "text-slate-400"
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
