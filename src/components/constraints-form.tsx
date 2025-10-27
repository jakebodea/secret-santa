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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!giverId || !receiverId) {
      alert('Please select both players')
      return
    }

    if (giverId === receiverId) {
      alert('A player cannot be constrained from themselves')
      return
    }

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
        <CardTitle className="text-2xl font-normal tracking-wide">Add Exclusion Rule</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="giver">This player</Label>
            <Select value={giverId} onValueChange={setGiverId}>
              <SelectTrigger id="giver">
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
              <SelectTrigger id="receiver">
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

          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label htmlFor="bidirectional">Apply both ways</Label>
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Both players cannot give to each other
              </p>
            </div>
            <Switch
              id="bidirectional"
              checked={bidirectional}
              onCheckedChange={setBidirectional}
            />
          </div>

          <Button type="submit" className="w-full">
            Add Rule
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

