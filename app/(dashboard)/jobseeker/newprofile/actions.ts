'use server';

import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth/session';
import { v4 as uuidv4 } from 'uuid';
import { createJobseekerProfile } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export async function handleResumeUploadAndAnalysis(state: any, formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    return { error: 'You must be logged in.' };
  }

  const file = formData.get('resume') as File;
  if (!file || file.size === 0) {
    return { error: 'Please select a file.' };
  }

  if (file.type !== 'application/pdf') {
    return { error: 'Only PDF files are allowed.' };
  }

  let blob;
  try {
    blob = await put(`resumes/${session.user.id}/${uuidv4()+'.pdf'}`, file, {
      access: 'public',
    });
  } catch (error) {
    return { error: 'Failed to upload resume.' };
  }

  // Mocking the FastAPI endpoint call
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  const mockData = {
    blobUrl: blob.url,
    name: 'John Doe',
    email: 'john.doe@example.com',
    bio: 'Experienced software engineer with a passion for building scalable web applications.',
    skills: 'React, TypeScript, Node.js, SQL',
    fileurl: blob.url,
    experience: 'senior',
  };

  return { success: true, analysis: mockData };
}

export async function createProfileFromAnalysis(state: any, formData: FormData) {
  const session = await getSession();
  if (!session?.user) {
    return { error: 'You must be logged in to create a profile.' };
  }

  const profileName = formData.get('profileName') as string;
  const resumeUrl = formData.get('resumeLink') as string;
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const bio = formData.get('bio') as string | undefined;
  const skills = formData.get('skills') as string | undefined;
  const experience = formData.get('experience') as 'entry' | 'mid' | 'senior' | undefined;
  const desiredSalary = formData.get('desiredSalary') ? Number(formData.get('desiredSalary')) : undefined;

  if (!profileName) {
    return { error: 'Profile name is required.' };
  }

  try {
    await createJobseekerProfile(
      session.user.id,
      profileName,
      name,
      email,
      resumeUrl,
      bio,
      skills,
      experience,
      desiredSalary
    );
  } catch (error) {
    console.error(error);
    return { error: 'Failed to create profile.' };
  }

  redirect('/jobseeker/profile');
}
