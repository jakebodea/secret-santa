import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

import {
  CARD,
  GLINT_MS,
  SACK_ART,
  SACK_MOUTH_Y,
  STAGE,
  cardLabel,
  cardRestingPose,
  cardTrack,
  drawSchedule,
  glintDelay,
  pickCardPlayers,
  sackTrack,
} from "../lib/draw-timeline";
import { EASE_IN_OUT, EASE_OUT } from "../lib/motion";
import type { Player } from "../lib/types";
import { SackBack, SackFront, SealedEnvelope } from "./draw-art";

const SECOND = 1000;

/** Stage geometry from the timeline, handed to Tailwind as CSS variables. */
const STAGE_VARS = {
  "--card-h": `${CARD.height}px`,
  "--card-w": `${CARD.width}px`,
  "--sack-left": `${STAGE.width / 2 - SACK_ART.mouthX}px`,
  // The sack wobbles and squashes from the middle of its base.
  "--sack-origin-y": `${(124 / SACK_ART.height) * 100}%`,
  "--sack-top": `${SACK_MOUTH_Y - SACK_ART.mouthY}px`,
  "--stage-h": `${STAGE.height}px`,
  "--stage-w": `${STAGE.width}px`,
} as React.CSSProperties;

const SPARKLE_COLORS = ["bg-gold", "bg-primary", "bg-gold", "bg-secondary"];
const SPARKLES = Array.from({ length: 14 }, (_, step) => {
  // Golden-angle spread looks random but renders the same every time.
  const angle = step * 2.39996;
  const distance = 60 + (step % 4) * 18;
  return {
    className: SPARKLE_COLORS[step % SPARKLE_COLORS.length],
    id: `sparkle-${step}`,
    spin: (step % 2 === 0 ? 1 : -1) * (180 + step * 20),
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance * 0.7 - 20,
  };
});

interface Message {
  at: number;
  text: string;
}

function messagesFor(cardCount: number): Message[] {
  const { exitAt, shakeAt } = drawSchedule(cardCount);
  return [
    { at: 0, text: "Into the sack..." },
    { at: shakeAt, text: "Giving it a shake..." },
    { at: exitAt, text: "Sealed & ready!" },
  ];
}

/** Steps through the messages on the draw's schedule. */
function useCurrentMessage(messages: Message[], skipToEnd: boolean) {
  const [index, setIndex] = useState(skipToEnd ? messages.length - 1 : 0);
  useEffect(() => {
    const next = messages[index + 1];
    if (skipToEnd || !next) {
      return;
    }
    const timer = setTimeout(() => {
      setIndex((current) => current + 1);
    }, next.at - messages[index].at);
    return () => {
      clearTimeout(timer);
    };
  }, [index, messages, skipToEnd]);
  return messages[index];
}

interface DrawCardProps {
  index: number;
  count: number;
  label: string;
  reduceMotion: boolean;
}

function DrawCard({ index, count, label, reduceMotion }: DrawCardProps) {
  const { total } = drawSchedule(count);
  const { values, ease, times } = cardTrack(index, count);
  const timing = { duration: total / SECOND, ease, times };
  const { envelope, ...pose } = values;
  const restingPose = cardRestingPose(index, count);

  return (
    <m.div
      className="absolute top-0 left-0 -mt-[calc(var(--card-h)/2)] -ml-[calc(var(--card-w)/2)] h-(--card-h) w-(--card-w)"
      initial={reduceMotion ? false : undefined}
      animate={reduceMotion ? restingPose : pose}
      transition={reduceMotion ? undefined : timing}
    >
      <div className="border-border text-foreground absolute inset-0 flex items-center justify-center rounded-md border bg-white px-2 font-serif text-sm shadow-sm">
        <span className="border-accent absolute inset-[3px] rounded-sm border" />
        <span className="truncate">{label}</span>
      </div>
      {/* The envelope sits on top of the name and only appears inside the sack */}
      <m.div
        className="absolute inset-0 overflow-hidden rounded-md shadow-md"
        initial={reduceMotion ? false : undefined}
        animate={{ opacity: reduceMotion ? 1 : envelope }}
        transition={reduceMotion ? undefined : timing}
      >
        <SealedEnvelope />
        {!reduceMotion && (
          <m.span
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/60 to-transparent"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{
              delay: glintDelay(index, count) / SECOND,
              duration: GLINT_MS / SECOND,
              ease: EASE_IN_OUT,
            }}
          />
        )}
      </m.div>
    </m.div>
  );
}

interface SackLayerProps {
  count: number;
  reduceMotion: boolean;
  children: React.ReactNode;
}

/** Back and front share one motion so the sack moves as a single piece. */
function SackLayer({ count, reduceMotion, children }: SackLayerProps) {
  const { total } = drawSchedule(count);
  const track = sackTrack(count);
  return (
    <m.div
      className="absolute top-(--sack-top) left-(--sack-left) origin-[50%_var(--sack-origin-y)]"
      animate={reduceMotion ? undefined : track.values}
      transition={{
        duration: total / SECOND,
        ease: track.ease,
        times: track.times,
      }}
    >
      {children}
    </m.div>
  );
}

function Sparkles({ count }: { count: number }) {
  const { glintAt } = drawSchedule(count);
  return SPARKLES.map((sparkle) => (
    <m.span
      key={sparkle.id}
      className={`absolute top-20 left-1/2 h-2.5 w-1.5 rounded-xs ${sparkle.className}`}
      initial={{ opacity: 0, rotate: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 1, 0],
        rotate: sparkle.spin,
        x: sparkle.x,
        y: [0, sparkle.y, sparkle.y + 40],
      }}
      transition={{
        delay: (glintAt - 150) / SECOND,
        duration: 0.9,
        ease: EASE_OUT,
      }}
    />
  ));
}

interface AssignmentAnimationProps {
  players: Player[];
}

/**
 * Plays while assignments are drawn: name cards drop into Santa's sack, it
 * shakes, and sealed envelopes come back out. Shows names only, never pairs.
 */
export function AssignmentAnimation({ players }: AssignmentAnimationProps) {
  const reduceMotion = useReducedMotion() ?? false;
  const cards = useMemo(() => pickCardPlayers(players), [players]);
  const messages = useMemo(() => messagesFor(cards.length), [cards.length]);
  const message = useCurrentMessage(messages, reduceMotion);

  return (
    <m.div
      className="bg-background flex min-h-dvh items-center justify-center overflow-hidden px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div className="space-y-4 text-center sm:space-y-12">
        <div
          className="relative mx-auto h-(--stage-h) w-(--stage-w) sm:scale-125"
          style={STAGE_VARS}
          aria-hidden
        >
          <SackLayer count={cards.length} reduceMotion={reduceMotion}>
            <SackBack />
          </SackLayer>
          {cards.map((player, index) => (
            <DrawCard
              key={player.id}
              index={index}
              count={cards.length}
              label={cardLabel(player.name)}
              reduceMotion={reduceMotion}
            />
          ))}
          <SackLayer count={cards.length} reduceMotion={reduceMotion}>
            <SackFront />
          </SackLayer>
          {!reduceMotion && <Sparkles count={cards.length} />}
        </div>

        {/* Both messages share one grid cell so they crossfade in place */}
        <div className="grid" aria-live="polite">
          <AnimatePresence initial={false}>
            <m.h2
              key={message.text}
              className="text-foreground text-3xl font-normal tracking-wide [grid-area:1/1] md:text-4xl"
              initial={{ filter: "blur(4px)", opacity: 0, y: 10 }}
              animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
              exit={{ filter: "blur(4px)", opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              {message.text}
            </m.h2>
          </AnimatePresence>
        </div>
      </div>
    </m.div>
  );
}
