import { NextResponse } from "next/server";
import { resetRound } from "@/lib/store";

export async function POST() {
  resetRound();
  return NextResponse.json({ ok: true });
}
