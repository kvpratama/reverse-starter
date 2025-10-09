"use client";

import { useActionState } from "react";
import { handleResumeUploadAndCoaching } from "@/app/(dashboard)/jobseeker/resume-coach/actions";
import UploadResumeCard from "@/components/dashboard/UploadResumeCard";
import ResumeFeedbackDisplay from "@/components/dashboard/ResumeFeedbackDisplay";
import { Button } from "@/components/ui/button";
// import { useRouter } from "next/navigation";
import { SignpostBig } from "lucide-react";
import { ActionState } from "@/app/types/resume-coaching";

export default function ResumeCoach() {
  const [uploadState, uploadAction, isUploading] = useActionState<
    ActionState,
    FormData
  >(handleResumeUploadAndCoaching, {});
  // const router = useRouter();
  const handleRefresh = () => {
    // router.refresh(); // Soft-reloads the current route
    window.location.reload();
  };

  return (
    <section className="flex-1 p-4 lg:p-8">
      {!uploadState.success && !uploadState.coaching && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-orange-100 p-2 rounded-lg">
              <SignpostBig className="w-6 h-6 text-orange-500" />
            </div>
            <h1 className="text-lg lg:text-2xl font-medium text-gray-900">
              Resume Coach
            </h1>
          </div>
          <p className="text-gray-600 mb-4 text-sm">
            Get personalized feedback on your resume to improve your chances of
            landing your dream job.
          </p>

          {/* What you'll receive section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-7 shadow-lg">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">
              📊 You'll receive detailed scoring on:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-orange-600">✓</span>
                <span>ATS Compatibility</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">✓</span>
                <span>Tone & Style</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">✓</span>
                <span>Content Quality</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">✓</span>
                <span>Structure</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">✓</span>
                <span>Skills Presentation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-orange-600">✓</span>
                <span>Overall Score</span>
              </div>
            </div>
          </div>

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
            <Button variant="ghost" onClick={handleRefresh}>
              ← Analyze New Resume
            </Button>
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
