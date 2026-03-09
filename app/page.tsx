"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function join(e: FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nickname: nickname.trim() }),
      });
      const { userId } = await res.json();
      localStorage.setItem("userId", userId);
      localStorage.setItem("nickname", nickname.trim());
      router.push("/room");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Planning Poker
        </h1>
        <p className="text-center text-gray-500 text-sm mb-8">
          Enter your nickname to join the session
        </p>
        <form onSubmit={join} className="space-y-4">
          <input
            type="text"
            placeholder="Your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={24}
            autoFocus
            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading || !nickname.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-40 text-white font-semibold rounded-xl py-3 transition-colors"
          >
            {loading ? "Joining…" : "Join Session"}
          </button>
        </form>
      </div>
    </main>
  );
}
