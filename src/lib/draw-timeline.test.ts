import { describe, expect, it } from "vitest";

import {
  MAX_CARDS,
  STAGE,
  cardLabel,
  cardSlot,
  cardTrack,
  drawDurationMs,
  pickCardPlayers,
  sackTrack,
} from "./draw-timeline";

const isIncreasing = (times: number[]) =>
  times.every((time, index) => index === 0 || time > times[index - 1]);

describe(cardTrack, () => {
  it.each([3, 4, 5, 6])(
    "builds valid keyframes for every card when there are %i",
    (count) => {
      for (let index = 0; index < count; index += 1) {
        const track = cardTrack(index, count);
        expect(track.times[0]).toBe(0);
        expect(track.times.at(-1)).toBe(1);
        expect(isIncreasing(track.times)).toBeTruthy();
        expect(track.ease).toHaveLength(track.times.length - 1);
        for (const values of Object.values(track.values)) {
          expect(values).toHaveLength(track.times.length);
        }
      }
    }
  );

  it("ends each card face down in the slot it started from", () => {
    const track = cardTrack(4, 6);
    const slot = cardSlot(4, 6);
    expect(track.values.x.at(-1)).toBe(slot.x);
    expect(track.values.y.at(-1)).toBe(slot.y);
    expect(track.values.envelope.at(-1)).toBe(1);
    expect(track.values.opacity.at(-1)).toBe(1);
  });
});

describe("card faces", () => {
  it("only swaps name for envelope while the card is hidden", () => {
    const { envelope, opacity } = cardTrack(2, 6).values;
    const firstEnvelope = envelope.indexOf(1);
    // Fully hidden on both sides of the swap.
    expect(opacity[firstEnvelope - 1]).toBe(0);
    expect(opacity[firstEnvelope]).toBe(0);
    const visibleFaces = envelope.filter((_, frame) => opacity[frame] > 0);
    expect(visibleFaces.every((face) => face === 0 || face === 1)).toBeTruthy();
  });
});

describe(sackTrack, () => {
  it.each([3, 6])("keeps keyframes in order for %i cards", (count) => {
    const track = sackTrack(count);
    expect(isIncreasing(track.times)).toBeTruthy();
    expect(track.times.at(-1)).toBe(1);
  });
});

describe(cardSlot, () => {
  it("keeps every card on the stage", () => {
    for (let index = 0; index < MAX_CARDS; index += 1) {
      const { x } = cardSlot(index, MAX_CARDS);
      expect(x).toBeGreaterThan(0);
      expect(x).toBeLessThan(STAGE.width);
    }
  });
});

describe(pickCardPlayers, () => {
  it("keeps small groups whole and in order", () => {
    expect(pickCardPlayers(["a", "b", "c"])).toStrictEqual(["a", "b", "c"]);
  });

  it("spreads six picks across a big group", () => {
    const players = Array.from({ length: 20 }, (_, index) => index);
    expect(pickCardPlayers(players)).toStrictEqual([0, 3, 6, 10, 13, 16]);
  });
});

describe(drawDurationMs, () => {
  it("caps the length of the draw for big groups", () => {
    expect(drawDurationMs(40)).toBe(drawDurationMs(MAX_CARDS));
  });
});

describe(cardLabel, () => {
  it("uses the first name", () => {
    expect(cardLabel("  Mary Jane Watson")).toBe("Mary");
  });
});
