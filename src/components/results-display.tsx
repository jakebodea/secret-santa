import { useRef, useState } from "react";

import { useNow } from "../hooks/use-now";
import { useWebMCPTools } from "../hooks/use-webmcp-tools";
import type { Assignment, Player } from "../lib/types";
import { emptySchema } from "../lib/webmcp/tools";
import { ResultsDrawOptions } from "./results-draw-options";
import { ResultsEmailSending } from "./results-email-sending";
import { ResultsEmailsSent } from "./results-emails-sent";
import { ResultsErrorDialog } from "./results-error-dialog";
import { ResultsReadyToSend } from "./results-ready-to-send";
import { TurnstileWidget } from "./turnstile-widget";

interface ResultsDisplayProps {
  assignments: Assignment[];
  players: Player[];
  partyName?: string;
  /** Public Turnstile key for this stage; the send button waits for its token. */
  turnstileSiteKey: string;
  onStartOver: () => void;
  onRedraw: () => void;
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
  turnstileSiteKey,
  onStartOver,
  onRedraw,
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
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  // Tokens are single-use; bumping this remounts the widget for a fresh one.
  const [turnstileAttempt, setTurnstileAttempt] = useState(0);

  const sendLock = useRef(false);
  const consumedToken = useRef<string | null>(null);
  const sent = useRef(false);
  const now = useNow();

  const COOLDOWN_MS = 60 * 60 * 1000;
  const remainingMs = cooldownUntil ? Math.max(0, cooldownUntil - now) : 0;
  const isOnCooldown = remainingMs > 0;

  const needsVerification = () =>
    !turnstileToken || turnstileToken === consumedToken.current;

  const handleSendEmails = async (opts?: { bypass?: boolean }) => {
    if (sendLock.current || emailsSent) {
      return { error: "Emails already sent or sending." };
    }
    if (needsVerification()) {
      return { error: "Complete verification in the page before sending." };
    }
    if (isOnCooldown && !opts?.bypass) {
      setConfirmDialogOpen(true);
      return {
        error: "Sending is on cooldown. Use the page to review resend options.",
      };
    }
    consumedToken.current = turnstileToken;
    sendLock.current = true;
    setIsSending(true);

    try {
      if (opts?.bypass) {
        localStorage.removeItem("ss_email_cooldown_until");
        setCooldownUntil(null);
      }
      const response = await fetch("/api/send-emails", {
        body: JSON.stringify({
          assignments,
          partyName,
          players,
          turnstileToken,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      const data = (await response.json()) as { error?: string };

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
      sent.current = true;
      setEmailsSent(true);
      return {
        status: "sent",
        message:
          "The server accepted the emails. Inbox delivery is not verified.",
      };
    } catch (error) {
      setErrorDialog({
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
        message: "Failed to send emails",
        open: true,
      });
      return {
        error: error instanceof Error ? error.message : "Email sending failed.",
      };
    } finally {
      sendLock.current = sent.current;
      setTurnstileToken(null);
      setTurnstileAttempt((attempt) => attempt + 1);
      setIsSending(false);
      setConfirmDialogOpen(false);
    }
  };

  let deliveryStatus = "ready_to_send";
  if (emailsSent) {
    deliveryStatus = "sent";
  } else if (isSending) {
    deliveryStatus = "sending";
  }

  useWebMCPTools([
    {
      name: "get_delivery_status",
      description:
        "Read whether verification is ready, emails are sending, or the server accepted them. Does not reveal matches. Verification may require the user to interact with the page.",
      inputSchema: emptySchema,
      annotations: { readOnlyHint: true },
      execute: () => ({
        status: deliveryStatus,
        verified: turnstileToken !== null,
        cooldownRemainingMs: remainingMs,
      }),
    },
    {
      name: "send_assignment_emails",
      description:
        "Send each participant their secret match and each organizer the FULL match summary. Only call after the user approves the group, organizer, and sending emails. Requires page verification. Does not bypass cooldowns or resend after success.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["confirmed"],
        properties: {
          confirmed: {
            type: "boolean",
            const: true,
            description:
              "User has approved sending to the displayed group and organizers.",
          },
        },
      },
      annotations: { consequentialHint: true },
      execute: (input) =>
        input.confirmed === true
          ? handleSendEmails()
          : { error: "Ask the user to approve email sending first." },
    },
  ]);

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
        isVerified={turnstileToken !== null}
        verification={
          <TurnstileWidget
            key={turnstileAttempt}
            siteKey={turnstileSiteKey}
            onToken={setTurnstileToken}
          />
        }
        cooldownRemainingMs={remainingMs}
        confirmDialogOpen={confirmDialogOpen}
        onConfirmDialogOpenChange={setConfirmDialogOpen}
        onSendEmails={async () => {
          await handleSendEmails();
        }}
        onSendEmailsBypass={async () => {
          await handleSendEmails({ bypass: true });
        }}
        drawOptions={
          <ResultsDrawOptions
            assignments={assignments}
            players={players}
            onRedraw={onRedraw}
            onStartOver={onStartOver}
          />
        }
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
