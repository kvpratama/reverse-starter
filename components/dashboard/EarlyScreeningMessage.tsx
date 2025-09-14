"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Message } from "./Messages";

export type JobPost = {
  jobTitle: string;
  jobDescription: string;
  jobRequirements: string;
  coreSkills?: string | null;
  niceToHaveSkills?: string | null;
  perks?: string | null;
  jobCategoryName?: string | null;
  jobSubcategoryName?: string | null;
  jobRoleName?: string | null;
};

export type EarlyScreeningMessageProps = {
  msg: Message;
  onParticipateSubmit?: (answers: { [index: number]: string }) => void;
};

export default function EarlyScreeningMessage({ msg, onParticipateSubmit }: EarlyScreeningMessageProps) {
  const [showJobModal, setShowJobModal] = useState(false);
  const [showParticipateModal, setShowParticipateModal] = useState(false);
  const [answers, setAnswers] = useState<{ [index: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [jobPost, setJobPost] = useState<JobPost | null>(null);
  const [loadingJob, setLoadingJob] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      if (!msg.jobPostId) return;
      setLoadingJob(true);
      try {
        const res = await fetch(`/api/job-posts/${msg.jobPostId}`, { cache: 'no-store' });
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
    if (showJobModal) fetchJob();
  }, [showJobModal, msg.jobPostId]);
  const questions=[
    'Briefly describe a challenging frontend performance issue you solved. What was your approach?',
    'How do you structure large React applications for scalability and maintainability?',
    'Share an example of a complex UI component you built and how you tested it.',
  ]
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
      <p className="text-sm">You are invited to enter an early screening.</p>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setShowJobModal(true)}>
          Check Job Post
        </Button>
        <Button size="sm" className="rounded-full bg-orange-500 hover:bg-orange-600" onClick={() => setShowParticipateModal(true)}>
          Participate
        </Button>
      </div>

      {/* Job Post Modal */}
      {showJobModal ? (
        <Modal onClose={() => setShowJobModal(false)}>
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl">{loadingJob ? "Loading..." : (jobPost?.jobTitle ?? "Job Post")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold">Job Description</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{jobPost?.jobDescription ?? "-"}</p>
              </div>
              <div>
                <h3 className="font-semibold">Job Requirements</h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{jobPost?.jobRequirements ?? "-"}</p>
              </div>
              {jobPost?.coreSkills ? (
                <div>
                  <h3 className="font-semibold">Core Skills</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{jobPost.coreSkills}</p>
                </div>
              ) : null}
              {jobPost?.niceToHaveSkills ? (
                <div>
                  <h3 className="font-semibold">Nice To Have Skills</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{jobPost.niceToHaveSkills}</p>
                </div>
              ) : null}
              {jobPost?.perks ? (
                <div>
                  <h3 className="font-semibold">Perks</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{jobPost.perks}</p>
                </div>
              ) : null}
              <div className="pt-2">
                <Button className="rounded-full" onClick={() => setShowJobModal(false)}>Close</Button>
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
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="space-y-2">
                    <Label htmlFor={`q-${idx}`}>Question {idx + 1}</Label>
                    <p className="text-sm text-muted-foreground">{q}</p>
                    <Textarea
                      id={`q-${idx}`}
                      value={answers[idx] || ""}
                      onChange={(e) => setAnswers((prev) => ({ ...prev, [idx]: e.target.value }))}
                      placeholder="Type your answer here"
                      className="min-h-24"
                    />
                  </div>)
                )}
                <div className="flex gap-2 pt-2">
                  <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowParticipateModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="rounded-full bg-orange-500 hover:bg-orange-600">
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </Modal>
      ) : null}
    </div>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-3xl">
        {children}
      </div>
    </div>
  );
}
