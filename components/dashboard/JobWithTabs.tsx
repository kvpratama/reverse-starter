"use client";
import { useActionState, useState } from "react";
import JobPostDetailsCard from "@/components/dashboard/JobPostDetailsCard";
import CandidatesCard from "@/components/dashboard/CandidatesCard";
import { updateJob } from "@/app/(dashboard)/recruiter/post-a-job/actions";

export default function JobWithTabs({ jobPost, candidates }: any) {
  const [activeTab, setActiveTab] = useState<"job" | "candidates">("job");
  const [state, formAction, isPending] = useActionState(updateJob, {});

  return (
    <div>
      {/* Tabs */}
      <div className="flex items-center gap-2 border-b">
        <button
          onClick={() => setActiveTab("job")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "job"
              ? "border-orange-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Job Post
        </button>
        <button
          onClick={() => setActiveTab("candidates")}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === "candidates"
              ? "border-orange-500 text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Candidates
        </button>
      </div>

      {activeTab === "job" ? (
        <JobPostDetailsCard
          jobPost={jobPost}
          mode="edit"
          formAction={formAction}
          isPending={isPending}
          state={state}
          submitButtonText="Update Job Post"
        />
      ) : (
        <CandidatesCard
          candidates={candidates}
          jobPostId={jobPost?.id}
          screeningQuestions={jobPost?.jobScreeningQuestions}
        />
      )}
    </div>
  );
}
