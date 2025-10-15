import type { Player, Constraint, Assignment } from './types'

export interface AssignmentResult {
  success: boolean
  assignments?: Assignment[]
  error?: string
  details?: string
}

/**
 * Check if a giver can be assigned to a receiver based on constraints
 */
function canAssign(
  giverId: string,
  receiverId: string,
  constraints: Constraint[]
): boolean {
  // Can't give to yourself
  if (giverId === receiverId) return false

  // Check constraints
  for (const constraint of constraints) {
    if (constraint.giverId === giverId && constraint.receiverId === receiverId) {
      return false
    }
    // Check bidirectional constraints
    if (
      constraint.bidirectional &&
      constraint.giverId === receiverId &&
      constraint.receiverId === giverId
    ) {
      return false
    }
  }

  return true
}

/**
 * Shuffle array randomly (Fisher-Yates algorithm)
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Try to find valid Secret Santa assignments using backtracking
 */
function findAssignments(
  givers: string[],
  availableReceivers: string[],
  constraints: Constraint[],
  currentAssignments: Assignment[]
): Assignment[] | null {
  // Base case: all givers have been assigned
  if (givers.length === 0) {
    return currentAssignments
  }

  const [currentGiver, ...remainingGivers] = givers

  // Try each available receiver
  for (let i = 0; i < availableReceivers.length; i++) {
    const receiver = availableReceivers[i]

    if (canAssign(currentGiver, receiver, constraints)) {
      // Try this assignment
      const newAssignments = [
        ...currentAssignments,
        { giverId: currentGiver, receiverId: receiver },
      ]
      const newAvailableReceivers = availableReceivers.filter(
        (r) => r !== receiver
      )

      // Recursively try to assign remaining givers
      const result = findAssignments(
        remainingGivers,
        newAvailableReceivers,
        constraints,
        newAssignments
      )

      if (result !== null) {
        return result
      }
    }
  }

  // No valid assignment found
  return null
}

/**
 * Analyze why assignments might be impossible
 */
function analyzeConstraints(
  players: Player[],
  constraints: Constraint[]
): string {
  const playerCount = players.length
  const details: string[] = []

  // Check if any player has no possible receivers
  for (const giver of players) {
    const possibleReceivers = players.filter((receiver) =>
      canAssign(giver.id, receiver.id, constraints)
    )
    const giverName = giver.name

    if (possibleReceivers.length === 0) {
      details.push(
        `${giverName} has no one they can give to (all other players are excluded by constraints)`
      )
    } else if (possibleReceivers.length < 2 && playerCount > 3) {
      // Having only one option makes it very difficult
      details.push(
        `${giverName} can only give to ${possibleReceivers[0].name}, which might make a valid assignment impossible`
      )
    }
  }

  // Check for circular constraints in small groups
  if (playerCount === 3) {
    const [p1, p2, p3] = players
    const p1ToP2 = canAssign(p1.id, p2.id, constraints)
    const p2ToP3 = canAssign(p2.id, p3.id, constraints)
    const p3ToP1 = canAssign(p3.id, p1.id, constraints)

    if (!p1ToP2 || !p2ToP3 || !p3ToP1) {
      details.push(
        'With only 3 players, at least one direction in each possible cycle is blocked'
      )
    }
  }

  if (details.length === 0) {
    return 'The constraints appear too restrictive to find a valid assignment'
  }

  return details.join('. ')
}

/**
 * Generate Secret Santa assignments
 */
export function generateAssignments(
  players: Player[],
  constraints: Constraint[]
): AssignmentResult {
  // Validate minimum players
  if (players.length < 3) {
    return {
      success: false,
      error: 'Not enough players',
      details: 'You need at least 3 players to run Secret Santa',
    }
  }

  // Create arrays of player IDs
  const giverIds = shuffle(players.map((p) => p.id))
  const receiverIds = players.map((p) => p.id)

  // Try to find assignments with multiple random attempts
  const maxAttempts = 100
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffledGivers = shuffle(giverIds)
    const result = findAssignments(
      shuffledGivers,
      receiverIds,
      constraints,
      []
    )

    if (result !== null) {
      return {
        success: true,
        assignments: result,
      }
    }
  }

  // Failed to find valid assignments
  const analysis = analyzeConstraints(players, constraints)

  return {
    success: false,
    error: 'Cannot find valid assignments',
    details: `After ${maxAttempts} attempts, we couldn't find a valid Secret Santa assignment that satisfies all constraints. ${analysis}`,
  }
}

/**
 * Get player name by ID (helper for display)
 */
export function getPlayerName(players: Player[], playerId: string): string {
  const player = players.find((p) => p.id === playerId)
  return player?.name || 'Unknown'
}

