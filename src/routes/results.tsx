import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'

interface CompactAssignment {
  giver: string
  receiver: string
}

interface DecodedData {
  assignments: CompactAssignment[]
  partyName?: string
}

export const Route = createFileRoute('/results')({
  component: ResultsPage,
  validateSearch: (search: Record<string, unknown>): { data?: string } => {
    return {
      data: typeof search.data === 'string' ? search.data : undefined,
    }
  },
})

function ResultsPage() {
  const { data } = Route.useSearch()
  const [showAll, setShowAll] = useState(false)
  const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null)

  let decodedData: DecodedData | null = null
  let error: string | null = null

  if (data) {
    try {
      // Decode base64 using browser-native atob()
      const decoded = atob(data)
      decodedData = JSON.parse(decoded) as DecodedData
    } catch (e) {
      error = 'Invalid or corrupted data in URL'
      console.error('Failed to decode data:', e)
    }
  } else {
    error = 'No data provided in URL'
  }

  // Extract unique participant names
  const participants =
    decodedData?.assignments
      .map((a) => a.giver)
      .filter((name, index, self) => self.indexOf(name) === index)
      .sort() || []

  // Get assignments to display
  const assignmentsToShow = showAll
    ? decodedData?.assignments || []
    : selectedParticipant
      ? decodedData?.assignments.filter((a) => a.giver === selectedParticipant) || []
      : []

  // Get selected assignment for peek mode
  const peekedAssignment =
    !showAll && selectedParticipant
      ? decodedData?.assignments.find((a) => a.giver === selectedParticipant)
      : null

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-6 md:gap-8">
              <img
                src="/gift.svg"
                alt="Gift"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
              />
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal tracking-tight leading-tight">
                Secret Santa Results
              </h1>
              <img
                src="/gift.svg"
                alt="Gift"
                className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16"
              />
            </div>
            {decodedData?.partyName && (
              <p className="text-lg sm:text-2xl md:text-3xl text-foreground font-light tracking-wide italic underline decoration-primary decoration-4">
                {decodedData.partyName}
              </p>
            )}
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
              View individual assignments or reveal all at once
            </p>
          </div>

          {/* Warning Banner */}
          <Card className="border-destructive/50 bg-destructive/5 shadow-sm">
            <CardContent>
              <div className="flex items-center gap-4">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <div>
                  <p className="font-medium text-destructive">
                    Warning: This page shows Secret Santa assignments!
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Keep this information confidential to maintain the surprise for all
                    participants.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Error state */}
          {error && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          {decodedData && decodedData.assignments && !error && (
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex-1 w-full sm:w-auto">
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Peek at a participant's assignment:
                </label>
                <Select
                  value={selectedParticipant || undefined}
                  onValueChange={(value) => {
                    setSelectedParticipant(value)
                    setShowAll(false)
                  }}
                  disabled={showAll}
                >
                  <SelectTrigger className="w-full sm:w-[280px] h-11">
                    <SelectValue placeholder="Select a participant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {participants.map((participant) => (
                      <SelectItem key={participant} value={participant}>
                        {participant}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={() => {
                    setShowAll(!showAll)
                    if (showAll) {
                      setSelectedParticipant(null)
                    }
                  }}
                  variant={showAll ? 'outline' : 'default'}
                  className="h-11 px-4 sm:px-6 gap-2"
                >
                  {showAll ? (
                    <>
                      <EyeOff className="w-4 h-4" />
                      Hide All
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      Show All
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Assignment Display */}
          {decodedData && decodedData.assignments && !error && (
            <>
              {/* Peek Mode - Single Assignment */}
              {!showAll && peekedAssignment && (
                <div className="py-8 px-6 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8">
                    <div className="text-center sm:text-left flex flex-col">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                        Gift Giver
                      </p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                        {peekedAssignment.giver}
                      </p>
                    </div>
                    <div className="text-center sm:text-left flex flex-col">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium opacity-0">
                        &nbsp;
                      </p>
                      <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-normal italic mt-1" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                        is giving to
                      </p>
                    </div>
                    <div className="text-center sm:text-left flex flex-col">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                        Gift Receiver
                      </p>
                      <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                        {peekedAssignment.receiver}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show All Mode - All Assignments */}
              {showAll && (
                <div className="py-8 px-6 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-6">
                    <div className="text-center sm:text-right sm:w-40">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                        Gift Giver
                      </p>
                    </div>
                    <div className="text-center sm:w-40">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium opacity-0">
                        &nbsp;
                      </p>
                    </div>
                    <div className="text-center sm:text-left sm:w-40">
                      <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">
                        Gift Receiver
                      </p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    {assignmentsToShow.map((assignment, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-baseline justify-center gap-4 sm:gap-8"
                      >
                        <div className="text-center sm:text-right sm:w-40">
                          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-foreground" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                            {assignment.giver}
                          </p>
                        </div>
                        <div className="text-center sm:w-40">
                          <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-normal italic" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                            is giving to
                          </p>
                        </div>
                        <div className="text-center sm:text-left sm:w-40">
                          <p className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary" style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}>
                            {assignment.receiver}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State - No Selection */}
              {!showAll && !selectedParticipant && (
                <Card className="border-dashed border-2 border-muted-foreground/20">
                  <CardContent className="pt-12 pb-12">
                    <div className="text-center space-y-4">
                      <Eye className="w-12 h-12 text-muted-foreground/40 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-foreground mb-1">
                          Select a participant to peek
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Choose someone from the dropdown above to see their assignment, or click
                          "Show All" to reveal everything at once.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

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

