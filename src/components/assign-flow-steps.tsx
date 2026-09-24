import type { Assignment, Constraint, Player } from "../lib/types";
import type { AssignFlowStepId } from "./assign-flow-metadata";
import { ConstraintsForm } from "./constraints-form";
import { ConstraintsList } from "./constraints-list";
import { ParticipantsSection } from "./participants-section";
import { ResultsDisplay } from "./results-display";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";

interface AssignFlowStepsProps {
  step: AssignFlowStepId;
  partyName: string;
  players: Player[];
  constraints: Constraint[];
  assignments: Assignment[];
  hasAssignments: boolean;
  onPartyNameChange: (value: string) => void;
  onPartyNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onAddPlayer: (player: Player) => void;
  onImportPlayers: (players: Player[]) => void;
  onRemovePlayer: (playerId: string) => void;
  onToggleAdmin: (playerId: string) => void;
  onClearAllPlayers: () => void;
  onAddConstraint: (constraint: Constraint) => void;
  onRemoveConstraint: (constraintId: string) => void;
  onClearConstraints: () => void;
  onStartOver: () => void;
}

export function AssignFlowSteps({
  step,
  partyName,
  players,
  constraints,
  assignments,
  hasAssignments,
  onPartyNameChange,
  onPartyNameKeyDown,
  onAddPlayer,
  onImportPlayers,
  onRemovePlayer,
  onToggleAdmin,
  onClearAllPlayers,
  onAddConstraint,
  onRemoveConstraint,
  onClearConstraints,
  onStartOver,
}: AssignFlowStepsProps) {
  if (step === 1) {
    return (
      <div className="space-y-6 text-center">
        <Input
          variant="party"
          type="text"
          autoFocus
          value={partyName}
          onChange={(e) => {
            onPartyNameChange(e.target.value);
          }}
          onKeyDown={onPartyNameKeyDown}
          placeholder="e.g. Office Party 2026"
          aria-label="Gift exchange name"
        />
        <p className="text-muted-foreground text-sm font-light tracking-wide">
          Optional — leave blank if you don’t need a name
        </p>
      </div>
    );
  }

  if (step === 2) {
    return (
      <ParticipantsSection
        players={players}
        onAddPlayer={onAddPlayer}
        onImport={onImportPlayers}
        onRemovePlayer={onRemovePlayer}
        onToggleAdmin={onToggleAdmin}
        onClearAll={onClearAllPlayers}
      />
    );
  }

  if (step === 3) {
    if (players.length < 2) {
      return (
        <p className="text-muted-foreground text-center text-sm font-light">
          Add more participants on the previous step to set exclusions.
        </p>
      );
    }
    return (
      <div className="space-y-6">
        <ConstraintsForm players={players} onAddConstraint={onAddConstraint} />
        <ConstraintsList
          constraints={constraints}
          players={players}
          onRemoveConstraint={onRemoveConstraint}
          onClearAll={onClearConstraints}
        />
      </div>
    );
  }

  if (step === 4 && hasAssignments) {
    return (
      <ResultsDisplay
        assignments={assignments}
        players={players}
        partyName={partyName}
        onStartOver={onStartOver}
      />
    );
  }

  if (step === 4) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="space-y-4 p-6 text-left">
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  Event
                </p>
                <h2 className="text-foreground mt-1 text-xl">
                  {partyName.trim() || "Your Secret Santa"}
                </h2>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  Participants
                </p>
                <p className="text-foreground mt-1 text-base">
                  {players.length} people ready to draw names
                </p>
                <ul className="text-muted-foreground mt-2 space-y-1 text-sm font-light">
                  {players.map((p) => (
                    <li key={p.id}>
                      {p.name}
                      {p.isAdmin ? " (organizer)" : ""}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
                  Exclusions
                </p>
                <p className="text-foreground mt-1 text-base">
                  {constraints.length === 0
                    ? "None — any pairing is allowed"
                    : `${constraints.length} rule${constraints.length === 1 ? "" : "s"} active`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <p className="text-muted-foreground text-center text-sm font-light tracking-wide">
          We’ll shuffle names next. You can review matches before emails go out.
        </p>
      </div>
    );
  }

  return null;
}
