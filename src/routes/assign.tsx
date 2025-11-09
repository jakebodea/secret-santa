import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog'
import { Sparkles } from 'lucide-react'

import { PlayerForm } from '../components/player-form'
import { PlayersList } from '../components/players-list'
import { ConstraintsForm } from '../components/constraints-form'
import { ConstraintsList } from '../components/constraints-list'
import { ResultsDisplay } from '../components/results-display'
import { AssignmentAnimation } from '../components/assignment-animation'

import type { Player, Constraint, Assignment } from '../lib/types'
import {
  getData,
  addPlayer,
  removePlayer,
  toggleAdmin,
  addConstraint,
  removeConstraint,
  saveConstraints,
  saveAssignments,
  clearAssignments,
  clearAllData,
  savePartyName,
} from '../lib/storage'
import { generateAssignments } from '../lib/secret-santa-assignments'
import { toTitleCase } from '../lib/utils'

export const Route = createFileRoute('/assign')({
  component: AssignPage,
})

function AssignPage() {
  const [players, setPlayers] = useState<Player[]>([])
  const [constraints, setConstraints] = useState<Constraint[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [partyName, setPartyName] = useState<string>('')
  const [showPartyNamePage, setShowPartyNamePage] = useState<boolean>(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [animationComplete, setAnimationComplete] = useState(false)
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
    const existingPartyName = data.partyName || ''
    setPartyName(existingPartyName)
    // Show party name page if no party name is set (before player assignments)
    setShowPartyNamePage(!existingPartyName)
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

    // Start animation
    setIsGenerating(true)
    setAnimationComplete(false)

    // Generate assignments immediately
    const result = generateAssignments(players, constraints)

    if (result.success && result.assignments) {
      saveAssignments(result.assignments)
      setAssignments(result.assignments)
      
      // Wait 3 seconds for animation, then show results
      setTimeout(() => {
        setIsGenerating(false)
        setAnimationComplete(true)
      }, 3000)
    } else {
      // If generation failed, stop animation immediately
      setIsGenerating(false)
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
    setAnimationComplete(false)
  }

  const handleClearAll = () => {
    clearAllData()
    setPlayers([])
    setConstraints([])
    setAssignments([])
    setAnimationComplete(false)
  }

  const handleClearConstraints = () => {
    saveConstraints([])
    setConstraints([])
  }

  const handlePartyNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setPartyName(value)
  }

  const handlePartyNameSubmit = () => {
    if (partyName.trim()) {
      const formatted = toTitleCase(partyName.trim())
      setPartyName(formatted)
      savePartyName(formatted)
    } else {
      savePartyName('')
    }
    setShowPartyNamePage(false)
  }

  const handleSkipPartyName = () => {
    savePartyName('')
    setPartyName('')
    setShowPartyNamePage(false)
  }

  const handlePartyNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handlePartyNameSubmit()
    }
  }

  const hasAssignments = assignments.length > 0 && animationComplete

  // Show full-screen party name entry page
  if (showPartyNamePage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-12">
          {/* Icon */}
          <div className="flex justify-center">
            <img
              src="/gift.svg"
              alt="Gift"
              className="w-32 h-32 md:w-40 md:h-40"
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-normal text-foreground tracking-tight leading-tight">
              What's Your Secret Santa Called?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
              Give your gift exchange a name
            </p>
          </div>

          {/* Input */}
          <div className="space-y-6">
            <Input
              type="text"
              value={partyName}
              onChange={handlePartyNameChange}
              onKeyDown={handlePartyNameKeyDown}
              className="text-3xl md:text-4xl h-16 md:h-20 px-6 text-center"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              autoFocus
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              onClick={handlePartyNameSubmit}
              disabled={!partyName.trim()}
              className="text-lg font-medium px-12 py-8 tracking-wide min-w-[200px]"
            >
              Continue
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleSkipPartyName}
              className="text-lg font-medium px-12 py-8 tracking-wide min-w-[200px]"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {isGenerating ? (
        <AssignmentAnimation />
      ) : (
        <main className="container mx-auto px-4 py-8">
          {hasAssignments ? (
            <div className="max-w-4xl mx-auto">
              <ResultsDisplay
                assignments={assignments}
                players={players}
                partyName={partyName}
                onStartOver={handleStartOver}
              />
            </div>
          ) : (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-5xl md:text-6xl font-normal tracking-tight leading-tight">
                Setup <span className="italic">{partyName || 'Your Secret Santa'}</span>
              </h1>
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
                  onClearAll={handleClearAll}
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
                  onClearAll={handleClearConstraints}
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
      )}

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

      {/* Footer */}
      <footer className="border-t border-border mt-20 py-10">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-light tracking-wide">
          <p>
            <Link 
              to="/support" 
              className="text-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Support this project
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

