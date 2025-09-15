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