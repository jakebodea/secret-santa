import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { Assignment, Player } from "../lib/types";
import { ResultsDisplay } from "./results-display";

const players: Player[] = [
  { email: "a@example.com", id: "a", isAdmin: true, name: "Alice" },
  { email: "b@example.com", id: "b", isAdmin: false, name: "Bob" },
  { email: "c@example.com", id: "c", isAdmin: false, name: "Cara" },
];

const assignments: Assignment[] = [
  { giverId: "a", receiverId: "b" },
  { giverId: "b", receiverId: "c" },
  { giverId: "c", receiverId: "a" },
];

describe(ResultsDisplay, () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("renders the ready-to-send screen without a render loop", () => {
    // Real clocks advance between React's snapshot reads; make every read differ
    // so an uncached Date.now() snapshot fails here the way it does in a browser.
    let fakeNow = 1_700_000_000_000;
    vi.spyOn(Date, "now").mockImplementation(() => {
      fakeNow += 1;
      return fakeNow;
    });

    render(
      <ResultsDisplay
        assignments={assignments}
        players={players}
        partyName="Office Party"
        turnstileSiteKey="1x00000000000000000000AA"
        onStartOver={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /send emails/iu })).toBeTruthy();
  });
});
