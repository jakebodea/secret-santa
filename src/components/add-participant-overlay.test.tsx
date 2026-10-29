import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";

import { AddParticipantOverlay } from "./add-participant-overlay";

const viewport = vi.hoisted(() => ({ mobile: false }));
vi.mock(import("../hooks/use-is-mobile"), () => ({
  useIsMobile: () => viewport.mobile,
}));

describe(AddParticipantOverlay, () => {
  afterEach(cleanup);

  test("desktop uses Dialog with the participant form", () => {
    viewport.mobile = false;
    render(
      <AddParticipantOverlay
        open
        onOpenChange={vi.fn<() => void>()}
        onAddPlayer={vi.fn<() => void>()}
        existingPlayers={[]}
      />
    );
    expect(screen.getByRole("dialog").dataset.slot).toBe("dialog-content");
    expect(screen.getByLabelText("QR card / private link")).toBeTruthy();
    expect(screen.getByLabelText("Only organizing")).toBeTruthy();
    expect(screen.getByLabelText("Email address")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("QR card / private link"));
    expect(screen.queryByLabelText("Email address")).toBeNull();
  });

  test("remembers the delivery choice after closing and reopening", async () => {
    viewport.mobile = false;
    const props = {
      onOpenChange: vi.fn<() => void>(),
      onAddPlayer: vi.fn<() => void>(),
      existingPlayers: [],
    };
    const { rerender } = render(<AddParticipantOverlay {...props} open />);
    fireEvent.click(screen.getByLabelText("QR card / private link"));
    rerender(<AddParticipantOverlay {...props} open={false} />);
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    rerender(<AddParticipantOverlay {...props} open />);
    expect(
      screen.getByRole<HTMLInputElement>("radio", {
        name: "QR card / private link",
      }).checked
    ).toBeTruthy();
    expect(screen.queryByLabelText("Email address")).toBeNull();
  });

  test("mobile uses Drawer defaults and Cancel dismisses it", () => {
    viewport.mobile = true;
    const onOpenChange = vi.fn<() => void>();
    render(
      <AddParticipantOverlay
        open
        onOpenChange={onOpenChange}
        onAddPlayer={vi.fn<() => void>()}
        existingPlayers={[]}
      />
    );
    expect(screen.getByRole("dialog").dataset.slot).toBe("drawer-popup");
    expect(screen.getByRole("dialog").dataset.swipeDirection).toBe("down");
    expect(document.activeElement).not.toBe(screen.getByLabelText("Name"));
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});
