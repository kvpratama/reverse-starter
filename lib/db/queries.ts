import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  users,
  jobseekersProfile,
  jobPosts,
  jobPostsCandidate,
} from "./schema";
import type { JobPost } from "./schema";
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

export const getJobPostsByUser = async (userId: string): Promise<JobPost[]> => {
  return await db
    .select()
    .from(jobPosts)
    .where(eq(jobPosts.userId, userId))
    .orderBy(desc(jobPosts.createdAt));
};

export const createJobPostCandidate = async (
  jobPostId: string,
  profileId: string,
  similarityScore: number,
) => {
  const id = uuidv4();
  await db.insert(jobPostsCandidate).values({
    id,
    jobPostId,
    profileId,
    similarityScore,
  });
  return id;
};

export const getJobPostWithCandidatesForUser = async (
  jobPostId: string,
  userId: string,
) => {
  const rows = await db
    .select({
      jobId: jobPosts.id,
      jobUserId: jobPosts.userId,
      jobTitle: jobPosts.jobTitle,
      jobDescription: jobPosts.jobDescription,
      jobRequirements: jobPosts.jobRequirements,
      jobPerks: jobPosts.perks,
      candidateId: jobPostsCandidate.id,
      similarityScore: jobPostsCandidate.similarityScore,
      profileId: jobseekersProfile.id,
      profileName: jobseekersProfile.profileName,
      name: jobseekersProfile.name,
      email: jobseekersProfile.email,
      resumeUrl: jobseekersProfile.resumeUrl,
      bio: jobseekersProfile.bio,
      skills: jobseekersProfile.skills,
      experience: jobseekersProfile.experience,
      desiredSalary: jobseekersProfile.desiredSalary,
    })
    .from(jobPosts)
    .where(and(eq(jobPosts.id, jobPostId), eq(jobPosts.userId, userId)))
    .leftJoin(jobPostsCandidate, eq(jobPostsCandidate.jobPostId, jobPosts.id))
    .leftJoin(
      jobseekersProfile,
      eq(jobseekersProfile.id, jobPostsCandidate.profileId),
    );

  if (rows.length === 0) {
    return null;
  }

  const job = {
    id: rows[0].jobId,
    userId: rows[0].jobUserId,
    jobTitle: rows[0].jobTitle,
    jobDescription: rows[0].jobDescription,
    jobRequirements: rows[0].jobRequirements,
    perks: rows[0].jobPerks,
  };

  const candidates = rows
    .filter((r) => r.candidateId !== null)
    .map((r) => ({
      id: r.candidateId!,
      similarityScore: r.similarityScore ?? 0,
      profile: r.profileId
        ? {
            id: r.profileId,
            profileName: r.profileName ?? undefined,
            name: r.name ?? undefined,
            email: r.email,
            resumeUrl: r.resumeUrl,
            bio: r.bio ?? undefined,
            skills: r.skills ?? undefined,
            experience: r.experience,
            desiredSalary: r.desiredSalary ?? undefined,
          }
        : undefined,
    }));

  return { jobPost: job, candidates };
};
