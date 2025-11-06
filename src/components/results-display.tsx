import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { RotateCcw, Mail, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import type { Player, Assignment } from '../lib/types'

interface ResultsDisplayProps {
  assignments: Assignment[]
  players: Player[]
  onStartOver: () => void
}

export function ResultsDisplay({
  assignments,
  players,
  onStartOver,
}: ResultsDisplayProps) {
  const [isSending, setIsSending] = useState(false)
  const [emailsSent, setEmailsSent] = useState(false)
  const [dialog, setDialog] = useState<{
    open: boolean
    type: 'success' | 'error'
    message: string
    details?: string
  }>({ open: false, type: 'success', message: '' })

  const handleSendEmails = async () => {
    setIsSending(true)
    
    try {
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          players,
          assignments,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      setEmailsSent(true)
      setDialog({
        open: true,
        type: 'success',
        message: 'Emails sent successfully!',
        details: data.message,
      })
    } catch (error) {
      setDialog({
        open: true,
        type: 'error',
        message: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-8">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <img
              src="/santa.svg"
              alt="Secret Santa"
              className="w-40 h-40 md:w-48 md:h-48"
            />
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-normal text-foreground tracking-tight leading-tight">
              Assignments Generated!
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
              Your Secret Santa assignments are ready to send!
            </p>
          </div>

          {/* Status Message */}
          {emailsSent ? (
            <Card className="bg-primary/10 border-primary/50">
              <CardContent>
                <p className="text-lg font-normal tracking-wide mb-2">Emails Sent!</p>
                <p className="text-base text-muted-foreground font-light tracking-wide">
                  Each participant has received an email with their assignment. Admins received a link to view all assignments.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-accent/30 border-accent">
              <CardContent>
                <p className="text-base text-muted-foreground font-light tracking-wide">
                  Click the button below to notify all participants of their assignments. Each person will receive an email with their assigned recipient.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {!emailsSent && (
              <Button
                size="lg"
                onClick={handleSendEmails}
                disabled={isSending}
                className="text-lg font-medium px-12 py-8 gap-3 tracking-wide"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-5 h-5" />
                    Send Emails
                  </>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="lg"
              onClick={onStartOver}
              className="text-lg font-medium px-12 py-8 gap-3 tracking-wide"
            >
              <RotateCcw className="w-5 h-5" />
              Start Over
            </Button>
          </div>

          {/* Admin Note */}
          {players.find((p) => p.isAdmin) && !emailsSent && (
            <Card className="bg-muted/50 mt-8">
              <CardContent>
                <p className="text-sm text-muted-foreground font-light tracking-wide">
                  <strong className="text-foreground font-normal">
                    {players.find((p) => p.isAdmin)?.name}
                  </strong>{' '}
                  (Admin) will receive a link to view all assignments. Please resist the temptation to look at it before the reveal! :)
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

    {/* Feedback Dialog */}
    <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {dialog.type === 'success' ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Success
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5" />
                Error
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="pt-4">
          <p className="mb-2">{dialog.message}</p>
          {dialog.details && (
            <p className="text-sm text-muted-foreground">{dialog.details}</p>
          )}
        </div>
        <div className="flex justify-end pt-4">
          <Button onClick={() => setDialog({ open: false, type: 'success', message: '' })}>
            Got it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  )
}

