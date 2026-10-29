import { Crown, Printer } from "lucide-react";

import {
  drawingPlayers,
  drawsNames,
  handDeliveryPlayers,
} from "../lib/players";
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
  turnstileSiteKey: string;
  onPartyNameChange: (value: string) => void;
  onPartyNameKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onAddPlayer: (player: Player) => void;
  onImportPlayers: (players: Player[]) => void;
  onRemovePlayer: (playerId: string) => void;
  onToggleAdmin: (playerId: string) => void;
  onToggleSitsOut: (playerId: string) => void;
  onClearAllPlayers: () => void;
  onAddConstraint: (constraint: Constraint) => void;
  onRemoveConstraint: (constraintId: string) => void;
  onClearConstraints: () => void;
  onStartOver: () => void;
  onRedraw: () => void;
}

export function AssignFlowSteps({
  step,
  partyName,
  players,
  constraints,
  assignments,
  hasAssignments,
  turnstileSiteKey,
  onPartyNameChange,
  onPartyNameKeyDown,
  onAddPlayer,
  onImportPlayers,
  onRemovePlayer,
  onToggleAdmin,
  onToggleSitsOut,
  onClearAllPlayers,
  onAddConstraint,
  onRemoveConstraint,
  onClearConstraints,
  onStartOver,
  onRedraw,
}: AssignFlowStepsProps) {
  if (step === 1) {
    return (
      <div className="space-y-6 text-center">
        <Input
          variant="party"
          type="text"
          enterKeyHint="next"
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
        onToggleSitsOut={onToggleSitsOut}
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
        turnstileSiteKey={turnstileSiteKey}
        onStartOver={onStartOver}
        onRedraw={onRedraw}
      />
    );
  }

  if (step === 4) {
    const drawing = drawingPlayers(players);
    const sittingOut = players.filter((p) => !drawsNames(p));
    const cardCount = handDeliveryPlayers(players).length;
    return (
      <div className="space-y-6">
        <Card>
          <CardContent>
            <div className="divide-border/60 space-y-5 divide-y text-left [&>*:not(:last-child)]:pb-5">
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
                  {drawing.length} people ready to draw names
                </p>
                <ul className="mt-3 flex flex-wrap gap-1.5">
                  {drawing.map((p) => (
                    <li
                      key={p.id}
                      className="bg-muted text-foreground/80 inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-light"
                    >
                      {p.isAdmin && (
                        <Crown
                          className="text-secondary size-3.5"
                          aria-label="Organizer"
                        />
                      )}
                      {p.name}
                    </li>
                  ))}
                </ul>
                {sittingOut.length > 0 && (
                  <p className="text-muted-foreground mt-3 text-sm font-light">
                    {sittingOut.map((p) => p.name).join(", ")} organizing, not
                    drawing.
                  </p>
                )}
                {cardCount > 0 && (
                  <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-sm font-light">
                    <Printer className="size-3.5 shrink-0" aria-hidden />
                    {cardCount === drawing.length
                      ? "Everyone chose QR cards / private links. Print, scan, or share after the draw."
                      : `${cardCount} using QR cards / private links; ${drawing.length - cardCount} using email.`}
                  </p>
                )}
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
          We’ll shuffle names next. Nothing goes out until you send it.
        </p>
      </div>
    );
  }

  return null;
}
