# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

No test framework is configured.

## Architecture

**Stack:** Next.js 14 (App Router) + React 18 + TypeScript (strict) + Tailwind CSS

**State model:** Single in-memory room stored on `globalThis` in `lib/store.ts`. No database, no WebSockets — clients poll `/api/state` every 1.5s. State is lost on serverless cold starts; the README notes Vercel KV/Upstash Redis as the upgrade path for multi-instance deployments.

**API routes** (`app/api/`):
- `GET /api/state` — full room state (polled by clients)
- `POST /api/join` — registers a participant, returns a UUID
- `POST /api/vote` — submits a vote; validates against `VALID_CARDS`
- `POST /api/reveal` — flips the revealed flag
- `POST /api/reset` — clears all votes and sets revealed to false

**Pages** (`app/`):
- `/` (`page.tsx`) — nickname entry form; stores `userId` + `nickname` in localStorage, then redirects to `/room`
- `/room` (`page.tsx`) — main game UI; polls state, shows participant grid, card picker, and reveal/reset controls

**Components:**
- `components/PokerCard.tsx` — card button with SVG assets from `public/cards/blue/`. Cards 5 and 21 have no SVG and fall back to a text-based render.

**Valid cards:** `["1", "2", "3", "5", "8", "13", "21", "?"]` — defined in both `app/api/vote/route.ts` and used in the room page.

**Path alias:** `@/*` resolves to the repo root (e.g., `@/lib/store`, `@/components/PokerCard`).
