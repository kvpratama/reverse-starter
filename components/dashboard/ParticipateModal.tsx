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
};

export function ParticipateModal({ open, onClose, jobPost, profileId }: ParticipateModalProps) {
  const [answers, setAnswers] = useState<{ [index: number]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      onSubmit(answers);
      onClose();
      setAnswers({});
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 mx-4 w-full max-w-3xl">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-xl">Early Screening</CardTitle>
            <p className="text-muted-foreground">
              Please answer the following questions to participate in the early screening process.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {jobPost?.screeningQuestions?.map((q, idx) => (
                <div key={idx} className="space-y-2">
                  <Label htmlFor={`q-${idx}`}>Question {idx + 1}</Label>
                  <p className="text-sm text-muted-foreground">{q.question}</p>
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
                  onClick={onClose}
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
      </div>
    </div>
  );
}
