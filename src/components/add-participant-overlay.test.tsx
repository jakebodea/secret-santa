import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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
    expect(screen.getByLabelText("Name")).toBeTruthy();
    expect(screen.getByLabelText("Email")).toBeTruthy();
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
