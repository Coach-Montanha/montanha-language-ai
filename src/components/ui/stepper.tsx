import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface StepItem {
  id?: string | number;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface StepperProps extends React.HTMLAttributes<HTMLDivElement> {
  steps: StepItem[];
  currentStep: number; // 1-indexed
  onStepClick?: (stepIndex: number) => void;
  orientation?: "horizontal" | "vertical";
  variant?: "default" | "compact" | "dots";
}

export const Stepper: React.FC<StepperProps> = ({
  steps,
  currentStep,
  onStepClick,
  orientation = "horizontal",
  variant = "default",
  className,
  ...props
}) => {
  if (variant === "dots") {
    return (
      <div
        className={cn("flex items-center justify-center gap-1.5", className)}
        {...props}
      >
        {steps.map((_, idx) => {
          const stepNum = idx + 1;
          const isComplete = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <button
              key={idx}
              type="button"
              disabled={!onStepClick}
              onClick={() => onStepClick?.(stepNum)}
              aria-label={`Passo ${stepNum}`}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                isCurrent
                  ? "w-6 bg-primary"
                  : isComplete
                  ? "w-2 bg-primary/50"
                  : "w-2 bg-muted-foreground/25"
              )}
            />
          );
        })}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className={cn("w-full space-y-1.5", className)} {...props}>
        <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground px-0.5">
          <span className="text-foreground">
            Passo {currentStep} de {steps.length}
          </span>
          <span className="text-primary font-bold">
            {steps[currentStep - 1]?.label}
          </span>
        </div>
        <div className="grid grid-cols-1 gap-1" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((_, idx) => {
            const stepNum = idx + 1;
            const isComplete = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <div
                key={idx}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  isCurrent
                    ? "bg-primary shadow-xs"
                    : isComplete
                    ? "bg-primary/60"
                    : "bg-muted"
                )}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between",
        orientation === "vertical" ? "flex-col items-start gap-4" : "gap-2",
        className
      )}
      {...props}
    >
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isComplete = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;
        const isClickable = Boolean(onStepClick);

        return (
          <React.Fragment key={idx}>
            <div
              onClick={() => isClickable && onStepClick?.(stepNum)}
              className={cn(
                "flex items-center gap-2 select-none transition-all",
                isClickable && "cursor-pointer group"
              )}
            >
              {/* Círculo do Passo */}
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all duration-200 border",
                  isComplete
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCurrent
                    ? "border-primary bg-background text-primary ring-2 ring-primary/20 shadow-xs"
                    : "border-border bg-muted/60 text-muted-foreground"
                )}
              >
                {isComplete ? (
                  <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                ) : step.icon ? (
                  step.icon
                ) : (
                  stepNum
                )}
              </div>

              {/* Rótulo e Descrição */}
              <div className="hidden sm:flex flex-col text-left">
                <span
                  className={cn(
                    "text-xs font-semibold leading-none transition-colors",
                    isCurrent
                      ? "text-foreground font-bold"
                      : isComplete
                      ? "text-foreground/80"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
                {step.description && (
                  <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
                    {step.description}
                  </span>
                )}
              </div>
            </div>

            {/* Linha Conectora entre passos */}
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 transition-all duration-300",
                  orientation === "vertical"
                    ? "h-6 w-0.5 ml-3.5 bg-border"
                    : "h-0.5 rounded-full bg-border",
                  idx < currentStep - 1 && "bg-primary"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
