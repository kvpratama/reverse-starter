import { NextRequest, NextResponse } from "next/server";
import { hasParticipated } from "@/lib/db/queries";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const profileId = url.searchParams.get("profileId");
    if (!id || !profileId) {
      return NextResponse.json(
        { error: "Missing jobPostId or profileId" },
        { status: 400 },
      );
    }
    const participated = await hasParticipated(id, profileId);
    return NextResponse.json({ hasParticipated: participated });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
