import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AssignmentAnimation } from "../components/assignment-animation";
import { ResultsDisplay } from "../components/results-display";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { generateAssignments } from "../lib/secret-santa-assignments";
import {
  getData,
  addPlayer,
  removePlayer,
  toggleAdmin,
  replacePlayers,
  addConstraint,
  removeConstraint,
  saveConstraints,
  saveAssignments,
  clearAssignments,
  clearAllData,
  savePartyName,
} from "../lib/storage";
import type { Player, Constraint, Assignment } from "../lib/types";
import { toTitleCase } from "../lib/utils";
import { AssignPartyNamePage } from "./assign-party-name-page";
import { AssignSetupView } from "./assign-setup-view";

export const Route = createFileRoute("/assign")({
  component: AssignPage,
});

function AssignPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [constraints, setConstraints] = useState<Constraint[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [partyName, setPartyName] = useState<string>("");
  const [showPartyNamePage, setShowPartyNamePage] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
    details?: string;
  }>({ message: "", open: false });
  const inputRef = useRef<HTMLInputElement>(null);

  // Every visit starts a fresh exchange, so state begins empty on the party name page
  useEffect(() => {
    clearAllData();
  }, []);

  // Keep input focused when party name page is shown
  useEffect(() => {
    if (showPartyNamePage && inputRef.current) {
      // Focus immediately when page is shown
      inputRef.current.focus();

      const pendingTimeouts = new Set<ReturnType<typeof setTimeout>>();

      const scheduleRefocus = () => {
        const timeoutId = setTimeout(() => {
          pendingTimeouts.delete(timeoutId);
          if (
            inputRef.current &&
            showPartyNamePage &&
            document.activeElement?.tagName !== "BUTTON"
          ) {
            inputRef.current.focus();
          }
        }, 10);
        pendingTimeouts.add(timeoutId);
      };

      const handleBlur = () => {
        scheduleRefocus();
      };

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName !== "BUTTON" && !target.closest("button")) {
          scheduleRefocus();
        }
      };

      const input = inputRef.current;
      input.addEventListener("blur", handleBlur);
      document.addEventListener("click", handleClick, true);

      return () => {
        input.removeEventListener("blur", handleBlur);
        document.removeEventListener("click", handleClick, true);
        for (const timeoutId of pendingTimeouts) {
          clearTimeout(timeoutId);
        }
        pendingTimeouts.clear();
      };
    }
  }, [showPartyNamePage]);

  const handleAddPlayer = (player: Player) => {
    addPlayer(player);
    const data = getData();
    setPlayers(data.players);
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
    const data = getData();
    setPlayers(data.players);
    setConstraints(data.constraints);
  };

  const handleToggleAdmin = (playerId: string) => {
    toggleAdmin(playerId);
    const data = getData();
    setPlayers(data.players);
  };

  const handleImportPlayers = (importedPlayers: Player[]) => {
    if (importedPlayers.length < 3) {
      setErrorDialog({
        details: "Imported file must contain at least 3 participants.",
        message: "Not enough participants",
        open: true,
      });
      return;
    }
    replacePlayers(importedPlayers);
    const data = getData();
    setPlayers(data.players);
    setConstraints(data.constraints);
    setAssignments(data.assignments);
    setAnimationComplete(false);
  };

  const handleAddConstraint = (constraint: Constraint) => {
    addConstraint(constraint);
    const data = getData();
    setConstraints(data.constraints);
  };

  const handleRemoveConstraint = (constraintId: string) => {
    removeConstraint(constraintId);
    const data = getData();
    setConstraints(data.constraints);
  };

  const handleGenerateAssignments = () => {
    if (players.length < 3) {
      setErrorDialog({
        details:
          "You need at least 3 players to generate Secret Santa assignments.",
        message: "Not enough players",
        open: true,
      });
      return;
    }

    // Start animation
    setIsGenerating(true);
    setAnimationComplete(false);

    // Generate assignments immediately
    const result = generateAssignments(players, constraints);

    if (result.success && result.assignments) {
      saveAssignments(result.assignments);
      setAssignments(result.assignments);

      // Wait 3 seconds for animation, then show results
      setTimeout(() => {
        setIsGenerating(false);
        setAnimationComplete(true);
      }, 3000);
    } else {
      // If generation failed, stop animation immediately
      setIsGenerating(false);
      setErrorDialog({
        details: result.details,
        message: result.error || "Failed to generate assignments",
        open: true,
      });
    }
  };

  const handleStartOver = () => {
    clearAssignments();
    setAssignments([]);
    setAnimationComplete(false);
  };

  const handleClearAll = () => {
    clearAllData();
    setPlayers([]);
    setConstraints([]);
    setAssignments([]);
    setAnimationComplete(false);
  };

  const handleClearConstraints = () => {
    saveConstraints([]);
    setConstraints([]);
  };

  const handlePartyNameChange = (value: string) => {
    setPartyName(toTitleCase(value));
  };

  const handlePartyNameSubmit = () => {
    if (partyName.trim()) {
      const formatted = toTitleCase(partyName.trim());
      setPartyName(formatted);
      savePartyName(formatted);
    } else {
      savePartyName("");
    }
    setShowPartyNamePage(false);
  };

  const handleSkipPartyName = () => {
    savePartyName("");
    setPartyName("");
    setShowPartyNamePage(false);
  };

  const handlePartyNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handlePartyNameSubmit();
    }
  };

  const hasAssignments = assignments.length > 0 && animationComplete;

  if (showPartyNamePage) {
    return (
      <AssignPartyNamePage
        inputRef={inputRef}
        partyName={partyName}
        onPartyNameChange={handlePartyNameChange}
        onPartyNameKeyDown={handlePartyNameKeyDown}
        onSubmit={handlePartyNameSubmit}
        onSkip={handleSkipPartyName}
      />
    );
  }

  return (
    <div className="bg-background min-h-screen">
      {isGenerating ? (
        <AssignmentAnimation />
      ) : (
        <main className="container mx-auto px-4 py-8 pb-24 sm:pb-8">
          {hasAssignments ? (
            <div className="mx-auto max-w-4xl">
              <ResultsDisplay
                assignments={assignments}
                players={players}
                partyName={partyName}
                onStartOver={handleStartOver}
              />
            </div>
          ) : (
            <AssignSetupView
              partyName={partyName}
              players={players}
              constraints={constraints}
              onAddPlayer={handleAddPlayer}
              onImportPlayers={handleImportPlayers}
              onRemovePlayer={handleRemovePlayer}
              onToggleAdmin={handleToggleAdmin}
              onClearAllPlayers={handleClearAll}
              onAddConstraint={handleAddConstraint}
              onRemoveConstraint={handleRemoveConstraint}
              onClearConstraints={handleClearConstraints}
              onGenerateAssignments={handleGenerateAssignments}
            />
          )}
        </main>
      )}

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialog.message}</DialogTitle>
            <DialogDescription variant="body">
              {errorDialog.details}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button
              onClick={() => setErrorDialog({ message: "", open: false })}
            >
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-border mt-12 border-t py-8 sm:mt-20 sm:py-10">
        <div className="text-muted-foreground container mx-auto px-4 text-center text-sm font-light tracking-wide">
          <p>
            <Link
              to="/support"
              className="text-foreground hover:text-primary underline underline-offset-4 transition-colors"
            >
              Support this project
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
