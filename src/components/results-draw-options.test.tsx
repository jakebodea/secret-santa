import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { ResultsDrawOptions } from "./results-draw-options";

const players = [
  { email: "a@example.com", id: "a", isAdmin: true, name: "Alice" },
  { email: "b@example.com", id: "b", isAdmin: false, name: "Bob" },
  { email: "c@example.com", id: "c", isAdmin: false, name: "Cara" },
];
const assignments = [
  { giverId: "a", receiverId: "b" },
  { giverId: "b", receiverId: "c" },
  { giverId: "c", receiverId: "a" },
];

describe(ResultsDrawOptions, () => {
  afterEach(cleanup);

  test("matches require consent each time and are removed when the preview closes", async () => {
    const user = userEvent.setup();
    render(
      <ResultsDrawOptions
        assignments={assignments}
        players={players}
        onRedraw={vi.fn<() => void>()}
        onStartOver={vi.fn<() => void>()}
      />
    );
    expect(
      screen
        .getByText("Preview or redraw")
        .closest("details")
        ?.hasAttribute("open")
    ).toBeFalsy();
    await user.click(screen.getByText("Preview or redraw"));
    const trigger = screen.getByRole("button", { name: "Preview matchups" });
    await user.click(trigger);
    expect(screen.queryByRole("table")).toBeNull();
    const cancel = screen.getByRole("button", { name: "Keep matches secret" });
    await waitFor(() => expect(document.activeElement).toBe(cancel));
    await user.click(
      screen.getByRole("button", { name: "Reveal all matchups" })
    );
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("row")[1].textContent).toBe("AliceBob");
    await user.keyboard("{Escape}");
    await waitFor(() =>
      expect(screen.queryByRole("table", { hidden: true })).toBeNull()
    );
    await user.click(trigger);
    expect(screen.queryByRole("table", { hidden: true })).toBeNull();
  });

  test("cancel keeps the draw and redraw happens only after explicit confirmation", async () => {
    const user = userEvent.setup();
    const onRedraw = vi.fn<() => void>();
    render(
      <ResultsDrawOptions
        assignments={assignments}
        players={players}
        onRedraw={onRedraw}
        onStartOver={vi.fn<() => void>()}
      />
    );
    await user.click(screen.getByText("Preview or redraw"));
    await user.click(screen.getByRole("button", { name: "Redraw names" }));
    expect(onRedraw).not.toHaveBeenCalled();
    expect(screen.queryByRole("table")).toBeNull();
    await user.click(screen.getByRole("button", { name: "Keep current draw" }));
    expect(onRedraw).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await user.click(screen.getByRole("button", { name: "Redraw names" }));
    await user.click(screen.getByRole("button", { name: "Yes, redraw names" }));
    expect(onRedraw).toHaveBeenCalledExactlyOnceWith();
  });
});
