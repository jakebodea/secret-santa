// Type definitions for Secret Santa app

export interface Player {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
}

export interface Constraint {
  id: string;
  // Player who cannot give
  giverId: string;
  // Player who cannot receive from giver
  receiverId: string;
  // If true, receiver also cannot give to giver
  bidirectional: boolean;
}

export interface Assignment {
  giverId: string;
  receiverId: string;
}

export interface SecretSantaData {
  players: Player[];
  constraints: Constraint[];
  assignments: Assignment[];
  partyName?: string;
}
