import { string } from "zod";

export interface Message {
  id: string;
  sender: "me" | string; // 'me' or the name of the other person
  content: string;
  type?: string;
  jobPostId?: string;
  timestamp: string; // ISO string
}

export interface Conversation {
  id: string;
  name: string;
  title: string;
  avatar: string;
  lastMessage: string;
  profileId: string;
  timestamp: string; // ISO string
  isRead: boolean;
  jobPostId: string;
}

export type JobPost = {
  id: string;
  jobPostId: string;
  companyName: string;
  companyProfile: string;
  jobTitle: string;
  jobLocation: string;
  jobDescription: string;
  jobRequirements: string;
  coreSkills?: string | null;
  niceToHaveSkills?: string | null;
  perks?: string | null;
  jobCategoryName?: string | null;
  jobSubcategoryName?: string | null;
  jobRoleName?: string | null;
  // Nested objects returned by DB layer (getJobPostWithCandidatesForUser)
  jobCategory?: { id: string; name: string } | null;
  jobSubcategory?: { id: string; name: string } | null;
  jobRole?: { id: string; name: string } | null;
  jobScreeningQuestions?: { question: string }[];
};

export type JobseekerProfile = {
  id: string;
  profileName: string;
  email: string;
  name?: string | null;
  jobCategory?: { name?: string | null } | null;
  jobSubcategory?: { name?: string | null } | null;
  jobRole?: { name?: string | null } | null;
  skills?: string | null;
  age?: number | null;
  visaStatus?: string | null;
  nationality?: string | null;
  bio?: string | null;
  workExperience?: WorkExperience[];
  education?: Education[];
  resumeUrl?: string | null;
};

export interface Candidate {
  id: string;
  status?: string | undefined;
  reasoning?: string | undefined;
  similarityScore?: number | 0;
  similarityScoreBio?: number | 0;
  similarityScoreSkills?: number | 0;
  similarityScoreScreening?: number | 0;
  profile?: CandidateProfile;
  screeningAnswers?: { answer: string }[];
  updatedAt?: string; // ISO string
}

export interface CandidateProfile {
  id: string;
  profileName?: string | null;
  name?: string | null;
  jobRole?: {
    id: string;
    name: string;
  } | null;
  jobSubcategory?: {
    id: string;
    name: string;
  } | null;
  jobCategory?: {
    id: string;
    name: string;
  } | null;
  email: string;
  resumeUrl: string;
  bio?: string | null;
  age?: number | null;
  nationality?: string | null;
  visaStatus?: string | null;
  skills?: string | null;
  experience?: string | null;
  desiredSalary?: number | null;
  workExperience?: WorkExperience[];
  education?: Education[];
}

export interface WorkExperience {
  id: string;
  startDate?: string | null;
  endDate?: string | null;
  position?: string | null;
  company?: string | null;
  description?: string | null;
}

export interface Education {
  id: string;
  startDate?: string | null;
  endDate?: string | null;
  degree?: string | null;
  institution?: string | null;
  fieldOfStudy?: string | null;
  description?: string | null;
}

// --- Conversations & Messages (Jobseeker) ---
export type ConversationListItem = {
  id: string;
  jobPostId: string;
  name: string; // recruiter or company name
  title: string; // job title
  avatar: string; // placeholder for now
  lastMessage: string;
  profileId: string;
  timestamp: string; // ISO string
  isRead: boolean;
};

export type ConversationMessageDTO = {
  id: string;
  sender: "me" | string; // "me" or other party name
  text: string;
  type?: string;
  jobPostId?: string;
  timestamp: string; // ISO string
};
