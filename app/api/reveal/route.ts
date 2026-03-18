import { NextResponse } from "next/server";
import { revealVotes } from "@/lib/store";

export async function POST() {
  await revealVotes();
  return NextResponse.json({ ok: true });
}
