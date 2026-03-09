import { NextRequest, NextResponse } from "next/server";
import { addParticipant } from "@/lib/store";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const { nickname } = await req.json();
  if (!nickname?.trim()) {
    return NextResponse.json({ error: "Nickname required" }, { status: 400 });
  }
  const userId = randomUUID();
  addParticipant(userId, nickname.trim());
  return NextResponse.json({ userId });
}
