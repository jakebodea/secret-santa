import { Plus } from "lucide-react";
import { useState } from "react";

import type { Player, Constraint } from "../lib/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Switch } from "./ui/switch";

interface ConstraintsFormProps {
  players: Player[];
  onAddConstraint: (constraint: Constraint) => void;
}

export function ConstraintsForm({
  players,
  onAddConstraint,
}: ConstraintsFormProps) {
  const [giverId, setGiverId] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState<string | null>(null);
  const [bidirectional, setBidirectional] = useState(true);

  const playerItems = [
    { label: "Select player", value: null },
    ...players.map((player) => ({ label: player.name, value: player.id })),
  ];

  const canSubmit = !!giverId && !!receiverId && giverId !== receiverId;

  const handleGiverChange = (id: string | null) => {
    setGiverId(id);
    if (id === receiverId) {
      setReceiverId(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit || !giverId || !receiverId) {
      return;
    }

    const newConstraint: Constraint = {
      bidirectional,
      giverId,
      id: crypto.randomUUID(),
      receiverId,
    };

    onAddConstraint(newConstraint);

    // Reset form
    setGiverId(null);
    setReceiverId(null);
    setBidirectional(true);
  };

  if (players.length < 2) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle variant="section">New rule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="giver">This player</Label>
              <Select
                items={playerItems}
                value={giverId}
                onValueChange={handleGiverChange}
              >
                <SelectTrigger id="giver" size="lg" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {players.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver">Cannot give to</Label>
              <Select
                items={playerItems.filter(
                  (item) => item.value !== giverId || item.value === null
                )}
                value={receiverId}
                onValueChange={setReceiverId}
              >
                <SelectTrigger id="receiver" size="lg" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {players.map((player) =>
                      player.id === giverId ? null : (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      )
                    )}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div className="space-y-0.5">
              <Label htmlFor="bidirectional">Apply both ways</Label>
              <p className="text-muted-foreground text-sm font-light tracking-wide">
                Neither can draw the other
              </p>
            </div>
            <Switch
              id="bidirectional"
              checked={bidirectional}
              onCheckedChange={setBidirectional}
            />
          </div>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-10 w-full sm:h-11"
          >
            <Plus data-icon="inline-start" />
            Add rule
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
