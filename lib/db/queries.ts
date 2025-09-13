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
    .where(eq(jobseekersProfile.userId, userId))
    .orderBy(desc(jobseekersProfile.updatedAt));
};

export const getJobseekerProfileById = async (
  profileId: string,
  userId: string,
) => {
  // Base profile
  const profileRows = await db
    .select()
    .from(jobseekersProfile)
    .where(
      and(
        eq(jobseekersProfile.id, profileId),
        eq(jobseekersProfile.userId, userId),
      ),
    )
    .limit(1);

  const profile = profileRows[0];
  if (!profile) return null;

  // Resolve role -> subcategory -> category
  let roleInfo:
    | {
        roleId: string;
        roleName: string;
        subcategoryId: string;
        subcategoryName: string;
        categoryId: string;
        categoryName: string;
      }
    | undefined;
  if (profile.jobRoleId) {
    const roleJoin = await db
      .select({
        roleId: jobRoles.id,
        roleName: jobRoles.name,
        subcategoryId: jobSubcategories.id,
        subcategoryName: jobSubcategories.name,
        categoryId: jobCategories.id,
        categoryName: jobCategories.name,
      })
      .from(jobRoles)
      .innerJoin(
        jobSubcategories,
        eq(jobSubcategories.id, jobRoles.subcategoryId),
      )
      .innerJoin(
        jobCategories,
        eq(jobCategories.id, jobSubcategories.categoryId),
      )
      .where(eq(jobRoles.id, profile.jobRoleId))
      .limit(1);
    roleInfo = roleJoin[0];
  }

  // Related work experience and education
  const work = await db
    .select({
      id: jobseekersWorkExperience.id,
      startDate: jobseekersWorkExperience.startDate,
      endDate: jobseekersWorkExperience.endDate,
      position: jobseekersWorkExperience.position,
      company: jobseekersWorkExperience.company,
      description: jobseekersWorkExperience.description,
    })
    .from(jobseekersWorkExperience)
    .where(eq(jobseekersWorkExperience.profileId, profile.id));

  const education = await db
    .select({
      id: jobseekersEducation.id,
      startDate: jobseekersEducation.startDate,
      endDate: jobseekersEducation.endDate,
      degree: jobseekersEducation.degree,
      institution: jobseekersEducation.institution,
      fieldOfStudy: jobseekersEducation.fieldOfStudy,
      description: jobseekersEducation.description,
    })
    .from(jobseekersEducation)
    .where(eq(jobseekersEducation.profileId, profile.id));

  return {
    ...profile,
    jobRole: roleInfo
      ? { id: roleInfo.roleId, name: roleInfo.roleName }
      : undefined,
    jobSubcategory: roleInfo
      ? { id: roleInfo.subcategoryId, name: roleInfo.subcategoryName }
      : undefined,
    jobCategory: roleInfo
      ? { id: roleInfo.categoryId, name: roleInfo.categoryName }
      : undefined,
    workExperience: work,
    education,
  } as const;
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
    .innerJoin(
      jobSubcategories,
      eq(jobSubcategories.id, jobRoles.subcategoryId),
    )
    .innerJoin(jobCategories, eq(jobCategories.id, jobSubcategories.categoryId))
    .where(
      and(
        eq(jobCategories.name, category),
        eq(jobSubcategories.name, subcategory),
        eq(jobRoles.name, job),
      ),
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
      startDate: exp.start_date,
      endDate: exp.end_date,
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
      startDate: edu.start_date,
      endDate: edu.end_date,
      degree: edu.degree,
      institution: edu.institution,
      fieldOfStudy: edu.field_of_study,
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
  coreSkills: string | undefined,
  niceToHaveSkills: string | undefined,
  category: string,
  subcategory: string,
  job: string,
) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (user.length === 0) {
    throw new Error("User not found");
  }

  // Resolve category → subcategory → job role
  const [role] = await db
    .select({
      roleId: jobRoles.id,
    })
    .from(jobRoles)
    .innerJoin(
      jobSubcategories,
      eq(jobSubcategories.id, jobRoles.subcategoryId),
    )
    .innerJoin(
      jobCategories,
      eq(jobCategories.id, jobSubcategories.categoryId),
    )
    .where(
      and(
        eq(jobCategories.name, category),
        eq(jobSubcategories.name, subcategory),
        eq(jobRoles.name, job),
      ),
    )
    .limit(1);

  if (!role) {
    throw new Error("Invalid category / subcategory / job combination");
  }

  const jobPostId = uuidv4();
  await db.insert(jobPosts).values({
    id: jobPostId,
    userId,
    jobTitle,
    jobDescription,
    jobRequirements,
    perks,
    jobRoleId: role.roleId,
    coreSkills,
    niceToHaveSkills,
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
  similarityScoreBio: number,
  similarityScoreSkills: number,
) => {
  const id = uuidv4();
  await db.insert(jobPostsCandidate).values({
    id,
    jobPostId,
    profileId,
    similarityScore,
    similarityScoreBio,
    similarityScoreSkills,
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
      jobCoreSkills: jobPosts.coreSkills,
      jobNiceToHaveSkills: jobPosts.niceToHaveSkills,
      jobRoleId: jobPosts.jobRoleId,
      roleId: jobRoles.id,
      roleName: jobRoles.name,
      subcategoryId: jobSubcategories.id,
      subcategoryName: jobSubcategories.name,
      categoryId: jobCategories.id,
      categoryName: jobCategories.name,
      candidateId: jobPostsCandidate.id,
      similarityScore: jobPostsCandidate.similarityScore,
      similarityScoreBio: jobPostsCandidate.similarityScoreBio,
      similarityScoreSkills: jobPostsCandidate.similarityScoreSkills,
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
    .leftJoin(jobRoles, eq(jobRoles.id, jobPosts.jobRoleId))
    .leftJoin(
      jobSubcategories,
      eq(jobSubcategories.id, jobRoles.subcategoryId),
    )
    .leftJoin(
      jobCategories,
      eq(jobCategories.id, jobSubcategories.categoryId),
    )
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
    coreSkills: rows[0].jobCoreSkills,
    niceToHaveSkills: rows[0].jobNiceToHaveSkills,
    perks: rows[0].jobPerks,
    jobRole: rows[0].roleId
      ? { id: rows[0].roleId, name: rows[0].roleName }
      : undefined,
    jobSubcategory: rows[0].subcategoryId
      ? { id: rows[0].subcategoryId, name: rows[0].subcategoryName }
      : undefined,
    jobCategory: rows[0].categoryId
      ? { id: rows[0].categoryId, name: rows[0].categoryName }
      : undefined,
  } as const;

  const candidates = rows
    .filter((r) => r.candidateId !== null)
    .map((r) => ({
      id: r.candidateId!,
      similarityScore: r.similarityScore ?? 0,
      similarityScoreBio: r.similarityScoreBio ?? 0,
      similarityScoreSkills: r.similarityScoreSkills ?? 0,
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
