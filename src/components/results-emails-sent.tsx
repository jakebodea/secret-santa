import { RotateCcw } from "lucide-react";

import { SupportCard } from "./support-card";
import { Button } from "./ui/button";

interface ResultsEmailsSentProps {
  partyName?: string;
  onStartOver: () => void;
}

export function ResultsEmailsSent({
  partyName,
  onStartOver,
}: ResultsEmailsSentProps) {
  return (
    <div className="flex items-center justify-center py-6 sm:py-12">
      <div className="mx-auto max-w-4xl space-y-8 px-4 text-center">
        <div className="flex justify-center">
          <img
            src="/santa-eyes.svg"
            alt="Secret Santa"
            className="h-28 w-28 sm:h-40 sm:w-40 md:h-48 md:w-48"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-6 md:gap-8">
            <img
              src="/gift.svg"
              alt="Gift"
              className="hidden h-10 w-10 sm:block md:h-12 md:w-12"
            />
            <h1 className="text-foreground text-3xl leading-tight font-normal tracking-tight sm:text-5xl md:text-6xl">
              Emails Sent!
            </h1>
            <img
              src="/gift.svg"
              alt="Gift"
              className="hidden h-10 w-10 sm:block md:h-12 md:w-12"
            />
          </div>
          {partyName && (
            <p className="text-foreground decoration-primary text-lg font-light tracking-wide italic underline decoration-4 sm:text-2xl md:text-3xl">
              {partyName}
            </p>
          )}
          <p className="text-muted-foreground text-base font-light tracking-wide sm:text-xl md:text-2xl">
            Each participant has received an email with their assignment. Admins
            received a link to view all assignments.
          </p>
        </div>

        <div className="pt-4">
          <SupportCard />
        </div>

        <div className="flex justify-center pt-4">
          <Button variant="outline" onClick={onStartOver} size="cta">
            <RotateCcw data-icon="inline-start" />
            Start Over
          </Button>
        </div>
      </div>
    </div>
  );
}
