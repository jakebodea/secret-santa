import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, test, vi } from "vitest";

import { PlayerForm } from "./player-form";

describe(PlayerForm, () => {
  afterEach(cleanup);

  test("an organizer can sit out without an email or reveal card", async () => {
    const user = userEvent.setup();
    const onAddPlayer = vi.fn<() => void>();
    render(<PlayerForm existingPlayers={[]} onAddPlayer={onAddPlayer} />);
    await user.type(screen.getByLabelText("Name"), "Parent");
    await user.click(screen.getByLabelText("Only organizing"));
    await user.click(screen.getByLabelText("No email summary"));
    await user.click(screen.getByRole("button", { name: "Add person" }));
    await waitFor(() =>
      expect(onAddPlayer).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Parent",
          isAdmin: true,
          sitsOut: true,
          email: "",
        })
      )
    );
  });

  test.each(["parent@example.com", "not-an-email"])(
    "switching from email %s to a QR card discards the address",
    async (address) => {
      const user = userEvent.setup();
      const onAddPlayer = vi.fn<() => void>();
      render(
        <PlayerForm
          existingPlayers={[{ id: "parent", name: "Parent", isAdmin: true }]}
          onAddPlayer={onAddPlayer}
        />
      );
      await user.type(screen.getByLabelText("Name"), "Ava");
      await user.click(screen.getByLabelText("Email"));
      await user.type(screen.getByLabelText("Email address"), address);
      await user.click(screen.getByLabelText("QR card / private link"));
      await user.click(screen.getByRole("button", { name: "Add person" }));
      await waitFor(() =>
        expect(onAddPlayer).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Ava",
            email: "",
            isAdmin: false,
            sitsOut: false,
          })
        )
      );
      expect(
        screen.getByRole<HTMLInputElement>("radio", {
          name: "QR card / private link",
        }).checked
      ).toBeTruthy();
    }
  );

  test("email defaults on and requires an address, including a directly pasted one", async () => {
    const user = userEvent.setup();
    const onAddPlayer = vi.fn<() => void>();
    render(<PlayerForm existingPlayers={[]} onAddPlayer={onAddPlayer} />);
    await user.type(screen.getByLabelText("Name"), "Ava");
    expect(
      screen.getByRole<HTMLInputElement>("radio", {
        name: "Email",
      }).checked
    ).toBeTruthy();
    expect(
      screen.getByRole<HTMLButtonElement>("button", { name: "Add person" })
        .disabled
    ).toBeTruthy();
    await user.click(screen.getByLabelText("Email address"));
    await user.paste("ava@example.com");
    await user.click(screen.getByRole("button", { name: "Add person" }));
    await waitFor(() =>
      expect(onAddPlayer).toHaveBeenCalledWith(
        expect.objectContaining({ email: "ava@example.com" })
      )
    );
  });
});
