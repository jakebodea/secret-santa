import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { AlertCircle } from 'lucide-react'

interface CompactAssignment {
  giver: string
  receiver: string
}

interface DecodedData {
  assignments: CompactAssignment[]
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

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-4">
              <span className="text-5xl">🎅</span>
              <h1 className="text-5xl md:text-6xl font-normal tracking-tight">
                Secret Santa Results
              </h1>
              <span className="text-5xl">🤫</span>
            </div>
          </div>

          {/* Warning Banner */}
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-destructive">
                    Warning: This page shows all Secret Santa assignments!
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
            <Card>
              <CardHeader>
                <CardTitle className="text-destructive">Error Loading Results</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Assignments Table */}
          {decodedData && decodedData.assignments && (
            <Card>
              <CardHeader>
                <CardTitle>All Assignments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Gift Giver
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-muted-foreground">
                          →
                        </th>
                        <th className="text-left py-3 px-4 font-medium text-muted-foreground">
                          Gift Receiver
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {decodedData.assignments.map((assignment, index) => (
                        <tr
                          key={index}
                          className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎁</span>
                              <span className="font-medium">{assignment.giver}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-muted-foreground">gives to</span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🎄</span>
                              <span className="font-medium">{assignment.receiver}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Total assignments: {decodedData.assignments.length}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}

