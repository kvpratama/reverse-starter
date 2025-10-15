import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle"; // Ensure your path is correct
import {
  interviewBookings,
  jobPostsCandidate,
  jobseekersProfile,
  users,
  jobPosts,
} from "@/lib/db/schema"; // Ensure your path is correct
import { eq, desc, and, SQL } from "drizzle-orm";
// import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth/session";
import type { InterviewStatus } from "@/lib/db/schema"; // Ensure this type is defined

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as InterviewStatus | null;
    const userId = session.user.id;

    // Get current user
    const currentUserArray = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (currentUserArray.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const currentUser = currentUserArray[0];

    // Base query with all joins defined once
    const baseBookingsQuery = db
      .select({
        booking: interviewBookings,
        application: jobPostsCandidate,
        candidateProfile: jobseekersProfile,
        recruiter: users,
        jobPost: jobPosts,
      })
      .from(interviewBookings)
      .innerJoin(
        jobPostsCandidate,
        eq(interviewBookings.applicationId, jobPostsCandidate.id)
      )
      .innerJoin(
        jobseekersProfile,
        eq(interviewBookings.candidateProfileId, jobseekersProfile.id)
      )
      .innerJoin(users, eq(interviewBookings.recruiterId, users.id))
      .innerJoin(jobPosts, eq(jobPostsCandidate.jobPostId, jobPosts.id));
    
    // Array to hold all dynamic where conditions
    const whereConditions: (SQL | undefined)[] = [];

    // Filter based on user role
    if (currentUser.roleId === 1) {
      // Recruiter - show their interviews
      whereConditions.push(eq(interviewBookings.recruiterId, userId));
    } else {
      // Candidate - find their profile first
      const profileArray = await db
        .select()
        .from(jobseekersProfile)
        .where(eq(jobseekersProfile.userId, userId))
        .limit(1);

      if (profileArray.length > 0) {
        whereConditions.push(
          eq(interviewBookings.candidateProfileId, profileArray[0].id)
        );
      } else {
        // Candidate has no profile, no bookings to show
        return NextResponse.json([]);
      }
    }

    // Apply status filter if provided
    if (status) {
      whereConditions.push(eq(interviewBookings.status, status));
    }

    // Execute the query: apply where conditions (combined by 'and') and order by
    const bookings = await baseBookingsQuery
      .where(and(...whereConditions))
      .orderBy(desc(interviewBookings.scheduledDate));

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (
      !body.applicationId ||
      !body.recruiterId ||
      !body.candidateProfileId ||
      !body.interviewType ||
      !body.scheduledDate
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check for conflicts
    const conflictingBooking = await db
      .select()
      .from(interviewBookings)
      .where(
        and(
          eq(interviewBookings.recruiterId, body.recruiterId),
          eq(interviewBookings.scheduledDate, new Date(body.scheduledDate)),
          eq(interviewBookings.status, "scheduled")
        )
      )
      .limit(1);

    if (conflictingBooking.length > 0) {
      return NextResponse.json(
        { error: "Time slot already booked" },
        { status: 409 }
      );
    }

    // Create the booking
    const newBooking = await db
      .insert(interviewBookings)
      .values({
        applicationId: body.applicationId,
        recruiterId: body.recruiterId,
        candidateProfileId: body.candidateProfileId,
        interviewType: body.interviewType,
        scheduledDate: new Date(body.scheduledDate),
        duration: body.duration || 30,
        candidateNotes: body.notes || null,
        meetingLink: body.meetingLink || null,
        status: "scheduled",
      })
      .returning();

    // Update application status to 'interview'
    await db
      .update(jobPostsCandidate)
      .set({ status: "interview", updatedAt: new Date() })
      .where(eq(jobPostsCandidate.id, body.applicationId));

    // TODO: Send email notifications
    // TODO: Create calendar events

    return NextResponse.json(newBooking[0], { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}