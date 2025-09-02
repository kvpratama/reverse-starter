import { desc, and, eq, isNull } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  users,
  jobseekersProfile,
  jobseekersWorkExperience,
  jobseekersEducation,
  jobCategories,
  jobSubcategories,
  jobRoles,
  jobPosts,
  jobPostsCandidate,
} from "./schema";
import type { JobPost } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";
import { WorkExperienceEntry, EducationEntry } from "@/lib/types/profile";

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

export const getJobseekerProfileById = async (
  profileId: string,
  userId: string,
) => {
  const rows = await db
    .select()
    .from(jobseekersProfile)
    .where(
      and(
        eq(jobseekersProfile.id, profileId),
        eq(jobseekersProfile.userId, userId),
      ),
    )
    .limit(1);
  return rows[0] ?? null;
};

export const createJobseekerProfile = async (
  userId: string,
  profileName: string,
  category: string,
  subcategory: string,
  job: string,
  name: string,
  email: string,
  resumeUrl: string,
  bio: string | undefined,
  skills: string | undefined,
  experience: "entry" | "mid" | "senior" | undefined,
  desiredSalary: number | undefined,
  workExperience: WorkExperienceEntry[] | undefined,
  education: EducationEntry[] | undefined,
) => {

  // 1. Check user exists
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (user.length === 0) {
    throw new Error("User not found");
  }

  // 2. Resolve category → subcategory → job role
  const [role] = await db
    .select({
      roleId: jobRoles.id,
    })
    .from(jobRoles)
    .innerJoin(jobSubcategories, eq(jobSubcategories.id, jobRoles.subcategoryId))
    .innerJoin(jobCategories, eq(jobCategories.id, jobSubcategories.categoryId))
    .where(
      eq(jobCategories.name, category) &&
      eq(jobSubcategories.name, subcategory) &&
      eq(jobRoles.name, job)
    )
    .limit(1);

  if (!role) {
    throw new Error("Invalid category / subcategory / job combination");
  }


  // 3. Insert profile
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
    jobRoleId: role.roleId,
  });

  // 4. Insert work experience
  if (workExperience?.length) {
    const workEntries = workExperience.map((exp) => ({
      id: uuidv4(),
      profileId,
      start_date: exp.start_date,
      end_date: exp.end_date,
      position: exp.position,
      company: exp.company,
      description: exp.description,
    }));
    await db.insert(jobseekersWorkExperience).values(workEntries);
  }

  // 5. Insert education
  if (education?.length) {
    const eduEntries = education.map((edu) => ({
      id: uuidv4(),
      profileId,
      start_date: edu.start_date,
      end_date: edu.end_date,
      degree: edu.degree,
      institution: edu.institution,
      field_of_study: edu.field_of_study,
      description: edu.description,
    }));
    await db.insert(jobseekersEducation).values(eduEntries);
  }

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
    )
    .orderBy(desc(jobPostsCandidate.similarityScore));

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
