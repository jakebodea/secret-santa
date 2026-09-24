import { Sparkles } from "lucide-react";

import { ConstraintsForm } from "../components/constraints-form";
import { ConstraintsList } from "../components/constraints-list";
import { PlayerForm } from "../components/player-form";
import { PlayersList } from "../components/players-list";
import { Button } from "../components/ui/button";
import type { Constraint, Player } from "../lib/types";

interface AssignSetupViewProps {
  partyName: string;
  players: Player[];
  constraints: Constraint[];
  onAddPlayer: (player: Player) => void;
  onImportPlayers: (players: Player[]) => void;
  onRemovePlayer: (playerId: string) => void;
  onToggleAdmin: (playerId: string) => void;
  onClearAllPlayers: () => void;
  onAddConstraint: (constraint: Constraint) => void;
  onRemoveConstraint: (constraintId: string) => void;
  onClearConstraints: () => void;
  onGenerateAssignments: () => void;
}

export function AssignSetupView({
  partyName,
  players,
  constraints,
  onAddPlayer,
  onImportPlayers,
  onRemovePlayer,
  onToggleAdmin,
  onClearAllPlayers,
  onAddConstraint,
  onRemoveConstraint,
  onClearConstraints,
  onGenerateAssignments,
}: AssignSetupViewProps) {
  const canGenerate = players.length >= 3;

  return (
    <>
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
            Add everyone who’s playing, then set any rules for who can’t draw
            whom
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <PlayerForm
              onAddPlayer={onAddPlayer}
              onImport={onImportPlayers}
              existingPlayers={players}
            />
            <PlayersList
              players={players}
              onRemovePlayer={onRemovePlayer}
              onToggleAdmin={onToggleAdmin}
              onClearAll={onClearAllPlayers}
            />
          </div>

          <div className="space-y-6">
            <ConstraintsForm
              players={players}
              onAddConstraint={onAddConstraint}
            />
            <ConstraintsList
              constraints={constraints}
              players={players}
              onRemoveConstraint={onRemoveConstraint}
              onClearAll={onClearConstraints}
            />
          </div>
        </div>

        <div className="hidden flex-col items-center gap-3 pt-8 sm:flex">
          <Button
            onClick={onGenerateAssignments}
            disabled={!canGenerate}
            size="cta"
          >
            <Sparkles data-icon="inline-start" />
            Generate Assignments
          </Button>
          {!canGenerate && (
            <p className="text-muted-foreground text-sm font-light tracking-wide">
              Add {3 - players.length} more participant
              {3 - players.length === 1 ? "" : "s"} to generate assignments
            </p>
          )}
        </div>
      </div>

      {canGenerate && (
        <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 fixed inset-x-0 bottom-0 z-40 border-t backdrop-blur sm:hidden">
          <div className="container mx-auto px-4 py-3">
            <Button
              onClick={onGenerateAssignments}
              size="cta"
              className="w-full"
            >
              <Sparkles data-icon="inline-start" />
              Generate Assignments
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
