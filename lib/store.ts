export type Participant = {
  id: string;
  nickname: string;
  vote: string | null;
};

export type Room = {
  participants: Record<string, Participant>;
  revealed: boolean;
};

// Global singleton — shared across requests within the same serverless instance
const g = globalThis as typeof globalThis & { _room?: Room };

if (!g._room) {
  g._room = { participants: {}, revealed: false };
}

export function getRoom(): Room {
  return g._room!;
}

export function addParticipant(id: string, nickname: string): void {
  g._room!.participants[id] = { id, nickname, vote: null };
}

export function setVote(id: string, vote: string): void {
  const p = g._room!.participants[id];
  if (p) p.vote = vote;
}

export function revealVotes(): void {
  g._room!.revealed = true;
}

export function resetRound(): void {
  g._room!.revealed = false;
  for (const p of Object.values(g._room!.participants)) {
    p.vote = null;
  }
}
