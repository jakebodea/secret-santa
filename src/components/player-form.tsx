import { useForm } from '@tanstack/react-form'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import type { Player } from '../lib/types'

interface PlayerFormProps {
  onAddPlayer: (player: Player) => void
  existingPlayers: Player[]
}

export function PlayerForm({ onAddPlayer, existingPlayers }: PlayerFormProps) {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      // Check for duplicate names
      const duplicate = existingPlayers.find(
        (p) => p.name.toLowerCase() === value.name.toLowerCase()
      )
      if (duplicate) {
        alert('A player with this name already exists!')
        return
      }

      // Create new player
      const newPlayer: Player = {
        id: crypto.randomUUID(),
        name: value.name,
        email: value.email,
        isAdmin: existingPlayers.length === 0, // First player is admin
      }

      onAddPlayer(newPlayer)

      // Reset form
      form.reset()
    },
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl sm:text-2xl font-normal tracking-wide">Add Participant</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            e.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-4"
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) =>
                !value ? 'Name is required' : undefined,
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter name"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) => {
                if (!value) return 'Email is required'
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                  return 'Please enter a valid email'
                }
                return undefined
              },
            }}
          >
            {(field) => (
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors && (
                  <p className="text-sm text-destructive">
                    {field.state.meta.errors.join(', ')}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button type="submit" disabled={!canSubmit || isSubmitting} className="h-10 sm:h-11 px-4 sm:px-5">
                {isSubmitting ? 'Adding...' : 'Add Player'}
              </Button>
            )}
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  )
}

