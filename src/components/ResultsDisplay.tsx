import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import { ArrowRight, RotateCcw, Crown } from 'lucide-react'
import type { Player, Assignment } from '../lib/types'
import { getPlayerName } from '../lib/secretSanta'

interface ResultsDisplayProps {
  assignments: Assignment[]
  players: Player[]
  onStartOver: () => void
}

export function ResultsDisplay({
  assignments,
  players,
  onStartOver,
}: ResultsDisplayProps) {
  const getPlayer = (playerId: string) =>
    players.find((p) => p.id === playerId)

  return (
    <Card className="border-primary/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🎉 Secret Santa Assignments</CardTitle>
          <Button variant="outline" onClick={onStartOver}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Start Over
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-accent/30 p-4 rounded-lg border border-accent mb-4">
          <p className="text-sm font-medium mb-2">📧 Coming Soon:</p>
          <p className="text-sm text-muted-foreground">
            Each participant will receive an email with their assigned recipient.
            For now, you can see all assignments below.
          </p>
        </div>

        <div className="space-y-3">
          {assignments.map((assignment) => {
            const giver = getPlayer(assignment.giverId)
            const receiver = getPlayer(assignment.receiverId)

            if (!giver || !receiver) return null

            return (
              <div
                key={assignment.giverId}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {giver.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{giver.name}</p>
                      {giver.isAdmin && (
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="w-3 h-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{giver.email}</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {receiver.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{receiver.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {receiver.email}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {players.find((p) => p.isAdmin) && (
          <div className="bg-muted/50 p-4 rounded-lg border mt-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">
                {players.find((p) => p.isAdmin)?.name}
              </strong>{' '}
              (Admin) will receive the complete assignment list via email as a
              backup. Please resist the temptation to look at it! 🙈
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

