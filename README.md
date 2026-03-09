# Planning Poker

A minimal real-time planning poker app for small teams. No accounts, no setup — just enter a nickname and start estimating.

## Features

- Join with a nickname, no authentication
- Cards: 1, 2, 3, 4, 8, 13, 20, 40, 100, infinity, ?, pause
- Votes hidden until the facilitator reveals them
- Average score shown after reveal (numeric votes only)
- Reset for the next round

## Tech stack

- **Next.js 14** (App Router) — TypeScript
- **Tailwind CSS** — minimal UI
- **REST API + polling** — no WebSocket server or external services needed
- **In-memory state** — zero database setup

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a nickname, and share the URL with your team.

## How it works

1. Each user opens the app and enters a nickname
2. Everyone picks a card — votes are hidden until revealed
3. Any participant can click **Reveal** to show all votes
4. The average is displayed (excluding `?` votes)
5. Click **Next Round** to reset and start again

## Project structure

```
app/
  page.tsx              # Join page
  room/page.tsx         # Room (cards, participants, controls)
  api/
    join/route.ts       # POST — register participant
    vote/route.ts       # POST — submit vote
    reveal/route.ts     # POST — reveal all votes
    reset/route.ts      # POST — reset round
    state/route.ts      # GET  — current room state (polled every 1.5s)
components/
  PokerCard.tsx         # Card button with SVG assets
lib/
  store.ts              # In-memory room state
public/
  cards/                # SVG card artwork (blue, green, red, yellow)
```

## Deploying to Vercel

```bash
npx vercel deploy
```

No environment variables required.

> **Heads up:** State lives in memory on a single serverless instance. This works well for small teams in active sessions. If you need persistence across cold starts or multiple instances, replace `lib/store.ts` with [Vercel KV](https://vercel.com/docs/storage/vercel-kv) or [Upstash Redis](https://upstash.com/) — the API routes need no changes.
