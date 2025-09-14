"use server";

import { createJobPost, createJobPostCandidate, notifyPotentialCandidatesForJobPost } from "@/lib/db/queries";
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
    companyName: formData.get("companyName") as string,
    companyProfile: formData.get("companyProfile") as string,
    title: formData.get("title") as string,
    location: formData.get("location") as string,
    description: formData.get("description") as string,
    requirements: formData.get("requirements") as string,
    perks: formData.get("perks") as string,
    coreSkills: formData.get("coreSkills") as string | undefined,
    niceToHaveSkills: formData.get("niceToHaveSkills") as string | undefined,
    category: formData.get("category") as string,
    subcategory: formData.get("subcategory") as string,
    job: formData.get("job") as string,
  };

  try {
    const jobPostId = await createJobPost(
      user.id,
      data.companyName,
      data.companyProfile,
      data.title,
      data.location,
      data.description,
      data.requirements,
      data.perks,
      data.coreSkills,
      data.niceToHaveSkills,
      data.category,
      data.subcategory,
      data.job,
    );

    // Create conversations and initial messages for potential candidates (same subcategory)
    await notifyPotentialCandidatesForJobPost(jobPostId, user.id);

    // Search for matching candidates after successful job post
    // const jobDescription =
    //   `${data.title} \n ${data.description} \n ${data.requirements}`.trim();
    // console.log(jobDescription);
    // const candidates = await searchCandidates({
    //   job_description: jobDescription,
    //   core_skills: data.coreSkills || "",
    //   nice_to_have_skills: data.niceToHaveSkills || "",
    //   category: data.category,
    //   subcategory: data.subcategory,
    //   job: data.job,
    //   k: 10,
    //   filter: {},
    // });

    // Store matching candidates in database
    // type CandidateScores = {
    //   similarity_score_bio: number;
    //   similarity_score_skills: number;
    //   similarity_score: number;
    // };

    // if (candidates.success) {
    //   for (const [profileId, scores] of Object.entries(candidates.success as Record<string, CandidateScores>)) {
    //     const similarityScore = scores.similarity_score;
    //     const similarityScoreBio = scores.similarity_score_bio;
    //     const similarityScoreSkills = scores.similarity_score_skills;
    //     await createJobPostCandidate(
    //       jobPostId,
    //       profileId,
    //       similarityScore,
    //       similarityScoreBio,
    //       similarityScoreSkills,
    //     );
    //   }
    // }
  } catch (error) {
    console.error("Error posting job:", error);
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
  core_skills: string;
  nice_to_have_skills: string;
  category: string;
  subcategory: string;
  job: string;
  k?: number;
  // filter?: Filter;
  filter?: {
    job?:string;
  };
}

export async function searchCandidates({
  job_description,
  core_skills,
  nice_to_have_skills,
  category,
  subcategory,
  job,
  k = 10,
  filter = {},
}: SearchCandidatesParams) {
  const API_KEY = process.env.REVERSE_API_KEY || "";
  const REVERSE_BASE_URL = process.env.REVERSE_BASE_URL;

  try {
    const response = await fetch(`${REVERSE_BASE_URL}/search-candidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify({
        job_description,
        core_skills,
        nice_to_have_skills,
        category,
        subcategory,
        job,
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
