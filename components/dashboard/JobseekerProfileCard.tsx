"use client";
import React, { useEffect, useState } from "react";
import { JobseekerProfileCardUI } from "./JobseekerProfileCardUI";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type WorkExperience = {
  id: string;
  company?: string | null;
  position?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
};

type Education = {
  id: string;
  institution?: string | null;
  degree?: string | null;
  fieldOfStudy?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  description?: string | null;
};

export type JobseekerProfile = {
  id: string;
  profileName: string;
  email: string;
  name?: string | null;
  jobCategory?: { name?: string | null } | null;
  jobSubcategory?: { name?: string | null } | null;
  jobRole?: { name?: string | null } | null;
  skills?: string | null;
  age?: number | null;
  visaStatus?: string | null;
  nationality?: string | null;
  bio?: string | null;
  workExperience?: WorkExperience[];
  education?: Education[];
  resumeUrl?: string | null;
};

export function JobseekerProfileCard({ profileId }: { profileId: string }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<JobseekerProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/jobseeker/profile/${profileId}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          const msg = await res.text();
          throw new Error(msg || `Failed to load profile`);
        }

        const data = await res.json();

        setProfile(data.profile ?? null);
      } catch (e: any) {
        console.error(e?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    if (profileId) fetchProfile();
  }, [profileId]);

  if (loading)
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Loading profile...</CardTitle>
        </CardHeader>
      </Card>
    );

  if (!profile) {
    return <div className="border p-4 text-red-500">Profile not found</div>;
  }

  return <JobseekerProfileCardUI profile={profile} />;
}
