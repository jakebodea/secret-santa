import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Sparkles, Home } from 'lucide-react'
import { Link } from '@tanstack/react-router'

import { PlayerForm } from '../components/PlayerForm'
import { PlayersList } from '../components/PlayersList'
import { ConstraintsForm } from '../components/ConstraintsForm'
import { ConstraintsList } from '../components/ConstraintsList'
import { ResultsDisplay } from '../components/ResultsDisplay'

import type { Player, Constraint, Assignment } from '../lib/types'
import {
  getData,
  addPlayer,
  removePlayer,
  toggleAdmin,
  addConstraint,
  removeConstraint,
  saveAssignments,
  clearAssignments,
} from '../lib/storage'
import { generateAssignments } from '../lib/secretSanta'

export const Route = createFileRoute('/assign')({
  component: AssignPage,
})

function AssignPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean
    message: string
    details?: string
  }>({ open: false, message: '' })

  // Load data on mount
  useEffect(() => {
    const data = getData()
    setPlayers(data.players)
    setConstraints(data.constraints)
    setAssignments(data.assignments)
  }, [])

  const handleAddPlayer = (player: Player) => {
    addPlayer(player)
    const data = getData()
    setPlayers(data.players)
  }

  const handleRemovePlayer = (playerId: string) => {
    removePlayer(playerId)
    const data = getData()
    setPlayers(data.players)
    setConstraints(data.constraints)
  }

  const handleToggleAdmin = (playerId: string) => {
    toggleAdmin(playerId)
    const data = getData()
    setPlayers(data.players)
  }

  const handleAddConstraint = (constraint: Constraint) => {
    addConstraint(constraint)
    const data = getData()
    setConstraints(data.constraints)
  }

  const handleRemoveConstraint = (constraintId: string) => {
    removeConstraint(constraintId)
    const data = getData()
    setConstraints(data.constraints)
  }

  const handleGenerateAssignments = () => {
    if (players.length < 3) {
      setErrorDialog({
        open: true,
        message: 'Not enough players',
        details: 'You need at least 3 players to generate Secret Santa assignments.',
      })
      return
    }

    const result = generateAssignments(players, constraints)

    if (result.success && result.assignments) {
      saveAssignments(result.assignments)
      setAssignments(result.assignments)
    } else {
      setErrorDialog({
        open: true,
        message: result.error || 'Failed to generate assignments',
        details: result.details,
      })
    }
  }

  const handleStartOver = () => {
    clearAssignments()
    setAssignments([])
  }

  const hasAssignments = assignments.length > 0

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80">
              <Home className="w-5 h-5" />
              <span className="text-xl font-normal tracking-wide">Secret Santa</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {hasAssignments ? (
          <div className="max-w-4xl mx-auto">
            <ResultsDisplay
              assignments={assignments}
              players={players}
              onStartOver={handleStartOver}
            />
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 md:gap-6">
                <img
                  src="/gift.svg"
                  alt="Gift"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
                <h1 className="text-5xl md:text-6xl font-normal tracking-tight leading-tight">Setup Your Secret Santa</h1>
                <img
                  src="/gift.svg"
                  alt="Gift"
                  className="w-12 h-12 md:w-16 md:h-16"
                />
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
                Add participants and set any exclusion rules before generating
                assignments
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PlayerForm
                  onAddPlayer={handleAddPlayer}
                  existingPlayers={players}
                />
                <PlayersList
                  players={players}
                  onRemovePlayer={handleRemovePlayer}
                  onToggleAdmin={handleToggleAdmin}
                />
              </div>

              <div className="space-y-6">
                <ConstraintsForm
                  players={players}
                  onAddConstraint={handleAddConstraint}
                />
                <ConstraintsList
                  constraints={constraints}
                  players={players}
                  onRemoveConstraint={handleRemoveConstraint}
                />
              </div>
            </div>

            {players.length >= 3 && (
              <div className="flex justify-center pt-8">
                <Button
                  size="lg"
                  onClick={handleGenerateAssignments}
                  className="text-base font-medium px-10 py-7 gap-2 tracking-wide"
                >
                  <Sparkles className="w-5 h-5" />
                  Generate Assignments
                </Button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{errorDialog.message}</DialogTitle>
            <DialogDescription className="pt-4">
              {errorDialog.details}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setErrorDialog({ open: false, message: '' })}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

