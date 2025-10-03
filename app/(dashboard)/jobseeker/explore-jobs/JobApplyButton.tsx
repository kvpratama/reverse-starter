"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ParticipateModal } from "@/components/dashboard/ParticipateModal";
import type { JobPost } from "@/app/types/types";

type JobApplyButtonProps = {
  jobPost: JobPost;
};

export default function JobApplyButton({ jobPost }: JobApplyButtonProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock: Get profile ID and check if already applied
    // In production, fetch from API
    const mockProfileId = "mock-profile-id";
    setProfileId(mockProfileId);

    // Mock: Check if user has applied to this job
    // In production: fetch from /api/applications
    const appliedJobs = JSON.parse(
      localStorage.getItem("appliedJobs") || "[]",
    ) as string[];
    setHasApplied(appliedJobs.includes(jobPost.id));
    setLoading(false);
  }, [jobPost.id]);

  const handleApplicationSuccess = () => {
    // Mark job as applied in local storage (mock)
    const appliedJobs = JSON.parse(
      localStorage.getItem("appliedJobs") || "[]",
    ) as string[];
    if (!appliedJobs.includes(jobPost.id)) {
      appliedJobs.push(jobPost.id);
      localStorage.setItem("appliedJobs", JSON.stringify(appliedJobs));
    }
    setHasApplied(true);
  };

  if (loading) {
    return (
      <Button disabled className="rounded-full bg-orange-500">
        Loading...
      </Button>
    );
  }

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        disabled={!profileId || hasApplied}
        className="rounded-full bg-orange-500 hover:bg-orange-600"
      >
        {hasApplied ? "Applied" : "Apply Now"}
      </Button>

      <ParticipateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        jobPost={jobPost}
        profileId={profileId || undefined}
        onSuccess={handleApplicationSuccess}
      />
    </>
  );
}
