import { NextResponse } from "next/server";
import { getRoom } from "@/lib/store";

export async function GET() {
  return NextResponse.json(await getRoom());
}
