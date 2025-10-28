import { useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback } from './ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { ArrowRight, RotateCcw, Crown, Mail, Loader2 } from 'lucide-react'
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

  const getPlayer = (playerId: string) =>
    players.find((p) => p.id === playerId)

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
        message: 'Emails sent successfully! 🎉',
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
      <Card className="border-primary/50">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="text-3xl md:text-4xl font-normal tracking-wide">
              🎉 Secret Santa Assignments
            </CardTitle>
            <div className="flex gap-2">
              {!emailsSent && (
                <Button
                  variant="default"
                  onClick={handleSendEmails}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Emails
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={onStartOver}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Start Over
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {emailsSent ? (
            <div className="bg-primary/10 p-4 rounded-lg border border-primary/50 mb-4">
              <p className="text-base font-normal tracking-wide mb-2">✅ Emails Sent!</p>
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Each participant has received an email with their assignment. Admins received a link to view all assignments.
              </p>
            </div>
          ) : (
            <div className="bg-accent/30 p-4 rounded-lg border border-accent mb-4">
              <p className="text-base font-normal tracking-wide mb-2">📧 Ready to Send:</p>
              <p className="text-sm text-muted-foreground font-light tracking-wide">
                Click "Send Emails" to notify all participants of their assignments. Each person will receive an email with their assigned recipient.
              </p>
            </div>
          )}

        <div className="space-y-3">
          {assignments.map((assignment) => {
            const giver = getPlayer(assignment.giverId)
            const receiver = getPlayer(assignment.receiverId)

            if (!giver || !receiver) return null

            return (
              <div
                key={assignment.giverId}
                className="flex items-center gap-4 p-4 rounded-lg border bg-card"
              >
                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {giver.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-normal tracking-wide">{giver.name}</p>
                      {giver.isAdmin && (
                        <Badge variant="secondary" className="gap-1">
                          <Crown className="w-3 h-3" />
                          Admin
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground font-light tracking-wide">{giver.email}</p>
                  </div>
                </div>

                <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                <div className="flex items-center gap-3 flex-1">
                  <Avatar>
                    <AvatarFallback className="bg-secondary text-secondary-foreground">
                      {receiver.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-normal tracking-wide">{receiver.name}</p>
                    <p className="text-sm text-muted-foreground font-light tracking-wide">
                      {receiver.email}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {players.find((p) => p.isAdmin) && (
          <div className="bg-muted/50 p-4 rounded-lg border mt-4">
            <p className="text-sm text-muted-foreground font-light tracking-wide">
              <strong className="text-foreground font-normal">
                {players.find((p) => p.isAdmin)?.name}
              </strong>{' '}
              (Admin) will receive a link to view all assignments. Please resist the temptation to look at it before the reveal! 🙈
            </p>
          </div>
        )}
      </CardContent>
    </Card>

    {/* Feedback Dialog */}
    <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dialog.type === 'success' ? '✅ Success' : '❌ Error'}
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

