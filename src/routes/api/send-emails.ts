import { render } from "@react-email/render";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { jsx } from "react/jsx-runtime";

import AdminSummary from "../../emails/admin-summary";
import SecretSantaAssignment from "../../emails/secret-santa-assignment";
import { env } from "../../env";
import { planMail } from "../../lib/assignment-mail";
import type { OutgoingMail } from "../../lib/assignment-mail";
import type { Player, Assignment } from "../../lib/types";

// 1 hour
const COOLDOWN_MS = 60 * 60 * 1000;
const COOLDOWN_COOKIE = "ss_send_cooldown";

function parseCookies(header: string | null): Record<string, string> {
  if (!header) {
    return {};
  }
  const cookies: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) {
      cookies[key] = rest.join("=");
    }
  }
  return cookies;
}

function buildCooldownCookie(expiresAtMs: number): string {
  // Use Max-Age rather than Expires for simplicity; set HttpOnly so JS can't mutate it easily
  const maxAgeSec = Math.max(0, Math.ceil((expiresAtMs - Date.now()) / 1000));
  return `${COOLDOWN_COOKIE}=${expiresAtMs}; Max-Age=${maxAgeSec}; Path=/; SameSite=Lax; Secure; HttpOnly`;
}

interface RequestBody {
  players: Player[];
  assignments: Assignment[];
  partyName?: string;
  bypassCooldown?: boolean;
}

const renderMail = (mail: OutgoingMail) =>
  mail.kind === "assignment"
    ? jsx(SecretSantaAssignment, {
        giverName: mail.giverName,
        partyName: mail.partyName,
        receiverName: mail.receiverName,
      })
    : jsx(AdminSummary, {
        adminName: mail.adminName,
        partyName: mail.partyName,
        resultsUrl: mail.resultsUrl,
      });

/** Sends every message through Cloudflare Email Service; returns the recipients that failed. */
const sendAll = async (mails: readonly OutgoingMail[]): Promise<string[]> => {
  const from = { email: env.MAIL_FROM, name: env.MAIL_FROM_NAME };
  const results = await Promise.allSettled(
    mails.map(async (mail) => {
      const element = renderMail(mail);
      const [html, text] = await Promise.all([
        render(element),
        render(element, { plainText: true }),
      ]);
      await env.EMAIL.send({
        from,
        html,
        subject: mail.subject,
        text,
        to: mail.to,
      });
    })
  );
  const failed: string[] = [];
  for (const [index, result] of results.entries()) {
    if (result.status === "rejected") {
      console.error("Failed to send email:", result.reason);
      failed.push(mails[index]?.to ?? "unknown");
    }
  }
  return failed;
};

export const Route = createFileRoute("/api/send-emails")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { players, assignments, partyName, bypassCooldown } =
            (await request.json()) as RequestBody;
          // Basic per-browser-session cooldown using an HttpOnly cookie (unless bypass requested)
          if (!bypassCooldown) {
            const cookies = parseCookies(request.headers.get("cookie"));
            const lastSentRaw = cookies[COOLDOWN_COOKIE];
            if (lastSentRaw) {
              const lastSent = Number(lastSentRaw);
              if (!Number.isNaN(lastSent)) {
                const now = Date.now();
                const elapsed = now - lastSent;
                if (elapsed < COOLDOWN_MS) {
                  const remainingMs = COOLDOWN_MS - elapsed;
                  const retryAfterSec = Math.max(
                    1,
                    Math.ceil(remainingMs / 1000)
                  );
                  return json(
                    {
                      error:
                        "Please wait before sending emails again. Try once per hour.",
                    },
                    {
                      headers: {
                        "Retry-After": String(retryAfterSec),
                      },
                      status: 429,
                    }
                  );
                }
              }
            }
          }

          // Validate input
          if (
            !players ||
            !assignments ||
            players.length === 0 ||
            assignments.length === 0
          ) {
            return json(
              { error: "Invalid request: missing players or assignments" },
              { status: 400 }
            );
          }

          const { participants, admins } = planMail({
            assignments,
            origin: env.SITE_ORIGIN,
            partyName,
            players,
          });

          const failedParticipants = await sendAll(participants);
          if (failedParticipants.length > 0) {
            throw new Error(
              `Failed to send ${failedParticipants.length} of ${participants.length} participant emails`
            );
          }
          // Participants already have their assignments; an admin summary failure is logged, not fatal.
          await sendAll(admins);

          return json(
            {
              adminCount: admins.length,
              message: `Successfully sent ${participants.length} participant emails and ${admins.length} admin emails`,
              participantCount: participants.length,
              success: true,
            },
            {
              headers: {
                // Set cooldown cookie for one hour
                "Set-Cookie": buildCooldownCookie(Date.now() + COOLDOWN_MS),
              },
              status: 200,
            }
          );
        } catch (error) {
          console.error("Error sending emails:", error);
          return json(
            {
              details: error instanceof Error ? error.message : "Unknown error",
              error: "Failed to send emails",
            },
            { status: 500 }
          );
        }
      },
    },
  },
});
