"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import type { JobPost } from "@/app/types/types";

export type ParticipateModalProps = {
  open: boolean;
  onClose: () => void;
  jobPost: JobPost | null;
  profileId?: string;
  onSuccess?: () => void;
};

export function ParticipateModal({
  open,
  onClose,
  jobPost,
  profileId,
  onSuccess,
}: ParticipateModalProps) {
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      setError(null);
      setSuccess(null);
      if (!jobPost?.id) {
        setError("Missing job post id");
        return;
      }
      if (!profileId) {
        setError("Missing profile id");
        return;
      }
      const formattedAnswers = (jobPost?.screeningQuestions ?? []).map(
        (_, idx) => ({
          answer: answers[idx] ?? "",
        }),
      );
      const resp = await fetch("/api/rate-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobPostId: jobPost.id,
          profileId,
          screeningAnswers: formattedAnswers,
        }),
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error(text);
        setError("Failed to submit responses. Please try again.");
        throw new Error(text || `Request failed with ${resp.status}`);
      }
      const data = await resp.json();
      setSuccess(`You have successfully submitted your responses.`);
      // notify parent to refresh (e.g., hide participate button, reload messages)
      try {
        onSuccess?.();
      } catch {
        console.error("Failed to notify parent with onSuccess");
        setSuccess(null);
      }
      // Give a brief success feedback then close
      setTimeout(() => {
        onClose();
        setAnswers([]);
        setSuccess(null);
      }, 600);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 w-full max-w-3xl max-h-full flex">
        <Card className="w-full max-w-2xl flex flex-col max-h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-xl">Early Screening</CardTitle>
            <p className="text-muted-foreground">
              Please answer the following questions to participate in the early
              screening process.
            </p>
          </CardHeader>
          <div className="flex-1 overflow-y-auto px-6">
            <div className="space-y-4 pb-4">
              {error ? <p className="text-sm text-red-600">{error}</p> : null}
              {success ? (
                <p className="text-sm text-green-600">{success}</p>
              ) : null}
              {jobPost?.screeningQuestions?.map((q, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={`q-${idx}`}>Question {idx + 1}</Label>
                  <p className="text-sm text-muted-foreground">{q.question}</p>
                  <Textarea
                    id={`q-${idx}`}
                    value={answers[idx] ?? ""}
                    onChange={(e) => {
                      setAnswers((prev) => {
                        const next = [...prev];
                        next[idx] = e.target.value;
                        return next;
                      });
                    }}
                    placeholder="Type your answer here"
                    className="min-h-33"
                    disabled={submitting}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex-shrink-0 p-6 pt-2 border-t">
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-orange-500 hover:bg-orange-600"
                onClick={handleSubmit}
              >
                {submitting ? "Submitting..." : "Submit"}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
