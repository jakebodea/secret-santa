import { useForm } from "@tanstack/react-form";
import { UserPlus } from "lucide-react";
import { useRef, useState } from "react";

import type { Player } from "../lib/types";
import { toTitleCase } from "../lib/utils";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
  existingPlayers: Player[];
  variant?: "dialog" | "default";
  fieldIdPrefix?: string;
}

export function PlayerForm({
  onAddPlayer,
  existingPlayers,
  variant = "default",
  fieldIdPrefix = "participant",
}: PlayerFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
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
      const duplicate = existingPlayers.find(
        (p) => p.name.toLowerCase() === value.name.toLowerCase()
      );
      if (duplicate) {
        setDuplicateError(`${duplicate.name} is already on the list`);
        return;
      }

      const newPlayer: Player = {
        email: value.email.trim().toLowerCase(),
        id: crypto.randomUUID(),
        isAdmin: existingPlayers.length === 0,
        name: toTitleCase(value.name.trim()),
      };

      onAddPlayer(newPlayer);
      form.reset();
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

        <form.Field
          name="email"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) {
                return "Email is required";
              }
              if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) {
                return "Invalid email address";
              }
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={emailFieldId} variant="field">
                Email
              </Label>
              <Input
                id={emailFieldId}
                type="email"
                placeholder="alex@example.com"
                autoComplete="off"
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
              />
              {field.state.meta.errors.length > 0 && (
                <p className="text-destructive text-sm">
                  {field.state.meta.errors.join(", ")}
                </p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
      >
        {([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit || isSubmitting}
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
