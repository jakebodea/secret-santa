import { FileSpreadsheet } from "lucide-react";
import { useRef, useState } from "react";

import { importParticipants } from "../lib/import-utils";
import type { Player } from "../lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";

interface PlayerImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (players: Player[]) => void;
}

export function PlayerImportDialog({
  open,
  onOpenChange,
  onImport,
}: PlayerImportDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = async (file: File) => {
    setIsImporting(true);
    setImportError(null);

    try {
      const result = await importParticipants(file);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (result.success && result.players) {
        onImport(result.players);
        setImportError(null);
        onOpenChange(false);
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

    const fileName = file.name.toLowerCase();
    const extension = fileName.split(".").pop();
    if (extension !== "csv" && extension !== "xlsx" && extension !== "xls") {
      setImportError("Please upload a CSV or Excel file (.csv, .xlsx, .xls)");
      return;
    }

    await processFile(file);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setImportError(null);
      setIsDragging(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Participants</DialogTitle>
          <DialogDescription>
            Upload a CSV or Excel file with your participants. The file must
            contain the following columns:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            onClick={() => {
              fileInputRef.current?.click();
            }}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            className={`focus-visible:ring-ring/50 w-full cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors outline-none focus-visible:ring-3 ${
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
  );
}
