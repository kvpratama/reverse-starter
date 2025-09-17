"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import type { Message } from "@/app/types/types";

export type InterviewInvitationMessageProps = {
  msg: Message;
};

export default function InterviewInvitationMessage({
  msg,
}: InterviewInvitationMessageProps) {
  // The message content is expected to be the Calendly link.
  const calendlyLink = msg.content;

  return (
    <div className="space-y-3">
      <p className="text-sm">
        We are excited to invite you to an interview. Just click the button
        below to book a time through our scheduling partner. We are looking
        forward to connecting with you.
      </p>
      <Button
        asChild
        size="sm"
        className="rounded-full bg-orange-500 hover:bg-orange-600"
      >
        <a href={calendlyLink} target="_blank" rel="noopener noreferrer">
          Schedule Interview
        </a>
      </Button>
    </div>
  );
}
