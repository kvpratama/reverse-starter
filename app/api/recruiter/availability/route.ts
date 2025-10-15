import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
 recruiterAvailability
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { getSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const recruiterId = searchParams.get("recruiterId") || session.user.id;

    const availability = await db
      .select()
      .from(recruiterAvailability)
      .where(
        and(
          eq(recruiterAvailability.recruiterId, recruiterId),
          eq(recruiterAvailability.isActive, true)
        )
      )
      .orderBy(recruiterAvailability.dayOfWeek);

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
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

    const newAvailability = await db
      .insert(recruiterAvailability)
      .values({
        recruiterId: session.user.id,
        dayOfWeek: body.dayOfWeek,
        startTime: body.startTime,
        endTime: body.endTime,
        isActive: true,
      })
      .returning();

    return NextResponse.json(newAvailability[0], { status: 201 });
  } catch (error) {
    console.error("Error creating availability:", error);
    return NextResponse.json(
      { error: "Failed to create availability" },
      { status: 500 }
    );
  }
}