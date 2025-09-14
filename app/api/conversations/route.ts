import { NextResponse } from "next/server";
import { getConversationsForCurrentJobseeker } from "@/lib/db/queries";

export async function GET() {
  try {
    const conversations = await getConversationsForCurrentJobseeker();
    return NextResponse.json({ conversations });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Internal Server Error" }, { status: 500 });
  }
}
