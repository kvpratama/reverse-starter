"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Message, JobPost } from "@/app/types/types";
import { JobseekerProfileCard } from "./JobseekerProfileCard";


export type EarlyScreeningMessageProps = {
  msg: Message;
  onParticipateSubmit?: (answers: { [index: number]: string }) => void;
  profileId?: string;
};

export default function EarlyScreeningMessage({
  msg,
  onParticipateSubmit,
  profileId,
}: EarlyScreeningMessageProps) {
  const [showJobModal, setShowJobModal] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [answers, setAnswers] = useState<{ [index: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      onParticipateSubmit?.(answers);
      setShowParticipateModal(false);
      setAnswers({});
    } finally {
      setSubmitting(false);
    }
  };

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
          <Card className="w-full max-w-2xl h-[calc(100vh-10rem)] flex flex-col">
            <CardHeader className="flex items-center justify-between p-6 border-b border-gray-200">
              <CardTitle className="text-xl">
                {loadingJob ? "Loading..." : (jobPost?.jobTitle ?? "Job Post")}
              </CardTitle>
              <Button
                className="w-8 h-8 rounded-full text-gray-500 hover:text-gray-700 transition-colors duration-200"
                onClick={() => setShowJobModal(false)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto flex-1">
              <div>
                <h3 className="font-semibold">Company Name</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {jobPost?.companyName ?? "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Company Profile</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {jobPost?.companyProfile ?? "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Job Title</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {jobPost?.jobTitle ?? "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Job Location</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {jobPost?.jobLocation ?? "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {jobPost?.jobDescription ?? "-"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold">Job Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {jobPost?.jobRequirements ?? "-"}
                </p>
              </div>
              {jobPost?.coreSkills ? (
                <div>
                  <h3 className="font-semibold">Core Skills</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {jobPost.coreSkills}
                  </p>
                </div>
              ) : null}
              {jobPost?.niceToHaveSkills ? (
                <div>
                  <h3 className="font-semibold">Nice To Have Skills</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {jobPost.niceToHaveSkills}
                  </p>
                </div>
              ) : null}
              {jobPost?.perks ? (
                <div>
                  <h3 className="font-semibold">Perks</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {jobPost.perks}
                  </p>
                </div>
              ) : null}
              <div className="pt-2">
                <Button
                  className="rounded-full"
                  onClick={() => setShowJobModal(false)}
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </Modal>
      ) : null}

      {/* Participate Modal */}
      {showParticipateModal ? (
        <Modal onClose={() => setShowParticipateModal(false)}>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Early Screening</CardTitle>
              <p className="text-muted-foreground">
                Please answer the following questions to participate in the
                early screening process.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {jobPost?.screeningQuestions?.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label htmlFor={`q-${idx}`}>Question {idx + 1}</Label>
                    <p className="text-sm text-muted-foreground">
                      {q.question}
                    </p>
                    <Textarea
                      id={`q-${idx}`}
                      value={answers[idx] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [idx]: e.target.value,
                        }))
                      }
                      placeholder="Type your answer here"
                      className="min-h-24"
                    />
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-full"
                    onClick={() => setShowParticipateModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="rounded-full bg-orange-500 hover:bg-orange-600"
                  >
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Modal>
      ) : null}

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
