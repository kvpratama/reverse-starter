import { desc, and, eq, isNull, inArray } from "drizzle-orm";
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
  conversations,
  messages,
  JobStatus,
} from "./schema";
import { pgEnum } from "drizzle-orm/pg-core";
import type { JobPost } from "./schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";
import { WorkExperienceEntry, EducationEntry } from "@/lib/types/profile";
import { ConversationListItem, ConversationMessageDTO } from "@/app/types/types";

// Helper: Batch-resolve role -> subcategory -> category for a set of role IDs
const getRolePathMap = async (
  roleIds: string[],
): Promise<
  Map<
    string,
    {
      roleId: string;
      roleName: string;
      subcategoryId: string;
      subcategoryName: string;
      categoryId: string;
      categoryName: string;
    }
  >
> => {
  const result = new Map<
    string,
    {
      roleId: string;
      roleName: string;
      subcategoryId: string;
      subcategoryName: string;
      categoryId: string;
      categoryName: string;
    }
  >();
  if (roleIds.length === 0) return result;

  const rows = await db
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
    .innerJoin(jobCategories, eq(jobCategories.id, jobSubcategories.categoryId))
    .where(inArray(jobRoles.id, roleIds));

  for (const r of rows) {
    if (r.roleId) {
      result.set(r.roleId, r);
    }
  }

  return result;
};

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

// Check if a jobseeker (profileId) has already participated for a given job post
export const hasParticipated = async (jobPostId: string, profileId: string) => {
  const rows = await db
    .select({ id: jobPostsCandidate.id })
    .from(jobPostsCandidate)
    .where(
      and(
        eq(jobPostsCandidate.jobPostId, jobPostId),
        eq(jobPostsCandidate.profileId, profileId),
      ),
    )
    .limit(1);
  return rows.length > 0;
};

// Aggregate job details with role/subcategory/category names for public use
export const getAggregatedJobPostById = async (jobPostId: string) => {
  const rows = await db
    .select({
      id: jobPosts.id,
      jobDescription: jobPosts.jobDescription,
      coreSkills: jobPosts.coreSkills,
      niceToHaveSkills: jobPosts.niceToHaveSkills,
      roleName: jobRoles.name,
      subcategoryName: jobSubcategories.name,
      categoryName: jobCategories.name,
    })
    .from(jobPosts)
    .leftJoin(jobRoles, eq(jobRoles.id, jobPosts.jobRoleId))
    .leftJoin(jobSubcategories, eq(jobSubcategories.id, jobRoles.subcategoryId))
    .leftJoin(jobCategories, eq(jobCategories.id, jobSubcategories.categoryId))
    .where(eq(jobPosts.id, jobPostId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    job_description: row.jobDescription ?? "",
    job_core_skills: row.coreSkills ?? "",
    job_nice_to_have_skills: row.niceToHaveSkills ?? "",
    job_role: row.roleName ?? "",
    job_subcategory: row.subcategoryName ?? "",
    job_category: row.categoryName ?? "",
  } as const;
};

// Aggregate jobseeker profile data (bio, skills, education, work)
export const getAggregatedJobseekerByProfileId = async (profileId: string) => {
  // base profile
  const profiles = await db
    .select({
      id: jobseekersProfile.id,
      bio: jobseekersProfile.bio,
      skills: jobseekersProfile.skills,
    })
    .from(jobseekersProfile)
    .where(eq(jobseekersProfile.id, profileId))
    .limit(1);
  const profile = profiles[0];
  if (!profile) return null;

  const work = await db
    .select({
      position: jobseekersWorkExperience.position,
      company: jobseekersWorkExperience.company,
      startDate: jobseekersWorkExperience.startDate,
      endDate: jobseekersWorkExperience.endDate,
      description: jobseekersWorkExperience.description,
    })
    .from(jobseekersWorkExperience)
    .where(eq(jobseekersWorkExperience.profileId, profileId));

  const edu = await db
    .select({
      degree: jobseekersEducation.degree,
      institution: jobseekersEducation.institution,
      fieldOfStudy: jobseekersEducation.fieldOfStudy,
      startDate: jobseekersEducation.startDate,
      endDate: jobseekersEducation.endDate,
      description: jobseekersEducation.description,
    })
    .from(jobseekersEducation)
    .where(eq(jobseekersEducation.profileId, profileId));

  const jobseeker_work_experience = work
    .map((w) =>
      `${w.startDate ?? ""} - ${w.endDate ?? ""} | ${w.position ?? ""} @ ${
        w.company ?? ""
      }\n${w.description ?? ""}`.trim(),
    )
    .join("\n\n");

  const jobseeker_education = edu
    .map((e) =>
      `${e.startDate ?? ""} - ${e.endDate ?? ""} | ${e.degree ?? ""} in ${
        e.fieldOfStudy ?? ""
      } @ ${e.institution ?? ""}\n${e.description ?? ""}`.trim(),
    )
    .join("\n\n");

  return {
    jobseeker_bio: profile.bio ?? "",
    jobseeker_skills: profile.skills ?? "",
    jobseeker_education,
    jobseeker_work_experience,
  } as const;
};

// Insert or update candidate record for a job post
export const upsertJobPostCandidate = async (
  jobPostId: string,
  profileId: string,
  similarityScore: number,
  similarityScoreBio: number,
  similarityScoreSkills: number,
  status: JobStatus,
  screeningAnswers?: any,
) => {
  // try insert, on unique violation perform update
  try {
    return await createJobPostCandidate(
      jobPostId,
      profileId,
      similarityScore,
      similarityScoreBio,
      similarityScoreSkills,
      status,
      screeningAnswers ?? "",
    );
  } catch (e: any) {
    // fallback to update existing
    await db
      .update(jobPostsCandidate)
      .set({
        similarityScore,
        similarityScoreBio,
        similarityScoreSkills,
        status,
        screeningAnswers: screeningAnswers ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(jobPostsCandidate.jobPostId, jobPostId),
          eq(jobPostsCandidate.profileId, profileId),
        ),
      );
    // return the existing id (not fetched here); caller may not need it
    return undefined;
  }
};

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
    const map = await getRolePathMap([profile.jobRoleId]);
    roleInfo = map.get(profile.jobRoleId);
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
  age: number,
  visaStatus: string,
  nationality: string,
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
    age,
    visaStatus,
    nationality,
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
  companyName: string,
  companyProfile: string,
  jobTitle: string,
  jobLocation: string,
  jobDescription: string,
  jobRequirements: string,
  perks: string,
  coreSkills: string | undefined,
  niceToHaveSkills: string | undefined,
  category: string,
  subcategory: string,
  job: string,
  screeningQuestion1: string,
  screeningQuestion2: string,
  screeningQuestion3: string,
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

  const jobPostId = uuidv4();
  await db.insert(jobPosts).values({
    id: jobPostId,
    userId,
    companyName,
    companyProfile,
    jobTitle,
    jobLocation,
    jobDescription,
    jobRequirements,
    perks,
    jobRoleId: role.roleId,
    coreSkills,
    niceToHaveSkills,
    screeningQuestions: [
      { question: screeningQuestion1 },
      { question: screeningQuestion2 },
      { question: screeningQuestion3 },
    ],
  });

  return jobPostId;
};

// After a job post is created, notify potential candidates who are in the same job subcategory
export const notifyPotentialCandidatesForJobPost = async (
  jobPostId: string,
  recruiterUserId: string,
) => {
  // 1) Load the job post and resolve its subcategory
  const jobRows = await db
    .select({
      id: jobPosts.id,
      jobTitle: jobPosts.jobTitle,
      companyName: jobPosts.companyName,
      roleId: jobPosts.jobRoleId,
      subcategoryId: jobSubcategories.id,
    })
    .from(jobPosts)
    .leftJoin(jobRoles, eq(jobRoles.id, jobPosts.jobRoleId))
    .leftJoin(jobSubcategories, eq(jobSubcategories.id, jobRoles.subcategoryId))
    .where(eq(jobPosts.id, jobPostId))
    .limit(1);

  const jobRow = jobRows[0];
  if (!jobRow || !jobRow.subcategoryId) {
    return { conversationsCreated: 0, messagesCreated: 0 } as const;
  }

  // 2) Find candidates with profiles whose role belongs to the same subcategory
  const candidateProfiles = await db
    .select({
      profileId: jobseekersProfile.id,
      jobseekersUserId: jobseekersProfile.userId,
      candidateName: jobseekersProfile.name,
      candidateEmail: jobseekersProfile.email,
    })
    .from(jobseekersProfile)
    .innerJoin(jobRoles, eq(jobRoles.id, jobseekersProfile.jobRoleId))
    .where(
      and(
        eq(jobRoles.subcategoryId, jobRow.subcategoryId),
        eq(jobseekersProfile.active, true),
      ),
    );

  let conversationsCreated = 0;
  let messagesCreated = 0;

  // 3) Create a conversation and initial message per candidate
  for (const candidate of candidateProfiles) {
    if (!candidate.jobseekersUserId) continue; // skip if profile isn't linked to a user

    const conversationId = uuidv4();
    await db.insert(conversations).values({
      id: conversationId,
      recruiterId: recruiterUserId,
      jobseekersId: candidate.jobseekersUserId,
      jobseekersProfileId: candidate.profileId,
      jobPostId: jobPostId,
    });
    conversationsCreated += 1;

    const greetingName = candidate.candidateName || "there";
    const content = `Hi ${greetingName}, <br/><br/>Your profile appears to be a potential match for the ${jobRow.jobTitle ?? "open"} role at ${jobRow.companyName ?? "our company"}. <br/><br/>You can view the full job post or join the early screening process using the options below. <br/><br/>Best regards, <br/>${jobRow.companyName ?? "our company"}`;

    await db.insert(messages).values({
      id: uuidv4(),
      conversationId,
      senderId: recruiterUserId,
      recipientId: candidate.jobseekersUserId,
      content,
      type: "early_screening",
    });
    messagesCreated += 1;
  }

  return { conversationsCreated, messagesCreated } as const;
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
  status: JobStatus,
  screeningAnswers?: any,
) => {
  const id = uuidv4();
  await db.insert(jobPostsCandidate).values({
    id,
    jobPostId,
    profileId,
    similarityScore,
    similarityScoreBio,
    similarityScoreSkills,
    status,
    screeningAnswers,
  });
  return id;
};

// Create an interview invitation message and update candidate status to "interview"
export const createInterviewInvitationAndUpdateStatus = async (
  jobPostId: string,
  jobseekersProfileId: string,
  calendlyLink: string,
) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  // Find the conversation first
  const convo = await db
    .select({
      id: conversations.id,
      recruiterId: conversations.recruiterId,
      jobseekersId: conversations.jobseekersId,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.jobPostId, jobPostId),
        eq(conversations.jobseekersProfileId, jobseekersProfileId),
      ),
    )
    .limit(1);

  const c = convo[0];
  if (!c) throw new Error("Conversation not found");
  if (c.recruiterId !== user.id)
    throw new Error("Forbidden: only recruiter can invite");

  // Insert message
  const messageId = uuidv4();
  const content = calendlyLink;
  await db.insert(messages).values({
    id: messageId,
    conversationId: c.id,
    senderId: c.recruiterId,
    recipientId: c.jobseekersId,
    content,
    type: "interview_invitation",
  });

  // Update candidate status
  await db
    .update(jobPostsCandidate)
    .set({ status: "interview" as JobStatus, updatedAt: new Date() })
    .where(
      and(
        eq(jobPostsCandidate.jobPostId, jobPostId),
        eq(jobPostsCandidate.profileId, jobseekersProfileId),
      ),
    );

  return { messageId } as const;
};

// Create a recruiter -> jobseeker message after early screening submission
export const createThankYouMessageForScreening = async (
  jobPostId: string,
  jobseekersProfileId: string,
  content: string,
  type: string = "thank_you",
) => {
  // Find the conversation matching this job post and jobseeker profile
  const convo = await db
    .select({
      id: conversations.id,
      recruiterId: conversations.recruiterId,
      jobseekersId: conversations.jobseekersId,
    })
    .from(conversations)
    .where(
      and(
        eq(conversations.jobPostId, jobPostId),
        eq(conversations.jobseekersProfileId, jobseekersProfileId),
      ),
    )
    .limit(1);

  const c = convo[0];
  if (!c) return undefined;
  console.log("Conversation found:", c);

  const id = uuidv4();
  await db.insert(messages).values({
    id,
    conversationId: c.id,
    senderId: c.recruiterId,
    recipientId: c.jobseekersId,
    content,
    type,
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
      jobScreeningQuestions: jobPosts.screeningQuestions,
      roleId: jobRoles.id,
      roleName: jobRoles.name,
      subcategoryId: jobSubcategories.id,
      subcategoryName: jobSubcategories.name,
      categoryId: jobCategories.id,
      categoryName: jobCategories.name,
      candidateId: jobPostsCandidate.id,
      candidateStatus: jobPostsCandidate.status,
      similarityScore: jobPostsCandidate.similarityScore,
      similarityScoreBio: jobPostsCandidate.similarityScoreBio,
      similarityScoreSkills: jobPostsCandidate.similarityScoreSkills,
      screeningAnswers: jobPostsCandidate.screeningAnswers,
      updatedAt: jobPostsCandidate.updatedAt,
      profileId: jobseekersProfile.id,
      profileName: jobseekersProfile.profileName,
      name: jobseekersProfile.name,
      email: jobseekersProfile.email,
      resumeUrl: jobseekersProfile.resumeUrl,
      bio: jobseekersProfile.bio,
      age: jobseekersProfile.age,
      nationality: jobseekersProfile.nationality,
      visaStatus: jobseekersProfile.visaStatus,
      profileRoleId: jobseekersProfile.jobRoleId,
      skills: jobseekersProfile.skills,
      experience: jobseekersProfile.experience,
      desiredSalary: jobseekersProfile.desiredSalary,
    })
    .from(jobPosts)
    .where(and(eq(jobPosts.id, jobPostId), eq(jobPosts.userId, userId)))
    .leftJoin(jobPostsCandidate, eq(jobPostsCandidate.jobPostId, jobPosts.id))
    .leftJoin(jobRoles, eq(jobRoles.id, jobPosts.jobRoleId))
    .leftJoin(jobSubcategories, eq(jobSubcategories.id, jobRoles.subcategoryId))
    .leftJoin(jobCategories, eq(jobCategories.id, jobSubcategories.categoryId))
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
    jobScreeningQuestions: rows[0].jobScreeningQuestions,
  } as const;

  // Build a base list of candidates
  const baseCandidates = rows
    .filter((r) => r.candidateId !== null)
    .map((r) => ({
      id: r.candidateId!,
      status: r.candidateStatus ?? undefined,
      similarityScore: r.similarityScore ?? 0,
      similarityScoreBio: r.similarityScoreBio ?? 0,
      similarityScoreSkills: r.similarityScoreSkills ?? 0,
      screeningAnswers: r.screeningAnswers ?? {},
      updatedAt: (r.updatedAt ?? new Date()).toISOString(),
      profile: r.profileId
        ? {
            id: r.profileId,
            profileName: r.profileName ?? undefined,
            name: r.name ?? undefined,
            email: r.email,
            resumeUrl: r.resumeUrl,
            bio: r.bio ?? undefined,
            age: r.age,
            nationality: r.nationality,
            visaStatus: r.visaStatus,
            skills: r.skills ?? undefined,
            experience: r.experience,
            desiredSalary: r.desiredSalary ?? undefined,
            // keep jobRoleId temporarily for enrichment
            jobRoleId: r.profileRoleId ?? undefined,
          }
        : undefined,
    }));

  // Collect unique profileIds
  const profileIds = Array.from(
    new Set(
      baseCandidates
        .map((c) => c.profile?.id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  // Map profileId -> roleId and prepare roleIds list for batch resolution
  const profileRoleByProfileId = new Map<string, string>();
  for (const r of rows) {
    if (r.profileId && r.profileRoleId) {
      profileRoleByProfileId.set(r.profileId, r.profileRoleId);
    }
  }
  const roleIds = Array.from(
    new Set(Array.from(profileRoleByProfileId.values())),
  );

  // Resolve role -> subcategory -> category info for all candidate profile roles
  const rolePathMap = await getRolePathMap(roleIds);

  // Prepare maps for related data
  const workByProfile = new Map<
    string,
    Array<{
      id: string;
      startDate: string | null;
      endDate: string | null;
      position: string | null;
      company: string | null;
      description: string | null;
    }>
  >();
  const eduByProfile = new Map<
    string,
    Array<{
      id: string;
      startDate: string | null;
      endDate: string | null;
      degree: string | null;
      institution: string | null;
      fieldOfStudy: string | null;
      description: string | null;
    }>
  >();

  if (profileIds.length > 0) {
    // Fetch all work experience entries for these profiles
    const work = await db
      .select({
        id: jobseekersWorkExperience.id,
        profileId: jobseekersWorkExperience.profileId,
        startDate: jobseekersWorkExperience.startDate,
        endDate: jobseekersWorkExperience.endDate,
        position: jobseekersWorkExperience.position,
        company: jobseekersWorkExperience.company,
        description: jobseekersWorkExperience.description,
      })
      .from(jobseekersWorkExperience)
      .where(inArray(jobseekersWorkExperience.profileId, profileIds));

    for (const w of work) {
      if (!w.profileId) continue;
      const arr = workByProfile.get(w.profileId) ?? [];
      arr.push({
        id: w.id,
        startDate: w.startDate ?? null,
        endDate: w.endDate ?? null,
        position: w.position ?? null,
        company: w.company ?? null,
        description: w.description ?? null,
      });
      workByProfile.set(w.profileId, arr);
    }

    // Fetch all education entries for these profiles
    const edu = await db
      .select({
        id: jobseekersEducation.id,
        profileId: jobseekersEducation.profileId,
        startDate: jobseekersEducation.startDate,
        endDate: jobseekersEducation.endDate,
        degree: jobseekersEducation.degree,
        institution: jobseekersEducation.institution,
        fieldOfStudy: jobseekersEducation.fieldOfStudy,
        description: jobseekersEducation.description,
      })
      .from(jobseekersEducation)
      .where(inArray(jobseekersEducation.profileId, profileIds));

    for (const e of edu) {
      if (!e.profileId) continue;
      const arr = eduByProfile.get(e.profileId) ?? [];
      arr.push({
        id: e.id,
        startDate: e.startDate ?? null,
        endDate: e.endDate ?? null,
        degree: e.degree ?? null,
        institution: e.institution ?? null,
        fieldOfStudy: e.fieldOfStudy ?? null,
        description: e.description ?? null,
      });
      eduByProfile.set(e.profileId, arr);
    }
  }

  // Attach related arrays to each candidate profile
  const candidates = baseCandidates.map((c) => {
    if (!c.profile) return c;
    const pid = c.profile.id;
    const profileRoleId = profileRoleByProfileId.get(pid);
    const roleInfo = profileRoleId ? rolePathMap.get(profileRoleId) : undefined;
    return {
      ...c,
      profile: {
        ...c.profile,
        // enrich with resolved role path
        jobRole: roleInfo
          ? { id: roleInfo.roleId, name: roleInfo.roleName }
          : undefined,
        jobSubcategory: roleInfo
          ? { id: roleInfo.subcategoryId, name: roleInfo.subcategoryName }
          : undefined,
        jobCategory: roleInfo
          ? { id: roleInfo.categoryId, name: roleInfo.categoryName }
          : undefined,
        // remove temporary jobRoleId field from output by not carrying it over
        workExperience: workByProfile.get(pid) ?? [],
        education: eduByProfile.get(pid) ?? [],
      },
    };
  });

  return { jobPost: job, candidates };
};

export const getConversationsForCurrentJobseeker = async () => {
  const user = await getUser();
  if (!user) return [] as ConversationListItem[];

  // Fetch conversations where the current user is the jobseeker
  const convos = await db
    .select({
      id: conversations.id,
      recruiterId: conversations.recruiterId,
      jobPostId: conversations.jobPostId,
      companyName: jobPosts.companyName,
      jobTitle: jobPosts.jobTitle,
      recruiterName: users.name,
      profileId: conversations.jobseekersProfileId,
    })
    .from(conversations)
    .leftJoin(jobPosts, eq(jobPosts.id, conversations.jobPostId))
    .leftJoin(users, eq(users.id, conversations.recruiterId))
    .where(eq(conversations.jobseekersId, user.id));

  const results: ConversationListItem[] = [];
  for (const c of convos) {
    // latest message
    const last = await db
      .select({
        id: messages.id,
        content: messages.content,
        sentAt: messages.sentAt,
        isRead: messages.isRead,
        recipientId: messages.recipientId,
      })
      .from(messages)
      .where(eq(messages.conversationId, c.id))
      .orderBy(desc(messages.sentAt))
      .limit(1);

    const lastMsg = last[0];
    results.push({
      id: c.id,
      jobPostId: c.jobPostId,
      name: c.companyName ?? c.recruiterName ?? "Recruiter",
      title: c.jobTitle ?? "",
      avatar: "https://placehold.co/100x100/E2E8F0/4A5568?text=HR",
      lastMessage: lastMsg?.content ?? "",
      profileId: c.profileId,
      timestamp: (lastMsg?.sentAt ?? new Date()).toISOString(),
      isRead: lastMsg
        ? !(lastMsg.recipientId === user.id && lastMsg.isRead === false)
        : true,
    });
  }

  // Sort by latest message time desc
  results.sort((a, b) => (b.timestamp > a.timestamp ? 1 : -1));
  return results;
};

export const getMessagesForConversation = async (conversationId: string) => {
  const user = await getUser();
  if (!user) return [] as ConversationMessageDTO[];

  // Ensure the user is part of the conversation
  const convo = await db
    .select({
      id: conversations.id,
      jobPostId: conversations.jobPostId,
      recruiterId: conversations.recruiterId,
      jobseekersId: conversations.jobseekersId,
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);

  const c = convo[0];
  if (!c || (c.jobseekersId !== user.id && c.recruiterId !== user.id)) {
    return [] as ConversationMessageDTO[];
  }

  const rows = await db
    .select({
      id: messages.id,
      content: messages.content,
      type: messages.type,
      sentAt: messages.sentAt,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      senderName: users.name,
    })
    .from(messages)
    .leftJoin(users, eq(users.id, messages.senderId))
    .where(eq(messages.conversationId, conversationId))
    .orderBy(messages.sentAt);

  return rows.map((m) => ({
    id: m.id,
    sender: m.senderId === user.id ? "me" : (m.senderName ?? ""),
    content: m.content,
    type: m.type ?? undefined,
    jobPostId: c.jobPostId,
    timestamp: m.sentAt.toISOString(),
  }));
};

export const createMessageInConversation = async (
  conversationId: string,
  content: string,
  type: string = "text",
) => {
  const user = await getUser();
  if (!user) throw new Error("Unauthorized");

  const convo = await db
    .select({
      recruiterId: conversations.recruiterId,
      jobseekersId: conversations.jobseekersId,
    })
    .from(conversations)
    .where(eq(conversations.id, conversationId))
    .limit(1);
  const c = convo[0];
  if (!c) throw new Error("Conversation not found");

  const recipientId =
    user.id === c.recruiterId ? c.jobseekersId : c.recruiterId;

  const id = uuidv4();
  await db.insert(messages).values({
    id,
    conversationId,
    senderId: user.id,
    recipientId,
    content,
    type,
  });

  return id;
};

export const getPublicJobPostById = async (jobPostId: string) => {
  const rows = await db
    .select({
      id: jobPosts.id,
      companyName: jobPosts.companyName,
      companyProfile: jobPosts.companyProfile,
      jobTitle: jobPosts.jobTitle,
      jobLocation: jobPosts.jobLocation,
      jobDescription: jobPosts.jobDescription,
      jobRequirements: jobPosts.jobRequirements,
      coreSkills: jobPosts.coreSkills,
      niceToHaveSkills: jobPosts.niceToHaveSkills,
      perks: jobPosts.perks,
      screeningQuestions: jobPosts.screeningQuestions,
    })
    .from(jobPosts)
    .where(eq(jobPosts.id, jobPostId))
    .limit(1);
  return rows[0] ?? null;
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string,
) => {
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.recipientId, userId),
        eq(messages.isRead, false),
      ),
    );
};
