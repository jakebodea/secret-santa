import { useForm } from "@tanstack/react-form";
import { UserPlus } from "lucide-react";
import { useRef, useState } from "react";

import { EMAIL_PATTERN, normalizeEmail } from "../lib/players";
import type { Player } from "../lib/types";
import { toTitleCase } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export type DeliveryMethod = "card" | "email";

interface PlayerFormProps {
  defaultDelivery?: DeliveryMethod;
  onDeliveryChange?: (delivery: DeliveryMethod) => void;
  onAddPlayer: (player: Player) => void;
  existingPlayers: Player[];
  variant?: "dialog" | "default";
  fieldIdPrefix?: string;
}

export function PlayerForm({
  onAddPlayer,
  existingPlayers,
  defaultDelivery = "email",
  onDeliveryChange,
  variant = "default",
  fieldIdPrefix = "participant",
}: PlayerFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [delivery, setDelivery] = useState<DeliveryMethod>(defaultDelivery);
  const [sitsOut, setSitsOut] = useState(false);
  const isOrganizer = existingPlayers.length === 0;
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  const nameFieldId = `${fieldIdPrefix}-name`;
  const emailFieldId = `${fieldIdPrefix}-email`;
  const isDialog = variant === "dialog";

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
    },
    onSubmit: ({ value }) => {
      if (
        !value.name.trim() ||
        (delivery === "email" && !EMAIL_PATTERN.test(value.email))
      ) {
        return;
      }
      const duplicate = existingPlayers.find(
        (p) => p.name.toLowerCase() === value.name.toLowerCase()
      );
      if (duplicate) {
        setDuplicateError(`${duplicate.name} is already on the list`);
        return;
      }

      const newPlayer: Player = {
        email: delivery === "email" ? normalizeEmail(value.email) : "",
        id: crypto.randomUUID(),
        isAdmin: isOrganizer,
        sitsOut: isOrganizer && sitsOut,
        name: toTitleCase(value.name.trim()),
      };

      onAddPlayer(newPlayer);
      form.reset();
      setSitsOut(false);
      setDuplicateError(null);

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="space-y-4">
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              setDuplicateError(null);
              if (!value.trim()) {
                return "Name is required";
              }
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={nameFieldId} variant="field">
                Name
              </Label>
              <Input
                id={nameFieldId}
                ref={nameInputRef}
                placeholder="Alex Morgan"
                autoComplete="name"
                className={isDialog ? "h-11" : undefined}
                value={field.state.value}
                onChange={(e) => {
                  field.handleChange(toTitleCase(e.target.value));
                }}
                onBlur={field.handleBlur}
                aria-invalid={
                  field.state.meta.errors.length > 0 || !!duplicateError
                }
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-sm">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
              {duplicateError && (
                <p className="text-destructive text-sm">{duplicateError}</p>
              )}
            </div>
          )}
        </form.Field>

        {isOrganizer && (
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">
              As the organizer, are you playing?
            </legend>
            <div className="flex flex-wrap gap-4">
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${fieldIdPrefix}-role`}
                  checked={!sitsOut}
                  onChange={() => setSitsOut(false)}
                  className="accent-primary"
                />
                Playing too
              </label>
              <label className="flex min-h-11 items-center gap-2 text-sm">
                <input
                  type="radio"
                  name={`${fieldIdPrefix}-role`}
                  checked={sitsOut}
                  onChange={() => setSitsOut(true)}
                  className="accent-primary"
                />
                Only organizing
              </label>
            </div>
          </fieldset>
        )}
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">
            {isOrganizer && sitsOut
              ? "Organizer summary"
              : "How will they get their match?"}
          </legend>
          <div className="flex flex-wrap gap-4">
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${fieldIdPrefix}-delivery`}
                checked={delivery === "card"}
                onChange={() => {
                  setDelivery("card");
                  onDeliveryChange?.("card");
                  form.setFieldValue("email", "");
                }}
                className="accent-primary"
              />
              {isOrganizer && sitsOut
                ? "No email summary"
                : "QR card / private link"}
            </label>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="radio"
                name={`${fieldIdPrefix}-delivery`}
                checked={delivery === "email"}
                onChange={() => {
                  setDelivery("email");
                  onDeliveryChange?.("email");
                }}
                className="accent-primary"
              />
              Email
            </label>
          </div>
          <p className="text-muted-foreground text-sm font-light">
            {isOrganizer && sitsOut
              ? "You’ll manage the draw here without getting a match. An optional email summary includes every pairing."
              : "Print a QR card, let them scan your screen, or text their private link after the draw. No account needed."}
          </p>
        </fieldset>

        {delivery === "email" && (
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!EMAIL_PATTERN.test(value)) {
                  return "Invalid email address";
                }
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor={emailFieldId} variant="field">
                  Email address
                </Label>
                <Input
                  id={emailFieldId}
                  type="email"
                  required
                  placeholder="alex@example.com"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                  enterKeyHint="done"
                  className={isDialog ? "h-11" : undefined}
                  value={field.state.value}
                  onKeyDown={(e) => {
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    const valueWithoutSpaces = e.target.value.replaceAll(
                      /\s/gu,
                      ""
                    );
                    field.handleChange(valueWithoutSpaces);
                  }}
                  onBlur={field.handleBlur}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={`${emailFieldId}-hint`}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p
                    id={`${emailFieldId}-hint`}
                    className="text-destructive text-sm"
                  >
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : (
                  <p
                    id={`${emailFieldId}-hint`}
                    className="text-muted-foreground text-sm font-light"
                  >
                    {isOrganizer
                      ? "The organizer also receives a link to every match."
                      : "Use an inbox this person can open privately."}
                  </p>
                )}
              </div>
            )}
          </form.Field>
        )}
      </div>

      <form.Subscribe
        selector={(state) =>
          [
            state.canSubmit,
            state.isSubmitting,
            state.values.email,
            state.values.name,
          ] as const
        }
      >
        {([canSubmit, isSubmitting, email, name]) => (
          <Button
            type="submit"
            disabled={
              !canSubmit ||
              !name.trim() ||
              isSubmitting ||
              (delivery === "email" && !EMAIL_PATTERN.test(email))
            }
            size={isDialog ? "default" : "lg"}
            className="w-full"
          >
            <UserPlus className="h-4 w-4" />
            {isSubmitting ? "Adding…" : "Add person"}
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
