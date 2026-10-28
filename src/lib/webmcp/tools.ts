import type { Constraint, Player } from "../types";
import { toTitleCase } from "../utils";

export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations?: {
    readOnlyHint?: boolean;
    consequentialHint?: boolean;
    untrustedContentHint?: boolean;
  };
  execute: (input: Record<string, unknown>) => unknown;
}

export interface ModelContext {
  registerTool: (
    tool: WebMCPTool,
    options: { signal: AbortSignal }
  ) => void | Promise<void>;
}

export const emptySchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export const exchangeSchema = {
  type: "object",
  additionalProperties: false,
  required: ["participants"],
  properties: {
    partyName: { type: "string", maxLength: 200 },
    participants: {
      type: "array",
      minItems: 3,
      maxItems: 100,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "email"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          isAdmin: {
            type: "boolean",
            description:
              "Organizer receives the full assignment summary. Defaults to the first participant if none selected.",
          },
        },
      },
    },
    exclusions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["giver", "receiver"],
        properties: {
          giver: { type: "string", description: "Exact participant name" },
          receiver: { type: "string", description: "Exact participant name" },
          bidirectional: { type: "boolean", default: true },
        },
      },
    },
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

/** Validate the entire input before changing any draft state. */
export function parseExchange(input: Record<string, unknown>): {
  partyName: string;
  players: Player[];
  constraints: Constraint[];
} {
  if (
    !Array.isArray(input.participants) ||
    input.participants.length < 3 ||
    input.participants.length > 100
  ) {
    throw new Error("Provide 3–100 participants.");
  }
  if (
    input.partyName !== undefined &&
    (typeof input.partyName !== "string" || input.partyName.length > 200)
  ) {
    throw new Error("Party name must be a string of at most 200 characters.");
  }
  const names = new Set<string>();
  const players = input.participants.map((value: unknown): Player => {
    if (
      !isRecord(value) ||
      typeof value.name !== "string" ||
      !value.name.trim() ||
      value.name.length > 200 ||
      typeof value.email !== "string" ||
      !EMAIL.test(value.email.trim()) ||
      value.email.length > 254 ||
      (value.isAdmin !== undefined && typeof value.isAdmin !== "boolean")
    ) {
      throw new Error(
        "Each participant needs a name and valid email; isAdmin must be a boolean."
      );
    }
    const name = toTitleCase(value.name.trim());
    if (names.has(name.toLowerCase())) {
      throw new Error(
        `Duplicate participant name: ${name}. Use distinct names.`
      );
    }
    names.add(name.toLowerCase());
    return {
      id: crypto.randomUUID(),
      name,
      email: value.email.trim().toLowerCase(),
      isAdmin: value.isAdmin === true,
    };
  });
  if (!players.some((player) => player.isAdmin)) {
    players[0].isAdmin = true;
  }
  if (input.exclusions !== undefined && !Array.isArray(input.exclusions)) {
    throw new Error("Exclusions must be an array.");
  }
  const constraints = ((input.exclusions ?? []) as unknown[]).map(
    (value): Constraint => {
      if (
        !isRecord(value) ||
        typeof value.giver !== "string" ||
        typeof value.receiver !== "string" ||
        (value.bidirectional !== undefined &&
          typeof value.bidirectional !== "boolean")
      ) {
        throw new Error(
          "Each exclusion needs giver and receiver names and an optional boolean bidirectional."
        );
      }
      const giver = players.find(
        (player) =>
          player.name.toLowerCase() === String(value.giver).trim().toLowerCase()
      );
      const receiver = players.find(
        (player) =>
          player.name.toLowerCase() ===
          String(value.receiver).trim().toLowerCase()
      );
      if (!giver || !receiver || giver.id === receiver.id) {
        throw new Error(
          "Exclusions must reference two different participants by name."
        );
      }
      return {
        id: crypto.randomUUID(),
        giverId: giver.id,
        receiverId: receiver.id,
        bidirectional: value.bidirectional !== false,
      };
    }
  );
  return {
    partyName: toTitleCase((input.partyName ?? "").toString().trim()),
    players,
    constraints,
  };
}
