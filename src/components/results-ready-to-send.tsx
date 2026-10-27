import { Mail, RotateCcw } from "lucide-react";
import type { ReactNode } from "react";

import type { Player } from "../lib/types";
import { CelebrationHero } from "./celebration-hero";
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
  onStartOver: () => void;
}

export function ResultsReadyToSend({
  partyName,
  players,
  isSending,
  isVerified,
  verification,
  cooldownRemainingMs,
  confirmDialogOpen,
  onConfirmDialogOpenChange,
  onSendEmails,
  onSendEmailsBypass,
  onStartOver,
}: ResultsReadyToSendProps) {
  const admin = players.find((p) => p.isAdmin);

  return (
    <div className="flex items-center justify-center py-2 sm:py-6">
      <div className="mx-auto w-full max-w-3xl space-y-8 text-center">
        <CelebrationHero
          imageSrc="/santa.svg"
          partyName={partyName}
          title="Names are drawn!"
          description={
            <>
              Each of your {players.length} participants will get an email with
              the person they’re buying for.
              {cooldownRemainingMs > 0 && (
                <span className="text-muted-foreground mt-2 block text-sm">
                  Email cooldown: {Math.ceil(cooldownRemainingMs / 60_000)} min
                  remaining
                </span>
              )}
            </>
          }
        />

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
          <Button
            variant="outline"
            onClick={onStartOver}
            size="cta"
            className="w-full sm:w-auto"
          >
            <RotateCcw data-icon="inline-start" />
            Start over
          </Button>
        </div>
        {verification}

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
