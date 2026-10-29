import { Upload, UserPlus, Users } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { MIN_DRAWING_PLAYERS, drawingPlayers } from "../lib/players";
import type { Player } from "../lib/types";
import { cn } from "../lib/utils";
import { AddParticipantOverlay } from "./add-participant-overlay";
import { PlayerImportDialog } from "./player-import-dialog";
import { PlayersList } from "./players-list";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

interface ParticipantsSectionProps {
  players: Player[];
  onAddPlayer: (player: Player) => void;
  onImport: (players: Player[]) => void;
  onRemovePlayer: (playerId: string) => void;
  onToggleAdmin: (playerId: string) => void;
  onToggleSitsOut: (playerId: string) => void;
  onClearAll: () => void;
}

function participantProgressLabel(count: number): string | null {
  if (count === 0) {
    return "Add at least three people to draw names. Choose email or QR cards for each.";
  }
  if (count < MIN_DRAWING_PLAYERS) {
    const remaining = MIN_DRAWING_PLAYERS - count;
    return `${remaining} more ${remaining === 1 ? "person" : "people"} until you can continue.`;
  }
  return null;
}

export function ParticipantsSection({
  players,
  onAddPlayer,
  onImport,
  onRemovePlayer,
  onToggleAdmin,
  onToggleSitsOut,
  onClearAll,
}: ParticipantsSectionProps) {
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const openAdd = () => {
    setIsAddOpen(true);
  };

  const handleAddPlayer = (player: Player) => {
    onAddPlayer(player);
    toast.success(`Added ${player.name}`, { duration: 2000 });
  };

  const handleImport = (importedPlayers: Player[]) => {
    onImport(importedPlayers);
    toast.success(`Imported ${importedPlayers.length} people`);
  };

  const drawingCount = drawingPlayers(players).length;
  const progressLabel = participantProgressLabel(drawingCount);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle variant="section">Participants</CardTitle>
          {progressLabel && <CardDescription>{progressLabel}</CardDescription>}
          <CardAction>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {players.length > 0 && (
                <Button
                  type="button"
                  variant="destructive-ghost"
                  size="sm"
                  onClick={onClearAll}
                >
                  Clear all
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsImportDialogOpen(true);
                }}
              >
                <Upload className="h-4 w-4" />
                Import
              </Button>
              {players.length > 0 && (
                <Button type="button" size="sm" onClick={openAdd}>
                  <UserPlus className="h-4 w-4" />
                  Add person
                </Button>
              )}
            </div>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="space-y-6">
            {players.length === 0 ? (
              <div
                className="border-border/60 flex flex-col items-center gap-4 rounded-xl border border-dashed px-6 py-12 text-center"
                aria-live="polite"
              >
                <div className="bg-muted text-muted-foreground flex size-12 items-center justify-center rounded-full">
                  <Users className="size-6" aria-hidden />
                </div>
                <div className="space-y-1">
                  <p className="text-foreground text-sm font-medium tracking-wide">
                    No one here yet
                  </p>
                  <p className="text-muted-foreground max-w-sm text-sm font-light tracking-wide">
                    Add yourself first as the organizer, even if you’re not
                    playing. Then add your group, or import a spreadsheet.
                  </p>
                </div>
                <Button type="button" onClick={openAdd}>
                  <UserPlus className="h-4 w-4" />
                  Add someone
                </Button>
              </div>
            ) : (
              <PlayersList
                embedded
                players={players}
                onRemovePlayer={onRemovePlayer}
                onToggleAdmin={onToggleAdmin}
                onToggleSitsOut={onToggleSitsOut}
                onClearAll={onClearAll}
              />
            )}

            {drawingCount > 0 && drawingCount < MIN_DRAWING_PLAYERS && (
              <output
                className="flex items-center gap-3"
                aria-label={`${drawingCount} of ${MIN_DRAWING_PLAYERS} participants added`}
              >
                <div className="flex flex-1 justify-center gap-2">
                  {Array.from({ length: MIN_DRAWING_PLAYERS }).map(
                    (_, index) => (
                      <div
                        key={index}
                        className={cn(
                          "size-2 rounded-full transition-colors duration-300 ease-out",
                          index < drawingCount ? "bg-primary" : "bg-muted"
                        )}
                      />
                    )
                  )}
                </div>
                <span className="text-muted-foreground shrink-0 text-xs font-medium tabular-nums">
                  {drawingCount}/{MIN_DRAWING_PLAYERS}
                </span>
              </output>
            )}
          </div>
        </CardContent>
      </Card>

      <AddParticipantOverlay
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        onAddPlayer={handleAddPlayer}
        existingPlayers={players}
      />

      <PlayerImportDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
        onImport={handleImport}
      />
    </>
  );
}
