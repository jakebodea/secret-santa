import { render } from "@react-email/render";
import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { jsx } from "react/jsx-runtime";

import AdminSummary from "../../emails/admin-summary";
import SecretSantaAssignment from "../../emails/secret-santa-assignment";
import { env } from "../../env";
import { planMail } from "../../lib/assignment-mail";
import type { OutgoingMail } from "../../lib/assignment-mail";
import { verifyTurnstile } from "../../lib/turnstile";
import type { Player, Assignment } from "../../lib/types";

/** A party bigger than this is almost certainly not a party. */
const MAX_PLAYERS = 100;
/** Seconds a client waits after hitting `SEND_LIMIT` (its period, see alchemy.run.ts). */
const RATE_LIMIT_RETRY_SECONDS = 60;

interface RequestBody {
  players?: Player[];
  assignments?: Assignment[];
  partyName?: string;
  turnstileToken?: string;
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
        // Anyone can call this endpoint, and it mails arbitrary addresses from our
        // domain: rate limit per IP, then require a fresh Turnstile token per send.
        const ip = request.headers.get("cf-connecting-ip");
        const { success: underLimit } = await env.SEND_LIMIT.limit({
          key: ip ?? "unknown",
        });
        if (!underLimit) {
          return json(
            {
              error: "Too many sends from this network. Try again in a minute.",
            },
            {
              headers: { "Retry-After": String(RATE_LIMIT_RETRY_SECONDS) },
              status: 429,
            }
          );
        }

        try {
          const { players, assignments, partyName, turnstileToken } =
            (await request.json()) as RequestBody;

          const human = await verifyTurnstile({
            fetch: fetch.bind(globalThis),
            remoteIp: ip,
            secret: env.TURNSTILE_SECRET_KEY,
            token: turnstileToken ?? "",
          });
          if (!human.ok) {
            return json(
              {
                details: human.codes.join(", "),
                error: "Verification failed. Refresh the page and try again.",
              },
              { status: 403 }
            );
          }

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
          if (
            players.length > MAX_PLAYERS ||
            assignments.length > MAX_PLAYERS
          ) {
            return json(
              { error: `Parties are limited to ${MAX_PLAYERS} participants` },
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

          return json({
            adminCount: admins.length,
            message: `Successfully sent ${participants.length} participant emails and ${admins.length} admin emails`,
            participantCount: participants.length,
            success: true,
          });
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
