import { Trash2, Crown, MoreVertical } from "lucide-react";

import type { Player } from "../lib/types";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";

interface PlayersListProps {
  players: Player[];
  onRemovePlayer: (playerId: string) => void;
  onToggleAdmin: (playerId: string) => void;
  onClearAll: () => void;
  embedded?: boolean;
}

function PlayerRow({
  player,
  onRemovePlayer,
  onToggleAdmin,
}: {
  player: Player;
  onRemovePlayer: (playerId: string) => void;
  onToggleAdmin: (playerId: string) => void;
}) {
  return (
    <div className="hover:bg-muted/50 flex items-center justify-between gap-3 rounded-lg px-2 py-2.5 transition-colors sm:px-3">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar className="size-9">
          <AvatarFallback tone="muted">
            {player.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-normal tracking-wide">{player.name}</p>
            {player.isAdmin && (
              <Badge variant="secondary">
                <span className="flex items-center gap-1">
                  <Crown className="h-3 w-3" aria-hidden />
                  Organizer
                </span>
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground truncate text-sm font-light tracking-wide">
            {player.email}
          </p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            <MoreVertical className="h-4 w-4" />
            <span className="sr-only">Options for {player.name}</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => {
              onToggleAdmin(player.id);
            }}
          >
            <Crown className="h-4 w-4" />
            {player.isAdmin ? "Remove organizer role" : "Make organizer"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              onRemovePlayer(player.id);
            }}
            variant="destructive"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function PlayersList({
  players,
  onRemovePlayer,
  onToggleAdmin,
  onClearAll,
  embedded = false,
}: PlayersListProps) {
  if (players.length === 0 && !embedded) {
    return (
      <Card>
        <CardHeader>
          <CardTitle variant="section">Participants (0)</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-6 text-center text-sm font-light tracking-wide sm:text-base">
            No one’s here yet. The first person you add becomes the organizer.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (embedded) {
    return (
      <div className="space-y-1">
        <p className="text-muted-foreground mb-2 text-xs font-medium tracking-widest uppercase">
          In your group
        </p>
        <div className="border-border/60 divide-border/60 -mx-1 divide-y rounded-lg border">
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              onRemovePlayer={onRemovePlayer}
              onToggleAdmin={onToggleAdmin}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle variant="section">
            Participants ({players.length})
            {players.length < 3 && (
              <span className="text-muted-foreground ml-2 text-sm font-light sm:text-base">
                (minimum 3 required)
              </span>
            )}
          </CardTitle>
          <Button variant="destructive-ghost" size="sm" onClick={onClearAll}>
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {players.map((player) => (
            <PlayerRow
              key={player.id}
              player={player}
              onRemovePlayer={onRemovePlayer}
              onToggleAdmin={onToggleAdmin}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
