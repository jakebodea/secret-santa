import { useForm } from "@tanstack/react-form";
import { Upload, FileSpreadsheet, UserPlus } from "lucide-react";
import { useRef, useState } from "react";

import { importParticipants } from "../lib/import-utils";
import type { Player } from "../lib/types";
import { toTitleCase } from "../lib/utils";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importParticipants(file);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (result.success && result.players) {
        onImport(result.players);
        setImportError(null);
        setIsImportDialogOpen(false);
      } else {
        setImportError(result.error || "Failed to import participants");
      }
    } catch (error) {
      setImportError(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    await processFile(file);
  };

  const handleDrop = async (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) {
      return;
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const extension = fileName.split(".").pop();
    if (extension !== "csv" && extension !== "xlsx" && extension !== "xls") {
      setImportError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDropZoneClick = () => {
    fileInputRef.current?.click();
  };

  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
    },
    onSubmit: ({ value }) => {
      // Check for duplicate names
      const duplicate = existingPlayers.find(
        (p) => p.name.toLowerCase() === value.name.toLowerCase()
      );
      if (duplicate) {
        setDuplicateError(`${duplicate.name} is already on the list`);
        return;
      }

      // Create new player
      const newPlayer: Player = {
        email: value.email.trim().toLowerCase(),
        id: crypto.randomUUID(),
        // First player is admin
        isAdmin: existingPlayers.length === 0,
        name: toTitleCase(value.name.trim()),
      };

      onAddPlayer(newPlayer);

      // Reset form
      form.reset();

      // Focus on name input after adding player
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 0);
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-normal tracking-tight sm:text-3xl">
            Add Participants
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsImportDialogOpen(true)}
              className="text-muted-foreground hover:text-foreground"
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
              onChange: ({ value }) => (value ? undefined : "Name is required"),
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  ref={nameInputRef}
                  id="name"
                  type="text"
                  placeholder="Jane Doe"
                  autoComplete="off"
                  aria-invalid={!!duplicateError || undefined}
                  value={field.state.value}
                  onChange={(e) => {
                    const normalizedValue = toTitleCase(e.target.value);
                    setDuplicateError(null);
                    field.handleChange(normalizedValue);
                  }}
                  onBlur={field.handleBlur}
                />
                {(duplicateError || field.state.meta.errors.length > 0) && (
                  <p className="text-destructive text-sm">
                    {duplicateError ?? field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) {
                  return "Email is required";
                }
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(value)) {
                  return "Please enter a valid email";
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
                  placeholder="jane@example.com"
                  autoComplete="off"
                  value={field.state.value}
                  onKeyDown={(e) => {
                    // Prevent space key from being entered
                    if (e.key === " ") {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    // Remove spaces from email (handles paste and other cases)
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
                className="h-10 w-full gap-2 sm:h-11"
              >
                <UserPlus className="h-4 w-4" />
                {isSubmitting ? "Adding..." : "Add Participant"}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>

      {/* Import Dialog */}
      <Dialog
        open={isImportDialogOpen}
        onOpenChange={(open) => {
          setIsImportDialogOpen(open);
          if (!open) {
            setImportError(null);
            setIsDragging(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Participants</DialogTitle>
            <DialogDescription>
              Upload a CSV or Excel file with your participants. The file must
              contain the following columns:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Required columns info */}
            <div className="space-y-2">
              <p className="text-sm font-medium">Required columns:</p>
              <ul className="text-muted-foreground list-inside list-disc space-y-1 text-sm">
                <li>
                  <strong>name</strong> - Participant name
                </li>
                <li>
                  <strong>email</strong> - Participant email address
                </li>
              </ul>
              <p className="text-muted-foreground mt-3 text-xs">
                Column names are case-insensitive. The first participant in the
                file will be set as admin.
              </p>
            </div>

            {/* File drop zone */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isImporting}
            />

            <button
              type="button"
              disabled={isImporting}
              onClick={handleDropZoneClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`focus-visible:ring-ring/50 w-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors outline-none focus-visible:ring-[3px] ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/30"
              } ${isImporting ? "cursor-not-allowed opacity-50" : ""} `}
            >
              {isImporting ? (
                <div className="space-y-2">
                  <div className="border-primary mx-auto h-8 w-8 animate-spin rounded-full border-b-2" />
                  <p className="text-muted-foreground text-sm">
                    Processing file...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <FileSpreadsheet className="text-muted-foreground mx-auto h-12 w-12" />
                  <div>
                    <p className="text-sm font-medium">
                      Drop your file here or click to browse
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      Supports .csv, .xlsx, .xls files
                    </p>
                  </div>
                </div>
              )}
            </button>

            {importError && (
              <p className="text-destructive text-sm font-light tracking-wide">
                {importError}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
