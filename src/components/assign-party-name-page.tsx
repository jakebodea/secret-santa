import type { RefObject } from "react";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

interface AssignPartyNamePageProps {
  inputRef: RefObject<HTMLInputElement | null>;
  partyName: string;
  onPartyNameChange: (value: string) => void;
  onPartyNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onSkip: () => void;
}

export function AssignPartyNamePage({
  inputRef,
  partyName,
  onPartyNameChange,
  onPartyNameKeyDown,
  onSubmit,
  onSkip,
}: AssignPartyNamePageProps) {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-2xl space-y-10 px-4 py-12 text-center sm:space-y-12 sm:py-16">
        <div className="flex justify-center">
          <img
            src="/gift.svg"
            alt="Gift"
            className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40"
          />
        </div>

        <div className="space-y-6">
          <h1 className="text-foreground text-3xl leading-tight font-normal tracking-tight sm:text-5xl md:text-6xl">
            What’s your gift exchange called?
          </h1>
          <p className="text-muted-foreground text-base font-light tracking-wide sm:text-xl md:text-2xl">
            Give your Secret Santa a name, or skip this step
          </p>
        </div>

        <div className="space-y-3">
          <Input
            ref={inputRef}
            variant="party"
            type="text"
            value={partyName}
            onChange={(e) => {
              onPartyNameChange(e.target.value);
            }}
            onKeyDown={onPartyNameKeyDown}
            placeholder="e.g. Office Party 2026"
            aria-label="Gift exchange name"
            autoFocus
          />
          <p className="text-muted-foreground hidden text-sm font-light tracking-wide sm:block">
            Press{" "}
            <kbd className="bg-card rounded border px-1.5 py-0.5 font-sans text-xs">
              Enter
            </kbd>{" "}
            to continue
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
          <Button
            onClick={onSubmit}
            disabled={!partyName.trim()}
            size="cta"
            className="min-w-[200px]"
          >
            Continue
          </Button>
          <Button
            variant="outline"
            onClick={onSkip}
            size="cta"
            className="min-w-[200px]"
          >
            Skip
          </Button>
        </div>
      </div>
    </div>
  );
}
