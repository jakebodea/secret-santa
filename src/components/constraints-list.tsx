import { AnimatePresence, m } from "framer-motion";
import { Trash2, ArrowRight, ArrowLeftRight } from "lucide-react";

import { listItemMotion } from "../lib/motion";
import { getPlayerName } from "../lib/secret-santa-assignments";
import type { Player, Constraint } from "../lib/types";
import { Button } from "./ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "./ui/card";

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
      <p className="text-muted-foreground border-border/60 rounded-xl border border-dashed px-6 py-5 text-center text-sm font-light tracking-wide">
        No rules yet. Optional, but handy for couples or housemates who
        shouldn’t draw each other.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle variant="section">
          Rules{" "}
          <span className="text-muted-foreground tabular-nums">
            ({constraints.length})
          </span>
        </CardTitle>
        <CardAction>
          <Button variant="destructive-ghost" size="sm" onClick={onClearAll}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="border-border/60 overflow-hidden rounded-lg border">
          <AnimatePresence initial={false}>
            {constraints.map((constraint) => (
              <m.div
                key={constraint.id}
                {...listItemMotion}
                className="border-border/60 overflow-hidden border-b last:border-b-0"
              >
                <div className="relative flex items-center justify-center py-2.5 pr-10">
                  <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 pl-10 sm:gap-4">
                    <span className="truncate text-right font-normal tracking-wide">
                      {getPlayerName(players, constraint.giverId)}
                    </span>
                    {constraint.bidirectional ? (
                      <ArrowLeftRight
                        className="text-muted-foreground size-4"
                        aria-label="can’t draw each other"
                      />
                    ) : (
                      <ArrowRight
                        className="text-muted-foreground size-4"
                        aria-label="can’t draw"
                      />
                    )}
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
              </m.div>
            ))}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
