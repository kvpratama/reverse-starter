"use client";

import { useActionState } from "react";
import {
  handleResumeUploadAndAnalysis,
  createProfileFromAnalysis,
} from "@/app/(dashboard)/jobseeker/newprofile/actions";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// New extracted components
import UploadResumeCard from "@/components/dashboard/UploadResumeCard";
import CreateProfileForm from "@/components/dashboard/CreateProfileForm";
import { JobCategoriesData } from "@/app/types/types";

type ActionState = {
  error?: string;
  success?: boolean;
  analysis?: {
    name: string;
    email?: string;
    age: number;
    visaStatus: string;
    nationality: string;
    bio: string;
    skills: string;
    fileurl: string;
    // experience: string;
    work_experience?: Array<{
      start_date: string;
      end_date: string;
      position: string;
      company: string;
      description: string;
    }>;
    education?: Array<{
      start_date: string;
      end_date: string;
      degree: string;
      field_of_study: string;
      institution: string;
      description: string;
    }>;
  };
};

export default function CreateNewProfile({
  jobCategoriesData,
}: {
  jobCategoriesData: JobCategoriesData;
}) {
  const [uploadState, uploadAction, isUploading] = useActionState<
    ActionState,
    FormData
  >(handleResumeUploadAndAnalysis, {});

  const [createState, createAction, isCreating] = useActionState<
    ActionState,
    FormData
  >(createProfileFromAnalysis, {});

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Create a New Profile
      </h1>
      <p className="text-gray-600 mb-6 text-sm">
        Build a new profile instantly by pulling key details from your
        resume—skills, experience, and achievements—all in one place.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 mt-6">
        {!uploadState.success && !uploadState.analysis && (
          <UploadResumeCard
            action={uploadAction}
            isUploading={isUploading}
            error={uploadState.error}
          />
        )}
      </div>

      {uploadState.success && uploadState.analysis && (
        <CreateProfileForm
          action={createAction}
          isCreating={isCreating}
          defaults={uploadState.analysis}
          error={createState.error}
          jobCategoriesData={jobCategoriesData}
        />
      )}
    </section>
  );
}
