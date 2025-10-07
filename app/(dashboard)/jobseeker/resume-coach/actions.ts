"use server";

import { put } from "@vercel/blob";
import { getSession } from "@/lib/auth/session";
import { v4 as uuidv4 } from "uuid";

const REVERSE_BASE_URL = process.env.REVERSE_BASE_URL;

export async function handleResumeUploadAndCoaching(
  state: any,
  formData: FormData
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
    const response = await fetch(`${REVERSE_BASE_URL}/resume-coach`, {
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
      return { error: `Resume coaching failed. Status: ${response.status}` };
    }

    const coaching = await response.json();

    return { success: true, coaching };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      return { error: "Resume coaching timed out. Please try again." };
    }
    console.error(error);
    return { error: "Resume coaching failed." };
  }
}
