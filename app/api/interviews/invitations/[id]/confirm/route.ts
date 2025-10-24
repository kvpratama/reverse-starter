import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  interviewInvitations,
  interviewBookings,
  jobPostsCandidate,
} from "@/lib/db/schema";
import { eq, and, isNull, sql } from "drizzle-orm"; // <-- Import 'and'
import { getSession } from "@/lib/auth/session";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const body = await request.json();
    const { selectedDate, selectedTime, scheduledDateTime, timezoneOffset } = body;

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
    if (invitation.status !== "pending") {
      return NextResponse.json(
        { error: "Invitation already handled" },
        { status: 409 }
      );
    }

    // Create scheduled date-time with proper error handling
    let scheduledDate: Date;
    try {
      // Validate date and time formats first
      if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
        return NextResponse.json(
          { error: "Invalid date format. Expected YYYY-MM-DD" },
          { status: 400 }
        );
      }

      if (!/^\d{2}:\d{2}$/.test(selectedTime)) {
        return NextResponse.json(
          { error: "Invalid time format. Expected HH:MM" },
          { status: 400 }
        );
      }

      // Derive the UTC time from the provided values to avoid timezone drift
      let computedDate: Date | null = null;

      if (scheduledDateTime) {
        const parsed = new Date(scheduledDateTime);
        if (isNaN(parsed.getTime())) {
          return NextResponse.json(
            { error: "Invalid scheduledDateTime value" },
            { status: 400 }
          );
        }
        computedDate = parsed;
      }

      if (!computedDate) {
        const [year, month, day] = selectedDate.split("-").map(Number);
        const [hour, minute] = selectedTime.split(":").map(Number);

        if (
          [year, month, day, hour, minute].some(
            (value) => Number.isNaN(value) || value === undefined
          )
        ) {
          return NextResponse.json(
            { error: "Invalid date or time values" },
            { status: 400 }
          );
        }

        if (typeof timezoneOffset !== "number") {
          return NextResponse.json(
            { error: "timezoneOffset is required" },
            { status: 400 }
          );
        }
        
        // Validate offset is within valid range (-12 to +14 hours)
        if (timezoneOffset < -840 || timezoneOffset > 720) {
          return NextResponse.json(
            { error: "Invalid timezone offset" },
            { status: 400 }
          );
        }
        
        const offsetMinutes = timezoneOffset;
        const utcMillis =
          Date.UTC(year, month - 1, day, hour, minute) - offsetMinutes * 60 * 1000;

        computedDate = new Date(utcMillis);
      }

      if (!computedDate || isNaN(computedDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid date or time values" },
          { status: 400 }
        );
      }

      scheduledDate = computedDate;

      // Ensure the date is in the future (at least 1 hour from now)
      const now = new Date();
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
      if (scheduledDate < oneHourFromNow) {
        return NextResponse.json(
          {
            error: "Interview must be scheduled at least 1 hour in the future",
          },
          { status: 400 }
        );
      }
    } catch (dateError) {
      console.error("Date parsing error:", {
        selectedDate,
        selectedTime,
        scheduledDateTime,
        timezoneOffset,
        dateError,
      });
      return NextResponse.json(
        { error: "Invalid date or time format" },
        { status: 400 }
      );
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
    const result = await db.transaction(async (tx) => {
      const start = new Date(scheduledDate.getTime());
      const end = new Date(start.getTime() + duration * 60_000);
      const startIso = start.toISOString();
      const endIso = end.toISOString();

      const overlapCondition = sql`
        (
          ("interview_bookings"."scheduled_date" >= ${startIso} AND "interview_bookings"."scheduled_date" < ${endIso})
          OR
          ("interview_bookings"."scheduled_date" < ${startIso} AND ("interview_bookings"."scheduled_date" + "interview_bookings"."duration" * interval '1 minute') > ${startIso})
        )
      `;

      const recruiterConflict = await tx
        .select({ id: interviewBookings.id })
        .from(interviewBookings)
        .where(
          and(
            eq(interviewBookings.recruiterId, invitation.recruiterId),
            eq(interviewBookings.status, "scheduled"),
            isNull(interviewBookings.deletedAt),
            overlapCondition
          )
        )
        .limit(1);

      if (recruiterConflict.length > 0) {
        throw new Error("CONFLICT:RECRUITER");
      }

      const candidateConflict = await tx
        .select({ id: interviewBookings.id })
        .from(interviewBookings)
        .where(
          and(
            eq(interviewBookings.candidateProfileId, invitation.profileId),
            eq(interviewBookings.status, "scheduled"),
            isNull(interviewBookings.deletedAt),
            overlapCondition
          )
        )
        .limit(1);

      if (candidateConflict.length > 0) {
        throw new Error("CONFLICT:CANDIDATE");
      }

      // Create the interview booking
      const booking = await tx
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
          scheduledDate,
          duration,
          status: "scheduled",
          meetingLink: invitation.meetingLink,
          candidateNotes: invitation.notes,
        })
        .returning();

      // Update invitation status
      await tx
        .update(interviewInvitations)
        .set({ status: "scheduled", confirmedDate: scheduledDate })
        .where(
          and(
            eq(interviewInvitations.id, id),
            eq(interviewInvitations.status, "pending")
          )
        );

      // Update application status
      await tx
        .update(jobPostsCandidate)
        .set({ status: "interview_scheduled" })
        .where(eq(jobPostsCandidate.id, applications[0].id));

      return booking[0];
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error confirming invitation:", error);
    if (error instanceof Error && error.message.startsWith("CONFLICT:")) {
      const conflictType = error.message.split(":")[1];
      const message =
        conflictType === "RECRUITER"
          ? "Recruiter has a conflicting booking"
          : conflictType === "CANDIDATE"
          ? "Candidate has a conflicting booking"
          : "Scheduling conflict detected";
      return NextResponse.json({ error: message }, { status: 409 });
    }
    return NextResponse.json(
      { error: "Failed to confirm invitation" },
      { status: 500 }
    );
  }
}
