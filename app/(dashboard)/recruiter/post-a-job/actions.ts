"use server";

import {
  createJobPost,
  // createJobPostCandidate,
  notifyPotentialCandidatesForJobPost,
} from "@/lib/db/queries";
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
    subcategories: formData.getAll("subcategories[]") as string[],
    subcategoryIds: formData.getAll("subcategoryIds[]") as string[],
    screeningQuestion1: formData.get("screeningQuestion1") as string,
    screeningQuestion2: formData.get("screeningQuestion2") as string,
    screeningQuestion3: formData.get("screeningQuestion3") as string,
  };
  let jobPostId = "";
  try {
    if (!data.category || data.subcategories.length === 0) {
      return {
        ...data,
        error: "Job category and at least one subcategory are required.",
      };
    }
    jobPostId = await createJobPost(
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
      data.subcategoryIds,
      data.screeningQuestion1,
      data.screeningQuestion2,
      data.screeningQuestion3,
    );

    // Search for matching candidates using vector similarity
    const jobDescription =
      `${data.title} \n ${data.description} \n ${data.requirements}`.trim();
    const candidates_vectordb = await searchCandidates({
      job_description: jobDescription,
      core_skills: data.coreSkills || "",
      nice_to_have_skills: data.niceToHaveSkills || "",
      category: data.category,
      subcategories: data.subcategories,
      k: 30,
      filter: {}, // Filter runs on the API side
    });

    // filter candidates with similarity score >= 0.7
    const profileIds_vectordb = Object.entries(
      candidates_vectordb.success as Record<
        string,
        { similarity_score: number }
      >,
    )
      .filter(([_, v]) => v.similarity_score >= 0.7)
      .map(([id]) => id);

    // Create conversations and initial messages for potential candidates (same subcategory)
    await notifyPotentialCandidatesForJobPost(
      jobPostId,
      user.id,
      profileIds_vectordb,
    );

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
      ...data,
      error: "Failed to post job. Try again later.",
    };
  }
  redirect(`/recruiter/my-job-postings`);
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
  subcategories: string[];
  k?: number;
  // filter?: Filter;
  filter?: {
    category?: string;
  };
}

export async function searchCandidates({
  job_description,
  core_skills,
  nice_to_have_skills,
  category,
  subcategories,
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
        subcategories,
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
