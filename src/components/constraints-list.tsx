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
            <CardTitle className="text-xl sm:text-2xl font-normal tracking-wide">Exclusion Rules</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground font-light tracking-wide text-center py-8">
            No exclusion rules yet. Add rules if certain players shouldn't give to
            each other (e.g., spouses, close family members).
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl sm:text-2xl font-normal tracking-wide">Exclusion Rules</CardTitle>
          {constraints.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear Rules
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {constraints.map((constraint) => (
            <div key={constraint.id} className="flex items-center justify-center py-2 relative">
              <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-4 px-4">
                <span className="text-lg font-normal tracking-wide text-right">
                  {getPlayerName(players, constraint.giverId)}
                </span>
                <div className="flex items-center justify-center">
                  {constraint.bidirectional ? (
                    <ArrowLeftRight className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                <span className="text-lg font-normal tracking-wide text-left">
                  {getPlayerName(players, constraint.receiverId)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveConstraint(constraint.id)}
                className="absolute right-0 text-destructive hover:text-destructive hover:bg-destructive/10"
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

