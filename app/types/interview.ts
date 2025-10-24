// ============================================
// TYPES (types/interview.ts)
// ============================================

export type InterviewType =
  | "phone_screen"
  | "technical"
  | "behavioral"
  | "final_round"
  | "hr_round"
  | "team_meet";

export type InterviewStatus =
  | "pending"
  | "scheduled"
  | "completed"
  | "cancelled"
  | "rescheduled"
  | "no_show";

export type JobStatus =
  | "applied"
  | "interview_invited"
  | "interview_scheduled"
  | "offer"
  | "rejected"
  | "hired"
  | "contacted"
  | "shortlisted";

export interface User {
  id: string;
  name: string | null;
  email: string;
  roleId: number;
}

export interface JobPost {
  id: string;
  jobTitle: string | null;
  companyName: string | null;
  jobLocation: string | null;
  jobDescription: string | null;
}

export interface JobseekersProfile {
  id: string;
  userId: string | null;
  name: string | null;
  email: string;
  resumeUrl: string;
  bio: string | null;
  skills: string | null;
}

export interface JobPostCandidate {
  id: string;
  profileId: string | null;
  jobPostId: string | null;
  status: JobStatus | null;
  similarityScore: number | null;
}

export interface ApplicationWithDetails {
  application: JobPostCandidate;
  profile: JobseekersProfile;
  jobPost: JobPost;
  recruiter: User;
}

export interface InterviewBooking {
  id: string;
  applicationId: string;
  recruiterId: string;
  candidateProfileId: string;
  interviewType: InterviewType;
  scheduledDate: string;
  duration: number;
  status: InterviewStatus;
  meetingLink: string | null;
  candidateNotes: string | null;
  recruiterNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewWithDetails {
  booking: InterviewBooking;
  application: JobPostCandidate;
  candidateProfile: JobseekersProfile;
  recruiter: User;
  jobPost: JobPost;
}

export interface AvailableSlot {
  time: string;
  timeDisplay: string;
  available: boolean;
}

export interface CreateInterviewRequest {
  applicationId: string;
  recruiterId: string;
  candidateProfileId: string;
  interviewType: InterviewType;
  scheduledDate: string;
  duration: number;
  notes?: string;
  meetingLink?: string;
}

export type InterviewBookingsWithDetails = {
  id: string;
  scheduledDate: Date;
  interviewType: InterviewType;
  duration: number;
  status: InterviewStatus;
  meetingLink: string | null;
  location: string | null;
  recruiterNotes: string | null;
  candidateNotes: string | null;
  // Joined data
  jobTitle: string | null;
  companyName: string | null;
  candidateName: string | null;
  candidateEmail: string | null;
  recruiterName: string | null;
  recruiterId: string | null;
  candidateProfileId: string;
  applicationId: string;
};
