/**
 * Who draws names and who can be emailed. Every screen, the solver, the mail
 * planner and the WebMCP tools read these instead of the raw fields.
 */
import type { Player } from "./types";

/** At least this many people must draw names. */
export const MIN_DRAWING_PLAYERS = 3;

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;

export const hasEmail = (
  player: Player
): player is Player & { email: string } => Boolean(player.email?.trim());

export const drawsNames = (player: Player): boolean => !player.sitsOut;

export const drawingPlayers = (players: readonly Player[]): Player[] =>
  players.filter(drawsNames);

/** Givers in the draw who have no inbox and need a reveal card. */
export const handDeliveryPlayers = (players: readonly Player[]): Player[] =>
  players.filter((player) => drawsNames(player) && !hasEmail(player));

/** "" for blank input; a lowercased address otherwise. */
export const normalizeEmail = (value: string): string =>
  value.trim().toLowerCase();
