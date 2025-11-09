import { useEffect, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
  const [cooldownUntil, setCooldownUntil] = useState<number | null>(null)
  const [nowTs, setNowTs] = useState<number>(Date.now())
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean
    message: string
    details?: string
  }>({ open: false, message: '' })
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  // Load cooldown from localStorage and keep a ticking clock for remaining time
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem('ss_email_cooldown_until')
    if (stored) {
      const parsed = Number(stored)
      if (!Number.isNaN(parsed)) {
        setCooldownUntil(parsed)
      }
    }
  }, [])

  useEffect(() => {
    if (!cooldownUntil) return
    const id = setInterval(() => {
      setNowTs(Date.now())
    }, 1000)
    return () => clearInterval(id)
  }, [cooldownUntil])

  const COOLDOWN_MS = 60 * 60 * 1000
  const remainingMs = cooldownUntil ? Math.max(0, cooldownUntil - nowTs) : 0
  const isOnCooldown = remainingMs > 0

  const handleSendEmails = async (opts?: { bypass?: boolean }) => {
    if (isOnCooldown && !opts?.bypass) {
      setConfirmDialogOpen(true)
      return
    }
    setIsSending(true)
    
    try {
      // If user explicitly bypassed, clear client cooldown immediately
      if (opts?.bypass && typeof window !== 'undefined') {
        localStorage.removeItem('ss_email_cooldown_until')
        setCooldownUntil(null)
      }
      const response = await fetch('/api/send-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          players,
          assignments,
          partyName,
          bypassCooldown: opts?.bypass === true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // If rate-limited, persist local cooldown based on Retry-After if present
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After')
          const retrySeconds = retryAfter ? Number(retryAfter) : null
          const until = retrySeconds && !Number.isNaN(retrySeconds)
            ? Date.now() + retrySeconds * 1000
            : Date.now() + COOLDOWN_MS
          if (typeof window !== 'undefined') {
            localStorage.setItem('ss_email_cooldown_until', String(until))
          }
          setCooldownUntil(until)
        }
        throw new Error(data.error || 'Failed to send emails')
      }

      // Success: set client cooldown for one hour
      const until = Date.now() + COOLDOWN_MS
      if (typeof window !== 'undefined') {
        localStorage.setItem('ss_email_cooldown_until', String(until))
      }
      setCooldownUntil(until)
      setEmailsSent(true)
    } catch (error) {
      setErrorDialog({
        open: true,
        message: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setIsSending(false)
      setConfirmDialogOpen(false)
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
              <div className="flex items-center justify-center gap-3 md:gap-4">
                <img
                  src="/gift.svg"
                  alt="Gift"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                />
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-foreground tracking-tight leading-tight">
                  Emails Sent!
                </h1>
                <img
                  src="/gift.svg"
                  alt="Gift"
                  className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
                />
              </div>
              {partyName && (
                <p className="text-lg sm:text-2xl md:text-3xl text-foreground font-light tracking-wide italic underline decoration-primary decoration-4">
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
            <div className="flex items-center justify-center gap-3 md:gap-4">
              <img
                src="/gift.svg"
                alt="Gift"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              />
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-normal text-foreground tracking-tight leading-tight">
                {partyName && (
                  <>
                    <span className="italic underline decoration-primary decoration-4">{partyName}</span>
                    <br />
                  </>
                )}
                Assignments Generated!
              </h1>
              <img
                src="/gift.svg"
                alt="Gift"
                className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              />
            </div>
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
              onClick={() => handleSendEmails()}
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
          {/* Confirmation Dialog for re-sending within cooldown */}
          <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-xl sm:text-2xl">Send again so soon?</DialogTitle>
                <DialogDescription className="pt-2 text-base">
                  Are you sure you want to send emails again? Is this for a different party? No problem if so, go ahead. 
                  <br />
                  <br />
                  Just keep in mind there are real costs to running this site (especially sending emails), and any support would be appreciated — even a few bucks helps! :)
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setConfirmDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={() => handleSendEmails({ bypass: true })}
                  className="w-full sm:w-auto"
                >
                  Send anyway
                </Button>
              </div>
            </DialogContent>
          </Dialog>

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

