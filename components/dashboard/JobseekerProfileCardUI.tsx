import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { JobseekerProfile } from "@/app/types/types";

export function JobseekerProfileCardUI({
  profile,
  screeningQuestions,
  screeningAnswers,
}: {
  profile: JobseekerProfile;
  screeningQuestions?: { question: string }[];
  screeningAnswers?: { answer: string }[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.profileName}</CardTitle>
        <CardDescription>{profile.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* <div className="space-y-4"> */}
          <div>
            <p className="text-sm text-muted-foreground">Full name</p>
            <p className="font-medium">{profile.name || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Category {">"} Subcategory {">"} Role
            </p>
            <p className="font-medium">
              <span className="text-orange-300">
                {profile.jobCategory?.name ?? "-"}
              </span>{" "}
              {">"}{" "}
              <span className="text-orange-400">
                {profile.jobSubcategory?.name ?? "-"}
              </span>{" "}
              {/* {">"}{" "}
              <span className="text-orange-500">
                {profile.jobRole?.name ?? "-"}
              </span> */}
            </p>
          </div>
          {/* </div> */}
        </div>

        <div className="flex flex-wrap gap-2 text-sm m-2">
          <span className="font-semibold text-gray-700">Skills:</span>
          {profile?.skills?.split(",").map((skill: string, index: number) => (
            <span
              key={index}
              className="bg-orange-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
            >
              {skill.trim()}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Age </p>
            <p>{profile.age ?? "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Visa Status</p>
            <p>{profile.visaStatus || "-"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Nationality</p>
            <p>{profile.nationality || "-"}</p>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Bio</p>
          <p className="font-small whitespace-pre-wrap break-words">
            {profile.bio || "-"}
          </p>
        </div>

        {Array.isArray(profile.workExperience) &&
          profile.workExperience.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <div className="mt-3 space-y-4">
                {profile.workExperience.map((we) => (
                  <div key={we.id} className="border rounded p-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{we.company || ""}</span>
                      <span>
                        {[we.startDate, we.endDate].filter(Boolean).join(" - ")}
                      </span>
                    </div>
                    <div className="font-medium">{we.position || ""}</div>
                    {we.description && (
                      <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                        {we.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {Array.isArray(profile.education) && profile.education.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Education</h3>
            <div className="mt-3 space-y-4">
              {profile.education.map((ed) => (
                <div key={ed.id} className="border rounded p-3">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{ed.institution || ""}</span>
                    <span>
                      {[ed.startDate, ed.endDate].filter(Boolean).join(" - ")}
                    </span>
                  </div>
                  <div className="font-medium">{ed.degree || ""}</div>
                  {ed.fieldOfStudy && (
                    <div className="text-sm">Field: {ed.fieldOfStudy}</div>
                  )}
                  {ed.description && (
                    <p className="text-sm mt-1 whitespace-pre-wrap break-words">
                      {ed.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screening Q&A */}
        {((screeningQuestions && screeningQuestions.length > 0) ||
          (screeningAnswers && screeningAnswers.length > 0)) && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold">Screening Q&A</h3>
            <div className="mt-3 space-y-3">
              {Array.from({
                length: Math.max(
                  screeningQuestions?.length || 0,
                  screeningAnswers?.length || 0,
                ),
              }).map((_, idx) => {
                const q = screeningQuestions?.[idx]?.question;
                const a = screeningAnswers?.[idx]?.answer;
                return (
                  <div key={idx} className="border rounded p-3">
                    <div className="text-sm font-medium text-gray-900">
                      {q ? q : `Question ${idx + 1}`}
                    </div>
                    <div className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">
                      {a ? a : "No answer provided."}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {profile.resumeUrl && (
          <div className="mt-6">
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white hover:text-white hover:cursor-pointer">
                View Resume
              </Button>
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
