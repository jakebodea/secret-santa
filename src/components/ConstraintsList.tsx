import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Trash2, ArrowRight, ArrowLeftRight } from 'lucide-react'
import type { Player, Constraint } from '../lib/types'
import { getPlayerName } from '../lib/secretSanta'

interface ConstraintsListProps {
  constraints: Constraint[]
  players: Player[]
  onRemoveConstraint: (constraintId: string) => void
}

export function ConstraintsList({
  constraints,
  players,
  onRemoveConstraint,
}: ConstraintsListProps) {
  if (constraints.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exclusion Rules ({constraints.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
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
        <CardTitle>Exclusion Rules ({constraints.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {constraints.map((constraint) => (
            <div
              key={constraint.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <Badge variant="outline" className="font-normal">
                  {getPlayerName(players, constraint.giverId)}
                </Badge>
                {constraint.bidirectional ? (
                  <ArrowLeftRight className="w-4 h-4 text-muted-foreground" />
                ) : (
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                )}
                <Badge variant="outline" className="font-normal">
                  {getPlayerName(players, constraint.receiverId)}
                </Badge>
                {constraint.bidirectional && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (both ways)
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveConstraint(constraint.id)}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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

