"use server";

import { updateJobPost } from "@/lib/db/queries";
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
    minSalary: formData.get("minSalary") as string,
    maxSalary: formData.get("maxSalary") as string,
    coreSkills: formData.get("coreSkills") as string | undefined,
    niceToHaveSkills: formData.get("niceToHaveSkills") as string | undefined,
    category: formData.get("category") as string,
    subcategories: formData.getAll("subcategories[]") as string[],
    subcategoryIds: formData.getAll("subcategoryIds[]") as string[],
    screeningQuestion1: formData.get("screeningQuestion1") as string,
    screeningQuestion2: formData.get("screeningQuestion2") as string,
    screeningQuestion3: formData.get("screeningQuestion3") as string,
  };

  try {
    const minSalaryValue = parseInt(data.minSalary, 10);
    const maxSalaryValue = parseInt(data.maxSalary, 10);

    if (Number.isNaN(minSalaryValue) || Number.isNaN(maxSalaryValue)) {
      return {
        ...data,
        error: "Please provide both minimum and maximum salary in Korean Won.",
      };
    }

    if (minSalaryValue <= 0 || maxSalaryValue <= 0) {
      return {
        ...data,
        error: "Salary values must be greater than zero.",
      };
    }

    if (minSalaryValue > maxSalaryValue) {
      return {
        ...data,
        error: "Minimum salary cannot be greater than maximum salary.",
      };
    }

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
      minSalaryValue,
      maxSalaryValue,
      data.coreSkills,
      data.niceToHaveSkills,
      data.subcategoryIds,
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
