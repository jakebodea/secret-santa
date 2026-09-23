import { createFileRoute } from "@tanstack/react-router";
import { json } from "@tanstack/react-start";
import { jsx } from "react/jsx-runtime";
import { Resend } from "resend";

import AdminSummary from "../../emails/admin-summary";
import SecretSantaAssignment from "../../emails/secret-santa-assignment";
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

// Helper to get name with initial for compact representation
function getCompactName(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return name;
  }

  const [firstName] = parts;
  const lastInitial = parts.at(-1)?.[0] ?? "";
  return `${firstName} ${lastInitial}`;
}

// Helper to encode assignments for URL
function encodeAssignments(
  assignments: Assignment[],
  players: Player[],
  partyName?: string
): string {
  const playerMap = new Map(players.map((p) => [p.id, p]));

  const compactData = {
    assignments: assignments.map((a) => ({
      giver: getCompactName(playerMap.get(a.giverId)?.name || "Unknown"),
      receiver: getCompactName(playerMap.get(a.receiverId)?.name || "Unknown"),
    })),
    partyName,
  };

  return Buffer.from(JSON.stringify(compactData)).toString("base64");
}

export const Route = createFileRoute("/api/send-emails")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { players, assignments, partyName, bypassCooldown } =
            (await request.json()) as RequestBody;
          const baseUrl = new URL(request.url).origin;
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

          const apiKey = process.env.RESEND_API_KEY;
          if (!apiKey) {
            return json(
              { error: "Server configuration error: missing API key" },
              { status: 500 }
            );
          }

          const resend = new Resend(apiKey);

          // Create player lookup map
          const playerMap = new Map(players.map((p) => [p.id, p]));

          // Build the admin results URL with encoded data
          const encodedData = encodeAssignments(
            assignments,
            players,
            partyName
          );
          const resultsUrl = `${baseUrl}/results?data=${encodedData}`;

          // Prepare emails for participants
          const participantEmails = assignments.map((assignment) => {
            const giver = playerMap.get(assignment.giverId);
            const receiver = playerMap.get(assignment.receiverId);

            if (!giver || !receiver) {
              throw new Error("Invalid assignment: player not found");
            }

            return {
              from: "Secret Santa <noreply@supersimplesecretsanta.com>",
              react: jsx(SecretSantaAssignment, {
                giverName: giver.name,
                partyName,
                receiverName: receiver.name,
              }),
              subject: partyName
                ? `Hey ${giver.name}! You've been assigned for ${partyName}...`
                : `Hey ${giver.name}! You've been assigned for Secret Santa...`,
              to: giver.email,
            };
          });

          // Send participant emails in batch
          const participantResult = await resend.batch.send(participantEmails);

          if (participantResult.error) {
            console.error(
              "Failed to send participant emails:",
              participantResult.error
            );
            throw new Error(
              `Failed to send participant emails: ${participantResult.error.message}`
            );
          }

          // Send admin emails
          const admins = players.filter((p) => p.isAdmin);
          const adminEmails = admins.map((admin) => ({
            from: "Secret Santa <noreply@supersimplesecretsanta.com>",
            react: jsx(AdminSummary, {
              adminName: admin.name,
              partyName,
              resultsUrl,
            }),
            subject: partyName
              ? `Admin: ${partyName} Results`
              : "Admin: Secret Santa Results",
            to: admin.email,
          }));

          if (adminEmails.length > 0) {
            const adminResult = await resend.batch.send(adminEmails);

            if (adminResult.error) {
              console.error("Failed to send admin emails:", adminResult.error);
              // Continue anyway since participant emails were sent
            }
          }

          return json(
            {
              adminCount: adminEmails.length,
              message: `Successfully sent ${participantEmails.length} participant emails and ${adminEmails.length} admin emails`,
              participantCount: participantEmails.length,
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
