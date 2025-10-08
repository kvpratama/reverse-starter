export type ResumeCoachingTip = {
    type: string;
    tip: string;
    explanation: string;
  };
  
  export type ResumeCoachingCategory = {
    score: number;
    tips: ResumeCoachingTip[];
  };
  
  export type ResumeCoachingData = {
    overall_explanation: string;
    ats: ResumeCoachingCategory;
    tone_and_style: ResumeCoachingCategory;
    content: ResumeCoachingCategory;
    structure: ResumeCoachingCategory;
    skills: ResumeCoachingCategory;
    overall_score: number;
  };
  
  export type ActionState = {
    error?: string;
    success?: boolean;
    coaching?: ResumeCoachingData;
    resumeUrl?: string;
  };