import { RotateCcw } from "lucide-react";

import type { RevealCard } from "../lib/reveal-link";
import { CelebrationHero } from "./celebration-hero";
import { RevealCards } from "./reveal-cards";
import { SupportCard } from "./support-card";
import { Button } from "./ui/button";

interface ResultsEmailsSentProps {
  partyName?: string;
  onStartOver: () => void;
  cards: RevealCard[];
}

export function ResultsEmailsSent({
  partyName,
  onStartOver,
  cards,
}: ResultsEmailsSentProps) {
  return (
    <div className="flex items-center justify-center py-2 sm:py-6">
      <div className="mx-auto w-full max-w-4xl space-y-8 text-center">
        <CelebrationHero
          imageSrc="/santa-eyes.svg"
          partyName={partyName}
          title="Emails sent!"
          description={
            cards.length > 0
              ? "Everyone with an email has their match. Hand out the cards to the rest."
              : "Everyone has their match in their inbox. Organizers also got a link to see all the pairings."
          }
        />

        {cards.length > 0 && (
          <div className="animate-reveal reveal-order-3">
            <RevealCards cards={cards} />
          </div>
        )}

        <div className="animate-reveal reveal-order-3 pt-4">
          <SupportCard />
        </div>

        <div className="animate-reveal reveal-order-4 flex justify-center pt-4">
          <Button variant="outline" onClick={onStartOver} size="cta">
            <RotateCcw data-icon="inline-start" />
            Start over
          </Button>
        </div>
      </div>
    </div>
  );
}
