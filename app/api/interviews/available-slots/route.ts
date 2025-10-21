import { NextRequest, NextResponse } from "next/server";
import { db  } from "@/lib/db/drizzle";
import { recruiterAvailability, interviewBookings } from "@/lib/db/schema";
import { eq, and, gte, lte, isNull } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const recruiterId = searchParams.get("recruiterId");
    const date = searchParams.get("date"); // YYYY-MM-DD

    if (!recruiterId || !date) {
      return NextResponse.json(
        { error: "recruiterId and date are required" },
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json({ error: "Invalid date" }, { status: 400 });
    }
    const dayOfWeek = targetDate.getDay();

    // Get recruiter's availability for this day
    const availability = await db
      .select()
      .from(recruiterAvailability)
      .where(
        and(
          eq(recruiterAvailability.recruiterId, recruiterId),
          eq(recruiterAvailability.dayOfWeek, dayOfWeek),
          eq(recruiterAvailability.isActive, true)
        )
      );

    if (availability.length === 0) {
      return NextResponse.json([]);
    }

    // Get existing bookings for this date
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const bookings = await db
      .select()
      .from(interviewBookings)
      .where(
        and(
          eq(interviewBookings.recruiterId, recruiterId),
          gte(interviewBookings.scheduledDate, startOfDay),
          lte(interviewBookings.scheduledDate, endOfDay),
          eq(interviewBookings.status, "scheduled")
        )
      );

    // Generate available slots
    const slots = [];
    for (const avail of availability) {
      const [startHour, startMin] = avail.startTime.split(":").map(Number);
      const [endHour, endMin] = avail.endTime.split(":").map(Number);

      let currentTime = new Date(targetDate);
      currentTime.setHours(startHour, startMin, 0, 0);

      const endTime = new Date(targetDate);
      endTime.setHours(endHour, endMin, 0, 0);

      while (currentTime < endTime) {
        const slotTime = new Date(currentTime);
        const isBooked = bookings.some((booking) => {
          const bookingTime = new Date(booking.scheduledDate);
          return bookingTime.getTime() === slotTime.getTime();
        });

        if (!isBooked && slotTime > new Date()) {
          slots.push({
            time: slotTime.toISOString(),
            timeDisplay: slotTime.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            available: true,
          });
        }

        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    return NextResponse.json(
      { error: "Failed to fetch available slots" },
      { status: 500 }
    );
  }
}
