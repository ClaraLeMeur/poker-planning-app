import { NextResponse } from "next/server";
import { revealVotes } from "@/lib/store";

export async function POST() {
  revealVotes();
  return NextResponse.json({ ok: true });
}
