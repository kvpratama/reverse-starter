import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { interviewBookings, users, jobseekersProfile, jobPostsCandidate } from "@/lib/db/schema";
import { eq, or, gte, isNull, and, inArray } from "drizzle-orm";
import { RECRUITER_ROLE_ID, JOBSEEKER_ROLE_ID } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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

    // Handle based on user type
    if (profileId) {
      // Recruiter flow - only check recruiter bookings for the specific candidate profile
      whereConditions.push(eq(interviewBookings.recruiterId, recruiterId));
      whereConditions.push(eq(interviewBookings.candidateProfileId, profileId));
    } else if (userId && userRole) {
      // Jobseeker flow - fetch their profiles and check bookings for those profiles
      const userProfiles = await db
        .select({ id: jobseekersProfile.id })
        .from(jobseekersProfile)
        .where(eq(jobseekersProfile.userId, userId));

      if (userProfiles.length > 0) {
        const profileIds = userProfiles.map((p) => p.id);
        if (profileIds.length === 1) {
          whereConditions.push(eq(interviewBookings.candidateProfileId, profileIds[0]));
        } else {
          whereConditions.push(inArray(interviewBookings.candidateProfileId, profileIds));
        }
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
