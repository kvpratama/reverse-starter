import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import ProgressRing from "@/components/ui/progress-ring";
import { JobseekerProfileCardUI } from "@/components/dashboard/JobseekerProfileCardUI";
import type { JobseekerProfile } from "@/app/types/types";

export default function CandidatesCard({
  candidates,
}: {
  candidates: Array<{
    id: string;
    similarityScore?: number | 0;
    similarityScoreBio?: number | 0;
    similarityScoreSkills?: number | 0;
    profile?: {
      id: string;
      profileName?: string | null;
      name?: string | null;
      email: string;
      resumeUrl: string;
      bio?: string | null;
      skills?: string | null;
      experience?: string | null;
      desiredSalary?: number | null;
      workExperience?: Array<{
        id: string;
        startDate?: string | null;
        endDate?: string | null;
        position?: string | null;
        company?: string | null;
        description?: string | null;
      }>;
      education?: Array<{
        id: string;
        startDate?: string | null;
        endDate?: string | null;
        degree?: string | null;
        institution?: string | null;
        fieldOfStudy?: string | null;
        description?: string | null;
      }>;
    };
  }>;
}) {
  const candidatesToRender = candidates.length > 0 ? candidates : [];
  const [openProfileId, setOpenProfileId] = useState<string | null>(null);

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
                const overallScore = Math.round(c.similarityScore || 0);
                const bioScore = Math.round(c.similarityScoreBio || 0);
                const skillsScore = Math.round(c.similarityScoreSkills || 0);
                const jobSeekerProfile: JobseekerProfile = {
                  id: c.profile?.id || "",
                  profileName: c.profile?.profileName || "",
                  email: c.profile?.email || "",
                  name: c.profile?.name || "",
                  jobCategory: null, //   c.profile?.jobCategory || null,
                  jobSubcategory: null, // c.profile?.jobSubcategory || null,
                  jobRole: null, // c.profile?.jobRole || null,
                  skills: c.profile?.skills || "",
                  age: null, // c.profile?.age || null,
                  visaStatus: null, //c.profile?.visaStatus || "",
                  nationality: "", // c.profile?.nationality || "",
                  bio: c.profile?.bio || "",
                  workExperience: c.profile?.workExperience || [],
                  education: c.profile?.education || [],
                  resumeUrl: c.profile?.resumeUrl || "",
                };

                const cAny = c as any;
                const name =
                  cAny.name ?? cAny.profile?.name ?? "Unnamed Profile";
                const skills = cAny.skills ?? cAny.profile?.skills ?? "";
                const bio = cAny.bio ?? cAny.profile?.bio ?? "";

                const latestWork = cAny.profile?.workExperience?.[0];
                const latestEdu = cAny.profile?.education?.[0];

                return (
                  <Card
                    key={c.id}
                    className="h-full flex flex-col justify-between"
                  >
                    <div>
                      <CardHeader className="border-b pb-4">
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-xl font-semibold">
                            {name}
                          </CardTitle>
                        </div>
                        <CardAction className="flex space-x-4 pt-2 text-sm text-gray-500">
                          <ProgressRing
                            score={overallScore}
                            title="Overall"
                            size="md"
                          />
                          <ProgressRing
                            score={bioScore}
                            title="Bio"
                            size="md"
                          />
                          <ProgressRing
                            score={skillsScore}
                            title="Skills"
                            size="md"
                          />
                        </CardAction>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3">
                        {skills && (
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
                        )}
                        {bio && (
                          <div className="text-sm text-gray-600 whitespace-pre-wrap">
                            {bio.length > 150
                              ? `${bio.substring(0, 150)}... `
                              : bio}
                          </div>
                        )}
                        {latestWork && (
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">
                              Latest Experience:
                            </span>{" "}
                            <span>
                              {latestWork.position || "Role"}
                              {latestWork.company
                                ? ` @ ${latestWork.company}`
                                : ""}
                            </span>
                            {(latestWork.startDate || latestWork.endDate) && (
                              <span className="text-gray-500">{` (${latestWork.startDate || ""}${latestWork.endDate ? ` - ${latestWork.endDate}` : ""})`}</span>
                            )}
                          </div>
                        )}
                        {latestEdu && (
                          <div className="text-sm text-gray-700">
                            <span className="font-semibold">Education:</span>{" "}
                            <span>
                              {latestEdu.degree || "Degree"}
                              {latestEdu.fieldOfStudy
                                ? ` in ${latestEdu.fieldOfStudy}`
                                : ""}
                              {latestEdu.institution
                                ? ` @ ${latestEdu.institution}`
                                : ""}
                            </span>
                            {(latestEdu.startDate || latestEdu.endDate) && (
                              <span className="text-gray-500">{` (${latestEdu.startDate || ""}${latestEdu.endDate ? ` - ${latestEdu.endDate}` : ""})`}</span>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </div>
                    <CardFooter className="pt-4">
                      <Button
                        size="sm"
                        className="m-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
                      >
                        Invite for Interview
                      </Button>
                      <Button
                        size="sm"
                        className="m-1 bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
                        onClick={() => setOpenProfileId(c.profile?.id || c.id)}
                      >
                        View Profile
                      </Button>
                      {/* Only render the Modal for the selected candidate */}
                      {openProfileId === (c.profile?.id || c.id) ? (
                        <Modal onClose={() => setOpenProfileId(null)}>
                          <Card className="w-full max-w-4xl h-[calc(100vh-10rem)] flex flex-col">
                            <CardHeader>
                              <CardTitle className="text-xl">
                                Candidate Profile
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 overflow-y-auto">
                              {jobSeekerProfile ? (
                                <JobseekerProfileCardUI
                                  profile={jobSeekerProfile}
                                />
                              ) : (
                                <p className="text-sm text-muted-foreground">
                                  No profileId available.
                                </p>
                              )}
                              <div className="pt-3">
                                <Button
                                  className="rounded-full"
                                  onClick={() => setOpenProfileId(null)}
                                >
                                  Close
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Modal>
                      ) : null}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
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