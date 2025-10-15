import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  interviewInvitations,
  interviewBookings,
  jobPostsCandidate,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm"; // <-- Import 'and'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { selectedDate, selectedTime } = body;

    // Fetch the invitation
    const invitations = await db
      .select()
      .from(interviewInvitations)
      .where(eq(interviewInvitations.id, id))
      .limit(1);

    if (invitations.length === 0) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    const invitation = invitations[0];

    // Create scheduled date-time with proper error handling
    let scheduledDateTime: Date;
    try {
      // First try the direct concatenation approach
      scheduledDateTime = new Date(`${selectedDate}T${selectedTime}:00`);

      // Check if the date is valid
      if (isNaN(scheduledDateTime.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch (dateError) {
      // If that fails, try parsing the date parts separately
      try {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const [hours, minutes] = selectedTime.split(":").map(Number);

        scheduledDateTime = new Date(
          year,
          month - 1,
          day,
          hours,
          minutes,
          0,
          0
        );

        if (isNaN(scheduledDateTime.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (fallbackError) {
        console.error("Date parsing error:", {
          selectedDate,
          selectedTime,
          dateError,
          fallbackError,
        });
        return NextResponse.json(
          { error: "Invalid date or time format" },
          { status: 400 }
        );
      }
    }

    // Get duration based on interview type
    const durations: Record<string, number> = {
      phone_screen: 30,
      technical: 60,
      behavioral: 45,
      final_round: 60,
      hr_round: 30,
      team_meet: 30,
    };
    const duration = durations[invitation.interviewType] || 30;

    // Find the application (Corrected where clause using 'and')
    const applications = await db
      .select()
      .from(jobPostsCandidate)
      .where(
        and(
          // Use 'and' to combine conditions
          eq(jobPostsCandidate.profileId, invitation.profileId),
          eq(jobPostsCandidate.jobPostId, invitation.jobPostId)
        )
      )
      .limit(1);

    if (applications.length === 0) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Create the interview booking
    const booking = await db
      .insert(interviewBookings)
      .values({
        applicationId: applications[0].id,
        recruiterId: invitation.recruiterId,
        candidateProfileId: invitation.profileId,
        interviewType: invitation.interviewType as
          | "phone_screen"
          | "technical"
          | "behavioral"
          | "final_round"
          | "hr_round"
          | "team_meet",
        scheduledDate: scheduledDateTime,
        duration,
        status: "scheduled",
        meetingLink: invitation.meetingLink,
        candidateNotes: invitation.notes,
      })
      .returning();

    // Update invitation status
    await db
      .update(interviewInvitations)
      .set({ status: "confirmed", confirmedDate: scheduledDateTime })
      .where(eq(interviewInvitations.id, id));

    // Update application status
    await db
      .update(jobPostsCandidate)
      .set({ status: "interview_scheduled" })
      .where(eq(jobPostsCandidate.id, applications[0].id));

    // TODO: Send confirmation emails to both recruiter and candidate

    return NextResponse.json(booking[0]);
  } catch (error) {
    console.error("Error confirming invitation:", error);
    return NextResponse.json(
      { error: "Failed to confirm invitation" },
      { status: 500 }
    );
  }
}
