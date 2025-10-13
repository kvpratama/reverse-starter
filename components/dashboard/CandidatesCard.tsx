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
  GraduationCap,
  Calendar,
  Eye,
  UserPlus,
  CheckCircle,
  LucideIcon,
  Clock,
  Download,
} from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { CandidatePDF } from "@/components/dashboard/CandidatePDF";

export default function CandidatesCard({
  candidates,
  jobPostId,
  screeningQuestions,
  jobPostTitle,
}: {
  candidates: Candidate[];
  jobPostId?: string;
  screeningQuestions?: { question: string }[];
  jobPostTitle?: string;
}) {
  const candidatesToRender = candidates || [];
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);
  const [inviteProfileId, setInviteProfileId] = useState<string | null>(null);
  const [invitedProfileIds, setInvitedProfileIds] = useState<Set<string>>(
    new Set()
  );
  const [sortBy, setSortBy] = useState<"overall" | "bio" | "skills" | "date">(
    "date"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterByStatus, setFilterByStatus] = useState<string>("all");

  let processedCandidates = [...candidatesToRender];

  // Filtering
  if (filterByStatus !== "all") {
    processedCandidates = processedCandidates.filter(
      (c) => c.candidateStatus === filterByStatus
    );
  }

  // Sorting
  if (sortBy) {
    processedCandidates.sort((a, b) => {
      let valA = 0;
      let valB = 0;

      if (sortBy === "overall") {
        valA = a.similarityScore || 0;
        valB = b.similarityScore || 0;
      } else if (sortBy === "bio") {
        valA = a.similarityScoreBio || 0;
        valB = b.similarityScoreBio || 0;
      } else if (sortBy === "skills") {
        valA = a.similarityScoreSkills || 0;
        valB = b.similarityScoreSkills || 0;
      } else if (sortBy === "date") {
        valA = new Date(a.updatedAt || 0).getTime();
        valB = new Date(b.updatedAt || 0).getTime();
      }

      return sortOrder === "asc" ? valA - valB : valB - valA;
    });
  }

  // Seed invited set based on persisted DB status
  useEffect(() => {
    const initiallyInvited = new Set<string>();
    for (const c of candidatesToRender) {
      if (c.candidateStatus === "interview" && c.profileId) {
        initiallyInvited.add(c.profileId);
      }
    }
    setInvitedProfileIds(initiallyInvited);
  }, [candidates]);

  // Find the profile for the currently open modal
  const selectedCandidate = candidatesToRender.find(
    (c) => c.candidateId === openProfileId
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>
              Potential Candidates ({processedCandidates.length})
            </CardTitle>
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4">
              {/* Sorting */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  className="border rounded-md px-2 py-1 text-sm border-2 border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={sortBy || ""}
                  onChange={(e) => setSortBy(e.target.value as any)}
                >
                  <option value="overall">Overall Score</option>
                  <option value="bio">Bio Score</option>
                  <option value="skills">Skills Score</option>
                  <option value="date">Last Updated</option>
                </select>

                <button
                  className="px-2 py-1 border rounded-md text-sm border-2 border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                >
                  {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                </button>
              </div>

              {/* Filtering */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">
                  Filter by status:
                </label>
                <select
                  className="border rounded-md px-2 py-1 text-sm border-2 border-gray-200 focus:outline-none focus:ring-1 focus:ring-orange-500"
                  value={filterByStatus}
                  onChange={(e) => setFilterByStatus(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="applied">Applied</option>
                  <option value="interview">Invited / Interview</option>
                  <option value="offer">Offer</option>
                  <option value="rejected">Rejected</option>
                  <option value="hired">Hired</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {processedCandidates.length === 0 ? (
            <p className="text-muted-foreground">
              No candidates match the criteria.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedCandidates.map((c) => {
                return (
                  <CandidateCard
                    key={c.candidateId}
                    candidate={c}
                    setOpenProfileId={setOpenProfileId}
                    onInvite={() => setInviteProfileId(c.profileId || "")}
                    isInvited={invitedProfileIds.has(c.profileId || "")}
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
            candidateId: selectedCandidate.candidateId || "",
            profileName: "",
            email: selectedCandidate.email || "",
            name: selectedCandidate.name || "",
            jobCategories: selectedCandidate.jobCategories || null,
            jobSubcategories: selectedCandidate.jobSubcategories || null,
            jobRole: selectedCandidate.jobRole || null,
            skills: selectedCandidate.skills || "",
            age: selectedCandidate.age || null,
            visaStatus: selectedCandidate.visaStatus || "",
            nationality: selectedCandidate.nationality || "",
            bio: selectedCandidate.bio || "",
            workExperience: selectedCandidate.workExperience || [],
            education: selectedCandidate.education || [],
            resumeUrl: "", // selectedCandidate.profile?.resumeUrl || "",
          }}
          screeningQuestions={screeningQuestions}
          screeningAnswers={selectedCandidate.screeningAnswers}
          reasoning={selectedCandidate.reasoning}
          jobPostTitle={jobPostTitle}
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
  // const latestWork = candidate.workExperience?.[0];
  const latestEdu = candidate.education?.[0];
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
          <h3 className="text-xl font-bold text-gray-900">{candidate.name}</h3>
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
                {reasoning.length > 150
                  ? `${reasoning.substring(0, 150)}...`
                  : reasoning}
              </p>
            </div>
          </div>
        </div>

        {/* Latest Experience */}
        {/* {latestWork && (
          <InfoCard
            icon={Briefcase}
            title="Latest Experience"
            primaryText={latestWork.position || "Role"}
            secondaryText={latestWork.company ? `${latestWork.company}` : ""}
            dateRange={formatDateRange(
              latestWork.startDate || "",
              latestWork.endDate || ""
            )}
          />
        )} */}

        {/* Total Years of Experience */}
        {(() => {
          const totalYears = calculateTotalExperience(candidate.workExperience);
          return (
            <InfoCard
              icon={Clock}
              title="Total Work Experience"
              primaryText={
                totalYears > 0
                  ? `${totalYears} year${totalYears !== 1 ? "s" : ""}`
                  : "No professional experience yet"
              }
              secondaryText={
                totalYears > 0
                  ? "Combined duration across all positions"
                  : "Looking forward to building experience"
              }
              dateRange=""
            />
          );
        })()}

        {/* Education */}
        {latestEdu && (
          <InfoCard
            icon={GraduationCap}
            title="Education"
            primaryText={`${latestEdu.degree || "Degree"}${latestEdu.fieldOfStudy ? ` in ${latestEdu.fieldOfStudy}` : ""}`}
            secondaryText={latestEdu.institution || ""}
            dateRange={formatDateRange(
              latestEdu.startDate || "",
              latestEdu.endDate || ""
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
              onClick={() => setOpenProfileId(candidate.candidateId || "")}
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

// Helper to merge overlapping ranges
const mergeDateRanges = (ranges: [Date, Date][]): [Date, Date][] => {
  ranges.sort((a, b) => a[0].getTime() - b[0].getTime());
  const merged: [Date, Date][] = [];

  for (const [start, end] of ranges) {
    if (!merged.length || start > merged[merged.length - 1][1]) {
      merged.push([start, end]);
    } else {
      merged[merged.length - 1][1] = new Date(
        Math.max(end.getTime(), merged[merged.length - 1][1].getTime())
      );
    }
  }
  return merged;
};

const calculateTotalExperience = (workExperience?: any[]): number => {
  if (!workExperience?.length) return 0;

  const currentDate = new Date();
  const ranges: [Date, Date][] = [];

  for (const exp of workExperience) {
    const start = exp.startDate ? new Date(exp.startDate) : null;
    const endValue = exp.endDate?.toLowerCase?.();
    const end =
      !endValue || ["current", "present"].includes(endValue)
        ? currentDate
        : new Date(exp.endDate!);

    if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime()))
      continue;
    if (end < start) continue;

    ranges.push([start, end]);
  }

  // Merge overlapping periods
  const merged = mergeDateRanges(ranges);

  // Sum durations
  let totalMonths = 0;
  for (const [start, end] of merged) {
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();
    const days = end.getDate() - start.getDate();
    let diff = years * 12 + months + (days > 0 ? days / 30 : 0);
    totalMonths += diff;
  }

  return parseFloat((totalMonths / 12).toFixed(1));
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
  jobPostTitle,
}: {
  jobSeekerProfile: JobseekerProfile;
  onClose: () => void;
  screeningQuestions?: { question: string }[];
  screeningAnswers?: { answer: string }[];
  reasoning?: string;
  jobPostTitle?: string;
}) {
  const sanitizeFilename = (str: string) =>
    str.replace(/[/\\:*?"<>|]/g, "-").trim();
  const safeJobTitle = sanitizeFilename(jobPostTitle || "JobTitle");
  const safeCandidateName = sanitizeFilename(
    jobSeekerProfile.name || "CandidateName"
  );
  const [downloadState, setDownloadState] = useState<"idle" | "success">(
    "idle"
  );
  return (
    <Modal onClose={onClose}>
      <Card className="w-full max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Candidate Profile</CardTitle>
            <PDFDownloadLink
              document={
                <CandidatePDF
                  profile={jobSeekerProfile}
                  screeningQuestions={screeningQuestions}
                  screeningAnswers={screeningAnswers}
                />
              }
              fileName={`${safeJobTitle} - ${safeCandidateName}.pdf`}
            >
              {({ loading }) => (
                <Button
                  className={`${
                    downloadState === "success"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                  } text-white shadow-sm hover:shadow-md transition-all`}
                  onClick={() => {
                    if (!loading) {
                      setDownloadState("success");
                      setTimeout(() => setDownloadState("idle"), 3000);
                    }
                  }}
                >
                  {downloadState === "success" ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      {loading ? "Generating..." : "Download PDF"}
                    </>
                  )}
                </Button>
              )}
            </PDFDownloadLink>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          {reasoning && (
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-100 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <span className="block mb-2 text-sm font-semibold tracking-wide uppercase text-orange-700">
                    AI Overview{" "}
                    <span className="ml-2 text-gray-400 font-normal normal-case text-xs">
                      AI can make mistakes — please verify any critical
                      information for accuracy
                    </span>
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
