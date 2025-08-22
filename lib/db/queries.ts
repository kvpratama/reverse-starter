import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import { activityLogs, users, jobseekersProfile, jobPosts } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";

export async function getUser() {
  const sessionCookie = (await cookies()).get("session");
  if (!sessionCookie || !sessionCookie.value) {
    return null;
  }

  const sessionData = await verifyToken(sessionCookie.value);
  if (
    !sessionData ||
    !sessionData.user ||
    typeof sessionData.user.id !== "string"
  ) {
    return null;
  }

  if (new Date(sessionData.expires) < new Date()) {
    return null;
  }

  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.id, sessionData.user.id), isNull(users.deletedAt)))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  return user[0];
}

// export const getUserByEmail = async (email: string) => {
//     const user = await db.select().from(users).where(eq(users.email, email));
//     return user[0];
// };

export const getJobseekerProfiles = async (userId: string) => {
  return await db
    .select()
    .from(jobseekersProfile)
    .where(eq(jobseekersProfile.userId, userId));
};

export const createJobseekerProfile = async (
  userId: string,
  profileName: string,
  name: string,
  email: string,
  resumeUrl: string,
  bio: string | undefined,
  skills: string | undefined,
  experience: "entry" | "mid" | "senior" | undefined,
  desiredSalary: number | undefined,
) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (user.length === 0) {
    throw new Error("User not found");
  }

  const profileId = uuidv4();
  await db.insert(jobseekersProfile).values({
    id: profileId,
    userId,
    profileName,
    name,
    email,
    resumeUrl,
    bio,
    skills,
    experience: experience || "entry",
    desiredSalary,
  });

  return profileId;
};

export const createJobPost = async (
  userId: string,
  jobTitle: string,
  jobDescription: string,
  jobRequirements: string,
  perks: string,
) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (user.length === 0) {
    throw new Error("User not found");
  }

  const jobPostId = uuidv4();
  await db.insert(jobPosts).values({
    id: jobPostId,
    userId,
    jobTitle,
    jobDescription,
    jobRequirements,
    perks,
  });

  return jobPostId;
};

export const getJobPostsByUser = async (userId: string) => {
  return await db
    .select()
    .from(jobPosts)
    .where(eq(jobPosts.userId, userId));
};
