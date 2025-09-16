import { NextRequest, NextResponse } from "next/server";
import { createInterviewInvitationAndUpdateStatus } from "@/lib/db/queries";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const jobPostId: string | undefined = body?.jobPostId;
    const profileId: string | undefined = body?.profileId;
    const calendlyLink: string | undefined = body?.calendlyLink;

    if (!jobPostId || !profileId || !calendlyLink) {
      return NextResponse.json(
        { error: "Missing jobPostId, profileId or calendlyLink" },
        { status: 400 },
      );
    }

    const { messageId } = await createInterviewInvitationAndUpdateStatus(
      jobPostId,
      profileId,
      calendlyLink,
    );

    return NextResponse.json({ id: messageId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
