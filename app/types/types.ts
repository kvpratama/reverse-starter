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
}

export type JobPost = {
  id: string;
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
  screeningQuestions?: { question: string }[];
};

type WorkExperience = {
  id: string;
  company?: string | null;
  position?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
};

type Education = {
  id: string;
  institution?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
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
