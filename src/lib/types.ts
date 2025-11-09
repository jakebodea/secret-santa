// Type definitions for Secret Santa app

export interface Player {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export interface Constraint {
  id: string
  giverId: string // Player who cannot give
  receiverId: string // Player who cannot receive from giver
  bidirectional: boolean // If true, receiver also cannot give to giver
}

export interface Assignment {
  giverId: string
  receiverId: string
}

export interface SecretSantaData {
  players: Player[]
  constraints: Constraint[]
  assignments: Assignment[]
  partyName?: string
}

