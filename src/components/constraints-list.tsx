import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Trash2, ArrowRight, ArrowLeftRight } from 'lucide-react'
import type { Player, Constraint } from '../lib/types'
import { getPlayerName } from '../lib/secret-santa-assignments'

interface ConstraintsListProps {
  constraints: Constraint[]
  players: Player[]
  onRemoveConstraint: (constraintId: string) => void
  onClearAll: () => void
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
            <CardTitle className="text-2xl sm:text-3xl font-normal tracking-tight">Exclusion Rules</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm sm:text-base text-muted-foreground font-light tracking-wide text-center py-6">
            No rules yet. Optional, but handy for couples or housemates who
            shouldn't draw each other.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl sm:text-3xl font-normal tracking-tight">Exclusion Rules</CardTitle>
          {constraints.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {constraints.map((constraint) => (
            <div key={constraint.id} className="flex items-center justify-center py-2.5 pr-10 relative rounded-lg border bg-card">
              <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 pl-10">
                <span className="font-normal tracking-wide text-right truncate">
                  {getPlayerName(players, constraint.giverId)}
                </span>
                <div className="flex items-center justify-center">
                  {constraint.bidirectional ? (
                    <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <span className="font-normal tracking-wide text-left truncate">
                  {getPlayerName(players, constraint.receiverId)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveConstraint(constraint.id)}
                aria-label="Remove rule"
                className="absolute right-1 h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

