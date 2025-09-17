import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import ProgressRing from "@/components/ui/progress-ring";
import { JobseekerProfileCardUI } from "@/components/dashboard/JobseekerProfileCardUI";
import type { JobseekerProfile, Candidate } from "@/app/types/types";

export default function CandidatesCard({
  candidates,
  jobPostId,
  screeningQuestions,
}: {
  candidates: Candidate[];
  jobPostId?: string;
  screeningQuestions?: { question: string }[];
}) {
  const candidatesToRender = candidates.length > 0 ? candidates : [];
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const [inviteProfileId, setInviteProfileId] = useState<string | null>(null);
  const [invitedProfileIds, setInvitedProfileIds] = useState<Set<string>>(
    new Set(),
  );

  // Seed invited set based on persisted DB status
  useEffect(() => {
    const initiallyInvited = new Set<string>();
    for (const c of candidatesToRender) {
      if (c.status === "interview" && c.profile?.id) {
        initiallyInvited.add(c.profile.id);
      }
    }
    setInvitedProfileIds(initiallyInvited);
  }, [candidatesToRender]);

  // Find the profile for the currently open modal
  const selectedCandidate = candidatesToRender.find(
    (c) => (c.profile?.id || c.id) === openProfileId,
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            Potential Candidates ({candidatesToRender.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {candidatesToRender.length === 0 ? (
            <p className="text-muted-foreground">No candidates yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {candidatesToRender.map((c) => {
                return (
                  <CandidateCard
                    key={c.id}
                    candidate={c}
                    setOpenProfileId={setOpenProfileId}
                    onInvite={() => setInviteProfileId(c.profile?.id || "")}
                    isInvited={invitedProfileIds.has(c.profile?.id || "")}
                    screeningQuestions={screeningQuestions}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal rendered at component level */}
      {openProfileId && selectedCandidate && (
        <CandidateProfileModal
          jobSeekerProfile={{
            id: selectedCandidate.profile?.id || "",
            profileName: selectedCandidate.profile?.profileName || "",
            email: selectedCandidate.profile?.email || "",
            name: selectedCandidate.profile?.name || "",
            jobCategory: selectedCandidate.profile?.jobCategory || null,
            jobSubcategory: selectedCandidate.profile?.jobSubcategory || null,
            jobRole: selectedCandidate.profile?.jobRole || null,
            skills: selectedCandidate.profile?.skills || "",
            age: selectedCandidate.profile?.age || null,
            visaStatus: selectedCandidate.profile?.visaStatus || "",
            nationality: selectedCandidate.profile?.nationality || "",
            bio: selectedCandidate.profile?.bio || "",
            workExperience: selectedCandidate.profile?.workExperience || [],
            education: selectedCandidate.profile?.education || [],
            resumeUrl: "", // selectedCandidate.profile?.resumeUrl || "",
          }}
          screeningQuestions={screeningQuestions}
          screeningAnswers={selectedCandidate.screeningAnswers}
          onClose={() => setOpenProfileId(null)}
        />
      )}

      {/* Invite modal */}
      {inviteProfileId && (
        <InviteInterviewModal
          onClose={() => setInviteProfileId(null)}
          onSubmit={async (calendlyLink) => {
            if (!jobPostId) return;
            try {
              const res = await fetch("/api/interviews/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  jobPostId,
                  profileId: inviteProfileId,
                  calendlyLink,
                }),
              });
              if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || "Failed to send invitation");
              }
              // Mark this candidate as invited so the button disables
              if (inviteProfileId) {
                setInvitedProfileIds((prev) => {
                  const next = new Set(prev);
                  next.add(inviteProfileId);
                  return next;
                });
              }
            } catch (e) {
              console.error(e);
            } finally {
              setInviteProfileId(null);
            }
          }}
        />
      )}
    </>
  );
}

function CandidateCard({
  candidate,
  setOpenProfileId,
  onInvite,
  isInvited,
  screeningQuestions,
}: {
  candidate: Candidate;
  setOpenProfileId: (id: string) => void;
  onInvite: () => void;
  isInvited: boolean;
  screeningQuestions?: { question: string }[];
}) {
  const overallScore = Math.round(candidate.similarityScore || 0);
  const bioScore = Math.round(candidate.similarityScoreBio || 0);
  const skillsScore = Math.round(candidate.similarityScoreSkills || 0);
  const latestWork = candidate.profile?.workExperience?.[0];
  const latestEdu = candidate.profile?.education?.[0];
  return (
    <>
      <Card className="h-full flex flex-col justify-between">
        <CardHeader className="border-b pb-4">
          <div className="flex flex-wrap justify-center items-center gap-8 pt-2 text-sm text-gray-500">
            <ProgressRing
              score={overallScore}
              title="Overall Match"
              size="md"
            />
            <ProgressRing score={bioScore} title="Bio Match" size="md" />
            <ProgressRing score={skillsScore} title="Skills Match" size="md" />
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          {/* {skills && (
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="font-semibold text-gray-700">
                Skills:
              </span>
              {skills
                .split(",")
                .map((skill: string, index: number) => (
                  <span
                    key={index}
                    className="bg-orange-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
                  >
                    {skill.trim()}
                  </span>
                ))}
            </div>
          )} */}
          <div className="text-lg font-semibold text-black whitespace-pre-wrap">
            {candidate.profile?.name}
          </div>
          {candidate.profile?.bio && (
            <div className="text-sm text-gray-600 whitespace-pre-wrap">
              {candidate.profile.bio.length > 150
                ? `${candidate.profile.bio.substring(0, 150)}... `
                : candidate.profile.bio}
            </div>
          )}
          {latestWork && (
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Latest Experience:</span>{" "}
              <span>
                {latestWork.position || "Role"}
                {latestWork.company ? ` @ ${latestWork.company}` : ""}
              </span>
              {(latestWork.startDate || latestWork.endDate) && (
                <span className="text-gray-500">
                  {` (${latestWork.startDate || ""}${
                    latestWork.endDate ? ` - ${latestWork.endDate}` : ""
                  })`}
                </span>
              )}
            </div>
          )}
          {latestEdu && (
            <div className="text-sm text-gray-700">
              <span className="font-semibold">Education:</span>{" "}
              <span>
                {latestEdu.degree || "Degree"}
                {latestEdu.fieldOfStudy ? ` in ${latestEdu.fieldOfStudy}` : ""}
                {latestEdu.institution ? ` @ ${latestEdu.institution}` : ""}
              </span>
              {(latestEdu.startDate || latestEdu.endDate) && (
                <span className="text-gray-500">
                  {` (${latestEdu.startDate || ""}${
                    latestEdu.endDate ? ` - ${latestEdu.endDate}` : ""
                  })`}
                </span>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-4 flex flex-col gap-2">
          <div className="flex flex-col sm:flex-row sm:justify-start sm:flex-wrap">
            <Button
              size="sm"
              className="m-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
              onClick={onInvite}
              disabled={isInvited}
            >
              {isInvited ? "Invited" : "Invite For Interview"}
            </Button>
            <Button
              size="sm"
              className="m-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
              onClick={() => setOpenProfileId(candidate.profile?.id || "")}
            >
              View Profile
            </Button>
          </div>
          <div className="text-sm text-gray-400">
            {isInvited ? "Invited for interview" : "Applied"} on{" "}
            {candidate.updatedAt
              ? new Date(candidate.updatedAt).toLocaleString()
              : ""}
          </div>
        </CardFooter>
      </Card>
    </>
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

function CandidateProfileModal({
  jobSeekerProfile,
  onClose,
  screeningQuestions,
  screeningAnswers,
}: {
  jobSeekerProfile: JobseekerProfile;
  onClose: () => void;
  screeningQuestions?: { question: string }[];
  screeningAnswers?: { answer: string }[];
}) {
  return (
    <Modal onClose={onClose}>
      <Card className="w-full max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Candidate Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {jobSeekerProfile ? (
            <JobseekerProfileCardUI
              profile={jobSeekerProfile}
              screeningQuestions={screeningQuestions}
              screeningAnswers={screeningAnswers}
            />
          ) : (
            <p className="text-sm text-muted-foreground">
              No profileId available.
            </p>
          )}
          <div className="pt-3">
            <Button className="rounded-full" onClick={onClose}>
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    </Modal>
  );
}

function InviteInterviewModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (calendlyLink: string) => Promise<void> | void;
}) {
  const [link, setLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const valid = link.trim().length > 0;
  return (
    <Modal onClose={onClose}>
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-xl">Invite for Interview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="text-sm font-medium">Calendly Link</label>
          <input
            type="url"
            placeholder="https://calendly.com/your-link"
            className="w-full px-3 py-2 border rounded-md text-sm"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
        </CardContent>
        <CardFooter className="flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button
            className="bg-orange-500 hover:bg-orange-600 text-white"
            onClick={async () => {
              if (!valid) return;
              setSubmitting(true);
              try {
                await onSubmit(link.trim());
              } finally {
                setSubmitting(false);
              }
            }}
            disabled={!valid || submitting}
          >
            {submitting ? "Sending..." : "Send Invitation"}
          </Button>
        </CardFooter>
      </Card>
    </Modal>
  );
}
