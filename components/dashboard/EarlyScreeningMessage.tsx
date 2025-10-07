"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Message, JobPost } from "@/app/types/types";
import { JobseekerProfileCardUI } from "@/components/dashboard/JobseekerProfileCardUI";
import { ParticipateModal } from "@/components/dashboard/ParticipateModal";
import JobPostDetailsCard from "@/components/dashboard/JobPostDetailsCard";
import type { JobseekerProfile } from "@/app/types/types";
import { Loader2 } from "lucide-react";

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
  const [checkingParticipation, setCheckingParticipation] = useState(true);
  const [hasParticipated, setHasParticipated] = useState(false);
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [profile, setProfile] = useState<JobseekerProfile | null>(null);

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

  useEffect(() => {
    const fetchProfile = async () => {
      setCheckingProfile(true);

      try {
        const res = await fetch(`/api/jobseeker/profile/${profileId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to load profile`);
        }

        const data = await res.json();

        setProfile(data.profile ?? null);
      } catch (e: any) {
        console.error(e?.message || "Failed to load profile");
      } finally {
        setCheckingProfile(false);
      }
    };
    if (profileId) fetchProfile();
  }, [profileId]);

  // Check participation status when we know jobPostId and profileId
  useEffect(() => {
    const checkParticipation = async () => {
      if (!msg.jobPostId || !profileId) {
        setCheckingParticipation(false);
        return;
      }
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
      } finally {
        setCheckingParticipation(false);
      }
    };
    checkParticipation();
  }, [msg.jobPostId, profileId]);

  const handleJobModalOpen = () => {
    setShowJobModal(true);
  };

  const handleParticipateClick = () => {
    setShowParticipateModal(true);
  };

  return (
    <div className="space-y-3">
      <p
        className="text-sm"
        dangerouslySetInnerHTML={{ __html: msg.content }}
      ></p>
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto rounded-full transition-all"
          onClick={handleJobModalOpen}
          disabled={loadingJob}
          data-testid="button-check-job-post"
        >
          {loadingJob && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          {!loadingJob && "Check Job Post"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto rounded-full transition-all"
          onClick={() => setShowProfileModal(true)}
          disabled={checkingProfile}
          data-testid="button-view-your-profile"
        >
          {checkingProfile && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          {!checkingProfile && "View Your Profile"}
        </Button>
        {!hasParticipated && (
          <Button
            size="sm"
            className="w-full sm:w-auto rounded-full bg-orange-500 hover:bg-orange-600 transition-all"
            onClick={handleParticipateClick}
            disabled={checkingParticipation}
            data-testid="button-participate"
          >
            {checkingParticipation && (
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
            )}
            {!checkingParticipation && "Participate"}
          </Button>
        )}
      </div>

      {/* Job Post Modal */}
      <Modal open={showJobModal} onClose={() => setShowJobModal(false)}>
        <Card data-testid="card">
          <CardContent className="pt-6">
            <div className="max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
              <div className="overflow-y-auto">
                {loadingJob ? (
                  <JobPostSkeleton />
                ) : jobPost ? (
                  <JobPostDetailsCard jobPost={jobPost} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Failed to load job post.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Modal>

      {/* Participate Modal */}
      <ParticipateModal
        open={showParticipateModal}
        onClose={() => setShowParticipateModal(false)}
        jobPost={jobPost}
        profileId={profileId}
        data-testid="card"
        onSuccess={() => {
          setHasParticipated(true);
          try {
            onParticipated?.();
          } catch {}
        }}
      />

      {/* Profile Modal */}
      <Modal open={showProfileModal} onClose={() => setShowProfileModal(false)}>
        <Card
          className="w-full max-w-4xl h-[calc(100vh-10rem)] flex flex-col"
          data-testid="card"
        >
          <CardHeader data-testid="jobseeker-profile-card">
            <CardTitle className="text-xl" data-testid="card-title">
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {profile ? (
              <JobseekerProfileCardUI profile={profile} />
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
    </div>
  );
}

function Modal({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
        onClick={onClose}
        data-testid="modal-backdrop"
      />
      <div className="relative z-10 mx-4 w-full max-w-3xl animate-in zoom-in-95 duration-200">
        {children}
      </div>
    </div>
  );
}

function JobPostSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
      <div className="h-32 bg-gray-200 rounded"></div>
    </div>
  );
}
