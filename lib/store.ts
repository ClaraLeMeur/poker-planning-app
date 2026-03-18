import { Redis } from "@upstash/redis";

export type Participant = {
  id: string;
  nickname: string;
  vote: string | null;
};

export type Room = {
  participants: Record<string, Participant>;
  revealed: boolean;
};

const ROOM_KEY = "poker:room";
const DEFAULT_ROOM: Room = { participants: {}, revealed: false };

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export async function getRoom(): Promise<Room> {
  const room = await redis.get<Room>(ROOM_KEY);
  return room ?? DEFAULT_ROOM;
}

export async function addParticipant(id: string, nickname: string): Promise<void> {
  const room = await getRoom();
  room.participants[id] = { id, nickname, vote: null };
  await redis.set(ROOM_KEY, room);
}

export async function setVote(id: string, vote: string): Promise<void> {
  const room = await getRoom();
  const p = room.participants[id];
  if (p) {
    p.vote = vote;
    await redis.set(ROOM_KEY, room);
  }
}

export async function revealVotes(): Promise<void> {
  const room = await getRoom();
  room.revealed = true;
  await redis.set(ROOM_KEY, room);
}

export async function resetRound(): Promise<void> {
  const room = await getRoom();
  room.revealed = false;
  for (const p of Object.values(room.participants)) {
    p.vote = null;
  }
  await redis.set(ROOM_KEY, room);
}
