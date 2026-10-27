import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import type { Constraint, Player } from "../lib/types";
import { ConstraintsForm } from "./constraints-form";

const players: Player[] = [
  { email: "alice@example.com", id: "player-a", isAdmin: true, name: "Alice" },
  { email: "bob@example.com", id: "player-b", isAdmin: false, name: "Bob" },
  { email: "cara@example.com", id: "player-c", isAdmin: false, name: "Cara" },
];

async function selectPlayer(label: string, name: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole("combobox", { name: label }));
  await user.click(await screen.findByRole("option", { name }));
  await waitFor(() => {
    expect(screen.queryByRole("listbox")).toBeNull();
  });
}

describe(ConstraintsForm, () => {
  afterEach(cleanup);

  test("selects show names, save player IDs, and reset after adding a rule", async () => {
    const onAddConstraint = vi.fn<(constraint: Constraint) => void>();
    render(
      <ConstraintsForm players={players} onAddConstraint={onAddConstraint} />
    );

    await selectPlayer("This player", "Alice");
    await selectPlayer("Cannot give to", "Bob");
    expect(
      screen.getByRole("combobox", { name: "This player" }).textContent
    ).toContain("Alice");
    fireEvent.click(screen.getByRole("switch", { name: "Apply both ways" }));
    fireEvent.click(screen.getByRole("button", { name: "Add rule" }));

    expect(onAddConstraint).toHaveBeenCalledWith({
      bidirectional: false,
      giverId: "player-a",
      id: expect.any(String),
      receiverId: "player-b",
    });
    await waitFor(() => {
      expect(
        screen.getByRole("combobox", { name: "This player" }).textContent
      ).toContain("Select player");
      expect(
        screen.getByRole("combobox", { name: "Cannot give to" }).textContent
      ).toContain("Select player");
      expect(
        screen
          .getByRole("switch", { name: "Apply both ways" })
          .getAttribute("aria-checked")
      ).toBe("true");
      expect(
        screen
          .getByRole("button", { name: "Add rule" })
          .hasAttribute("disabled")
      ).toBeTruthy();
    });
  });

  test("changing the giver clears a receiver who would become a self-pairing", async () => {
    const onAddConstraint = vi.fn<(constraint: Constraint) => void>();
    render(
      <ConstraintsForm players={players} onAddConstraint={onAddConstraint} />
    );

    await selectPlayer("Cannot give to", "Bob");
    await selectPlayer("This player", "Bob");
    expect(
      screen.getByRole("combobox", { name: "Cannot give to" }).textContent
    ).toContain("Select player");
    fireEvent.click(screen.getByRole("combobox", { name: "Cannot give to" }));
    await screen.findByRole("option", { name: "Alice" });
    expect(screen.queryByRole("option", { name: "Bob" })).toBeNull();
    expect(onAddConstraint).not.toHaveBeenCalled();
  });
});
