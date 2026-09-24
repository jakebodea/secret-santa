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
      <div className="bg-background min-h-screen">
        <main className="container mx-auto px-4 py-8">{children}</main>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <header className="fixed inset-x-0 top-0 z-30 flex items-center justify-between px-5 py-5 sm:px-6 sm:py-6">
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

      <main className="container mx-auto flex flex-1 flex-col px-4 pt-16 pb-28 sm:max-w-3xl sm:pt-20 sm:pb-32">
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
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 sm:bottom-8">
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
