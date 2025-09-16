import { NextRequest, NextResponse } from "next/server";
import {
  getAggregatedJobPostById,
  getAggregatedJobseekerByProfileId,
  upsertJobPostCandidate,
  createThankYouMessageForScreening,
} from "@/lib/db/queries";

const API_KEY = process.env.REVERSE_API_KEY;
const REVERSE_BASE_URL = process.env.REVERSE_BASE_URL;

export async function POST(req: NextRequest) {
  try {
    const { jobPostId, profileId, screeningAnswers } = (await req.json()) as {
      jobPostId?: string;
      profileId?: string;
      screeningAnswers?: Record<number, string>;
    };

    if (!jobPostId || !profileId) {
      return NextResponse.json(
        { error: "jobPostId and profileId are required" },
        { status: 400 },
      );
    }

    const jobAgg = await getAggregatedJobPostById(jobPostId);
    if (!jobAgg) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const seekerAgg = await getAggregatedJobseekerByProfileId(profileId);
    if (!seekerAgg) {
      return NextResponse.json(
        { error: "Jobseeker profile not found" },
        { status: 404 },
      );
    }

    if (!REVERSE_BASE_URL || !API_KEY) {
      return NextResponse.json(
        { error: "Reverse API not configured" },
        { status: 500 },
      );
    }

    const payload = {
      job_description: jobAgg.job_description,
      job_core_skills: jobAgg.job_core_skills,
      job_nice_to_have_skills: jobAgg.job_nice_to_have_skills,
      job_category: jobAgg.job_category,
      job_subcategory: jobAgg.job_subcategory,
      job_role: jobAgg.job_role,
      jobseeker_bio: seekerAgg.jobseeker_bio,
      jobseeker_skills: seekerAgg.jobseeker_skills,
      jobseeker_education: seekerAgg.jobseeker_education,
      jobseeker_work_experience: seekerAgg.jobseeker_work_experience,
    };

    const resp = await fetch(`${REVERSE_BASE_URL}/rate-candidate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!resp.ok) {
      const text = await resp.text();
      return NextResponse.json(
        { error: `Reverse API error: ${resp.status} ${text}` },
        { status: 502 },
      );
    }

    const data = (await resp.json()) as {
      similarity_score_bio: number;
      similarity_score_skills: number;
      similarity_score: number;
    };
    console.log("before upsertJobPostCandidate");
    await upsertJobPostCandidate(
      jobPostId,
      profileId,
      data.similarity_score,
      data.similarity_score_bio,
      data.similarity_score_skills,
      "applied",
      screeningAnswers ?? null,
    );
    console.log("after upsertJobPostCandidate");
    // Send a thank-you message to the jobseeker in the conversation thread
    const thankYou =
      "Thank you for participating in the early screening! We have received your responses and will be in touch soon.";
    await createThankYouMessageForScreening(
      jobPostId,
      profileId,
      thankYou,
      "thank_you",
    );

    return NextResponse.json({
      similarityScore: data.similarity_score,
      similarityScoreBio: data.similarity_score_bio,
      similarityScoreSkills: data.similarity_score_skills,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message ?? "Internal Server Error" },
      { status: 500 },
    );
  }
}
