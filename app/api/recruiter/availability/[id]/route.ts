import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { recruiterAvailability } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db
      .update(recruiterAvailability)
      .set({ isActive: false })
      .where(eq(recruiterAvailability.id, params.id));

    return NextResponse.json({ message: "Availability deleted" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete availability" },
      { status: 500 }
    );
  }
}
