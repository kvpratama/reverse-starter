import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { interviewBookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const requestedRecruiterId = searchParams.get("recruiterId");

    // If requesting another recruiter's bookings, verify permission
    if (requestedRecruiterId && requestedRecruiterId !== session.user.id) {
      // Check if user is admin or has permission to view this recruiter's data
      if (session.user.role !== "admin") {
        return NextResponse.json(
          { error: "Forbidden: Cannot access other recruiter's bookings" },
          { status: 403 }
        );
      }
    }

    const recruiterId = requestedRecruiterId || session.user.id;

    // Fetch existing interview bookings for this recruiter
    const bookings = await db
      .select({
        scheduledDate: interviewBookings.scheduledDate,
        duration: interviewBookings.duration,
        status: interviewBookings.status,
      })
      .from(interviewBookings)
      .where(
        and(
          eq(interviewBookings.recruiterId, recruiterId),
          eq(interviewBookings.status, "scheduled")
        )
      );
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
