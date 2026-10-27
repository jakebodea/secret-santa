import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useReducer, useState } from "react";

import type { AssignFlowStepId } from "../components/assign-flow-metadata";
import { AssignFlowSteps } from "../components/assign-flow-steps";
import { buildAssignShellFooter } from "../components/assign-shell-footer";
import { AssignStepperShell } from "../components/assign-stepper-shell";
import { AssignmentAnimation } from "../components/assignment-animation";
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
  addConstraint,
  addPlayer,
  clearAllData,
  clearAssignments,
  getData,
  removeConstraint,
  removePlayer,
  replacePlayers,
  saveAssignments,
  saveConstraints,
  savePartyName,
  toggleAdmin,
} from "../lib/storage";
import { getTurnstileSiteKey } from "../lib/turnstile-site-key";
import type { Assignment, Constraint, Player } from "../lib/types";
import { toTitleCase } from "../lib/utils";

export const Route = createFileRoute("/assign")({
  component: AssignPage,
  loader: async () => ({ turnstileSiteKey: await getTurnstileSiteKey() }),
});

interface ListState {
  players: Player[];
  constraints: Constraint[];
  assignments: Assignment[];
  animationComplete: boolean;
}

type ListAction =
  | { type: "sync_from_storage"; animationComplete?: boolean }
  | { type: "patch"; patch: Partial<ListState> }
  | { type: "reset_lists" };

function listReducer(state: ListState, action: ListAction): ListState {
  switch (action.type) {
    case "sync_from_storage": {
      const data = getData();
      return {
        animationComplete: action.animationComplete ?? state.animationComplete,
        assignments: data.assignments,
        constraints: data.constraints,
        players: data.players,
      };
    }
    case "patch": {
      return { ...state, ...action.patch };
    }
    case "reset_lists": {
      return {
        animationComplete: false,
        assignments: [],
        constraints: [],
        players: [],
      };
    }
    default: {
      return state;
    }
  }
}

function AssignPage() {
  const { turnstileSiteKey } = Route.useLoaderData();
  const navigate = useNavigate();
  const [stepState, setStepState] = useState<{
    step: AssignFlowStepId;
    direction: 1 | -1;
  }>({ direction: 1, step: 1 });
  const { step, direction } = stepState;
  const [partyName, setPartyName] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
    details?: string;
  }>({ message: "", open: false });
  const [listState, dispatchList] = useReducer(listReducer, {
    animationComplete: false,
    assignments: [],
    constraints: [],
    players: [],
  });

  const { players, constraints, assignments, animationComplete } = listState;

  useEffect(() => {
    clearAllData();
  }, []);

  useEffect(() => {
    if (!isGenerating) {
      return;
    }
    const timer = setTimeout(() => {
      setIsGenerating(false);
      dispatchList({
        patch: { animationComplete: true },
        type: "patch",
      });
    }, 3000);
    return () => {
      clearTimeout(timer);
    };
  }, [isGenerating]);

  const goToStep = (next: AssignFlowStepId) => {
    setStepState({ direction: next >= step ? 1 : -1, step: next });
  };

  const persistPartyName = () => {
    if (partyName.trim()) {
      const formatted = toTitleCase(partyName.trim());
      setPartyName(formatted);
      savePartyName(formatted);
    } else {
      savePartyName("");
    }
  };

  const handleAddPlayer = (player: Player) => {
    addPlayer(player);
    dispatchList({ type: "sync_from_storage" });
  };

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId);
    dispatchList({ type: "sync_from_storage" });
  };

  const handleToggleAdmin = (playerId: string) => {
    toggleAdmin(playerId);
    dispatchList({ type: "sync_from_storage" });
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
    dispatchList({ animationComplete: false, type: "sync_from_storage" });
  };

  const handleAddConstraint = (constraint: Constraint) => {
    addConstraint(constraint);
    dispatchList({ type: "sync_from_storage" });
  };

  const handleRemoveConstraint = (constraintId: string) => {
    removeConstraint(constraintId);
    dispatchList({ type: "sync_from_storage" });
  };

  const handleGenerateAssignments = (
    previousAssignments: Assignment[] = []
  ) => {
    if (players.length < 3) {
      setErrorDialog({
        details:
          "You need at least 3 players to generate Secret Santa assignments.",
        message: "Not enough players",
        open: true,
      });
      return;
    }

    const result = generateAssignments(
      players,
      constraints,
      previousAssignments
    );

    if (result.success && result.assignments) {
      setIsGenerating(true);
      saveAssignments(result.assignments);
      dispatchList({
        patch: { animationComplete: false, assignments: result.assignments },
        type: "patch",
      });
    } else {
      setIsGenerating(false);
      setErrorDialog({
        details: result.details,
        message: result.error || "Failed to generate assignments",
        open: true,
      });
    }
  };

  const handleStartOver = () => {
    goToStep(2);
    clearAssignments();
    dispatchList({
      patch: { animationComplete: false, assignments: [] },
      type: "patch",
    });
  };

  const handleClearAll = () => {
    clearAllData();
    dispatchList({ type: "reset_lists" });
    goToStep(2);
  };

  const handleClearConstraints = () => {
    saveConstraints([]);
    dispatchList({
      patch: { constraints: [] },
      type: "patch",
    });
  };

  const handlePartyNameChange = (value: string) => {
    setPartyName(toTitleCase(value));
  };

  const handlePartyNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      persistPartyName();
      goToStep(2);
    }
  };

  const handleStepBack = () => {
    if (step > 1) {
      goToStep((step - 1) as AssignFlowStepId);
      return;
    }
    void navigate({ to: "/" });
  };

  const hasAssignments = assignments.length > 0 && animationComplete;

  const shellFooter = buildAssignShellFooter({
    hasAssignments,
    onBack: handleStepBack,
    onGenerateAssignments: handleGenerateAssignments,
    onGoToStep: goToStep,
    onPersistPartyNameAndContinue: () => {
      persistPartyName();
      goToStep(2);
    },
    playersCount: players.length,
    step,
  });

  if (isGenerating) {
    return <AssignmentAnimation />;
  }

  return (
    <>
      <AssignStepperShell
        currentStep={step}
        direction={direction}
        showHeading={!hasAssignments}
        {...shellFooter}
      >
        <AssignFlowSteps
          assignments={assignments}
          constraints={constraints}
          hasAssignments={hasAssignments}
          onAddConstraint={handleAddConstraint}
          onAddPlayer={handleAddPlayer}
          onClearAllPlayers={handleClearAll}
          onClearConstraints={handleClearConstraints}
          onImportPlayers={handleImportPlayers}
          onPartyNameChange={handlePartyNameChange}
          onPartyNameKeyDown={handlePartyNameKeyDown}
          onRemoveConstraint={handleRemoveConstraint}
          onRemovePlayer={handleRemovePlayer}
          onRedraw={() => handleGenerateAssignments(assignments)}
          onStartOver={handleStartOver}
          onToggleAdmin={handleToggleAdmin}
          partyName={partyName}
          players={players}
          step={step}
          turnstileSiteKey={turnstileSiteKey}
        />
      </AssignStepperShell>

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
    </>
  );
}
