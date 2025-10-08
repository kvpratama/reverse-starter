"use client";

import { useActionState } from "react";
import { handleResumeUploadAndCoaching } from "@/app/(dashboard)/jobseeker/resume-coach/actions";
import UploadResumeCard from "@/components/dashboard/UploadResumeCard";
import ResumeFeedbackDisplay from "@/components/dashboard/ResumeFeedbackDisplay";
import { Button } from "@/components/ui/button";
import Link from "next/link";

type ActionState = {
  error?: string;
  success?: boolean;
  coaching?: {
    overall_explanation: string;
    ats: {
      score: number;
      tips: Array<{
        type: string;
        tip: string;
        explanation: string;
      }>;
    };
    tone_and_style: {
      score: number;
      tips: Array<{
        type: string;
        tip: string;
        explanation: string;
      }>;
    };
    content: {
      score: number;
      tips: Array<{
        type: string;
        tip: string;
        explanation: string;
      }>;
    };
    structure: {
      score: number;
      tips: Array<{
        type: string;
        tip: string;
        explanation: string;
      }>;
    };
    skills: {
      score: number;
      tips: Array<{
        type: string;
        tip: string;
        explanation: string;
      }>;
    };
    overall_score: number;
  };
  resumeUrl?: string;
};

export default function ResumeCoach() {
  const [uploadState, uploadAction, isUploading] = useActionState<
    ActionState,
    FormData
  >(handleResumeUploadAndCoaching, {});

  return (
    <section className="flex-1 p-4 lg:p-8">
      {!uploadState.success && !uploadState.coaching && (
        <div>
          <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
            Resume Coach
          </h1>
          <p className="text-gray-600 mb-6 text-sm">
            Get personalized feedback on your resume to improve your chances of
            landing your dream job.
          </p>
          <div className="flex justify-center mt-6">
            <div className="w-full max-w-2xl">
              <UploadResumeCard
                action={uploadAction}
                isUploading={isUploading}
                error={uploadState.error}
              />
            </div>
          </div>
        </div>
      )}

      {uploadState.success && uploadState.coaching && (
        <>
          <div className="mb-4">
            <Link href="/jobseeker/dashboard">
              <Button variant="ghost">← Back to Dashboard</Button>
            </Link>
          </div>
          <ResumeFeedbackDisplay
            coaching={uploadState.coaching}
            resumeUrl={uploadState.resumeUrl}
          />
        </>
      )}
    </section>
  );
}
