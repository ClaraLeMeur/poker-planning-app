import { NextResponse } from "next/server";
import { resetRound } from "@/lib/store";

export async function POST() {
  await resetRound();
  return NextResponse.json({ ok: true });
}
