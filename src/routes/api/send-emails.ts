import { json } from '@tanstack/react-start'
import { createFileRoute } from '@tanstack/react-router'
import { Resend } from 'resend'
import { jsx } from 'react/jsx-runtime'
import SecretSantaAssignment from '../../emails/secret-santa-assignment'
import AdminSummary from '../../emails/admin-summary'
import type { Player, Assignment } from '../../lib/types'

interface RequestBody {
  players: Player[]
  assignments: Assignment[]
  partyName?: string
}

// Helper to get name with initial for compact representation
function getCompactName(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length === 1) return name
  
  const firstName = parts[0]
  const lastInitial = parts[parts.length - 1][0]
  return `${firstName} ${lastInitial}`
}

// Helper to encode assignments for URL
function encodeAssignments(
  assignments: Assignment[],
  players: Player[],
  partyName?: string
): string {
  const playerMap = new Map(players.map(p => [p.id, p]))
  
  const compactData = {
    assignments: assignments.map(a => ({
      giver: getCompactName(playerMap.get(a.giverId)?.name || 'Unknown'),
      receiver: getCompactName(playerMap.get(a.receiverId)?.name || 'Unknown'),
    })),
    partyName,
  }
  
  return Buffer.from(JSON.stringify(compactData)).toString('base64')
}

export const Route = createFileRoute('/api/send-emails')({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const { players, assignments, partyName } = (await request.json()) as RequestBody
          const baseUrl = new URL(request.url).origin

          // Validate input
          if (!players || !assignments || players.length === 0 || assignments.length === 0) {
            return json(
              { error: 'Invalid request: missing players or assignments' },
              { status: 400 }
            )
          }

          const apiKey = process.env.RESEND_API_KEY
          if (!apiKey) {
            return json(
              { error: 'Server configuration error: missing API key' },
              { status: 500 }
            )
          }

          const resend = new Resend(apiKey)

          // Create player lookup map
          const playerMap = new Map(players.map(p => [p.id, p]))

          // Build the admin results URL with encoded data
          const encodedData = encodeAssignments(assignments, players, partyName)
          const resultsUrl = `${baseUrl}/results?data=${encodedData}`

          // Prepare emails for participants
          const participantEmails = assignments.map(assignment => {
            const giver = playerMap.get(assignment.giverId)
            const receiver = playerMap.get(assignment.receiverId)

            if (!giver || !receiver) {
              throw new Error('Invalid assignment: player not found')
            }

            return {
              from: 'Secret Santa <noreply@supersimplesecretsanta.com>',
              to: giver.email,
              subject: partyName 
                ? `Hey ${giver.name}! You've been assigned for ${partyName}...`
                : `Hey ${giver.name}! You've been assigned for Secret Santa...`,
              react: jsx(SecretSantaAssignment, {
                giverName: giver.name,
                receiverName: receiver.name,
                partyName,
              }),
            }
          })

          // Send participant emails in batch
          const participantResult = await resend.batch.send(participantEmails)

          if (participantResult.error) {
            console.error('Failed to send participant emails:', participantResult.error)
            throw new Error(`Failed to send participant emails: ${participantResult.error.message}`)
          }

          // Send admin emails
          const admins = players.filter(p => p.isAdmin)
          const adminEmails = admins.map(admin => ({
            from: 'Secret Santa <noreply@supersimplesecretsanta.com>',
            to: admin.email,
            subject: partyName
              ? `Admin: ${partyName} Results`
              : 'Admin: Secret Santa Results',
            react: jsx(AdminSummary, {
              adminName: admin.name,
              resultsUrl,
              partyName,
            }),
          }))

          if (adminEmails.length > 0) {
            const adminResult = await resend.batch.send(adminEmails)

            if (adminResult.error) {
              console.error('Failed to send admin emails:', adminResult.error)
              // Continue anyway since participant emails were sent
            }
          }

          return json({
            success: true,
            message: `Successfully sent ${participantEmails.length} participant emails and ${adminEmails.length} admin emails`,
            participantCount: participantEmails.length,
            adminCount: adminEmails.length,
          }, { status: 200 })
        } catch (error) {
          console.error('Error sending emails:', error)
          return json(
            {
              error: 'Failed to send emails',
              details: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
          )
        }
      },
    },
  },
})

