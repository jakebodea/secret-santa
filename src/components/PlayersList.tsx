import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Trash2, Crown } from 'lucide-react'
import type { Player } from '../lib/types'

interface PlayersListProps {
  players: Player[]
  onRemovePlayer: (playerId: string) => void
}

export function PlayersList({ players, onRemovePlayer }: PlayersListProps) {
  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Participants ({players.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No participants yet. Add your first player to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Participants ({players.length})
          {players.length < 3 && (
            <span className="text-sm font-normal text-muted-foreground ml-2">
              (minimum 3 required)
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player) => (
            <div
              key={player.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {player.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{player.name}</p>
                    {player.isAdmin && (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="w-3 h-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{player.email}</p>
                </div>
              </div>
              {!player.isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemovePlayer(player.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          {players.length > 0 && players[0].isAdmin && (
            <p className="text-xs text-muted-foreground pt-2">
              The admin will receive the complete list of assignments (for backup
              purposes). They're encouraged not to look at it!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

