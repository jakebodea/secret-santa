import { Mail } from "lucide-react";
import type { ReactNode } from "react";

import { drawingPlayers, hasEmail } from "../lib/players";
import type { RevealCard } from "../lib/reveal-link";
import type { Player } from "../lib/types";
import { CelebrationHero } from "./celebration-hero";
import { RevealCards } from "./reveal-cards";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface ResultsReadyToSendProps {
  partyName?: string;
  players: Player[];
  /** Reveal cards for people in the draw without email. */
  cards: RevealCard[];
  /** At least one participant or organizer has an inbox. */
  canEmail: boolean;
  isSending: boolean;
  /** Turnstile has issued a token; sending without one would be rejected. */
  isVerified: boolean;
  /** The Turnstile widget; invisible unless the visitor must interact. */
  verification: ReactNode;
  cooldownRemainingMs: number;
  confirmDialogOpen: boolean;
  onConfirmDialogOpenChange: (open: boolean) => void;
  onSendEmails: () => Promise<void>;
  onSendEmailsBypass: () => Promise<void>;
  drawOptions: ReactNode;
}

export function ResultsReadyToSend({
  partyName,
  players,
  cards,
  canEmail,
  isSending,
  isVerified,
  verification,
  cooldownRemainingMs,
  confirmDialogOpen,
  onConfirmDialogOpenChange,
  onSendEmails,
  onSendEmailsBypass,
  drawOptions,
}: ResultsReadyToSendProps) {
  const admin = players.find((p) => p.isAdmin && hasEmail(p));
  const drawingCount = drawingPlayers(players).length;
  const emailCount = drawingCount - cards.length;

  let description = `Each of your ${drawingCount} participants will get an email with the person they’re buying for.`;
  if (!canEmail) {
    description =
      "Print a card for each person, or text them their link. Each one opens only that person’s match.";
  } else if (cards.length > 0) {
    description = `${emailCount} ${emailCount === 1 ? "person gets" : "people get"} an email. Print a card or text a link for the ${cards.length} using QR cards / private links.`;
  }

  return (
    <div className="flex items-center justify-center py-2 sm:py-6">
      <div className="mx-auto w-full max-w-3xl space-y-8 text-center">
        <CelebrationHero
          imageSrc="/santa.svg"
          partyName={partyName}
          title="Names are drawn!"
          description={
            <>
              {description}
              {canEmail && cooldownRemainingMs > 0 && (
                <span className="text-muted-foreground mt-2 block text-sm">
                  Email cooldown: {Math.ceil(cooldownRemainingMs / 60_000)} min
                  remaining
                </span>
              )}
            </>
          }
        />

        {canEmail && (
          <>
            <div className="animate-reveal reveal-order-3 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
              <Button
                onClick={onSendEmails}
                disabled={isSending || !isVerified}
                size="cta"
                className="w-full sm:w-auto"
              >
                <Mail data-icon="inline-start" />
                Send emails
              </Button>
            </div>
            {verification}
          </>
        )}
        {cards.length > 0 && (
          <div className="animate-reveal reveal-order-3">
            <RevealCards cards={cards} primary={!canEmail} />
          </div>
        )}
        {drawOptions}

        <Dialog
          open={confirmDialogOpen}
          onOpenChange={onConfirmDialogOpenChange}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle variant="compact">Send again so soon?</DialogTitle>
              <DialogDescription variant="body">
                Are you sure you want to send emails again? Is this for a
                different party? No problem if so, go ahead.
                <br />
                <br />
                Just keep in mind there are real costs to running this site
                (especially sending emails), and any support would be
                appreciated — even a few bucks helps! :)
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col justify-end gap-2 pt-4 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => {
                  onConfirmDialogOpenChange(false);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button onClick={onSendEmailsBypass} className="w-full sm:w-auto">
                Send anyway
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {admin && (
          <div className="animate-reveal reveal-order-4">
            <p className="text-muted-foreground bg-muted/60 mx-auto max-w-lg rounded-xl px-5 py-4 text-sm font-light tracking-wide">
              <strong className="text-foreground font-normal">
                {admin.name}
              </strong>{" "}
              (organizer) gets a private link to see every match. Try not to
              peek before the reveal!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
