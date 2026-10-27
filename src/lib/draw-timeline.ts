/**
 * Choreography for the "drawing names" screen: name cards are tossed into
 * Santa's sack, the sack shakes, and sealed envelopes rise back out to the spots the
 * cards started from. Everything is plain numbers so the timing is testable
 * and the component only maps tracks onto motion props.
 */

type CubicBezier = readonly [number, number, number, number];

const LINEAR: CubicBezier = [0, 0, 1, 1];
const EASE_OUT: CubicBezier = [0.23, 1, 0.32, 1];
const EASE_IN_OUT: CubicBezier = [0.77, 0, 0.175, 1];

export const STAGE = { height: 300, width: 320 } as const;
export const CARD = { height: 50, width: 72 } as const;
/** Six cards fill two rows; bigger groups show six spread through the list. */
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

const APPEAR_STAGGER = 70;
const APPEAR_DURATION = 520;

const DROP_START = 950;
const DROP_STAGGER = 130;
/** A small press before each toss reads as the card being picked up. */
const PRESS_DURATION = 110;
const TOSS_DURATION = 480;
/** How far above the higher end of the toss the arc peaks. */
const TOSS_HEIGHT = 34;
/** Room for the card to carry on into the sack at the speed it arrived. */
const ENTRY_MAX = 120;
const DROP_DURATION = PRESS_DURATION + TOSS_DURATION + ENTRY_MAX;
/** Straight lines between this many points along each curved path. */
const PATH_STEPS = 8;

const SHAKE_DELAY = 160;
const SHAKE_DURATION = 760;
const EXIT_GAP = 80;

const EXIT_STAGGER = 120;
const FADE_IN = 30;
const RISE_DURATION = 270;
/** Height above the mouth an envelope pops to before gliding home. */
const RISE_HEIGHT = 64;
const GLIDE_DURATION = 560;
const GLIDE_LIFT = 30;
const SETTLE_DURATION = 160;
const EXIT_DURATION =
  FADE_IN + RISE_DURATION + GLIDE_DURATION + SETTLE_DURATION;

const RIPPLE_DELAY = 120;
const RIPPLE_STAGGER = 60;
/** Time to see the sealed envelopes before the results. */
const FINAL_HOLD = 1100;

export interface DrawSchedule {
  shakeAt: number;
  exitAt: number;
  /** When the last envelope has landed. */
  landedAt: number;
  /** When the screen hands over to the results. */
  total: number;
}

export function drawSchedule(cardCount: number): DrawSchedule {
  const lastIndex = cardCount - 1;
  const lastDropEnd = DROP_START + lastIndex * DROP_STAGGER + DROP_DURATION;
  const shakeAt = lastDropEnd + SHAKE_DELAY;
  const exitAt = shakeAt + SHAKE_DURATION + EXIT_GAP;
  const landedAt = exitAt + lastIndex * EXIT_STAGGER + EXIT_DURATION;
  const total = landedAt + FINAL_HOLD;
  return { exitAt, landedAt, shakeAt, total };
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

interface Point {
  x: number;
  y: number;
}

/** Point `t` of the way along a quadratic curve from `from` to `to`. */
function along(from: Point, control: Point, to: Point, t: number): Point {
  const a = (1 - t) ** 2;
  const b = 2 * t * (1 - t);
  const c = t ** 2;
  return {
    x: a * from.x + b * control.x + c * to.x,
    y: a * from.y + b * control.y + c * to.y,
  };
}

/** Control point that makes the curve's midpoint pass through `peak`. */
function controlThrough(from: Point, peak: Point, to: Point): Point {
  return {
    x: 2 * peak.x - (from.x + to.x) / 2,
    y: 2 * peak.y - (from.y + to.y) / 2,
  };
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
}

const CARD_KEYS = ["x", "y", "rotate", "envelope", "scale", "opacity"] as const;
export type CardKey = (typeof CARD_KEYS)[number];
type CardFrame = Frame<CardKey>;

/**
 * The toss into the sack. Walking a quadratic curve at an even pace is how a
 * thrown object really moves (steady sideways, accelerating down), so the
 * card arcs up, tips toward the sack, and drops in.
 */
function tossFrames(
  slot: CardPose,
  startAt: number,
  lean: number
): CardFrame[] {
  const from = { x: slot.x, y: slot.y + 3 };
  const to = { x: CENTER_X, y: SACK_MOUTH_Y - 6 };
  const peak = {
    x: (from.x + to.x) / 2,
    y: Math.min(from.y, to.y) - TOSS_HEIGHT,
  };
  const control = controlThrough(from, peak, to);
  const frames: CardFrame[] = Array.from({ length: PATH_STEPS }, (_, step) => {
    const t = (step + 1) / PATH_STEPS;
    return {
      ...along(from, control, to, t),
      at: startAt + TOSS_DURATION * t,
      envelope: 0,
      opacity: 1,
      rotate: slot.rotate * (1 - t) + lean * Math.sin(Math.PI * t),
      // Grows a touch at the top of the arc, shrinks as it falls away.
      scale: 0.97 + 0.06 * Math.sin(Math.PI * t) - 0.07 * t,
    };
  });
  // Keep falling at the speed it reached so it doesn't stall at the mouth.
  const speed = (2 * (to.y - control.y)) / TOSS_DURATION;
  const entry = Math.min(ENTRY_MAX, Math.max(40, (INSIDE_Y - to.y) / speed));
  const enterAt = startAt + TOSS_DURATION + entry;
  const inside = { rotate: 0, scale: INSIDE_SCALE, x: CENTER_X, y: INSIDE_Y };
  frames.push(
    { ...inside, at: enterAt, envelope: 0, opacity: 1 },
    { ...inside, at: enterAt + 1, envelope: 0, opacity: 0 }
  );
  return frames;
}

/** Pops up out of the sack, then glides home in an eased arc and settles. */
function exitFrames(slot: CardPose, riseAt: number, lean: number): CardFrame[] {
  const sealed = { envelope: 1, opacity: 1 };
  const popped = { x: CENTER_X, y: SACK_MOUTH_Y - RISE_HEIGHT };
  const glideAt = riseAt + FADE_IN + RISE_DURATION;
  const peak = {
    x: (popped.x + slot.x) / 2,
    y: Math.min(popped.y, slot.y) - GLIDE_LIFT,
  };
  const control = controlThrough(popped, peak, slot);
  const inside = { rotate: 0, scale: INSIDE_SCALE, x: CENTER_X, y: INSIDE_Y };
  const frames: CardFrame[] = [
    // Swapped for the envelope while out of sight, so a name never comes back out.
    { ...inside, at: riseAt, envelope: 1, opacity: 0 },
    { ...inside, ...sealed, at: riseAt + FADE_IN },
    {
      ...popped,
      ...sealed,
      at: glideAt,
      ease: EASE_OUT,
      rotate: -lean / 3,
      scale: 1.04,
    },
  ];
  for (let step = 1; step <= PATH_STEPS; step += 1) {
    const progress = easeInOutCubic(step / PATH_STEPS);
    frames.push({
      ...along(popped, control, slot, progress),
      ...sealed,
      at: glideAt + (GLIDE_DURATION * step) / PATH_STEPS,
      rotate: (-lean / 3) * (1 - progress) + slot.rotate * progress,
      // Lands with a soft press, then settles to full size.
      scale: 1.04 - 0.07 * progress,
    });
  }
  frames.push({
    ...slot,
    ...sealed,
    at: glideAt + GLIDE_DURATION + SETTLE_DURATION,
    ease: EASE_OUT,
    scale: 1,
  });
  return frames;
}

/**
 * One card's whole life: fade up face up, get tossed into the sack, stay
 * hidden while the sack shakes, then pop out as a sealed envelope and glide
 * back to its slot. `envelope` is how much the envelope covers the name: 0 or
 * 1 whenever the card can be seen.
 */
export function cardTrack(index: number, count: number): Track<CardKey> {
  const { exitAt, landedAt, total } = drawSchedule(count);
  const slot = cardSlot(index, count);
  const appearAt = index * APPEAR_STAGGER;
  const dropAt = DROP_START + index * DROP_STAGGER;
  const riseAt = exitAt + index * EXIT_STAGGER;
  const rippleAt = landedAt + RIPPLE_DELAY + index * RIPPLE_STAGGER;
  // Lean toward the sack while flying; the middle column alternates.
  const side = Math.sign(CENTER_X - slot.x) || (index % 2 === 0 ? -1 : 1);
  const lean = side * 12;

  const faceUp = { ...slot, envelope: 0, opacity: 1, scale: 1 };
  const hidden = { ...faceUp, at: 0, opacity: 0, scale: 0.94, y: slot.y + 12 };
  const resting = { ...slot, envelope: 1, opacity: 1, scale: 1 };

  const frames: CardFrame[] = [
    hidden,
    ...(appearAt > 0 ? [{ ...hidden, at: appearAt }] : []),
    { ...faceUp, at: appearAt + APPEAR_DURATION, ease: EASE_OUT },
    { ...faceUp, at: dropAt },
    {
      ...faceUp,
      at: dropAt + PRESS_DURATION,
      ease: EASE_OUT,
      scale: 0.97,
      y: slot.y + 3,
    },
    ...tossFrames(slot, dropAt + PRESS_DURATION, lean),
    ...exitFrames(slot, riseAt, lean),
    // Once all are home, a ripple runs across the envelopes.
    { ...resting, at: rippleAt },
    { ...resting, at: rippleAt + 160, ease: EASE_OUT, scale: 1.035 },
    { ...resting, at: rippleAt + 420, ease: EASE_IN_OUT },
    { ...resting, at: total },
  ];
  return toTrack(CARD_KEYS, frames, total);
}

/** Where every card ends up (as an envelope), for reduced motion. */
export function cardRestingPose(index: number, count: number) {
  return { ...cardSlot(index, count), opacity: 1, scale: 1 };
}

const SACK_KEYS = ["rotate", "y", "scaleX", "scaleY"] as const;
export type SackKey = (typeof SACK_KEYS)[number];
type SackFrame = Frame<SackKey>;

const REST = { rotate: 0, scaleX: 1, scaleY: 1, y: 0 };
const WIND_UP = { ...REST, scaleX: 1.05, scaleY: 0.92 };
const WIND_UP_TIME = 90;
const SHAKE_ANGLES = [-8, 7, -5, 3, -1.5, 0] as const;
const CATCH = { ...REST, scaleX: 1.03, scaleY: 0.95, y: 1 };
const RELEASE = { ...REST, scaleX: 1.04, scaleY: 0.93 };
const PULSE_PEAK = 45;
const LAST_PULSE = 220;

/** A quick squash and recover at each moment, never overlapping the next. */
function pulses(starts: number[], squash: typeof REST, gap: number) {
  return starts.flatMap((at, index): SackFrame[] => {
    const settle = index === starts.length - 1 ? LAST_PULSE : gap - 1;
    return [
      { ...REST, at },
      { ...squash, at: at + PULSE_PEAK, ease: EASE_OUT },
      { ...REST, at: at + settle, ease: EASE_OUT },
    ];
  });
}

/**
 * The sack gulps as each card lands in it, winds up and wobbles once
 * everything is in, then bobs as each envelope leaves.
 */
export function sackTrack(count: number): Track<SackKey> {
  const { exitAt, shakeAt, total } = drawSchedule(count);
  const indexes = Array.from({ length: count }, (_, index) => index);
  const catches = indexes.map(
    (index) =>
      DROP_START + index * DROP_STAGGER + PRESS_DURATION + TOSS_DURATION
  );
  const releases = indexes.map((index) => exitAt + index * EXIT_STAGGER);
  const wobbleStep = (SHAKE_DURATION - WIND_UP_TIME) / SHAKE_ANGLES.length;
  const frames: SackFrame[] = [
    { ...REST, at: 0 },
    ...pulses(catches, CATCH, DROP_STAGGER),
    { ...REST, at: shakeAt },
    { ...WIND_UP, at: shakeAt + WIND_UP_TIME, ease: EASE_OUT },
    ...SHAKE_ANGLES.map((angle, step) => ({
      ...REST,
      at: shakeAt + WIND_UP_TIME + (step + 1) * wobbleStep,
      ease: EASE_IN_OUT,
      rotate: angle,
      y: step % 2 === 0 ? -4 : 0,
    })),
    ...pulses(releases, RELEASE, EXIT_STAGGER),
    { ...REST, at: total },
  ];
  return toTrack(SACK_KEYS, frames, total);
}

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
