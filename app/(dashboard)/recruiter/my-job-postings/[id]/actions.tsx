"use server";

import {
  updateJobPost,
} from "@/lib/db/queries";
import { getUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";

export async function updateJob(previousState: any, formData: FormData) {
  const user = await getUser();

  if (!user) {
    return {
      ...previousState,
      error: "You must be logged in to update a job.",
    };
  }

  const jobPostId = formData.get("jobPostId") as string;
  if (!jobPostId) {
    return {
      ...previousState,
      error: "Job post not found.",
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
    subcategoryId: formData.get("subcategoryId") as string,
    screeningQuestion1: formData.get("screeningQuestion1") as string,
    screeningQuestion2: formData.get("screeningQuestion2") as string,
    screeningQuestion3: formData.get("screeningQuestion3") as string,
  };

  try {
    await updateJobPost(
      jobPostId,
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
      data.subcategoryId,
      data.screeningQuestion1,
      data.screeningQuestion2,
      data.screeningQuestion3,
    );
  } catch (error) {
    console.error("Error updating job:", error);
    return {
      ...previousState,
      error: "Failed to update job.",
    };
  }
  redirect(`/recruiter/my-job-postings/${jobPostId}`);
}

