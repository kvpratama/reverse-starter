import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { interviewInvitations } from "@/lib/db/schema";
import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth/session";

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

    return NextResponse.json(invitation[0], { status: 201 });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Failed to create invitation" },
      { status: 500 }
    );
  }
}