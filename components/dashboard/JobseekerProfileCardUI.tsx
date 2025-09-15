import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { JobseekerProfile } from "./JobseekerProfileCard";

export function JobseekerProfileCardUI({
  profile,
}: {
  profile: JobseekerProfile;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.profileName}</CardTitle>
        <CardDescription>{profile.email}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
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
                {">"}{" "}
                <span className="text-orange-500">
                  {profile.jobRole?.name ?? "-"}
                </span>
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Skills</p>
              <p className="text-sm whitespace-pre-wrap break-words">
                {profile.skills || "-"}
              </p>
            </div>
          </div>
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
