"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message, JobPost } from "@/app/types/types";
import { JobseekerProfileCard } from "./JobseekerProfileCard";
import { ParticipateModal } from "./ParticipateModal";
import JobPostDetailsCard from "@/components/dashboard/JobPostDetailsCard";

export type EarlyScreeningMessageProps = {
  msg: Message;
  onParticipateSubmit?: (answers: { [index: number]: string }) => void;
  profileId?: string;
  onParticipated?: () => void;
};

export default function EarlyScreeningMessage({
  msg,
  profileId,
  onParticipated,
}: EarlyScreeningMessageProps) {
  const [showJobModal, setShowJobModal] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);
  const [hasParticipated, setHasParticipated] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!msg.jobPostId) return;
      setLoadingJob(true);
      try {
        const res = await fetch(`/api/job-posts/${msg.jobPostId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          setJobPost(data.job ?? null);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingJob(false);
      }
    };
    fetchJob();
  }, [msg.jobPostId]);

  // Check participation status when we know jobPostId and profileId
  useEffect(() => {
    const checkParticipation = async () => {
      if (!msg.jobPostId || !profileId) return;
      try {
        const res = await fetch(
          `/api/job-posts/${msg.jobPostId}/participation?profileId=${profileId}`,
          { cache: "no-store" },
        );
        if (res.ok) {
          const data = await res.json();
          setHasParticipated(Boolean(data?.hasParticipated));
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkParticipation();
  }, [msg.jobPostId, profileId]);

  return (
    <div className="space-y-3">
      <p
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: msg.content }}
      ></p>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setShowJobModal(true)}
        >
          Check Job Post
        </Button>
        <Button
          size="sm"
          className="rounded-full bg-orange-500 hover:bg-orange-600"
          onClick={() => setShowParticipateModal(true)}
          style={{ display: hasParticipated ? "none" : "block" }}
        >
          Participate
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full"
          onClick={() => setShowProfileModal(true)}
          disabled={!profileId}
        >
          View Your Profile
        </Button>
      </div>

      {/* Job Post Modal */}
      {showJobModal ? (
        <Modal onClose={() => setShowJobModal(false)}>
          <Card>
            <CardContent>
              <div className="max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
                <div className="overflow-y-auto">
                  {jobPost && (
                    <JobPostDetailsCard jobPost={jobPost} disabled={true} />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </Modal>
      ) : null}

      {/* Participate Modal */}
      <ParticipateModal
        open={showParticipateModal}
        onClose={() => setShowParticipateModal(false)}
        jobPost={jobPost}
        profileId={profileId}
        onSuccess={() => {
          setHasParticipated(true);
          try {
            onParticipated?.();
          } catch {}
        }}
      />

      {/* Profile Modal */}
      {showProfileModal ? (
        <Modal onClose={() => setShowProfileModal(false)}>
          <Card className="w-full max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader>
              <CardTitle className="text-xl">Your Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {profileId ? (
                <JobseekerProfileCard profileId={profileId} />
              ) : (
                <p className="text-sm text-muted-foreground">
                  No profileId available.
                </p>
              )}
              <div className="pt-3">
                <Button
                  className="rounded-full"
                  onClick={() => setShowProfileModal(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-3xl">{children}</div>
    </div>
  );
}
