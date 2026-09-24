import { useForm } from "@tanstack/react-form";
import { Upload, UserPlus } from "lucide-react";
import { useRef, useState } from "react";

import type { Player } from "../lib/types";
import { toTitleCase } from "../lib/utils";
import { PlayerImportDialog } from "./player-import-dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void;
  onImport: (players: Player[]) => void;
  existingPlayers: Player[];
}

export function PlayerForm({
  onAddPlayer,
  onImport,
  existingPlayers,
}: PlayerFormProps) {
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

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

      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle variant="section">Add Participants</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsImportDialogOpen(true);
              }}
            >
              <Upload className="h-4 w-4" />
              Import CSV
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-4"
        >
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
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  ref={nameInputRef}
                  placeholder="Participant name"
                  autoComplete="name"
                  value={field.state.value}
                  onChange={(e) => {
                    field.handleChange(toTitleCase(e.target.value));
                  }}
                  onBlur={field.handleBlur}
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
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="participant@example.com"
                  autoComplete="off"
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
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-destructive text-sm">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                size="lg"
                className="w-full"
              >
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add Participant"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>

      <PlayerImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={onImport}
      />
    </Card>
  );
}
