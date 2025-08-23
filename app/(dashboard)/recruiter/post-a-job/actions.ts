"use server";

import { createJobPost, createJobPostCandidate } from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export async function postJob(previousState: any, formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      ...previousState,
      error: "You must be logged in to post a job.",
    };
  }

  const data = {
    title: formData.get("title") as string,
    description: formData.get("description") as string,
    requirements: formData.get("requirements") as string,
    perks: formData.get("perks") as string,
  };

  try {
    const jobPostId = await createJobPost(
      user.id,
      data.title,
      data.description,
      data.requirements,
      data.perks,
    );

    // Search for matching candidates after successful job post
    const jobDescription =
      `${data.title} ${data.description} ${data.requirements}`.trim();
    const candidates = await searchCandidates({
      job_description: jobDescription,
      k: 10,
      filter: {},
    });

    // Store matching candidates in database
    if (candidates.success) {
      for (const candidate of candidates.success) {
        const profileId = candidate[0].metadata.profile_id;
        const similarityScore = candidate[1];
        await createJobPostCandidate(jobPostId, profileId, similarityScore);
      }
    }
  } catch (error) {
    return {
      ...previousState,
      error: "Failed to post job.",
    };
  }

  redirect("/recruiter/my-job-postings");
}

type FilterCondition = {
  $in?: string[];
  // Add other filter conditions as needed (e.g., $gt, $lt, etc.)
};

type Filter = {
  [key: string]: FilterCondition | Filter;
};

interface SearchCandidatesParams {
  job_description: string;
  k?: number;
  filter?: Filter;
}

export async function searchCandidates({
  job_description,
  k = 10,
  filter = {},
}: SearchCandidatesParams) {
  const API_KEY = process.env.REVERSE_API_KEY || "";
  const BASE_URL = "https://reverse-api-phi.vercel.app/";

  try {
    const response = await fetch(`${BASE_URL}/search-candidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        job_description,
        k,
        filter,
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error searching for candidates:", error);
    throw new Error(`Failed to search for candidates ${error}`);
  }
}
