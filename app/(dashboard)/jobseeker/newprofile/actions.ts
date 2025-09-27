"use server";

import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";
import { createJobseekerProfileByIds } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import { WorkExperienceEntry, EducationEntry } from "@/lib/types/profile";

const REVERSE_BASE_URL = process.env.REVERSE_BASE_URL;

export async function handleResumeUploadAndAnalysis(
  state: any,
  formData: FormData,
) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "You must be logged in." };
  }

  if (!REVERSE_BASE_URL) {
    return { error: "Server misconfiguration: REVERSE_BASE_URL is not set." };
  }
  if (!process.env.REVERSE_API_KEY) {
    return { error: "Server misconfiguration: REVERSE_API_KEY is not set." };
  }

  const file = formData.get("resume") as File;
  if (!file || file.size === 0) {
    return { error: "Please select a file." };
  }

  if (file.type !== "application/pdf") {
    return { error: "Only PDF files are allowed." };
  }

  let blob;
  try {
    blob = await put(`resumes/${session.user.id}/${uuidv4() + ".pdf"}`, file, {
      access: "public",
    });
  } catch (error) {
    return { error: "Failed to upload resume." };
  }

  const config = {
    configurable: {
      thread_id: session.user.id,
      model: "google_genai:gemini-2.5-flash-lite",
    },
  };

  try {
    // Add a timeout to avoid hanging if external service stalls
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000); // 60s
    const response = await fetch(`${REVERSE_BASE_URL}/resume-analyzer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": process.env.REVERSE_API_KEY || "",
      },
      body: JSON.stringify({
        resume_url: blob.url,
        config: config,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", errorText);
      return { error: `Failed to analyze resume. Status: ${response.status}` };
    }

    const analysis = await response.json();
    // console.log(analysis);
    // New API may return the payload at top-level; keep compatibility if nested under `response`.
    const payload = analysis?.response ?? analysis;

    const bioParts = [payload?.bio1, payload?.bio2, payload?.bio3].filter(
      (p: unknown) => typeof p === "string" && p.trim().length > 0,
    ) as string[];

    const formattedAnalysis = {
      name: payload?.name || "",
      email: payload?.email || "",
      age: payload?.age || "",
      visaStatus: payload?.visa_status || "",
      nationality: payload?.nationality || "",
      bio: bioParts.join(" \n \n "),
      skills: Array.isArray(payload?.skills)
        ? (payload.skills as string[]).join(", ")
        : typeof payload?.skills === "string"
          ? payload.skills
          : "",
      work_experience: Array.isArray(payload?.work_experience)
        ? payload.work_experience
        : [],
      education: Array.isArray(payload?.education) ? payload.education : [],
      fileurl: blob.url,
      // experience: payload?.experience_level,
    } as const;

    return { success: true, analysis: formattedAnalysis };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      return { error: "Resume analysis timed out. Please try again." };
    }
    console.error(error);
    return { error: "Failed to analyze resume." };
  }
}

/**
 * Parses form data entries that are structured as arrays of objects.
 * This function uses generics to be reusable for any object type.
 * @param formData The FormData object from the form submission.
 * @param arrayName The base name of the array (e.g., "education", "work_experience").
 * @returns An array of objects matching the specified type.
 */
function parseArrayFromFormData<T extends object>(
  formData: FormData,
  arrayName: string,
): T[] {
  const result: T[] = [];
  const pattern = new RegExp(`^${arrayName}\\[(\\d+)\\]\\[(\\w+)\\]$`);

  for (const [key, value] of formData.entries()) {
    const match = key.match(pattern);
    if (match) {
      const index: number = parseInt(match[1], 10);
      const field: string = match[2];

      // Ensure the array has enough space for the current index
      if (!result[index]) {
        // Create a temporary object with a string index signature
        result[index] = {} as T;
      }

      // Assign the value to the correct object and field
      (result[index] as Record<string, string>)[field] = value as string;
    }
  }

  // Filter out any empty items and return the final array
  return result.filter((item) => Object.keys(item).length > 0);
}

export async function createProfileFromAnalysis(
  state: any,
  formData: FormData,
) {
  const session = await getSession();
  if (!session?.user) {
    return { error: "You must be logged in to create a profile." };
  }

  if (!REVERSE_BASE_URL) {
    return { error: "Server misconfiguration: REVERSE_BASE_URL is not set." };
  }
  if (!process.env.REVERSE_API_KEY) {
    return { error: "Server misconfiguration: REVERSE_API_KEY is not set." };
  }

  const profileName =
    (formData.get("profileName") as string | null)?.trim() || "";
  const category = (formData.get("category") as string | null)?.trim() || "";
  const subcategories = formData.getAll("subcategories[]") as string[];
  const subcategoryIds = formData.getAll("subcategoryIds[]") as string[];
  const resumeUrl = (formData.get("resumeLink") as string | null)?.trim() || "";
  const name = (formData.get("name") as string | null)?.trim() || "";
  const email = (formData.get("email") as string | null)?.trim() || "";
  const age = Number(formData.get("age")) || 18;
  const visaStatus =
    (formData.get("visaStatus") as string | null)?.trim() || "";
  const nationality =
    (formData.get("nationality") as string | null)?.trim() || "";
  const bio = (formData.get("bio") as string | null)?.trim();
  const experience = formData.get("experience") as
    | "entry"
    | "mid"
    | "senior"
    | undefined;
  const desiredSalary = formData.get("desiredSalary")
    ? Number(formData.get("desiredSalary"))
    : undefined;
  const workExperience: WorkExperienceEntry[] =
    parseArrayFromFormData<WorkExperienceEntry>(formData, "work_experience");
  const education: EducationEntry[] = parseArrayFromFormData<EducationEntry>(
    formData,
    "education",
  );
  const skills = (formData.get("skills") as string | null)?.trim();

  if (!profileName) {
    return { error: "Profile name is required." };
  }
  if (!category || subcategories.length === 0) {
    return { error: "Job category and at least one subcategory are required." };
  }
  
  let profileId = "";

  try {
    profileId = await createJobseekerProfileByIds(
      session.user.id,
      profileName,
      subcategoryIds,
      name,
      email,
      age,
      visaStatus,
      nationality,
      resumeUrl,
      bio,
      skills,
      experience,
      desiredSalary,
      workExperience,
      education,
    );
  } catch (error) {
    console.error(error);
    return { error: `Failed to create profile. ${error}` };
  }

  // try {
  //   // Save profile to vector database with timeout
  //   const controller = new AbortController();
  //   const timeout = setTimeout(() => controller.abort(), 15000); // 15s
  //   const vectorDbResponse = await fetch(
  //     `${REVERSE_BASE_URL}/save-to-vectordb`,
  //     {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-API-Key": process.env.REVERSE_API_KEY || "",
  //       },
  //       body: JSON.stringify({
  //         user_id: session.user.id,
  //         profile_id: profileId,
  //         // profile_name: profileName,
  //         name: name,
  //         // email: email,
  //         // resume_url: resumeUrl,
  //         bio: `${bio}`,
  //         skills: skills,
  //         category: category,
  //         subcategory: subcategory,
  //         // experience: experience,
  //         // desired_salary: desiredSalary || 0,
  //       }),
  //       signal: controller.signal,
  //     },
  //   );
  //   clearTimeout(timeout);

  //   if (!vectorDbResponse.ok) {
  //     throw new Error(`HTTP error! status: ${vectorDbResponse.status}`);
  //   }
  // } catch (error: any) {
  //   if (error?.name === "AbortError") {
  //     return { error: "Saving profile to vector database timed out." };
  //   }
  //   console.error(error);
  //   return { error: `Failed to save profile to vector database. ${error}` };
  // }

  redirect(`/jobseeker/profile/${profileId}`);
}
