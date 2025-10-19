import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { recruiterAvailability } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Verify ownership before deleting
    const result = await db
      .update(recruiterAvailability)
      .set({ isActive: false })
      .where(
        and(
          eq(recruiterAvailability.id, id),
          eq(recruiterAvailability.recruiterId, session.user.id)
        )
      )
      .returning();

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Availability not found or unauthorized" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Availability deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
