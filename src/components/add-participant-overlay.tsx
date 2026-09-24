import { useEffect } from "react";

import { useIsMobile } from "../hooks/use-is-mobile";
import type { Player } from "../lib/types";
import { PlayerForm } from "./player-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";

interface AddParticipantOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlayer: (player: Player) => void;
  existingPlayers: Player[];
}

function AddParticipantForm({
  existingPlayers,
  onAddPlayer,
  open,
}: {
  open: boolean;
  existingPlayers: Player[];
  onAddPlayer: (player: Player) => void;
}) {
  useEffect(() => {
    if (!open) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      const nameInput = document.querySelector("#add-participant-name");
      if (nameInput instanceof HTMLInputElement) {
        nameInput.focus();
      }
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [open]);

  return (
    <PlayerForm
      variant="dialog"
      onAddPlayer={onAddPlayer}
      existingPlayers={existingPlayers}
      fieldIdPrefix="add-participant"
    />
  );
}

export function AddParticipantOverlay({
  open,
  onOpenChange,
  onAddPlayer,
  existingPlayers,
}: AddParticipantOverlayProps) {
  const isMobile = useIsMobile();

  const title = "Add someone";
  const isFirstParticipant = existingPlayers.length === 0;

  const form = (
    <AddParticipantForm
      open={open}
      existingPlayers={existingPlayers}
      onAddPlayer={onAddPlayer}
    />
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto">
          <SheetHeader className="text-left">
            <SheetTitle>{title}</SheetTitle>
            {isFirstParticipant && (
              <SheetDescription>
                The first person you add becomes the organizer.
              </SheetDescription>
            )}
          </SheetHeader>
          <div className="px-4 pb-6">{form}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle variant="compact">{title}</DialogTitle>
          {isFirstParticipant && (
            <DialogDescription>
              The first person you add becomes the organizer.
            </DialogDescription>
          )}
        </DialogHeader>
        {form}
      </DialogContent>
    </Dialog>
  );
}
