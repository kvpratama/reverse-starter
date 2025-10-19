import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { interviewBookings, users, jobseekersProfile, jobPostsCandidate } from "@/lib/db/schema";
import { eq, or, gte, isNull, and } from "drizzle-orm";
import { RECRUITER_ROLE_ID, JOBSEEKER_ROLE_ID } from "@/lib/db/schema";

export async function POST(request: NextRequest) {
  try {
    const { recruiterId, profileId, userId, userRole } = await request.json();

    if (!recruiterId) {
      return NextResponse.json(
        { error: "Recruiter ID is required" },
        { status: 400 }
      );
    }

    // Get current date to only check future bookings
    const now = new Date();

    let whereConditions = [];

    // Add recruiter bookings condition
    whereConditions.push(eq(interviewBookings.recruiterId, recruiterId));

    // Handle candidate bookings based on user type
    if (profileId) {
      // Direct profile ID provided (for recruiter creating invitations)
      whereConditions.push(eq(interviewBookings.candidateProfileId, profileId));
    } else if (userId && userRole) {
      // For jobseekers, fetch all their profiles and check across all
      const userProfiles = await db
        .select({ id: jobseekersProfile.id })
        .from(jobseekersProfile)
        .where(eq(jobseekersProfile.userId, userId));

      if (userProfiles.length > 0) {
        const profileIds = userProfiles.map((p) => p.id);
        whereConditions.push(
          or(...profileIds.map((id) => eq(interviewBookings.candidateProfileId, id)))
        );
      }
    }

    // Fetch existing bookings for both recruiter and candidate
    const existingBookings = await db
      .select({
        scheduledDate: interviewBookings.scheduledDate,
        duration: interviewBookings.duration,
      })
      .from(interviewBookings)
      .where(
        and(
          or(...whereConditions),
          gte(interviewBookings.scheduledDate, now),
          eq(interviewBookings.status, "scheduled"),
          isNull(interviewBookings.deletedAt)
        )
      );

    return NextResponse.json(existingBookings);
  } catch (error) {
    console.error("Error fetching existing bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch existing bookings" },
      { status: 500 }
    );
  }
}
