/**
 * Choreography for the "drawing names" screen: name cards drop into Santa's
 * sack, the sack shakes, and sealed envelopes rise back out to the spots the
 * cards started from. Everything is plain numbers so the timing is testable
 * and the component only maps tracks onto motion props.
 */

type CubicBezier = readonly [number, number, number, number];

const LINEAR: CubicBezier = [0, 0, 1, 1];
const EASE_OUT: CubicBezier = [0.23, 1, 0.32, 1];
const EASE_IN: CubicBezier = [0.55, 0, 1, 0.45];
const EASE_IN_OUT: CubicBezier = [0.77, 0, 0.175, 1];
/** Overshoots slightly, so cards land with a small settle. */
const SPRING_OUT: CubicBezier = [0.34, 1.45, 0.64, 1];
const POP_IN: CubicBezier = [0.34, 1.56, 0.64, 1];

export const STAGE = { height: 300, width: 320 } as const;
export const CARD = { height: 50, width: 72 } as const;
/** Six cards fill two rows; bigger groups show a random six. */
export const MAX_CARDS = 6;

const CENTER_X = STAGE.width / 2;
/** The sack art is 160×130; the middle of its opening sits at (80, 22). */
export const SACK_ART = { height: 130, mouthX: 80, mouthY: 22, width: 160 };
/** Where the middle of the sack's opening sits on the stage. */
export const SACK_MOUTH_Y = 180;
/** Deep enough below the mouth that the front of the sack hides the card. */
const INSIDE_Y = SACK_MOUTH_Y + 36;
const INSIDE_SCALE = 0.75;

const COLUMNS = 3;
const COLUMN_GAP = 86;
const ROW_GAP = 66;
const TOP_ROW_Y = 44;
const SINGLE_ROW_Y = 77;
const TILTS = [-4, 2, -3, 3, -2, 4] as const;

const APPEAR_STAGGER = 55;
const APPEAR_DURATION = 420;
const DROP_START = 450;
const DROP_STAGGER = 100;
const DROP_DURATION = 480;
const SHAKE_DURATION = 560;
const EXIT_GAP = 60;
const EXIT_STAGGER = 80;
const EXIT_DURATION = 780;
const GLINT_GAP = 50;
const GLINT_STAGGER = 40;
const GLINT_DURATION = 500;
const FINAL_HOLD = 200;
const SETTLE_DURATION = 260;

export interface DrawSchedule {
  shakeAt: number;
  exitAt: number;
  glintAt: number;
  /** When the screen hands over to the results. */
  total: number;
}

export function drawSchedule(cardCount: number): DrawSchedule {
  const lastIndex = cardCount - 1;
  const shakeAt = DROP_START + lastIndex * DROP_STAGGER + DROP_DURATION + 20;
  const exitAt = shakeAt + SHAKE_DURATION + EXIT_GAP;
  const glintAt = exitAt + lastIndex * EXIT_STAGGER + EXIT_DURATION + GLINT_GAP;
  const total =
    glintAt + lastIndex * GLINT_STAGGER + GLINT_DURATION + FINAL_HOLD;
  return { exitAt, glintAt, shakeAt, total };
}

/** How long the draw plays before the results show. */
export function drawDurationMs(playerCount: number) {
  return drawSchedule(Math.min(playerCount, MAX_CARDS)).total;
}

export interface Track<Key extends string> {
  values: Record<Key, number[]>;
  /** 0–1 progress through the whole draw, one per keyframe. */
  times: number[];
  /** Easing into each keyframe after the first. */
  ease: CubicBezier[];
}

type Frame<Key extends string> = Record<Key, number> & {
  at: number;
  ease?: CubicBezier;
};

function toTrack<Key extends string>(
  keys: readonly Key[],
  frames: Frame<Key>[],
  total: number
): Track<Key> {
  const poses: Record<Key, number>[] = frames;
  const values = Object.fromEntries(
    keys.map((key) => [key, poses.map((pose) => pose[key])])
  ) as Record<Key, number[]>;
  return {
    ease: frames.slice(1).map((frame) => frame.ease ?? LINEAR),
    times: frames.map((frame) => frame.at / total),
    values,
  };
}

interface CardPose {
  x: number;
  y: number;
  rotate: number;
}

/** Cards sit in rows of three, centred, on the stage above the sack. */
export function cardSlot(index: number, count: number): CardPose {
  const rows = Math.ceil(count / COLUMNS);
  const row = Math.floor(index / COLUMNS);
  const inRow = Math.min(COLUMNS, count - row * COLUMNS);
  const column = index % COLUMNS;
  return {
    rotate: TILTS[index % TILTS.length],
    x: CENTER_X + (column - (inRow - 1) / 2) * COLUMN_GAP,
    y: rows === 1 ? SINGLE_ROW_Y : TOP_ROW_Y + row * ROW_GAP,
  };
}

const CARD_KEYS = ["x", "y", "rotate", "envelope", "scale", "opacity"] as const;
export type CardKey = (typeof CARD_KEYS)[number];

/**
 * One card's whole life: pop in face up, hop into the sack, stay hidden while
 * the sack shakes, then rise out as a sealed envelope and spring back to its
 * slot. `envelope` is how much the envelope covers the name: 0 or 1 whenever
 * the card can be seen.
 */
export function cardTrack(index: number, count: number): Track<CardKey> {
  const { exitAt, total } = drawSchedule(count);
  const slot = cardSlot(index, count);
  const appearAt = index * APPEAR_STAGGER;
  const dropAt = DROP_START + index * DROP_STAGGER;
  const riseAt = exitAt + index * EXIT_STAGGER;

  const faceUp = { ...slot, opacity: 1, envelope: 0, scale: 1 };
  const hidden = { ...faceUp, at: 0, opacity: 0, scale: 0.7, y: slot.y + 10 };
  const inside = {
    rotate: 0,
    scale: INSIDE_SCALE,
    x: CENTER_X,
    y: INSIDE_Y,
  };

  const frames: Frame<CardKey>[] = [
    hidden,
    ...(appearAt > 0 ? [{ ...hidden, at: appearAt }] : []),
    { ...faceUp, at: appearAt + APPEAR_DURATION, ease: POP_IN },
    { ...faceUp, at: dropAt },
    // Small lift before the hop reads as anticipation.
    {
      ...faceUp,
      at: dropAt + DROP_DURATION * 0.22,
      scale: 1.04,
      y: slot.y - 10,
    },
    {
      ...faceUp,
      at: dropAt + DROP_DURATION * 0.6,
      ease: EASE_IN_OUT,
      rotate: 0,
      scale: 0.95,
      x: CENTER_X,
      y: SACK_MOUTH_Y - CARD.height * 0.9,
    },
    {
      ...inside,
      at: dropAt + DROP_DURATION * 0.96,
      ease: EASE_IN,
      opacity: 1,
      envelope: 0,
    },
    { ...inside, at: dropAt + DROP_DURATION, opacity: 0, envelope: 0 },
    // Swapped for the envelope while out of sight, so a name never comes back out.
    { ...inside, at: riseAt, opacity: 0, envelope: 1 },
    { ...inside, at: riseAt + EXIT_DURATION * 0.04, opacity: 1, envelope: 1 },
    {
      at: riseAt + EXIT_DURATION * 0.36,
      ease: EASE_OUT,
      opacity: 1,
      rotate: slot.rotate / 2,
      envelope: 1,
      scale: 1,
      x: CENTER_X,
      y: SACK_MOUTH_Y - 50,
    },
    {
      ...slot,
      at: riseAt + EXIT_DURATION,
      ease: SPRING_OUT,
      opacity: 1,
      envelope: 1,
      scale: 1,
    },
    { ...slot, at: total, opacity: 1, envelope: 1, scale: 1 },
  ];
  return toTrack(CARD_KEYS, frames, total);
}

/** Where every card ends up (as an envelope), for reduced motion. */
export function cardRestingPose(index: number, count: number) {
  return { ...cardSlot(index, count), opacity: 1, scale: 1 };
}

const SACK_KEYS = ["rotate", "y", "scaleX", "scaleY"] as const;
export type SackKey = (typeof SACK_KEYS)[number];

const SHAKE_ANGLES = [0, -7, 6, -5, 4, -2, 0] as const;
const REST = { rotate: 0, scaleX: 1, scaleY: 1, y: 0 };
const SQUASH = { rotate: 0, scaleX: 1.04, scaleY: 0.93, y: 0 };
const SQUASH_TIME = 35;

/** The sack wobbles once everything is in, then bobs as each card leaves. */
export function sackTrack(count: number): Track<SackKey> {
  const { exitAt, shakeAt, total } = drawSchedule(count);
  const shakeStep = SHAKE_DURATION / (SHAKE_ANGLES.length - 1);
  const frames: Frame<SackKey>[] = [
    { ...REST, at: 0 },
    ...SHAKE_ANGLES.map((angle, step) => ({
      ...REST,
      at: shakeAt + step * shakeStep,
      ease: EASE_IN_OUT,
      rotate: angle,
      y: step % 2 === 1 ? -3 : 0,
    })),
  ];
  for (let index = 0; index < count; index += 1) {
    const riseAt = exitAt + index * EXIT_STAGGER;
    const nextAt =
      index === count - 1 ? riseAt + SETTLE_DURATION : riseAt + EXIT_STAGGER;
    frames.push(
      { ...REST, at: riseAt },
      { ...SQUASH, at: riseAt + SQUASH_TIME, ease: EASE_OUT },
      { ...REST, at: nextAt - 1, ease: EASE_OUT }
    );
  }
  frames.push({ ...REST, at: total });
  return toTrack(SACK_KEYS, frames, total);
}

export function glintDelay(index: number, count: number) {
  return drawSchedule(count).glintAt + index * GLINT_STAGGER;
}

export const GLINT_MS = GLINT_DURATION;

const FIRST_NAME = /\S+/u;

/** First names only, so they fit on a card. */
export function cardLabel(name: string) {
  return FIRST_NAME.exec(name)?.[0] ?? name;
}

/** Up to six players, spread evenly through the list when there are more. */
export function pickCardPlayers<T>(players: readonly T[]): T[] {
  if (players.length <= MAX_CARDS) {
    return [...players];
  }
  const step = players.length / MAX_CARDS;
  return Array.from(
    { length: MAX_CARDS },
    (_, slot) => players[Math.floor(slot * step)]
  );
}
