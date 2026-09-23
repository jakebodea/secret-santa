import { useState } from 'react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'
import type { Player, Constraint } from '../lib/types'

interface ConstraintsFormProps {
  players: Player[]
  onAddConstraint: (constraint: Constraint) => void
}

export function ConstraintsForm({
  players,
  onAddConstraint,
}: ConstraintsFormProps) {
  const [giverId, setGiverId] = useState<string>('')
  const [receiverId, setReceiverId] = useState<string>('')
  const [bidirectional, setBidirectional] = useState(true)

  const canSubmit = !!giverId && !!receiverId && giverId !== receiverId

  const handleGiverChange = (id: string) => {
    setGiverId(id)
    if (id === receiverId) setReceiverId('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!canSubmit) return

    const newConstraint: Constraint = {
      id: crypto.randomUUID(),
      giverId,
      receiverId,
      bidirectional,
    }

    onAddConstraint(newConstraint)

    // Reset form
    setGiverId('')
    setReceiverId('')
    setBidirectional(true)
  }

  if (players.length < 2) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl sm:text-3xl font-normal tracking-tight">Add Exclusion Rule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="giver">This player</Label>
            <Select value={giverId} onValueChange={handleGiverChange}>
              <SelectTrigger id="giver" className="w-full h-11">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {players.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="receiver">Cannot give to</Label>
            <Select value={receiverId} onValueChange={setReceiverId}>
              <SelectTrigger id="receiver" className="w-full h-11">
                <SelectValue placeholder="Select player" />
              </SelectTrigger>
              <SelectContent>
                {players
                  .filter((player) => player.id !== giverId)
                  .map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          </div>

          <div className="flex items-center justify-between space-x-2 p-2.5 sm:p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="bidirectional">Apply both ways</Label>
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Neither can draw the other
              </p>
            </div>
            <Switch
              id="bidirectional"
              checked={bidirectional}
              onCheckedChange={setBidirectional}
            />
          </div>

          <Button type="submit" disabled={!canSubmit} className="w-full h-10 sm:h-11">
            Add Rule
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

