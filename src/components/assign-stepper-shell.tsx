import { Link } from "@tanstack/react-router";
import { m } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

import { EASE_OUT } from "../lib/motion";
import { cn } from "../lib/utils";
import { ASSIGN_FLOW_STEPS } from "./assign-flow-metadata";
import type { AssignFlowStepId } from "./assign-flow-metadata";
import { Button } from "./ui/button";

const STEP_OFFSET_PX = 24;

interface AssignStepperShellProps {
  currentStep: AssignFlowStepId;
  /** 1 when moving forward through the flow, -1 when going back */
  direction?: 1 | -1;
  /** Hide the step title when the content brings its own hero */
  showHeading?: boolean;
  children: ReactNode;
  onBack?: () => void;
  showBack?: boolean;
  primaryAction?: {
    disabled?: boolean;
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  };
  variant?: "default" | "minimal";
}

export function AssignStepperShell({
  children,
  currentStep,
  direction = 1,
  showHeading = true,
  onBack,
  primaryAction,
  showBack = true,
  variant = "default",
}: AssignStepperShellProps) {
  const stepMeta =
    ASSIGN_FLOW_STEPS.find((s) => s.id === currentStep) ?? ASSIGN_FLOW_STEPS[0];

  const showActions = primaryAction || (showBack && onBack);

  if (variant === "minimal") {
    return (
      <div className="bg-background min-h-dvh">
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-dvh flex-col">
      <header className="top-safe-0 px-safe-5 sm:px-safe-6 fixed inset-x-0 z-30 grid grid-cols-[1fr_auto_1fr] items-center py-5 sm:py-6">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground justify-self-start text-sm font-light tracking-wide transition-colors"
        >
          ← Home
        </Link>
        <StepProgress currentStep={currentStep} />
        <Link
          to="/support"
          className="text-muted-foreground hover:text-foreground justify-self-end text-sm font-light tracking-wide transition-colors"
        >
          Support
        </Link>
      </header>

      <main className="pt-safe-16 pb-safe-28 sm:pt-safe-20 sm:pb-safe-32 container mx-auto flex flex-1 flex-col px-4 sm:max-w-3xl">
        <m.div
          key={currentStep}
          className="flex flex-1 flex-col"
          initial={{ opacity: 0, x: direction * STEP_OFFSET_PX }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.32, ease: EASE_OUT }}
        >
          <div
            className="mb-8 space-y-3 text-center sm:mb-10"
            hidden={!showHeading}
          >
            <h1 className="text-foreground text-3xl leading-tight font-normal tracking-tight sm:text-4xl md:text-5xl">
              {stepMeta.title}
            </h1>
            <p className="text-muted-foreground mx-auto max-w-lg text-base font-light tracking-wide sm:text-lg">
              {stepMeta.description}
            </p>
          </div>

          <div className="mx-auto w-full max-w-2xl flex-1">{children}</div>
        </m.div>
      </main>

      {showActions ? (
        <m.div
          className="bottom-safe-6 sm:bottom-safe-8 pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
        >
          <div className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/85 rounded-action pointer-events-auto flex w-full max-w-md min-w-[min(100%,18rem)] gap-2 border p-2 shadow-lg shadow-black/5 backdrop-blur-md">
            {showBack && onBack ? (
              <Button
                type="button"
                variant="outline"
                size="bar"
                onClick={onBack}
              >
                <ChevronLeft data-icon="inline-start" />
                Back
              </Button>
            ) : null}
            {primaryAction ? (
              <Button
                type="button"
                size="bar"
                onClick={() => primaryAction.onClick()}
                disabled={primaryAction.disabled}
              >
                {primaryAction.icon}
                <span className="truncate">{primaryAction.label}</span>
              </Button>
            ) : null}
          </div>
        </m.div>
      ) : null}
    </div>
  );
}

function StepProgress({ currentStep }: { currentStep: AssignFlowStepId }) {
  const current = ASSIGN_FLOW_STEPS.find((s) => s.id === currentStep);
  return (
    <ol
      aria-label={`Step ${currentStep} of ${ASSIGN_FLOW_STEPS.length}: ${current?.label ?? ""}`}
      className="flex items-center gap-1.5"
    >
      {ASSIGN_FLOW_STEPS.map((s) => (
        <li
          key={s.id}
          aria-current={s.id === currentStep ? "step" : undefined}
          className={cn(
            // Only width and color change here, so `all` stays cheap
            "h-1.5 rounded-full transition-all duration-300 ease-out",
            s.id === currentStep ? "bg-primary w-6" : "w-1.5",
            s.id < currentStep && "bg-primary/40",
            s.id > currentStep && "bg-border"
          )}
        >
          <span className="sr-only">{s.label}</span>
        </li>
      ))}
    </ol>
  );
}
