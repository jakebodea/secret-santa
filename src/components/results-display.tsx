import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { RotateCcw, Mail, XCircle } from 'lucide-react'
import { SupportCard } from './support-card'
import type { Player, Assignment } from '../lib/types'

interface ResultsDisplayProps {
  assignments: Assignment[]
  players: Player[]
  partyName?: string
  onStartOver: () => void
}

export function ResultsDisplay({
  assignments,
  players,
  partyName,
  onStartOver,
}: ResultsDisplayProps) {
  const [isSending, setIsSending] = useState(false)
  const [emailsSent, setEmailsSent] = useState(false)
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean
    message: string
    details?: string
  }>({ open: false, message: '' })

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
          partyName,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send emails')
      }

      setEmailsSent(true)
    } catch (error) {
      setErrorDialog({
        open: true,
        message: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsSending(false)
    }
  }

  // Loading state while sending emails
  if (isSending) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-8">
          {/* Bouncing Loading Dots */}
          <div className="flex justify-center items-center gap-3 h-12">
            <div 
              className="w-3 h-3 bg-primary rounded-full" 
              style={{
                animation: 'bounce-high 1s ease-in-out infinite',
                animationDelay: '0ms'
              }}
            ></div>
            <div 
              className="w-3 h-3 bg-primary rounded-full" 
              style={{
                animation: 'bounce-high 1s ease-in-out infinite',
                animationDelay: '150ms'
              }}
            ></div>
            <div 
              className="w-3 h-3 bg-primary rounded-full" 
              style={{
                animation: 'bounce-high 1s ease-in-out infinite',
                animationDelay: '300ms'
              }}
            ></div>
          </div>
          <style>{`
            @keyframes bounce-high {
              0% {
                transform: translateY(0);
              }
              20% {
                transform: translateY(-16px);
              }
              40% {
                transform: translateY(0);
              }
              100% {
                transform: translateY(0);
              }
            }
          `}</style>
          
          {/* Text Message */}
          <div>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-normal tracking-wide text-foreground">
              Sending Emails...
            </h2>
          </div>
        </div>
      </div>
    )
  }

  // Success state after emails are sent
  if (emailsSent) {
    return (
      <>
        <div className="min-h-screen bg-background flex items-center justify-center py-12 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 text-center space-y-8">
            {/* Celebration Icon */}
            <div className="flex justify-center">
              <img
                src="/santa.svg"
                alt="Secret Santa"
                className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48"
              />
            </div>

            {/* Main Message */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-foreground tracking-tight leading-tight">
                Emails Sent!
              </h1>
              {partyName && (
                <p className="text-lg sm:text-2xl md:text-3xl text-foreground font-light tracking-wide italic">
                  {partyName}
                </p>
              )}
              <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
                Each participant has received an email with their assignment. Admins received a link to view all assignments.
              </p>
            </div>

            {/* Support Card */}
            <div className="pt-4">
              <SupportCard />
            </div>

            {/* Action Button */}
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={onStartOver}
                className="h-11 sm:h-12 px-6 sm:px-8 text-base font-medium gap-3 tracking-wide"
              >
                <RotateCcw className="w-5 h-5" />
                Start Over
              </Button>
            </div>
          </div>
        </div>

        {/* Error Dialog */}
        <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Error
              </DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <p className="mb-2">{errorDialog.message}</p>
              {errorDialog.details && (
                <p className="text-sm text-muted-foreground">{errorDialog.details}</p>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setErrorDialog({ open: false, message: '' })}>
                Got it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Initial state - assignments generated, ready to send
  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center py-12 sm:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-8">
          {/* Celebration Icon */}
          <div className="flex justify-center">
            <img
              src="/santa.svg"
              alt="Secret Santa"
              className="w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48"
            />
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-foreground tracking-tight leading-tight">
              {partyName && (
                <>
                  <span className="italic">{partyName}</span>
                  <br />
                </>
              )}
              Assignments Generated!
            </h1>
            <p className="text-base sm:text-xl md:text-2xl text-muted-foreground font-light tracking-wide">
              Your Secret Santa assignments are ready to send!
            </p>
          </div>

          {/* Status Message */}
          <Card className="bg-accent/30 border-accent">
            <CardContent>
              <p className="text-base text-muted-foreground font-light tracking-wide">
                Click the button below to notify all participants of their assignments. Each person will receive an email with their assigned recipient.
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              onClick={handleSendEmails}
              disabled={isSending}
              className="h-11 sm:h-12 px-6 sm:px-8 text-base font-medium gap-3 tracking-wide"
            >
              <Mail className="w-5 h-5" />
              Send Emails
            </Button>
            <Button
              variant="outline"
              onClick={onStartOver}
              className="h-11 sm:h-12 px-6 sm:px-8 text-base font-medium gap-3 tracking-wide"
            >
              <RotateCcw className="w-5 h-5" />
              Start Over
            </Button>
          </div>

          {/* Admin Note */}
          {players.find((p) => p.isAdmin) && (
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

      {/* Error Dialog */}
      <Dialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              Error
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            <p className="mb-2">{errorDialog.message}</p>
            {errorDialog.details && (
              <p className="text-sm text-muted-foreground">{errorDialog.details}</p>
            )}
          </div>
          <div className="flex justify-end pt-4">
            <Button onClick={() => setErrorDialog({ open: false, message: '' })}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

