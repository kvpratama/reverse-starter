"use server";

import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";
import { createJobseekerProfileByIds, deleteJobseekerProfile } from "@/lib/db/queries";
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

function extractFormData(formData: FormData) {
  return {
    profileName: (formData.get("profileName") as string | null)?.trim() || "",
    category: (formData.get("category") as string | null)?.trim() || "",
    subcategories: formData.getAll("subcategories[]") as string[],
    subcategoryIds: formData.getAll("subcategoryIds[]") as string[],
    resumeUrl: (formData.get("resumeLink") as string | null)?.trim() || "",
    name: (formData.get("name") as string | null)?.trim() || "",
    email: (formData.get("email") as string | null)?.trim() || "",
    age: Number(formData.get("age")) || 18,
    visaStatus: (formData.get("visaStatus") as string | null)?.trim() || "",
    nationality: (formData.get("nationality") as string | null)?.trim() || "",
    bio: (formData.get("bio") as string | null)?.trim(),
    experience: formData.get("experience") as "entry" | "mid" | "senior" | undefined,
    desiredSalary: formData.get("desiredSalary") ? Number(formData.get("desiredSalary")) : undefined,
    workExperience: parseArrayFromFormData<WorkExperienceEntry>(formData, "work_experience"),
    education: parseArrayFromFormData<EducationEntry>(formData, "education"),
    skills: (formData.get("skills") as string | null)?.trim(),
  };
}

// Helper function to validate profile data
function validateProfileData(data: any): string | null {
  if (!data.profileName) {
    return "Profile name is required.";
  }
  if (!data.category || data.subcategories.length === 0) {
    return "Job category and at least one subcategory are required.";
  }
  return null;
}

// Robust vector DB save with retry logic
async function saveToVectorDbWithRetry(profileData: {
  userId: string;
  profileId: string;
  name: string;
  bio?: string;
  skills?: string;
  category: string;
  subcategories: string[];
}, maxRetries = 3): Promise<boolean> {
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const vectorDbResponse = await fetch(
        `${REVERSE_BASE_URL}/save-to-vectordb`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": process.env.REVERSE_API_KEY || "",
          },
          body: JSON.stringify({
            user_id: profileData.userId,
            profile_id: profileData.profileId,
            name: profileData.name,
            bio: profileData.bio || "",
            skills: profileData.skills,
            category: profileData.category,
            subcategories: profileData.subcategories,
          }),
          signal: controller.signal,
        },
      );
      
      clearTimeout(timeout);

      if (vectorDbResponse.ok) {
        return true;
      }

      // If it's a client error (4xx), don't retry
      if (vectorDbResponse.status >= 400 && vectorDbResponse.status < 500) {
        console.error(`Vector DB client error: ${vectorDbResponse.status}`);
        return false;
      }

      // Server error - will retry
      console.warn(`Vector DB attempt ${attempt} failed with status: ${vectorDbResponse.status}`);
      
    } catch (error: any) {
      if (error?.name === "AbortError") {
        console.warn(`Vector DB attempt ${attempt} timed out`);
      } else {
        console.warn(`Vector DB attempt ${attempt} failed:`, error);
      }
    }

    // Wait before retry (exponential backoff)
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }

  return false;
}

async function logCleanupFailure(profileId: string, error: any): Promise<void> {
  // Log cleanup failures for manual intervention
  console.error(`Manual cleanup needed for profile: ${profileId}`, error);
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

  // Extract and validate form data
  const profileData = extractFormData(formData);
  const validationError = validateProfileData(profileData);
  if (validationError) {
    return { error: validationError };
  }

  let profileId = "";
  let vectorDbSaved = false;

  try {
    // Step 1: Create profile in main database
    profileId = await createJobseekerProfileByIds(
      session.user.id,
      profileData.profileName,
      profileData.subcategoryIds,
      profileData.name,
      profileData.email,
      profileData.age,
      profileData.visaStatus,
      profileData.nationality,
      profileData.resumeUrl,
      profileData.bio,
      profileData.skills,
      profileData.experience,
      profileData.desiredSalary,
      profileData.workExperience,
      profileData.education,
    );

    // Step 2: Save to vector database with retry logic
    vectorDbSaved = await saveToVectorDbWithRetry({
      userId: session.user.id,
      profileId,
      name: profileData.name,
      bio: profileData.bio,
      skills: profileData.skills,
      category: profileData.category,
      subcategories: profileData.subcategories,
    });

    if (!vectorDbSaved) {
      // If vector DB save failed:
      // Option 1: Delete the profile and return error (strict consistency)
      await deleteJobseekerProfile(profileId);
      return { 
        error: "Failed to save profile to vector database. Profile creation cancelled." 
      };

      // Option 2: Mark profile for async sync and continue (eventual consistency)
      // await markProfileForSync(profileId);
      // console.warn(`Profile ${profileId} created but not synced to vector DB. Marked for retry.`);
    }

  } catch (error) {
    console.error("Profile creation failed:", error);

    // Cleanup: If we have a profileId, try to delete it
    if (profileId) {
      try {
        await deleteJobseekerProfile(profileId);
      } catch (cleanupError) {
        console.error("Failed to cleanup profile after error:", cleanupError);
        // Log this for manual cleanup if needed
        await logCleanupFailure(profileId, cleanupError);
      }
    }
    return { error: `Failed to create profile. ${error}` };
  }

  redirect(`/jobseeker/profile/${profileId}`);
}