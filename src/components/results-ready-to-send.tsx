import { Mail, RotateCcw } from "lucide-react";

import type { Player } from "../lib/types";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
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
  cooldownRemainingMs,
  confirmDialogOpen,
  onConfirmDialogOpenChange,
  onSendEmails,
  onSendEmailsBypass,
  onStartOver,
}: ResultsReadyToSendProps) {
  const admin = players.find((p) => p.isAdmin);

  return (
    <div className="flex items-center justify-center py-6 sm:py-12">
      <div className="mx-auto max-w-3xl space-y-8 px-4 text-center">
        <div className="flex justify-center">
          <img
            src="/santa.svg"
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
              {partyName && (
                <>
                  <span className="decoration-primary italic underline decoration-4">
                    {partyName}
                  </span>
                  <br />
                </>
              )}
              Assignments Generated!
            </h1>
            <img
              src="/gift.svg"
              alt="Gift"
              className="hidden h-10 w-10 sm:block md:h-12 md:w-12"
            />
          </div>
          <p className="text-muted-foreground text-base font-light tracking-wide sm:text-xl md:text-2xl">
            Each of your {players.length} participants will get an email with
            the person they’re buying for.
          </p>
          {cooldownRemainingMs > 0 && (
            <p className="text-muted-foreground text-sm">
              Email cooldown: {Math.ceil(cooldownRemainingMs / 60_000)} min
              remaining
            </p>
          )}
        </div>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Button
            onClick={onSendEmails}
            disabled={isSending}
            size="cta"
            className="w-full sm:w-auto"
          >
            <Mail data-icon="inline-start" />
            Send Emails
          </Button>
          <Button
            variant="outline"
            onClick={onStartOver}
            size="cta"
            className="w-full sm:w-auto"
          >
            <RotateCcw data-icon="inline-start" />
            Start Over
          </Button>
        </div>

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
          <Card variant="muted">
            <CardContent>
              <p className="text-muted-foreground text-sm font-light tracking-wide">
                <strong className="text-foreground font-normal">
                  {admin.name}
                </strong>{" "}
                (Admin) will receive a link to view all assignments. Please
                resist the temptation to look at it before the reveal! :)
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
