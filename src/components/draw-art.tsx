/**
 * Flat illustrations for the drawing-names screen, drawn in the palette and
 * style of public/santa.svg: solid fills, gold trim and accents, and
 * shading as translucent ink rather than gradients.
 */

import { SACK_ART } from "../lib/draw-timeline";

const RED = "#c83532";
const CREAM = "#e8d4a0";
const GOLD = "#c4a862";
const INK = "#2f3034";

const STAR_POINTS =
  "M58 77.5L60.4 83.2 66.5 83.6 61.8 87.5 63.3 93.4 58 90.2 52.7 93.4 54.2 87.5 49.5 83.6 55.6 83.2Z";

/** The rim and dark opening, drawn behind the cards. */
export function SackBack() {
  return (
    <svg
      width={SACK_ART.width}
      height={SACK_ART.height}
      viewBox="0 0 160 130"
      aria-hidden
    >
      <ellipse cx="80" cy="22" rx="52" ry="13" fill={GOLD} />
      <ellipse cx="80" cy="22" rx="43" ry="9" fill={RED} />
      <ellipse cx="80" cy="22" rx="43" ry="9" fill={INK} opacity="0.55" />
    </svg>
  );
}

/** The body and front of the trim, drawn over the cards to hide them inside. */
export function SackFront() {
  return (
    <svg
      width={SACK_ART.width}
      height={SACK_ART.height}
      viewBox="0 0 160 130"
      aria-hidden
    >
      <path
        d="M37 22A43 9 0 0 0 123 22C140 44 160 76 150 100Q141 124 80 124Q19 124 10 100C0 76 20 44 37 22Z"
        fill={RED}
      />
      <path
        d="M123 22C140 44 160 76 150 100Q141 124 80 124Q128 116 137 92C144 68 132 42 118 28Z"
        fill={INK}
        opacity="0.25"
      />
      <g
        fill="none"
        stroke={INK}
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.2"
      >
        <path d="M54 44Q46 74 52 106" />
        <path d="M106 70Q112 88 108 106" />
      </g>
      <circle cx="58" cy="86" r="13" fill={CREAM} />
      <path d={STAR_POINTS} fill={GOLD} />
      <path
        d="M28 22L28 28A52 13 0 0 0 132 28L132 22 123 22A43 9 0 0 1 37 22Z"
        fill={GOLD}
      />
      <path
        d="M30 30A52 13 0 0 0 130 30"
        fill="none"
        stroke={INK}
        strokeWidth="3"
        opacity="0.15"
      />
      <g fill="none" stroke={GOLD} strokeWidth="3.5" strokeLinecap="round">
        <path d="M18 50Q80 66 142 50" />
        <ellipse cx="96" cy="53" rx="8" ry="4.5" transform="rotate(20 96 53)" />
        <ellipse
          cx="112"
          cy="53"
          rx="8"
          ry="4.5"
          transform="rotate(-20 112 53)"
        />
        <path d="M104 57Q100 64 99 72M104 57Q110 63 112 70" />
      </g>
      <circle cx="104" cy="56.5" r="4" fill={GOLD} />
    </svg>
  );
}

const PAPER = "#fffaf1";
const FLAP_EDGE = "#e6d3ab";
const RED_DEEP = "#a32a27";

const SEAL = { lobes: 9, radius: 8.8, ripple: 0.75, x: 36, y: 30 };

/** Closed path through points around the seal's centre. */
function sealPath(points: number, radiusAt: (step: number) => number) {
  const corners = Array.from({ length: points }, (_, step) => {
    const angle = (step / points) * Math.PI * 2 - Math.PI / 2;
    const radius = radiusAt(step);
    const x = SEAL.x + Math.cos(angle) * radius;
    const y = SEAL.y + Math.sin(angle) * radius;
    return `${x.toFixed(2)} ${y.toFixed(2)}`;
  });
  return `M${corners.join("L")}Z`;
}

/** Wax blob: a circle with a soft ripple round the edge. */
const SEAL_EDGE = sealPath(
  72,
  (step) =>
    SEAL.radius + SEAL.ripple * Math.cos((step / 72) * Math.PI * 2 * SEAL.lobes)
);
const SEAL_STAR = sealPath(10, (step) => (step % 2 === 0 ? 3.7 : 1.6));

/** Back of a drawn card: warm paper closed with a red wax seal. */
export function SealedEnvelope() {
  return (
    <svg viewBox="0 0 72 50" className="absolute inset-0 size-full" aria-hidden>
      <rect width="72" height="50" fill={PAPER} />
      <path
        d="M0 0L36 31 72 0"
        fill="none"
        stroke={FLAP_EDGE}
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <path d={SEAL_EDGE} fill={RED} />
      <circle
        cx={SEAL.x}
        cy={SEAL.y}
        r="6"
        fill="none"
        stroke={RED_DEEP}
        strokeWidth="1.1"
      />
      <path d={SEAL_STAR} fill={CREAM} />
    </svg>
  );
}
