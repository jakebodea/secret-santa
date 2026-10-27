import { ChevronDown, Eye, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";

import { getPlayerName } from "../lib/secret-santa-assignments";
import type { Assignment, Player } from "../lib/types";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface ResultsDrawOptionsProps {
  assignments: Assignment[];
  players: Player[];
  onRedraw: () => void;
  onStartOver: () => void;
}

export function ResultsDrawOptions({
  assignments,
  players,
  onRedraw,
  onStartOver,
}: ResultsDrawOptionsProps) {
  const [view, setView] = useState<"warning" | "matches" | "redraw" | null>(
    null
  );
  const cancelRef = useRef<HTMLButtonElement>(null);
  const isRedraw = view === "redraw";
  const isRevealed = view === "matches";
  const previewDismissLabel = isRevealed
    ? "Hide matchups"
    : "Keep matches secret";

  return (
    <Dialog
      open={view !== null}
      onOpenChange={(open) => {
        if (!open) {
          setView(null);
        }
      }}
    >
      <details className="group mx-auto max-w-lg text-left">
        <summary className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex min-h-11 cursor-pointer list-none items-center justify-center gap-2 rounded-md text-sm focus-visible:ring-2 [&::-webkit-details-marker]:hidden">
          Preview or redraw
          <ChevronDown className="size-4 transition-transform group-open:rotate-180 motion-reduce:transition-none" />
        </summary>
        <div className="flex flex-col gap-4 pt-3">
          <p className="text-muted-foreground text-center text-sm">
            Matches stay secret unless you choose to reveal them. No emails have
            been sent yet.
          </p>
          <div className="flex flex-col justify-center gap-2 sm:flex-row">
            <DialogTrigger
              render={<Button variant="outline" size="lg" />}
              onClick={() => setView("warning")}
            >
              <Eye data-icon="inline-start" />
              Preview matchups
            </DialogTrigger>
            <DialogTrigger
              render={<Button variant="outline" size="lg" />}
              onClick={() => setView("redraw")}
            >
              <RotateCcw data-icon="inline-start" />
              Redraw names
            </DialogTrigger>
          </div>
          <Button variant="link" size="lg" onClick={onStartOver}>
            Edit participants or exclusions
          </Button>
        </div>
      </details>

      <DialogContent
        initialFocus={cancelRef}
        showCloseButton={false}
        className="flex max-h-[calc(100dvh-2rem)] flex-col"
      >
        <DialogHeader>
          <DialogTitle variant="compact">
            {isRedraw ? "Redraw all names?" : "Preview matchups"}
          </DialogTitle>
          <DialogDescription variant="body">
            {isRedraw &&
              "This replaces the current draw for everyone. Your participants and exclusions stay the same, and the new matches will stay hidden. No emails will be sent."}
            {!isRedraw &&
              !isRevealed &&
              "Are you sure you want to peek? You’ll see who everyone is buying for, including your own match. Once you know, you can’t unsee it."}
            {isRevealed &&
              "These are the current matchups. No emails have been sent yet."}
          </DialogDescription>
        </DialogHeader>

        {isRevealed && (
          <div className="min-h-0 overflow-y-auto overscroll-contain rounded-lg border">
            <table className="w-full table-fixed text-left text-sm">
              <caption className="sr-only">
                Current Secret Santa matchups
              </caption>
              <thead className="bg-muted">
                <tr>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Giver
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium">
                    Buying for
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {players.map((player) => {
                  const match = assignments.find(
                    (assignment) => assignment.giverId === player.id
                  );
                  return (
                    <tr key={player.id}>
                      <th
                        scope="row"
                        className="px-4 py-3 font-normal wrap-anywhere"
                      >
                        {player.name}
                      </th>
                      <td className="px-4 py-3 wrap-anywhere">
                        {match
                          ? getPlayerName(players, match.receiverId)
                          : "No match"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          <Button
            ref={cancelRef}
            variant="outline"
            size="lg"
            onClick={() => setView(null)}
          >
            {isRedraw ? "Keep current draw" : previewDismissLabel}
          </Button>
          {!isRevealed && (
            <Button
              size="lg"
              onClick={() => {
                if (isRedraw) {
                  setView(null);
                  onRedraw();
                } else {
                  setView("matches");
                  cancelRef.current?.focus();
                }
              }}
            >
              {isRedraw ? "Yes, redraw names" : "Reveal all matchups"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
