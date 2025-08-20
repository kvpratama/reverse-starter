'use server';

import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth/session';
import { v4 as uuidv4 } from 'uuid';

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
    bio: 'Experienced software engineer with a passion for building scalable web applications.',
    skills: 'React, TypeScript, Node.js, SQL',
    fileurl: blob.url,
    experience: 'senior',
  };

  return { success: true, analysis: mockData };
}
