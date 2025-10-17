import { desc, and, eq, isNull, inArray, gte, lte, or } from "drizzle-orm";
import { db } from "./drizzle";
import {
  activityLogs,
  users,
  jobseekersProfile,
  jobseekersWorkExperience,
  jobseekersEducation,
  jobCategories,
  jobSubcategories,
  jobPosts,
  jobPostSubcategories,
  jobseekersProfileSubcategories,
  jobPostsCandidate,
  conversations,
  messages,
  JobStatus,
  interviewBookings,
  RECRUITER_ROLE_ID,
  JOBSEEKER_ROLE_ID,
} from "@/lib/db/schema";
import type { JobPost } from "@/lib/db/schema";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";
import { WorkExperienceEntry, EducationEntry } from "@/lib/types/profile";
import { InterviewBookingsWithDetails } from "@/app/types/interview";
import {
  ConversationListItem,
  ConversationMessageDTO,
  JobCategoriesData,
} from "@/app/types/types";

// Helper: Batch-resolve subcategory -> category for a set of role IDs
const getRolePathMap = async (
  subcategoryIds: string[]
): Promise<
  Map<
    string,
    {
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
      subcategoryId: string;
      subcategoryName: string;
      categoryId: string;
      categoryName: string;
    }
  >();
  if (subcategoryIds.length === 0) return result;

  const rows = await db
    .select({
      subcategoryId: jobSubcategories.id,
      subcategoryName: jobSubcategories.name,
      categoryId: jobCategories.id,
      categoryName: jobCategories.name,
    })
    .from(jobSubcategories)
    .innerJoin(jobCategories, eq(jobCategories.id, jobSubcategories.categoryId))
    .where(inArray(jobSubcategories.id, subcategoryIds));

  for (const r of rows) {
    result.set(r.subcategoryId, r);
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
        eq(jobPostsCandidate.profileId, profileId)
      )
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
      jobRequirements: jobPosts.jobRequirements,
      coreSkills: jobPosts.coreSkills,
      niceToHaveSkills: jobPosts.niceToHaveSkills,
      screeningQuestions: jobPosts.screeningQuestions,
    })
    .from(jobPosts)
    .where(eq(jobPosts.id, jobPostId))
    .limit(1);
  const row = rows[0];
  if (!row) return null;
  return {
    id: row.id,
    job_description: row.jobDescription ?? "",
    job_requirements: row.jobRequirements ?? "",
    job_core_skills: row.coreSkills ?? "",
    job_nice_to_have_skills: row.niceToHaveSkills ?? "",
    job_screening_questions: row.screeningQuestions ?? "",
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
      }\n${w.description ?? ""}`.trim()
    )
    .join("\n\n");

  const jobseeker_education = edu
    .map((e) =>
      `${e.startDate ?? ""} - ${e.endDate ?? ""} | ${e.degree ?? ""} in ${
        e.fieldOfStudy ?? ""
      } @ ${e.institution ?? ""}\n${e.description ?? ""}`.trim()
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
  reasoning: string,
  similarityScore: number,
  similarityScoreBio: number,
  similarityScoreSkills: number,
  similarityScoreScreening: number,
  status: JobStatus,
  screeningAnswers?: any
) => {
  // try insert, on unique violation perform update
  try {
    return await createJobPostCandidate(
      jobPostId,
      profileId,
      reasoning,
      similarityScore,
      similarityScoreBio,
      similarityScoreSkills,
      similarityScoreScreening,
      status,
      screeningAnswers ?? ""
    );
  } catch (e: any) {
    // fallback to update existing
    await db
      .update(jobPostsCandidate)
      .set({
        reasoning,
        similarityScore,
        similarityScoreBio,
        similarityScoreSkills,
        similarityScoreScreening,
        status,
        screeningAnswers: screeningAnswers ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(jobPostsCandidate.jobPostId, jobPostId),
          eq(jobPostsCandidate.profileId, profileId)
        )
      );
    // return the existing id (not fetched here); caller may not need it
    return undefined;
  }
};

export async function getJobCategoriesData(): Promise<JobCategoriesData> {
  // Join jobCategories with jobSubcategories
  const results = await db
    .select({
      category: jobCategories.name,
      subcategoryId: jobSubcategories.id,
      subcategoryName: jobSubcategories.name,
    })
    .from(jobCategories)
    .leftJoin(
      jobSubcategories,
      eq(jobSubcategories.categoryId, jobCategories.id)
    );

  // Transform into { [category]: [subcategories] }
  const data: JobCategoriesData = {};
  for (const row of results) {
    if (!row.category) continue;
    if (!data[row.category]) {
      data[row.category] = [];
    }
    if (row.subcategoryId && row.subcategoryName) {
      data[row.category].push({
        id: row.subcategoryId,
        name: row.subcategoryName,
      });
    }
  }

  return data;
}

export const getJobseekerProfiles = async (userId: string) => {
  return await db
    .select()
    .from(jobseekersProfile)
    .where(eq(jobseekersProfile.userId, userId))
    .orderBy(desc(jobseekersProfile.updatedAt));
};

export const getJobseekerProfileById = async (
  profileId: string,
  userId: string
) => {
  // Base profile
  const profile = await db.query.jobseekersProfile.findFirst({
    where: and(
      eq(jobseekersProfile.id, profileId),
      eq(jobseekersProfile.userId, userId)
    ),
    with: {
      subcategories: {
        with: {
          subcategory: {
            with: {
              category: true,
            },
          },
        },
      },
      workExperience: true,
      education: true,
    },
  });

  if (!profile) return null;

  return {
    ...profile,
    candidateId: profile.id,
    jobSubcategories: profile.subcategories.map((ps) => ({
      id: ps.subcategory.id,
      name: ps.subcategory.name,
    })),
    jobCategories: profile.subcategories.map((ps) => ({
      id: ps.subcategory.category.id,
      name: ps.subcategory.category.name,
    })),
  };
};

export const createJobseekerProfileByIds = async (
  userId: string,
  profileName: string,
  subcategoryIds: string[], // Direct subcategory IDs
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
  education: EducationEntry[] | undefined
) => {
  // 1. Check user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  if (!user) {
    throw new Error("User not found");
  }

  // 2. Validate subcategory IDs exist
  if (subcategoryIds.length === 0) {
    throw new Error("At least one subcategory must be provided");
  }

  const existingSubcategories = await db.query.jobSubcategories.findMany({
    where: inArray(jobSubcategories.id, subcategoryIds),
    columns: { id: true }, // Only select ID for efficiency
  });

  if (existingSubcategories.length !== subcategoryIds.length) {
    const foundIds = existingSubcategories.map((sc) => sc.id);
    const missing = subcategoryIds.filter((id) => !foundIds.includes(id));
    throw new Error(`Invalid subcategory IDs: ${missing.join(", ")}`);
  }

  // 3. Use transaction for data consistency
  const profileId = await db.transaction(async (tx) => {
    const newProfileId = uuidv4();

    // Insert profile
    await tx.insert(jobseekersProfile).values({
      id: newProfileId,
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
    });

    // Insert profile-subcategory relationships
    const profileSubcategoryEntries = subcategoryIds.map((subcategoryId) => ({
      profileId: newProfileId,
      subcategoryId,
    }));
    await tx
      .insert(jobseekersProfileSubcategories)
      .values(profileSubcategoryEntries);

    // Insert work experience
    if (workExperience?.length) {
      const workEntries = workExperience.map((exp) => ({
        id: uuidv4(),
        profileId: newProfileId,
        startDate: exp.start_date,
        endDate: exp.end_date,
        position: exp.position,
        company: exp.company,
        description: exp.description,
      }));
      await tx.insert(jobseekersWorkExperience).values(workEntries);
    }

    // Insert education
    if (education?.length) {
      const eduEntries = education.map((edu) => ({
        id: uuidv4(),
        profileId: newProfileId,
        startDate: edu.start_date,
        endDate: edu.end_date,
        degree: edu.degree,
        institution: edu.institution,
        fieldOfStudy: edu.field_of_study,
        description: edu.description,
      }));
      await tx.insert(jobseekersEducation).values(eduEntries);
    }

    return newProfileId;
  });

  return profileId;
};

export const deleteJobseekerProfile = async (
  profileId: string,
  userId?: string // Optional: for additional security check
): Promise<void> => {
  // 1. Check if profile exists and optionally verify ownership
  const existingProfile = await db.query.jobseekersProfile.findFirst({
    where: userId
      ? and(
          eq(jobseekersProfile.id, profileId),
          eq(jobseekersProfile.userId, userId)
        )
      : eq(jobseekersProfile.id, profileId),
    columns: { id: true, userId: true }, // Only select what we need
  });

  if (!existingProfile) {
    throw new Error(
      userId ? "Profile not found or access denied" : "Profile not found"
    );
  }

  // 2. Use transaction to ensure all related data is deleted atomically
  await db.transaction(async (tx) => {
    // Delete work experience entries
    await tx
      .delete(jobseekersWorkExperience)
      .where(eq(jobseekersWorkExperience.profileId, profileId));

    // Delete education entries
    await tx
      .delete(jobseekersEducation)
      .where(eq(jobseekersEducation.profileId, profileId));

    // Delete profile-subcategory relationships
    await tx
      .delete(jobseekersProfileSubcategories)
      .where(eq(jobseekersProfileSubcategories.profileId, profileId));

    // Finally, delete the main profile
    await tx
      .delete(jobseekersProfile)
      .where(eq(jobseekersProfile.id, profileId));
  });
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
  subcategoryIds: string[],
  screeningQuestion1: string,
  screeningQuestion2: string,
  screeningQuestion3: string
) => {
  // 1. Check user exists
  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!user) {
    throw new Error("User not found");
  }

  // 2. Validate all subcategory IDs exist
  if (subcategoryIds.length === 0) {
    throw new Error("At least one subcategory must be provided");
  }
  const existingSubcategories = await db.query.jobSubcategories.findMany({
    where: inArray(jobSubcategories.id, subcategoryIds),
    columns: { id: true },
  });

  if (existingSubcategories.length !== subcategoryIds.length) {
    const foundIds = existingSubcategories.map((sc) => sc.id);
    const missing = subcategoryIds.filter((id) => !foundIds.includes(id));
    throw new Error(`Invalid subcategory IDs: ${missing.join(", ")}`);
  }

  // 3. Use transaction for atomicity
  const jobPostId = await db.transaction(async (tx) => {
    const newJobPostId = uuidv4();

    // Insert job post
    await tx.insert(jobPosts).values({
      id: newJobPostId,
      userId,
      companyName,
      companyProfile,
      jobTitle,
      jobLocation,
      jobDescription,
      jobRequirements,
      perks,
      coreSkills,
      niceToHaveSkills,
      screeningQuestions: [
        { question: screeningQuestion1 },
        { question: screeningQuestion2 },
        { question: screeningQuestion3 },
      ],
    });

    // Link job post to all provided subcategories
    const jobPostSubcategoryEntries = subcategoryIds.map((subcategoryId) => ({
      jobPostId: newJobPostId,
      subcategoryId,
    }));
    await tx.insert(jobPostSubcategories).values(jobPostSubcategoryEntries);

    return newJobPostId;
  });

  return jobPostId;
};

export const updateJobPost = async (
  jobPostId: string,
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
  subcategoryIds: string[],
  screeningQuestion1: string,
  screeningQuestion2: string,
  screeningQuestion3: string
) => {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (user.length === 0) {
    throw new Error("User not found");
  }

  // Validate all subcategory IDs exist
  if (subcategoryIds.length === 0) {
    throw new Error("At least one subcategory must be provided");
  }
  const existingSubcategories = await db.query.jobSubcategories.findMany({
    where: inArray(jobSubcategories.id, subcategoryIds),
    columns: { id: true },
  });

  if (existingSubcategories.length !== subcategoryIds.length) {
    const foundIds = existingSubcategories.map((sc) => sc.id);
    const missing = subcategoryIds.filter((id) => !foundIds.includes(id));
    throw new Error(`Invalid subcategory IDs: ${missing.join(", ")}`);
  }

  await db.transaction(async (tx) => {
    await tx
      .update(jobPosts)
      .set({
        companyName,
        companyProfile,
        jobTitle,
        jobLocation,
        jobDescription,
        jobRequirements,
        perks,
        coreSkills,
        niceToHaveSkills,
        screeningQuestions: [
          { question: screeningQuestion1 },
          { question: screeningQuestion2 },
          { question: screeningQuestion3 },
        ],
        updatedAt: new Date(),
      })
      .where(eq(jobPosts.id, jobPostId));

    // Update junction mapping to reflect new subcategory selection
    await tx
      .delete(jobPostSubcategories)
      .where(eq(jobPostSubcategories.jobPostId, jobPostId));

    const jobPostSubcategoryEntries = subcategoryIds.map((subcategoryId) => ({
      jobPostId,
      subcategoryId,
    }));
    await tx.insert(jobPostSubcategories).values(jobPostSubcategoryEntries);
  });

  return jobPostId;
};

// After a job post is created, notify potential candidates who are in the same job subcategory
export const notifyPotentialCandidatesForJobPost = async (
  jobPostId: string,
  recruiterUserId: string,
  profileIds_vectordb: string[]
) => {
  // 1) Load the job post and its subcategories
  const jobPostRows = await db
    .select({
      id: jobPosts.id,
      jobTitle: jobPosts.jobTitle,
      companyName: jobPosts.companyName,
      subcategoryId: jobPostSubcategories.subcategoryId,
    })
    .from(jobPosts)
    .leftJoin(
      jobPostSubcategories,
      eq(jobPostSubcategories.jobPostId, jobPosts.id)
    )
    .where(eq(jobPosts.id, jobPostId));

  if (jobPostRows.length === 0 || !jobPostRows[0].subcategoryId) {
    return { conversationsCreated: 0, messagesCreated: 0 } as const;
  }

  const jobInfo = jobPostRows[0];
  const subcategoryIds = jobPostRows
    .map((r) => r.subcategoryId)
    .filter((id): id is string => !!id);

  console.log("subcategoryIds", subcategoryIds);

  if (subcategoryIds.length === 0) {
    return { conversationsCreated: 0, messagesCreated: 0 } as const;
  }

  // 2) Find distinct candidate profiles that belong to the matching subcategories
  const matchingProfileIds = await db
    .selectDistinct({
      profileId: jobseekersProfileSubcategories.profileId,
    })
    .from(jobseekersProfileSubcategories)
    .where(
      inArray(jobseekersProfileSubcategories.subcategoryId, subcategoryIds)
    );

  const profileIds = matchingProfileIds.map((p) => p.profileId);
  // merge profileIds and profileIds_vectordb and remove duplicates
  const profileIds_all = [...new Set([...profileIds, ...profileIds_vectordb])];

  if (profileIds_all.length === 0) {
    return { conversationsCreated: 0, messagesCreated: 0 } as const;
  }

  const candidateProfiles = await db
    .select({
      profileId: jobseekersProfile.id,
      jobseekersUserId: jobseekersProfile.userId,
      candidateName: jobseekersProfile.name,
      candidateEmail: jobseekersProfile.email,
    })
    .from(jobseekersProfile)
    .where(
      and(
        inArray(jobseekersProfile.id, profileIds_all),
        eq(jobseekersProfile.active, true)
      )
    );

  let conversationsCreated = 0;
  let messagesCreated = 0;

  console.log("candidateProfiles", candidateProfiles);

  // 3) Create a conversation and initial message per candidate profile
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
    const content = `Hi ${greetingName}, <br/><br/>Your profile appears to be a potential match for the ${
      jobInfo.jobTitle ?? "open"
    } role at ${
      jobInfo.companyName ?? "our company"
    }. <br/><br/>You can view the full job post or join the early screening process using the options below. <br/><br/>Best regards, <br/>${
      jobInfo.companyName ?? "our company"
    }`;

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
  reasoning: string,
  similarityScore: number,
  similarityScoreBio: number,
  similarityScoreSkills: number,
  similarityScoreScreening: number,
  status: JobStatus,
  screeningAnswers?: any
) => {
  const id = uuidv4();
  await db.insert(jobPostsCandidate).values({
    id,
    jobPostId,
    profileId,
    reasoning,
    similarityScore,
    similarityScoreBio,
    similarityScoreSkills,
    similarityScoreScreening,
    status,
    screeningAnswers,
  });
  return id;
};

// Create an interview invitation message and update candidate status to "interview_invited"
export const createInterviewInvitationAndUpdateStatus = async (
  jobPostId: string,
  jobseekersProfileId: string,
  content: string,
  invitationId?: string
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
        eq(conversations.jobseekersProfileId, jobseekersProfileId)
      )
    )
    .limit(1);

  const c = convo[0];
  if (!c) throw new Error("Conversation not found");
  if (c.recruiterId !== user.id)
    throw new Error("Forbidden: only recruiter can invite");

  // Insert message
  const messageId = uuidv4();
  // Store invitationId in the message content as JSON for now
  const messageContent = invitationId
    ? JSON.stringify({ content, invitationId })
    : content;

  await db.insert(messages).values({
    id: messageId,
    conversationId: c.id,
    senderId: c.recruiterId,
    recipientId: c.jobseekersId,
    content: messageContent,
    type: "interview_invitation",
  });

  // Update candidate status
  await db
    .update(jobPostsCandidate)
    .set({ status: "interview_invited" as JobStatus, updatedAt: new Date() })
    .where(
      and(
        eq(jobPostsCandidate.jobPostId, jobPostId),
        eq(jobPostsCandidate.profileId, jobseekersProfileId)
      )
    );

  return { messageId } as const;
};

// Create a recruiter -> jobseeker message after early screening submission
export const createThankYouMessageForScreening = async (
  jobPostId: string,
  jobseekersProfileId: string,
  content: string,
  type: string = "thank_you"
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
        eq(conversations.jobseekersProfileId, jobseekersProfileId)
      )
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
  userId: string
) => {
  // Step 1: Fetch the core job post details
  const jobPostResult = await db.query.jobPosts.findFirst({
    where: and(eq(jobPosts.id, jobPostId), eq(jobPosts.userId, userId)),
    with: {
      subcategories: {
        with: {
          subcategory: {
            with: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!jobPostResult) {
    return null; // Job post not found or not owned by the user
  }

  // Step 2: Fetch associated candidates with a single aggregated query
  const candidatesResultRaw = await db
    .select({
      candidateId: jobPostsCandidate.id,
      candidateStatus: jobPostsCandidate.status,
      reasoning: jobPostsCandidate.reasoning,
      similarityScore: jobPostsCandidate.similarityScore,
      similarityScoreBio: jobPostsCandidate.similarityScoreBio,
      similarityScoreSkills: jobPostsCandidate.similarityScoreSkills,
      similarityScoreScreening: jobPostsCandidate.similarityScoreScreening,
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
      skills: jobseekersProfile.skills,
      experience: jobseekersProfile.experience,
      desiredSalary: jobseekersProfile.desiredSalary,
      subcategoryId: jobseekersProfileSubcategories.subcategoryId,
      subcategoryName: jobSubcategories.name,
      categoryId: jobCategories.id,
      categoryName: jobCategories.name,
      // Include work experience fields
      workExpId: jobseekersWorkExperience.id,
      workExpStartDate: jobseekersWorkExperience.startDate,
      workExpEndDate: jobseekersWorkExperience.endDate,
      workExpPosition: jobseekersWorkExperience.position,
      workExpCompany: jobseekersWorkExperience.company,
      workExpDescription: jobseekersWorkExperience.description,
      // Include education fields
      eduId: jobseekersEducation.id,
      eduStartDate: jobseekersEducation.startDate,
      eduEndDate: jobseekersEducation.endDate,
      eduDegree: jobseekersEducation.degree,
      eduInstitution: jobseekersEducation.institution,
      eduFieldOfStudy: jobseekersEducation.fieldOfStudy,
      eduDescription: jobseekersEducation.description,
      // Include interview booking fields for scheduled interviews
      interviewBookingId: interviewBookings.id,
      scheduledInterviewDate: interviewBookings.scheduledDate,
    })
    .from(jobPostsCandidate)
    .where(eq(jobPostsCandidate.jobPostId, jobPostId))
    .innerJoin(
      jobseekersProfile,
      eq(jobseekersProfile.id, jobPostsCandidate.profileId)
    )
    .leftJoin(
      jobseekersProfileSubcategories,
      eq(jobseekersProfileSubcategories.profileId, jobseekersProfile.id)
    )
    .leftJoin(
      jobSubcategories,
      eq(jobSubcategories.id, jobseekersProfileSubcategories.subcategoryId)
    )
    .leftJoin(jobCategories, eq(jobCategories.id, jobSubcategories.categoryId))
    .leftJoin(
      jobseekersWorkExperience,
      eq(jobseekersWorkExperience.profileId, jobseekersProfile.id)
    )
    .leftJoin(
      jobseekersEducation,
      eq(jobseekersEducation.profileId, jobseekersProfile.id)
    )
    .leftJoin(
      interviewBookings,
      and(
        eq(interviewBookings.applicationId, jobPostsCandidate.id),
        eq(interviewBookings.status, "scheduled")
      )
    )
    .orderBy(
      desc(jobPostsCandidate.similarityScore),
      desc(jobseekersWorkExperience.startDate),
      desc(jobseekersEducation.startDate)
    );

  // Step 3: Aggregate the candidate data efficiently
  const candidatesResultMap = candidatesResultRaw.reduce(
    (acc, row) => {
      let entry = acc.get(row.candidateId);
      if (!entry) {
        entry = {
          candidateId: row.candidateId,
          candidateStatus: row.candidateStatus,
          reasoning: row.reasoning,
          similarityScore: row.similarityScore,
          similarityScoreBio: row.similarityScoreBio,
          similarityScoreSkills: row.similarityScoreSkills,
          similarityScoreScreening: row.similarityScoreScreening,
          screeningAnswers: row.screeningAnswers,
          updatedAt: row.updatedAt,
          profileId: row.profileId,
          profileName: row.profileName,
          name: row.name,
          email: row.email,
          resumeUrl: row.resumeUrl,
          bio: row.bio,
          age: row.age,
          nationality: row.nationality,
          visaStatus: row.visaStatus,
          skills: row.skills,
          experience: row.experience,
          desiredSalary: row.desiredSalary,
          scheduledInterviewDate: null,
          jobCategories: [] as { id: string; name: string }[],
          jobSubcategories: [] as { id: string; name: string }[],
          workExperience: [] as {
            id: string;
            startDate: string | null;
            endDate: string | null;
            position: string | null;
            company: string | null;
            description: string | null;
          }[],
          education: [] as {
            id: string;
            startDate: string | null;
            endDate: string | null;
            degree: string | null;
            institution: string | null;
            fieldOfStudy: string | null;
            description: string | null;
          }[],
        };
        acc.set(row.candidateId, entry);
      }

      // Aggregate categories (deduplicate)
      if (row.categoryId && row.categoryName) {
        if (!entry.jobCategories.some((c) => c.id === row.categoryId)) {
          entry.jobCategories.push({
            id: row.categoryId,
            name: row.categoryName,
          });
        }
      }

      // Aggregate subcategories (deduplicate)
      if (row.subcategoryId && row.subcategoryName) {
        if (!entry.jobSubcategories.some((s) => s.id === row.subcategoryId)) {
          entry.jobSubcategories.push({
            id: row.subcategoryId,
            name: row.subcategoryName,
          });
        }
      }

      // Aggregate work experience (deduplicate) - already sorted by query
      if (row.workExpId) {
        if (!entry.workExperience.some((w) => w.id === row.workExpId)) {
          entry.workExperience.push({
            id: row.workExpId,
            startDate: row.workExpStartDate,
            endDate: row.workExpEndDate,
            position: row.workExpPosition,
            company: row.workExpCompany,
            description: row.workExpDescription,
          });
        }
      }

      // Aggregate education (deduplicate) - already sorted by query
      if (row.eduId) {
        if (!entry.education.some((e) => e.id === row.eduId)) {
          entry.education.push({
            id: row.eduId,
            startDate: row.eduStartDate,
            endDate: row.eduEndDate,
            degree: row.eduDegree,
            institution: row.eduInstitution,
            fieldOfStudy: row.eduFieldOfStudy,
            description: row.eduDescription,
          });
        }
      }
      // Aggregate interview booking (for scheduled interviews)
      if (row.interviewBookingId && row.scheduledInterviewDate) {
        if (!entry.scheduledInterviewDate) {
          entry.scheduledInterviewDate = row.scheduledInterviewDate;
        }
      }

      return acc;
    },
    new Map<
      string,
      {
        candidateId: string;
        candidateStatus: JobStatus | null;
        reasoning: string | null;
        similarityScore: number | null;
        similarityScoreBio: number | null;
        similarityScoreSkills: number | null;
        similarityScoreScreening: number | null;
        screeningAnswers: unknown;
        updatedAt: Date;
        profileId: string | null;
        profileName: string | null;
        name: string | null;
        email: string | null;
        resumeUrl: string | null;
        bio: string | null;
        age: number | null;
        nationality: string | null;
        visaStatus: string | null;
        skills: string | null;
        experience: "entry" | "mid" | "senior" | null;
        desiredSalary: number | null;
        scheduledInterviewDate: Date | null;
        jobCategories: { id: string; name: string }[];
        jobSubcategories: { id: string; name: string }[];
        workExperience: {
          id: string;
          startDate: string | null;
          endDate: string | null;
          position: string | null;
          company: string | null;
          description: string | null;
        }[];
        education: {
          id: string;
          startDate: string | null;
          endDate: string | null;
          degree: string | null;
          institution: string | null;
          fieldOfStudy: string | null;
          description: string | null;
        }[];
      }
    >()
  );

  // Convert map to array
  const candidatesResult = Array.from(candidatesResultMap.values());

  // Step 4: Aggregate the job post data
  const { subcategories, ...restOfJobPost } = jobPostResult;

  const aggregatedJobPost = {
    ...restOfJobPost,
    jobSubcategories: subcategories.map((s) => s.subcategory),
    jobCategories: subcategories.map((s) => s.subcategory.category),
  };

  return {
    jobPost: aggregatedJobPost,
    candidates: candidatesResult,
  };
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
  type: string = "text"
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

export const getJobPost = async (jobPostId: string) => {
  const jobPost = await db
    .select()
    .from(jobPosts)
    .where(eq(jobPosts.id, jobPostId))
    .limit(1);
  return jobPost[0];
};

export const getPublicJobPostById = async (jobPostId: string) => {
  const jobPost = await db.query.jobPosts.findFirst({
    where: eq(jobPosts.id, jobPostId),
    with: {
      subcategories: {
        with: {
          subcategory: {
            with: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!jobPost) return null;

  // Transform the data to match the expected JobPost type structure
  const { subcategories, ...restOfJobPost } = jobPost;

  return {
    ...restOfJobPost,
    jobSubcategories: subcategories.map((s) => s.subcategory),
    jobCategories: subcategories.map((s) => s.subcategory.category),
  } as const;
};

export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
) => {
  await db
    .update(messages)
    .set({ isRead: true })
    .where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.recipientId, userId),
        eq(messages.isRead, false)
      )
    );
};

/**
 * Fetch interviews for a specific user based on their role
 * - Recruiters see interviews they're conducting
 * - Job seekers see interviews they're attending
 */
export async function getInterviewsForUser(
  userId: string,
  userRole: number,
  month: number,
  year: number
): Promise<InterviewBookingsWithDetails[]> {
  // Calculate date range for the month (including buffer for prev/next month days)
  const startDate = new Date(year, month - 1, 15); // Start from 15th of previous month
  const endDate = new Date(year, month + 1, 15); // End at 15th of next month

  let interviews: InterviewBookingsWithDetails[];

  if (userRole === RECRUITER_ROLE_ID) {
    // Fetch interviews where user is the recruiter
    interviews = await db
      .select({
        id: interviewBookings.id,
        scheduledDate: interviewBookings.scheduledDate,
        interviewType: interviewBookings.interviewType,
        duration: interviewBookings.duration,
        status: interviewBookings.status,
        meetingLink: interviewBookings.meetingLink,
        location: interviewBookings.location,
        recruiterNotes: interviewBookings.recruiterNotes,
        candidateNotes: interviewBookings.candidateNotes,
        jobTitle: jobPosts.jobTitle,
        companyName: jobPosts.companyName,
        candidateName: jobseekersProfile.name,
        candidateEmail: jobseekersProfile.email,
        recruiterName: users.name,
        recruiterId: interviewBookings.recruiterId,
        candidateProfileId: interviewBookings.candidateProfileId,
        applicationId: interviewBookings.applicationId,
      })
      .from(interviewBookings)
      .innerJoin(
        jobPostsCandidate,
        eq(interviewBookings.applicationId, jobPostsCandidate.id)
      )
      .innerJoin(
        jobseekersProfile,
        eq(interviewBookings.candidateProfileId, jobseekersProfile.id)
      )
      .innerJoin(jobPosts, eq(jobPostsCandidate.jobPostId, jobPosts.id))
      .innerJoin(users, eq(interviewBookings.recruiterId, users.id))
      .where(
        and(
          eq(interviewBookings.recruiterId, userId),
          gte(interviewBookings.scheduledDate, startDate),
          lte(interviewBookings.scheduledDate, endDate),
          isNull(interviewBookings.deletedAt) // Exclude soft-deleted records
        )
      )
      .orderBy(interviewBookings.scheduledDate);
  } else if (userRole === JOBSEEKER_ROLE_ID) {
    // Fetch interviews where user's profile is the candidate
    // First get the user's profile(s)
    const userProfiles = await db
      .select({ id: jobseekersProfile.id })
      .from(jobseekersProfile)
      .where(eq(jobseekersProfile.userId, userId));

    if (userProfiles.length === 0) {
      return [];
    }

    const profileIds = userProfiles.map((p) => p.id);

    // Fetch interviews for any of the user's profiles
    interviews = await db
      .select({
        id: interviewBookings.id,
        scheduledDate: interviewBookings.scheduledDate,
        interviewType: interviewBookings.interviewType,
        duration: interviewBookings.duration,
        status: interviewBookings.status,
        meetingLink: interviewBookings.meetingLink,
        location: interviewBookings.location,
        recruiterNotes: interviewBookings.recruiterNotes,
        candidateNotes: interviewBookings.candidateNotes,
        jobTitle: jobPosts.jobTitle,
        companyName: jobPosts.companyName,
        candidateName: jobseekersProfile.name,
        candidateEmail: jobseekersProfile.email,
        recruiterName: users.name,
        recruiterId: interviewBookings.recruiterId,
        candidateProfileId: interviewBookings.candidateProfileId,
        applicationId: interviewBookings.applicationId,
      })
      .from(interviewBookings)
      .innerJoin(
        jobPostsCandidate,
        eq(interviewBookings.applicationId, jobPostsCandidate.id)
      )
      .innerJoin(
        jobseekersProfile,
        eq(interviewBookings.candidateProfileId, jobseekersProfile.id)
      )
      .innerJoin(jobPosts, eq(jobPostsCandidate.jobPostId, jobPosts.id))
      .innerJoin(users, eq(interviewBookings.recruiterId, users.id))
      .where(
        and(
          or(
            ...profileIds.map((id) =>
              eq(interviewBookings.candidateProfileId, id)
            )
          ),
          gte(interviewBookings.scheduledDate, startDate),
          lte(interviewBookings.scheduledDate, endDate),
          isNull(interviewBookings.deletedAt)
        )
      )
      .orderBy(interviewBookings.scheduledDate);
  } else {
    // Unknown role, return empty array
    return [];
  }

  return interviews.map((interview) => ({
    ...interview,
    // Ensure date is a Date object
    scheduledDate: new Date(interview.scheduledDate),
  }));
}

/**
 * Get a single interview by ID with authorization check
 */
export async function getInterviewById(
  interviewId: string,
  userId: string,
  userRole: number
): Promise<InterviewBookingsWithDetails | null> {
  const interview = await db
    .select({
      id: interviewBookings.id,
      scheduledDate: interviewBookings.scheduledDate,
      interviewType: interviewBookings.interviewType,
      duration: interviewBookings.duration,
      status: interviewBookings.status,
      meetingLink: interviewBookings.meetingLink,
      location: interviewBookings.location,
      recruiterNotes: interviewBookings.recruiterNotes,
      candidateNotes: interviewBookings.candidateNotes,
      jobTitle: jobPosts.jobTitle,
      companyName: jobPosts.companyName,
      candidateName: jobseekersProfile.name,
      candidateEmail: jobseekersProfile.email,
      recruiterName: users.name,
      recruiterId: interviewBookings.recruiterId,
      candidateProfileId: interviewBookings.candidateProfileId,
      applicationId: interviewBookings.applicationId,
    })
    .from(interviewBookings)
    .innerJoin(
      jobPostsCandidate,
      eq(interviewBookings.applicationId, jobPostsCandidate.id)
    )
    .innerJoin(
      jobseekersProfile,
      eq(interviewBookings.candidateProfileId, jobseekersProfile.id)
    )
    .innerJoin(jobPosts, eq(jobPostsCandidate.jobPostId, jobPosts.id))
    .innerJoin(users, eq(interviewBookings.recruiterId, users.id))
    .where(eq(interviewBookings.id, interviewId))
    .limit(1);

  if (interview.length === 0) {
    return null;
  }

  const interviewData = interview[0];

  // Authorization check
  if (userRole === RECRUITER_ROLE_ID) {
    // Recruiters can only see their own interviews
    if (interviewData.recruiterId !== userId) {
      return null;
    }
  } else if (userRole === JOBSEEKER_ROLE_ID) {
    // Job seekers can only see interviews for their profiles
    const userProfiles = await db
      .select({ id: jobseekersProfile.id })
      .from(jobseekersProfile)
      .where(eq(jobseekersProfile.userId, userId));

    const profileIds = userProfiles.map((p) => p.id);
    if (!profileIds.includes(interviewData.candidateProfileId)) {
      return null;
    }
  } else {
    return null;
  }

  return {
    ...interviewData,
    scheduledDate: new Date(interviewData.scheduledDate),
  };
}

/**
 * Get upcoming interviews count for a user (for dashboard/notifications)
 */
export async function getUpcomingInterviewsCount(
  userId: string,
  userRole: number
): Promise<number> {
  const now = new Date();

  if (userRole === RECRUITER_ROLE_ID) {
    const result = await db
      .select({ count: interviewBookings.id })
      .from(interviewBookings)
      .where(
        and(
          eq(interviewBookings.recruiterId, userId),
          gte(interviewBookings.scheduledDate, now),
          eq(interviewBookings.status, "scheduled"),
          isNull(interviewBookings.deletedAt)
        )
      );

    return result.length;
  } else if (userRole === JOBSEEKER_ROLE_ID) {
    const userProfiles = await db
      .select({ id: jobseekersProfile.id })
      .from(jobseekersProfile)
      .where(eq(jobseekersProfile.userId, userId));

    if (userProfiles.length === 0) {
      return 0;
    }

    const profileIds = userProfiles.map((p) => p.id);

    const result = await db
      .select({ count: interviewBookings.id })
      .from(interviewBookings)
      .where(
        and(
          or(
            ...profileIds.map((id) =>
              eq(interviewBookings.candidateProfileId, id)
            )
          ),
          gte(interviewBookings.scheduledDate, now),
          eq(interviewBookings.status, "scheduled"),
          isNull(interviewBookings.deletedAt)
        )
      );

    return result.length;
  }

  return 0;
}
