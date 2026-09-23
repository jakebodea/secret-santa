import { RotateCcw, Mail, XCircle } from "lucide-react";
import { useEffect, useState } from "react";

import type { Player, Assignment } from "../lib/types";
import { SupportCard } from "./support-card";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";

interface ResultsDisplayProps {
  assignments: Assignment[];
  players: Player[];
  partyName?: string;
  onStartOver: () => void;
}

function readStoredCooldown(): number | null {
  if (typeof window === "undefined") {
    return null;
  }
  const parsed = Number(localStorage.getItem("ss_email_cooldown_until"));
  return parsed > 0 ? parsed : null;
}

export function ResultsDisplay({
  assignments,
  players,
  partyName,
  onStartOver,
}: ResultsDisplayProps) {
  const [isSending, setIsSending] = useState(false);
  const [emailsSent, setEmailsSent] = useState(false);
  // Only rendered client-side after assignments are generated, so localStorage is available
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(
    readStoredCooldown
  );
  const [nowTs, setNowTs] = useState<number>(() => Date.now());
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
    details?: string;
  }>({ message: "", open: false });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  // Keep a ticking clock for remaining cooldown time
  useEffect(() => {
    if (!cooldownUntil) {
      return;
    }
    const id = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  const COOLDOWN_MS = 60 * 60 * 1000;
  const remainingMs = cooldownUntil ? Math.max(0, cooldownUntil - nowTs) : 0;
  const isOnCooldown = remainingMs > 0;

  const handleSendEmails = async (opts?: { bypass?: boolean }) => {
    if (isOnCooldown && !opts?.bypass) {
      setConfirmDialogOpen(true);
      return;
    }
    setIsSending(true);

    try {
      // If user explicitly bypassed, clear client cooldown immediately
      if (opts?.bypass && typeof window !== "undefined") {
        localStorage.removeItem("ss_email_cooldown_until");
        setCooldownUntil(null);
      }
      const response = await fetch("/api/send-emails", {
        body: JSON.stringify({
          assignments,
          bypassCooldown: opts?.bypass === true,
          partyName,
          players,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        // If rate-limited, persist local cooldown based on Retry-After if present
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const retrySeconds = retryAfter ? Number(retryAfter) : null;
          const until =
            retrySeconds && !Number.isNaN(retrySeconds)
              ? Date.now() + retrySeconds * 1000
              : Date.now() + COOLDOWN_MS;
          if (typeof window !== "undefined") {
            localStorage.setItem("ss_email_cooldown_until", String(until));
          }
          setCooldownUntil(until);
        }
        throw new Error(data.error || "Failed to send emails");
      }

      // Success: set client cooldown for one hour
      const until = Date.now() + COOLDOWN_MS;
      if (typeof window !== "undefined") {
        localStorage.setItem("ss_email_cooldown_until", String(until));
      }
      setCooldownUntil(until);
      setEmailsSent(true);
    } catch (error) {
      setErrorDialog({
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        message: "Failed to send emails",
        open: true,
      });
    } finally {
      setIsSending(false);
      setConfirmDialogOpen(false);
    }
  };

  // Loading state while sending emails
  if (isSending) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-8 text-center">
          {/* Bouncing Loading Dots */}
          <div className="flex h-12 items-center justify-center gap-3">
            <div
              className="bg-primary h-3 w-3 rounded-full"
              style={{
                animation: "bounce-high 1s ease-in-out infinite",
                animationDelay: "0ms",
              }}
            />
            <div
              className="bg-primary h-3 w-3 rounded-full"
              style={{
                animation: "bounce-high 1s ease-in-out infinite",
                animationDelay: "150ms",
              }}
            />
            <div
              className="bg-primary h-3 w-3 rounded-full"
              style={{
                animation: "bounce-high 1s ease-in-out infinite",
                animationDelay: "300ms",
              }}
            />
          </div>
          <style>{`
            @keyframes bounce-high {
              0% {
                transform: translateY(0);
              }
              20% {
                transform: translateY(-16px);
              }
              40% {
                transform: translateY(0);
              }
              100% {
                transform: translateY(0);
              }
            }
          `}</style>

          {/* Text Message */}
          <div>
            <h2 className="text-foreground text-xl font-normal tracking-wide sm:text-3xl md:text-4xl">
              Sending Emails...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  // Success state after emails are sent
  if (emailsSent) {
    return (
      <>
        <div className="flex items-center justify-center py-6 sm:py-12">
          <div className="mx-auto max-w-4xl space-y-8 px-4 text-center">
            {/* Celebration Icon */}
            <div className="flex justify-center">
              <img
                src="/santa-eyes.svg"
                alt="Secret Santa"
                className="h-28 w-28 sm:h-40 sm:w-40 md:h-48 md:w-48"
              />
            </div>

            {/* Main Message */}
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
                Each participant has received an email with their assignment.
                Admins received a link to view all assignments.
              </p>
            </div>

            {/* Support Card */}
            <div className="pt-4">
              <SupportCard />
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={onStartOver}
                className="h-11 gap-3 px-6 text-base font-medium tracking-wide sm:h-12 sm:px-8"
              >
                <RotateCcw className="h-5 w-5" />
                Start Over
              </Button>
            </div>
          </div>
        </div>

        {/* Error Dialog */}
        <Dialog
          open={errorDialog.open}
          onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="h-5 w-5" />
                Error
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <p className="mb-2">{errorDialog.message}</p>
              {errorDialog.details && (
                <p className="text-muted-foreground text-sm">
                  {errorDialog.details}
                </p>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button
                onClick={() => setErrorDialog({ message: "", open: false })}
              >
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Initial state - assignments generated, ready to send
  return (
    <>
      <div className="flex items-center justify-center py-6 sm:py-12">
        <div className="mx-auto max-w-3xl space-y-8 px-4 text-center">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <img
              src="/santa.svg"
              alt="Secret Santa"
              className="h-28 w-28 sm:h-40 sm:w-40 md:h-48 md:w-48"
            />
          </div>

          {/* Main Message */}
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Button
              onClick={() => handleSendEmails()}
              disabled={isSending}
              className="h-11 w-full gap-3 px-6 text-base font-medium tracking-wide sm:h-12 sm:w-auto sm:px-8"
            >
              <Mail className="h-5 w-5" />
              Send Emails
            </Button>
            <Button
              variant="outline"
              onClick={onStartOver}
              className="h-11 w-full gap-3 px-6 text-base font-medium tracking-wide sm:h-12 sm:w-auto sm:px-8"
            >
              <RotateCcw className="h-5 w-5" />
              Start Over
            </Button>
          </div>
          {/* Confirmation Dialog for re-sending within cooldown */}
          <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">
                  Send again so soon?
                </DialogTitle>
                <DialogDescription className="pt-2 text-base">
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
                  onClick={() => setConfirmDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleSendEmails({ bypass: true })}
                  className="w-full sm:w-auto"
                >
                  Send anyway
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Admin Note */}
          {players.find((p) => p.isAdmin) && (
            <Card className="bg-muted/50 shadow-none">
              <CardContent>
                <p className="text-muted-foreground text-sm font-light tracking-wide">
                  <strong className="text-foreground font-normal">
                    {players.find((p) => p.isAdmin)?.name}
                  </strong>{" "}
                  (Admin) will receive a link to view all assignments. Please
                  resist the temptation to look at it before the reveal! :)
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <p className="mb-2">{errorDialog.message}</p>
            {errorDialog.details && (
              <p className="text-muted-foreground text-sm">
                {errorDialog.details}
              </p>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setErrorDialog({ message: "", open: false })}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
