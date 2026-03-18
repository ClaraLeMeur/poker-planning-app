import { NextRequest, NextResponse } from "next/server";
import { setVote } from "@/lib/store";

const VALID_CARDS = new Set(["0,5", "1", "2", "3", "4", "8", "13", "20", "40", "100", "?", "pause"]);

export async function POST(req: NextRequest) {
  const { userId, vote } = await req.json();
  if (!userId || !VALID_CARDS.has(vote)) {
    return NextResponse.json({ error: "Invalid" }, { status: 400 });
  }
  await setVote(userId, vote);
  return NextResponse.json({ ok: true });
}
