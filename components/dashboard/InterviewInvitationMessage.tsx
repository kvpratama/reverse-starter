"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/app/types/types";
import CandidateInterviewScheduler from "@/components/dashboard/InterviewSchedulerCandidate";

export type InterviewInvitationMessageProps = {
  msg: Message;
};

export default function InterviewInvitationMessage({
  msg,
}: InterviewInvitationMessageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [invitationId, setInvitationId] = useState<string | null>(null);

  useEffect(() => {
    // Extract invitationId from message content (JSON format)
    try {
      const parsedContent = JSON.parse(msg.content);
      if (parsedContent.invitationId) {
        setInvitationId(parsedContent.invitationId);
      }
    } catch {
      // If parsing fails, content is not JSON, no invitationId available
      console.log("Message content is not JSON format");
    }
  }, [msg.content]);

  const handleScheduleInterview = () => {
    if (invitationId) {
      setIsModalOpen(true);
    } else {
      console.error("No invitation ID found");
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm">
          {(() => {
            try {
              const parsedContent = JSON.parse(msg.content);
              return parsedContent.content || msg.content;
            } catch {
              return msg.content;
            }
          })()}
        </p>
        <Button
          onClick={handleScheduleInterview}
          size="sm"
          className="rounded-full bg-orange-500 hover:bg-orange-600"
          disabled={!invitationId}
        >
          Schedule Interview
        </Button>
      </div>

      {/* Modal */}
      {isModalOpen && invitationId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
            onClick={handleModalClose}
            data-testid="modal-backdrop"
          />
          <div className="relative mx-4 w-full max-w-4xl animate-in zoom-in-95 duration-200">
            <div className="relative w-full max-h-[90vh] overflow-auto bg-white rounded-lg shadow-xl">
              <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b">
                <h2 className="text-lg font-semibold">Schedule Interview</h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close modal"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="p-4">
                <CandidateInterviewScheduler
                  invitationId={invitationId}
                  onComplete={handleModalClose}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
