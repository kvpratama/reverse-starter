import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { interviewInvitations } from "@/lib/db/schema";
// import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth/session";
import { createInterviewInvitationAndUpdateStatus } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      profileId,
      jobPostId,
      interviewType,
      dateTimeSlots,
      meetingLink,
      notes,
    } = body;

    // Create invitation
    const invitation = await db
      .insert(interviewInvitations)
      .values({
        profileId,
        jobPostId,
        recruiterId: session.user.id,
        interviewType,
        dateTimeSlots: JSON.stringify(dateTimeSlots),
        meetingLink: meetingLink || null,
        notes: notes || null,
        status: "pending",
      })
      .returning();

    // TODO: Send email notification to candidate

    // Create an interview invitation message and update candidate status to "interview_invited"
    const content =
      "We are excited to invite you to an interview. Just click the button below to book a time through our scheduling system. We are looking forward to connecting with you.";

    if (!jobPostId || !profileId) {
      return NextResponse.json(
        { error: "Missing jobPostId or profileId" },
        { status: 400 }
      );
    }

    const { messageId } = await createInterviewInvitationAndUpdateStatus(
      jobPostId,
      profileId,
      content,
      invitation[0].id // Pass the invitationId
    );

    return NextResponse.json(
      { id: invitation[0].id, messageId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}
