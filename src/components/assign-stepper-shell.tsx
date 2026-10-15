import { Link } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

import { ASSIGN_FLOW_STEPS } from "./assign-flow-metadata";
import type { AssignFlowStepId } from "./assign-flow-metadata";
import { Button } from "./ui/button";

interface AssignStepperShellProps {
  currentStep: AssignFlowStepId;
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
      <header className="top-safe-0 px-safe-5 sm:px-safe-6 fixed inset-x-0 z-30 flex items-center justify-between py-5 sm:py-6">
        <Link
          to="/"
          className="text-muted-foreground hover:text-foreground text-sm font-light tracking-wide transition-colors"
        >
          ← Home
        </Link>
        <Link
          to="/support"
          className="text-muted-foreground hover:text-foreground text-sm font-light tracking-wide transition-colors"
        >
          Support
        </Link>
      </header>

      <main className="pt-safe-16 pb-safe-28 sm:pt-safe-20 sm:pb-safe-32 container mx-auto flex flex-1 flex-col px-4 sm:max-w-3xl">
        <div className="mb-8 space-y-3 text-center sm:mb-10">
          <h1 className="text-foreground text-3xl leading-tight font-normal tracking-tight sm:text-4xl md:text-5xl">
            {stepMeta.title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-lg text-base font-light tracking-wide sm:text-lg">
            {stepMeta.description}
          </p>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1">{children}</div>
      </main>

      {showActions ? (
        <div className="bottom-safe-6 sm:bottom-safe-8 pointer-events-none fixed inset-x-0 z-40 flex justify-center px-4">
          <div className="border-border bg-card/95 supports-[backdrop-filter]:bg-card/90 pointer-events-auto flex w-full max-w-md min-w-[min(100%,18rem)] gap-2 rounded-lg border p-2 shadow-sm backdrop-blur-md">
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
        </div>
      ) : null}
    </div>
  );
}
