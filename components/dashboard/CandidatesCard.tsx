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
import {
  User,
  Briefcase,
  GraduationCap,
  Calendar,
  Eye,
  UserPlus,
  CheckCircle,
  LucideIcon,
} from "lucide-react";

export default function CandidatesCard({
  candidates,
  jobPostId,
  screeningQuestions,
}: {
  candidates: Candidate[];
  jobPostId?: string;
  screeningQuestions?: { question: string }[];
}) {
  const candidatesToRender = candidates || [];
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
  }, [candidates]);

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
            profileName: "",
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
          reasoning={selectedCandidate.reasoning}
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
  const reasoning = candidate.reasoning || "reasoning not available";
  const overallScore = Math.round(candidate.similarityScore || 0);
  const bioScore = Math.round(candidate.similarityScoreBio || 0);
  const skillsScore = Math.round(candidate.similarityScoreSkills || 0);
  // const screeningScore = Math.round(candidate.similarityScoreScreening || 0);
  const latestWork = candidate.profile?.workExperience?.[0];
  const latestEdu = candidate.profile?.education?.[0];
  return (
    <Card className="h-full flex flex-col">
      {/* Header with Match Scores */}
      <CardHeader className="border-gray-50 mb-2">
        <div className="flex justify-center items-center gap-8 pt-2">
          <ProgressRing score={overallScore} title="Overall Match" size="md" />
          <ProgressRing score={bioScore} title="Bio Match" size="md" />
          <ProgressRing score={skillsScore} title="Skills Match" size="md" />
        </div>
      </CardHeader>

      {/* Main Content */}
      <CardContent className="flex-1 space-y-1">
        {/* Candidate Name */}
        <div className="flex items-center gap-2">
          <User className="w-6 h-6 text-gray-400" />
          <h3 className="text-xl font-bold text-gray-900">
            {candidate.profile?.name}
          </h3>
        </div>

        {/* AI Overview */}
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            </div>
            <div className="flex-1">
              <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide block mb-2">
                AI Overview
              </span>
              <p className="text-sm text-orange-900 leading-relaxed">
                {reasoning.length > 200
                  ? `${reasoning.substring(0, 150)}...`
                  : reasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Experience */}
        {latestWork && (
          <InfoCard
            icon={Briefcase}
            title="Latest Experience"
            primaryText={latestWork.position || "Role"}
            secondaryText={latestWork.company ? `${latestWork.company}` : ""}
            dateRange={formatDateRange(
              latestWork.startDate || "",
              latestWork.endDate || "",
            )}
          />
        )}

        {/* Education */}
        {latestEdu && (
          <InfoCard
            icon={GraduationCap}
            title="Education"
            primaryText={`${latestEdu.degree || "Degree"}${latestEdu.fieldOfStudy ? ` in ${latestEdu.fieldOfStudy}` : ""}`}
            secondaryText={latestEdu.institution || ""}
            dateRange={formatDateRange(
              latestEdu.startDate || "",
              latestEdu.endDate || "",
            )}
          />
        )}
      </CardContent>

      {/* Footer with Actions */}
      <CardFooter className="border-gray-50">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="sm"
              className={`flex items-center justify-center gap-2 px-6 py-2.5 font-semibold transition-all ${
                isInvited
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-sm hover:shadow-md"
              }`}
              onClick={onInvite}
              disabled={isInvited}
            >
              {isInvited ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Invited
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Invite For Interview
                </>
              )}
            </Button>

            <Button
              size="sm"
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 font-medium transition-all"
              onClick={() => setOpenProfileId(candidate.profile?.id || "")}
            >
              <Eye className="w-4 h-4" />
              View Profile
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {isInvited ? "Invited for interview" : "Candidate applied"} on{" "}
              {candidate.updatedAt
                ? new Date(candidate.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

const formatDateRange = (startDate?: string, endDate?: string): string => {
  if (!startDate && !endDate) return "";
  return `${startDate || ""}${endDate ? ` - ${endDate}` : ""}`;
};

const InfoCard = ({
  icon: Icon,
  title,
  primaryText,
  secondaryText,
  dateRange,
}: {
  icon: LucideIcon;
  title: string;
  primaryText: string;
  secondaryText: string;
  dateRange: string;
}) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <span className="text-sm font-semibold text-gray-700 block">{title}</span>
      <p className="text-sm text-gray-900 mt-1">{primaryText}</p>
      {secondaryText && (
        <p className="text-sm text-gray-900 mt-1">
          <span className="text-gray-600">{secondaryText}</span>
        </p>
      )}
      {dateRange && (
        <div className="flex items-center gap-1 mt-1">
          <Calendar className="w-3 h-3 text-gray-400" />
          <span className="text-xs text-gray-500">{dateRange}</span>
        </div>
      )}
    </div>
  </div>
);

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
  reasoning,
}: {
  jobSeekerProfile: JobseekerProfile;
  onClose: () => void;
  screeningQuestions?: { question: string }[];
  screeningAnswers?: { answer: string }[];
  reasoning?: string;
}) {
  return (
    <Modal onClose={onClose}>
      <Card className="w-full max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader>
          <CardTitle className="text-xl">Candidate Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {reasoning && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-100 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <span className="text-xs font-semibold text-orange-700 uppercase tracking-wide block mb-2">
                    AI Overview
                  </span>
                  <p className="text-sm text-orange-900 leading-relaxed">
                    {reasoning}
                  </p>
                </div>
              </div>
            </div>
          )}
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
  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (e) {
      return false;
    }
  };
  const valid = link.trim().length > 0 && isValidUrl(link);

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
