import { Trash2, Crown, MoreVertical, ChevronDown } from "lucide-react";
import { useState } from "react";

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
}

const AVATAR_COLORS = [
  "bg-primary/10 text-primary",
  "bg-secondary/10 text-secondary",
  "bg-accent/40 text-foreground",
];

export function PlayersList({
  players,
  onRemovePlayer,
  onToggleAdmin,
  onClearAll,
}: PlayersListProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (players.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-normal tracking-tight sm:text-3xl">
              Participants ({players.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-6 text-center text-sm font-light tracking-wide sm:text-base">
            No one’s here yet. The first person you add becomes the admin.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer sm:cursor-default"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex flex-1 items-center gap-2">
            <CardTitle className="text-2xl font-normal tracking-tight sm:text-3xl">
              Participants ({players.length})
              {players.length < 3 && (
                <span className="text-muted-foreground ml-2 text-sm font-light sm:text-base">
                  (minimum 3 required)
                </span>
              )}
            </CardTitle>
            <ChevronDown
              className={`text-muted-foreground h-5 w-5 transition-transform sm:hidden ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>
          {players.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onClearAll();
              }}
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            >
              <Trash2 className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className={`sm:block ${isExpanded ? "block" : "hidden"}`}>
        <div className="space-y-3">
          {players.map((player, index) => (
            <div
              key={player.id}
              className="bg-card hover:bg-muted/60 flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar>
                  <AvatarFallback
                    className={`text-sm font-medium ${AVATAR_COLORS[index % AVATAR_COLORS.length]}`}
                  >
                    {player.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-normal tracking-wide">{player.name}</p>
                    {player.isAdmin && (
                      <Badge variant="secondary" className="gap-1">
                        <Crown className="h-3 w-3" />
                        Admin
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
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground h-8 w-8 shrink-0"
                  >
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Options for {player.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onToggleAdmin(player.id)}>
                    <Crown className="h-4 w-4" />
                    {player.isAdmin ? "Remove admin" : "Make admin"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onRemovePlayer(player.id)}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete player
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
          {players.some((p) => p.isAdmin) && (
            <p className="text-muted-foreground pt-2 text-sm font-light tracking-wide">
              The admin also gets the full list of assignments as a backup. No
              peeking!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
