import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { useState, useEffect, useRef } from "react";

import { AssignmentAnimation } from "../components/assignment-animation";
import { ConstraintsForm } from "../components/constraints-form";
import { ConstraintsList } from "../components/constraints-list";
import { PlayerForm } from "../components/player-form";
import { PlayersList } from "../components/players-list";
import { ResultsDisplay } from "../components/results-display";
import { Button } from "../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
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

      const handleBlur = () => {
        // Refocus after a short delay, unless user clicked a button
        setTimeout(() => {
          if (
            inputRef.current &&
            showPartyNamePage &&
            document.activeElement?.tagName !== "BUTTON"
          ) {
            inputRef.current.focus();
          }
        }, 10);
      };

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        // Only refocus if not clicking on a button or inside a button
        if (target.tagName !== "BUTTON" && !target.closest("button")) {
          setTimeout(() => {
            if (inputRef.current && showPartyNamePage) {
              inputRef.current.focus();
            }
          }, 10);
        }
      };

      const input = inputRef.current;
      input.addEventListener("blur", handleBlur);
      document.addEventListener("click", handleClick, true);

      return () => {
        input.removeEventListener("blur", handleBlur);
        document.removeEventListener("click", handleClick, true);
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

  const handlePartyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const normalizedValue = toTitleCase(value);
    setPartyName(normalizedValue);
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

  // Show full-screen party name entry page
  if (showPartyNamePage) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <div className="mx-auto w-full max-w-2xl space-y-10 px-4 py-12 text-center sm:space-y-12 sm:py-16">
          {/* Icon */}
          <div className="flex justify-center">
            <img
              src="/gift.svg"
              alt="Gift"
              className="h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40"
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-foreground text-3xl leading-tight font-normal tracking-tight sm:text-5xl md:text-6xl">
              What’s your gift exchange called?
            </h1>
            <p className="text-muted-foreground text-base font-light tracking-wide sm:text-xl md:text-2xl">
              Give your Secret Santa a name, or skip this step
            </p>
          </div>

          {/* Input */}
          <div className="space-y-3">
            <Input
              ref={inputRef}
              type="text"
              value={partyName}
              onChange={handlePartyNameChange}
              onKeyDown={handlePartyNameKeyDown}
              placeholder="e.g. Office Party 2026"
              aria-label="Gift exchange name"
              className="border-border placeholder:text-muted-foreground/40 focus-visible:border-primary h-14 rounded-none border-0 border-b-2 bg-transparent px-2 text-center text-2xl shadow-none transition-colors focus-visible:ring-0 sm:h-20 sm:text-4xl md:text-5xl dark:bg-transparent"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              autoFocus
            />
            <p className="text-muted-foreground hidden text-sm font-light tracking-wide sm:block">
              Press{" "}
              <kbd className="bg-card rounded border px-1.5 py-0.5 font-sans text-xs">
                Enter
              </kbd>{" "}
              to continue
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Button
              onClick={handlePartyNameSubmit}
              disabled={!partyName.trim()}
              className="h-11 min-w-[200px] px-6 text-base font-medium tracking-wide sm:h-12 sm:px-8"
            >
              Continue
            </Button>
            <Button
              variant="outline"
              onClick={handleSkipPartyName}
              className="h-11 min-w-[200px] px-6 text-base font-medium tracking-wide sm:h-12 sm:px-8"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
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
            <div className="mx-auto max-w-6xl space-y-8">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center gap-6 md:gap-8">
                  <img
                    src="/gift.svg"
                    alt="Gift"
                    className="hidden h-8 w-8 sm:h-10 sm:w-10 md:block md:h-12 md:w-12"
                  />
                  <h1 className="text-4xl leading-tight font-normal tracking-tight sm:text-5xl md:text-6xl">
                    Set up{" "}
                    <span className="decoration-primary italic underline decoration-4">
                      {partyName || "Your Secret Santa"}!
                    </span>
                  </h1>
                  <img
                    src="/gift.svg"
                    alt="Gift"
                    className="hidden h-8 w-8 sm:h-10 sm:w-10 md:block md:h-12 md:w-12"
                  />
                </div>
                <p className="text-muted-foreground text-base font-light tracking-wide sm:text-xl md:text-2xl">
                  Add everyone who’s playing, then set any rules for who can’t
                  draw whom
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-6">
                  <PlayerForm
                    onAddPlayer={handleAddPlayer}
                    onImport={handleImportPlayers}
                    existingPlayers={players}
                  />
                  <PlayersList
                    players={players}
                    onRemovePlayer={handleRemovePlayer}
                    onToggleAdmin={handleToggleAdmin}
                    onClearAll={handleClearAll}
                  />
                </div>

                <div className="space-y-6">
                  <ConstraintsForm
                    players={players}
                    onAddConstraint={handleAddConstraint}
                  />
                  <ConstraintsList
                    constraints={constraints}
                    players={players}
                    onRemoveConstraint={handleRemoveConstraint}
                    onClearAll={handleClearConstraints}
                  />
                </div>
              </div>

              <div className="hidden flex-col items-center gap-3 pt-8 sm:flex">
                <Button
                  onClick={handleGenerateAssignments}
                  disabled={players.length < 3}
                  className="h-12 gap-2 px-8 text-base font-medium tracking-wide"
                >
                  <Sparkles className="h-5 w-5" />
                  Generate Assignments
                </Button>
                {players.length < 3 && (
                  <p className="text-muted-foreground text-sm font-light tracking-wide">
                    Add {3 - players.length} more participant
                    {3 - players.length === 1 ? "" : "s"} to generate
                    assignments
                  </p>
                )}
              </div>
            </div>
          )}
        </main>
      )}
      {!isGenerating && !hasAssignments && players.length >= 3 && (
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur sm:hidden">
          <div className="container mx-auto px-4 py-3">
            <Button
              onClick={handleGenerateAssignments}
              className="h-12 w-full gap-2 text-base"
            >
              <Sparkles className="h-5 w-5" />
              Generate Assignments
            </Button>
          </div>
        </div>
      )}

      {/* Error Dialog */}
      <Dialog
        open={errorDialog.open}
        onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialog.message}</DialogTitle>
            <DialogDescription className="pt-4">
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
