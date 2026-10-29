import { useState } from "react";

import { useIsMobile } from "../hooks/use-is-mobile";
import type { Player } from "../lib/types";
import { PlayerForm } from "./player-form";
import type { DeliveryMethod } from "./player-form";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
  DrawerFooter,
} from "./ui/drawer";

interface AddParticipantOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPlayer: (player: Player) => void;
  existingPlayers: Player[];
}

export function AddParticipantOverlay({
  open,
  onOpenChange,
  onAddPlayer,
  existingPlayers,
}: AddParticipantOverlayProps) {
  const isMobile = useIsMobile();
  const [lastDelivery, setLastDelivery] = useState<DeliveryMethod>("email");

  const title = "Add someone";
  const isFirstParticipant = existingPlayers.length === 0;

  const form = (
    <PlayerForm
      defaultDelivery={lastDelivery}
      onDeliveryChange={setLastDelivery}
      variant="dialog"
      fieldIdPrefix="add-participant"
      existingPlayers={existingPlayers}
      onAddPlayer={onAddPlayer}
    />
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}</DrawerTitle>
            {isFirstParticipant && (
              <DrawerDescription>
                The first person you add becomes the organizer.
              </DrawerDescription>
            )}
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-4">{form}</div>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
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
