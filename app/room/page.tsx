"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import PokerCard, { CardColor } from "@/components/PokerCard";

type Participant = {
  id: string;
  nickname: string;
  vote: string | null;
};

type RoomState = {
  participants: Record<string, Participant>;
  revealed: boolean;
};

const CARDS = ["0,5", "1", "2", "3", "4", "8", "13", "20", "40", "100", "?", "pause"];

const COLORS: { value: CardColor; label: string; bg: string }[] = [
  { value: "blue",   label: "Blue",   bg: "bg-blue-500"   },
  { value: "green",  label: "Green",  bg: "bg-green-500"  },
  { value: "red",    label: "Red",    bg: "bg-red-500"    },
  { value: "yellow", label: "Yellow", bg: "bg-yellow-400" },
];

function computeAverage(participants: Participant[]): string | null {
  const numeric = participants
    .map((p) => p.vote)
    .filter((v): v is string => v !== null && v !== "?" && v !== "pause")
    .map((v) => Number(v.replace(",", ".")));
  if (numeric.length === 0) return null;
  const avg = numeric.reduce((a, b) => a + b, 0) / numeric.length;
  return Number.isInteger(avg) ? String(avg) : avg.toFixed(1);
}

export default function RoomPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [room, setRoom] = useState<RoomState | null>(null);
  const [cardColor, setCardColor] = useState<CardColor>("blue");
  const selectedCardRef = useRef<string | null>(null);

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (!id) {
      router.replace("/");
      return;
    }
    setUserId(id);
  }, [router]);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/state");
      const data: RoomState = await res.json();
      setRoom(data);
      // Sync selected card from server (e.g. after reset)
      if (userId && data.participants[userId]) {
        const serverVote = data.participants[userId].vote;
        if (serverVote !== selectedCardRef.current) {
          setSelectedCard(serverVote);
          selectedCardRef.current = serverVote;
        }
      }
    } catch {
      // ignore transient fetch errors
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    fetchState();
    const interval = setInterval(fetchState, 1500);
    return () => clearInterval(interval);
  }, [userId, fetchState]);

  async function vote(card: string) {
    if (!userId || room?.revealed) return;
    setSelectedCard(card);
    selectedCardRef.current = card;
    await fetch("/api/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, vote: card }),
    });
  }

  async function reveal() {
    await fetch("/api/reveal", { method: "POST" });
    fetchState();
  }

  async function reset() {
    setSelectedCard(null);
    selectedCardRef.current = null;
    await fetch("/api/reset", { method: "POST" });
    fetchState();
  }

  const participants = Object.values(room?.participants ?? {});
  const everyoneVoted =
    participants.length > 0 && participants.every((p) => p.vote !== null);
  const average = room?.revealed ? computeAverage(participants) : null;
  const voteCount = participants.filter((p) => p.vote !== null).length;

  return (
    <main className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800">Planning Poker</h1>
        <div className="text-sm text-gray-500">
          {participants.length} participant{participants.length !== 1 ? "s" : ""}
          {!room?.revealed && participants.length > 0 && (
            <span className="ml-2 text-gray-400">
              · {voteCount}/{participants.length} voted
            </span>
          )}
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-between p-6 max-w-3xl mx-auto w-full">
        {/* Participants grid */}
        <section className="w-full">
          {room?.revealed && average !== null && (
            <div className="mb-6 text-center">
              <span className="inline-block bg-blue-500 text-white text-4xl font-bold rounded-2xl px-8 py-4 shadow-lg">
                Average: {average}
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            {participants.map((p) => (
              <ParticipantTile
                key={p.id}
                participant={p}
                revealed={room?.revealed ?? false}
                isMe={p.id === userId}
              />
            ))}
          </div>

          {participants.length === 0 && (
            <p className="text-center text-gray-400 mt-12">
              Waiting for participants…
            </p>
          )}
        </section>

        {/* Controls */}
        <div className="flex gap-3 my-6">
          {!room?.revealed ? (
            <button
              onClick={reveal}
              disabled={voteCount === 0}
              className="px-6 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 text-white font-semibold rounded-xl transition-colors"
            >
              Reveal{everyoneVoted ? " 🎉" : ""}
            </button>
          ) : (
            <button
              onClick={reset}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-800 text-white font-semibold rounded-xl transition-colors"
            >
              Next Round
            </button>
          )}
        </div>

        {/* Card picker */}
        <section className="w-full">
          <div className="flex items-center justify-center gap-4 mb-4">
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              {room?.revealed ? "Votes revealed" : "Pick your card"}
            </p>
            <div className="flex gap-1.5">
              {COLORS.map(({ value, label, bg }) => (
                <button
                  key={value}
                  title={label}
                  onClick={() => setCardColor(value)}
                  className={`w-5 h-5 rounded-full ${bg} transition-all ${
                    cardColor === value ? "ring-2 ring-offset-1 ring-gray-500 scale-110" : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {CARDS.map((card) => (
              <PokerCard
                key={card}
                value={card}
                selected={selectedCard === card}
                disabled={room?.revealed ?? false}
                onClick={() => vote(card)}
                color={cardColor}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function ParticipantTile({
  participant,
  revealed,
  isMe,
}: {
  participant: Participant;
  revealed: boolean;
  isMe: boolean;
}) {
  const hasVoted = participant.vote !== null;

  return (
    <div
      className={`flex items-center justify-between rounded-xl px-4 py-3 border ${
        isMe ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-white"
      }`}
    >
      <span className="text-sm font-medium text-gray-700 truncate mr-2">
        {participant.nickname}
        {isMe && <span className="text-gray-400 text-xs ml-1">(you)</span>}
      </span>
      <VoteBadge vote={participant.vote} revealed={revealed} hasVoted={hasVoted} />
    </div>
  );
}

function VoteBadge({
  vote,
  revealed,
  hasVoted,
}: {
  vote: string | null;
  revealed: boolean;
  hasVoted: boolean;
}) {
  if (!hasVoted) {
    return (
      <span className="text-xs text-gray-400 italic">thinking…</span>
    );
  }
  if (!revealed) {
    return (
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white text-xs font-bold">
        ✓
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center min-w-[2rem] h-8 px-2 rounded-lg bg-green-500 text-white text-sm font-bold">
      {vote}
    </span>
  );
}
