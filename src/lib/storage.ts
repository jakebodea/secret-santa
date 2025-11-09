import type { Player, Constraint, Assignment, SecretSantaData } from './types'

const STORAGE_KEY = 'secret-santa-data'

// Default empty data structure
const defaultData: SecretSantaData = {
  players: [],
  constraints: [],
  assignments: [],
  partyName: undefined,
}

// Get all data from localStorage
export function getData(): SecretSantaData {
  if (typeof window === 'undefined') return defaultData

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultData
    return JSON.parse(stored) as SecretSantaData
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultData
  }
}

// Save all data to localStorage
export function saveData(data: SecretSantaData): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

// Player operations
export function getPlayers(): Player[] {
  return getData().players
}

export function savePlayers(players: Player[]): void {
  const data = getData()
  data.players = players
  saveData(data)
}

export function addPlayer(player: Player): void {
  const data = getData()
  data.players.push(player)
  saveData(data)
}

export function removePlayer(playerId: string): void {
  const data = getData()
  data.players = data.players.filter((p) => p.id !== playerId)
  // Also remove any constraints involving this player
  data.constraints = data.constraints.filter(
    (c) => c.giverId !== playerId && c.receiverId !== playerId
  )
  // If we removed the last admin and there are still players, make the first one admin
  const hasAdmin = data.players.some(p => p.isAdmin)
  if (!hasAdmin && data.players.length > 0) {
    data.players[0].isAdmin = true
  }
  saveData(data)
}

export function toggleAdmin(playerId: string): void {
  const data = getData()
  const player = data.players.find(p => p.id === playerId)
  if (!player) return
  
  // Toggle the admin status
  player.isAdmin = !player.isAdmin
  
  // Ensure at least one admin exists
  const hasAdmin = data.players.some(p => p.isAdmin)
  if (!hasAdmin && data.players.length > 0) {
    // If no admin, make the first player admin (or restore the current player)
    data.players[0].isAdmin = true
  }
  
  saveData(data)
}

// Constraint operations
export function getConstraints(): Constraint[] {
  return getData().constraints
}

export function saveConstraints(constraints: Constraint[]): void {
  const data = getData()
  data.constraints = constraints
  saveData(data)
}

export function addConstraint(constraint: Constraint): void {
  const data = getData()
  data.constraints.push(constraint)
  saveData(data)
}

export function removeConstraint(constraintId: string): void {
  const data = getData()
  data.constraints = data.constraints.filter((c) => c.id !== constraintId)
  saveData(data)
}

// Assignment operations
export function getAssignments(): Assignment[] {
  return getData().assignments
}

export function saveAssignments(assignments: Assignment[]): void {
  const data = getData()
  data.assignments = assignments
  saveData(data)
}

export function clearAssignments(): void {
  const data = getData()
  data.assignments = []
  saveData(data)
}

// Party name operations
export function getPartyName(): string | undefined {
  return getData().partyName
}

export function savePartyName(partyName: string): void {
  const data = getData()
  data.partyName = partyName
  saveData(data)
}

// Clear all data
export function clearAllData(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Error clearing localStorage:', error)
  }
}

