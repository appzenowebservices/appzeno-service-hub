import { Check } from "lucide-react";
import { cn } from "../../../../utils/cn";

interface Step {
  label: string;
  icon?: React.ReactNode;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-0 w-full mb-8">
      {steps.map((step, i) => {
        const done    = i < currentStep;
        const active  = i === currentStep;

        return (
          <div key={i} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center gap-1">
              <div className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                done   && "bg-primary-600 border-primary-600 text-white",
                active && "bg-white border-primary-600 text-primary-600 shadow-md ring-4 ring-primary-100",
                !done && !active && "bg-white border-neutral-200 text-neutral-400"
              )}>
                {done ? <Check size={16} /> : <span>{i + 1}</span>}
              </div>
              <span className={cn(
                "text-xs font-semibold whitespace-nowrap hidden sm:block",
                active ? "text-primary-600" : done ? "text-primary-500" : "text-neutral-400"
              )}>
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div className={cn(
                "h-0.5 w-10 sm:w-16 mx-1 rounded-full transition-all duration-300 mb-4",
                i < currentStep ? "bg-primary-500" : "bg-neutral-200"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
