import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { markMessagesAsRead } from "@/lib/db/queries";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: conversationId } = params;
    await markMessagesAsRead(conversationId, session.user.id);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 }
    );
  }
}
