"use client";
import React, { useEffect, useState } from "react";
import { JobseekerProfileCardUI } from "./JobseekerProfileCardUI";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { JobseekerProfile } from "@/app/types/types";

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
      <Card className="w-fullshadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
        <CardHeader>
          <CardTitle className="text-lg">Loading profile...</CardTitle>
        </CardHeader>
      </Card>
    );

  if (!profile) {
    return <div className="border p-4 text-red-500">Profile not found</div>;
  }

  return <JobseekerProfileCardUI profile={profile} />;
}
