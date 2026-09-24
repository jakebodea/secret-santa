import { useState, useSyncExternalStore } from "react";

import type { Assignment, Player } from "../lib/types";
import { ResultsEmailSending } from "./results-email-sending";
import { ResultsEmailsSent } from "./results-emails-sent";
import { ResultsErrorDialog } from "./results-error-dialog";
import { ResultsReadyToSend } from "./results-ready-to-send";

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
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(
    readStoredCooldown
  );
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
    details?: string;
  }>({ message: "", open: false });
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);

  const now = useSyncExternalStore(
    (onStoreChange) => {
      const id = setInterval(onStoreChange, 1000);
      return () => {
        clearInterval(id);
      };
    },
    () => Date.now(),
    () => Date.now()
  );

  const COOLDOWN_MS = 60 * 60 * 1000;
  const remainingMs = cooldownUntil ? Math.max(0, cooldownUntil - now) : 0;
  const isOnCooldown = remainingMs > 0;

  const handleSendEmails = async (opts?: { bypass?: boolean }) => {
    if (isOnCooldown && !opts?.bypass) {
      setConfirmDialogOpen(true);
      return;
    }
    setIsSending(true);

    try {
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

  if (isSending) {
    return <ResultsEmailSending />;
  }

  if (emailsSent) {
    return (
      <>
        <ResultsEmailsSent partyName={partyName} onStartOver={onStartOver} />
        <ResultsErrorDialog
          open={errorDialog.open}
          message={errorDialog.message}
          details={errorDialog.details}
          onOpenChange={(open) => {
            setErrorDialog({ ...errorDialog, open });
          }}
          onDismiss={() => {
            setErrorDialog({ message: "", open: false });
          }}
        />
      </>
    );
  }

  return (
    <>
      <ResultsReadyToSend
        partyName={partyName}
        players={players}
        isSending={isSending}
        cooldownRemainingMs={remainingMs}
        confirmDialogOpen={confirmDialogOpen}
        onConfirmDialogOpenChange={setConfirmDialogOpen}
        onSendEmails={async () => handleSendEmails()}
        onSendEmailsBypass={async () => handleSendEmails({ bypass: true })}
        onStartOver={onStartOver}
      />
      <ResultsErrorDialog
        open={errorDialog.open}
        message={errorDialog.message}
        details={errorDialog.details}
        onOpenChange={(open) => {
          setErrorDialog({ ...errorDialog, open });
        }}
        onDismiss={() => {
          setErrorDialog({ message: "", open: false });
        }}
      />
    </>
  );
}
