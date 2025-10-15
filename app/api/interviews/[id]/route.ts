import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { interviewBookings, interviewRescheduleHistory } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth/session";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // If rescheduling, log the change
    if (body.scheduledDate) {
      const existingBooking = await db
        .select()
        .from(interviewBookings)
        .where(eq(interviewBookings.id, params.id))
        .limit(1);

      if (existingBooking.length > 0) {
        await db.insert(interviewRescheduleHistory).values({
          bookingId: params.id,
          previousDate: existingBooking[0].scheduledDate,
          newDate: new Date(body.scheduledDate),
          reason: body.rescheduleReason || null,
          rescheduledBy: session.user.id,
        });
      }
    }

    // Build update object dynamically
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (body.status) updateData.status = body.status;
    if (body.scheduledDate)
      updateData.scheduledDate = new Date(body.scheduledDate);
    if (body.recruiterNotes) updateData.recruiterNotes = body.recruiterNotes;
    if (body.candidateNotes) updateData.candidateNotes = body.candidateNotes;
    if (body.meetingLink) updateData.meetingLink = body.meetingLink;
    if (body.recruiterFeedback)
      updateData.recruiterFeedback = body.recruiterFeedback;
    if (body.candidateFeedback)
      updateData.candidateFeedback = body.candidateFeedback;
    if (body.rating !== undefined) updateData.rating = body.rating;

    const updatedBooking = await db
      .update(interviewBookings)
      .set(updateData)
      .where(eq(interviewBookings.id, params.id))
      .returning();

    if (updatedBooking.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedBooking[0]);
  } catch (error) {
    console.error("Error updating booking:", error);
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await db
      .update(interviewBookings)
      .set({
        status: "cancelled",
        updatedAt: new Date(),
      })
      .where(eq(interviewBookings.id, params.id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Interview not found" },
        { status: 404 }
      );
    }

    // TODO: Send cancellation email

    return NextResponse.json({ message: "Interview cancelled" });
  } catch (error) {
    console.error("Error cancelling interview:", error);
    return NextResponse.json(
      { error: "Failed to cancel interview" },
      { status: 500 }
    );
  }
}