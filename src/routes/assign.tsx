import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect, useRef } from 'react'
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
  replacePlayers,
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
  const inputRef = useRef<HTMLInputElement>(null)

  // Clear cache and load data on mount
  useEffect(() => {
    clearAllData()
    const data = getData()
    setPlayers(data.players)
    setConstraints(data.constraints)
    setAssignments(data.assignments)
    const existingPartyName = data.partyName || ''
    setPartyName(existingPartyName)
    // Show party name page if no party name is set (before player assignments)
    setShowPartyNamePage(!existingPartyName)
  }, [])

  // Keep input focused when party name page is shown
  useEffect(() => {
    if (showPartyNamePage && inputRef.current) {
      // Focus immediately when page is shown
      inputRef.current.focus()

      const handleBlur = () => {
        // Refocus after a short delay, unless user clicked a button
        setTimeout(() => {
          if (inputRef.current && showPartyNamePage && document.activeElement?.tagName !== 'BUTTON') {
            inputRef.current.focus()
          }
        }, 10)
      }

      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        // Only refocus if not clicking on a button or inside a button
        if (target.tagName !== 'BUTTON' && !target.closest('button')) {
          setTimeout(() => {
            if (inputRef.current && showPartyNamePage) {
              inputRef.current.focus()
            }
          }, 10)
        }
      }

      const input = inputRef.current
      input.addEventListener('blur', handleBlur)
      document.addEventListener('click', handleClick, true)

      return () => {
        input.removeEventListener('blur', handleBlur)
        document.removeEventListener('click', handleClick, true)
      }
    }
  }, [showPartyNamePage])

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

  const handleImportPlayers = (importedPlayers: Player[]) => {
    if (importedPlayers.length < 3) {
      setErrorDialog({
        open: true,
        message: 'Not enough participants',
        details: 'Imported file must contain at least 3 participants.',
      })
      return
    }
    replacePlayers(importedPlayers)
    const data = getData()
    setPlayers(data.players)
    setConstraints(data.constraints)
    setAssignments(data.assignments)
    setAnimationComplete(false)
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
    const normalizedValue = toTitleCase(value)
    setPartyName(normalizedValue)
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
        <div className="w-full max-w-2xl mx-auto px-4 py-12 sm:py-16 text-center space-y-10 sm:space-y-12">
          {/* Icon */}
          <div className="flex justify-center">
            <img
              src="/gift.svg"
              alt="Gift"
              className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40"
            />
          </div>

          {/* Heading */}
          <div className="space-y-6">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-foreground tracking-tight leading-tight">
              What's your gift exchange called?
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
              Give your Secret Santa a name, or skip this step
            </p>
          </div>

          {/* Input */}
          <div className="space-y-3">
            <Input
              ref={inputRef}
              type="text"
              value={partyName}
              onChange={handlePartyNameChange}
              onKeyDown={handlePartyNameKeyDown}
              placeholder="e.g. Office Party 2026"
              aria-label="Gift exchange name"
              className="text-2xl sm:text-4xl md:text-5xl h-14 sm:h-20 px-2 text-center rounded-none border-0 border-b-2 border-border bg-transparent dark:bg-transparent shadow-none placeholder:text-muted-foreground/40 focus-visible:border-primary focus-visible:ring-0 transition-colors"
              style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
              autoFocus
            />
            <p className="hidden sm:block text-sm text-muted-foreground font-light tracking-wide">
              Press <kbd className="px-1.5 py-0.5 rounded border bg-card text-xs font-sans">Enter</kbd> to continue
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={handlePartyNameSubmit}
              disabled={!partyName.trim()}
              className="h-11 sm:h-12 px-6 sm:px-8 text-base font-medium tracking-wide min-w-[200px]"
            >
              Continue
            </Button>
            <Button
              variant="outline"
              onClick={handleSkipPartyName}
              className="h-11 sm:h-12 px-6 sm:px-8 text-base font-medium tracking-wide min-w-[200px]"
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
        <main className="container mx-auto px-4 py-8 pb-24 sm:pb-8">
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
              <div className="flex items-center justify-center gap-6 md:gap-8">
                <img
                  src="/gift.svg"
                  alt="Gift"
                  className="hidden md:block w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                />
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-tight">
                  Set up <span className="italic underline decoration-primary decoration-4">{partyName || 'Your Secret Santa'}!</span>
                </h1>
                <img
                  src="/gift.svg"
                  alt="Gift"
                  className="hidden md:block w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                />
              </div>
              <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
                Add everyone who's playing, then set any rules for who can't draw whom
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <PlayerForm
                  onAddPlayer={handleAddPlayer}
                  onImport={handleImportPlayers}
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

            <div className="hidden sm:flex flex-col items-center gap-3 pt-8">
              <Button
                onClick={handleGenerateAssignments}
                disabled={players.length < 3}
                className="h-12 px-8 text-base font-medium gap-2 tracking-wide"
              >
                <Sparkles className="w-5 h-5" />
                Generate Assignments
              </Button>
              {players.length < 3 && (
                <p className="text-sm text-muted-foreground font-light tracking-wide">
                  Add {3 - players.length} more participant{3 - players.length === 1 ? '' : 's'} to generate assignments
                </p>
              )}
            </div>
          </div>
          )}
        </main>
      )}
      {!isGenerating && !hasAssignments && players.length >= 3 && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto px-4 py-3">
            <Button onClick={handleGenerateAssignments} className="w-full h-12 text-base gap-2">
              <Sparkles className="w-5 h-5" />
              Generate Assignments
            </Button>
          </div>
        </div>
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
      <footer className="border-t border-border mt-12 sm:mt-20 py-8 sm:py-10">
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

