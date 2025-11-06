import { Avatar, AvatarFallback } from './ui/avatar'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu'
import { Trash2, Crown, MoreVertical } from 'lucide-react'
import type { Player } from '../lib/types'

interface PlayersListProps {
  players: Player[]
  onRemovePlayer: (playerId: string) => void
  onToggleAdmin: (playerId: string) => void
  onClearAll: () => void
}

export function PlayersList({ players, onRemovePlayer, onToggleAdmin, onClearAll }: PlayersListProps) {
  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-normal tracking-wide">Participants ({players.length})</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-base text-muted-foreground font-light tracking-wide text-center py-8">
            No participants yet. Add your first player to get started!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-normal tracking-wide">
            Participants ({players.length})
            {players.length < 3 && (
              <span className="text-base font-light text-muted-foreground ml-2">
                (minimum 3 required)
              </span>
            )}
          </CardTitle>
          {players.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearAll}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear
            </Button>
          )}
        </div>
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
                    <p className="font-normal tracking-wide">{player.name}</p>
                    {player.isAdmin && (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="w-3 h-3" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground font-light tracking-wide">{player.email}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleAdmin(player.id)}>
                    <Crown className="w-4 h-4" />
                    {player.isAdmin ? 'Remove admin' : 'Make admin'}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onRemovePlayer(player.id)}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {players.length > 0 && players.some(p => p.isAdmin) && (
            <p className="text-sm text-muted-foreground font-light tracking-wide pt-2">
              The admin will receive the complete list of assignments (for backup
              purposes). They're encouraged not to look at it!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

