import { Trash2, ArrowRight, ArrowLeftRight } from "lucide-react";

import { getPlayerName } from "../lib/secret-santa-assignments";
import type { Player, Constraint } from "../lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface ConstraintsListProps {
  constraints: Constraint[];
  players: Player[];
  onRemoveConstraint: (constraintId: string) => void;
  onClearAll: () => void;
}

export function ConstraintsList({
  constraints,
  players,
  onRemoveConstraint,
  onClearAll,
}: ConstraintsListProps) {
  if (constraints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle variant="section">Exclusion Rules</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-6 text-center text-sm font-light tracking-wide sm:text-base">
            No rules yet. Optional, but handy for couples or housemates who
            shouldn’t draw each other.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle variant="section">Exclusion Rules</CardTitle>
          {constraints.length > 0 && (
            <Button variant="destructive-ghost" size="sm" onClick={onClearAll}>
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {constraints.map((constraint) => (
            <div
              key={constraint.id}
              className="bg-card relative flex items-center justify-center rounded-lg border py-2.5 pr-10"
            >
              <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 pl-10 sm:gap-4">
                <span className="truncate text-right font-normal tracking-wide">
                  {getPlayerName(players, constraint.giverId)}
                </span>
                <div className="flex items-center justify-center">
                  {constraint.bidirectional ? (
                    <ArrowLeftRight className="text-muted-foreground h-5 w-5" />
                  ) : (
                    <ArrowRight className="text-muted-foreground h-5 w-5" />
                  )}
                </div>
                <span className="truncate text-left font-normal tracking-wide">
                  {getPlayerName(players, constraint.receiverId)}
                </span>
              </div>
              <Button
                variant="destructive-ghost"
                size="icon-sm"
                onClick={() => {
                  onRemoveConstraint(constraint.id);
                }}
                aria-label="Remove rule"
                className="absolute right-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
