"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/drizzle";
import { jobseekersProfile } from "@/lib/db/schema";

export async function setProfileActive(profileId: string, nextActive: boolean) {
  const session = await getSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ensure the profile belongs to the current user
  const updated = await db
    .update(jobseekersProfile)
    .set({ active: nextActive })
    .where(
      and(
        eq(jobseekersProfile.id, profileId),
        eq(jobseekersProfile.userId, session.user.id)
      )
    )
    .returning({ id: jobseekersProfile.id });

  if (updated.length === 0) {
    throw new Error("Profile not found or you do not have access");
  }

  // Revalidate the listing page
  revalidatePath("/jobseeker/profile");
}
