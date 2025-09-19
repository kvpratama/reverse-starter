"use client";
import { useActionState } from "react";
import { Briefcase } from "lucide-react";
import { postJob } from "./actions";
import JobPostDetailsCard from "@/components/dashboard/JobPostDetailsCard";

type ActionState = {
  companyName?: string;
  companyProfile?: string;
  title?: string;
  location?: string;
  description?: string;
  requirements?: string;
  perks?: string;
  screeningQuestion1?: string;
  screeningQuestion2?: string;
  screeningQuestion3?: string;
  error?: string;
  success?: string;
};

export default function PostAJobPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    postJob,
    {},
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-40/20 via-white to-blue-20/10">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Post a New Job
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create an engaging job listing to attract the best candidates for your team
          </p>
        </div>

        {/* Status Messages */}
        {state.error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              {state.error}
            </p>
          </div>
        )}
        {state.success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-700 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {state.success}
            </p>
          </div>
        )}

        <JobPostDetailsCard
          mode="create"
          formAction={formAction}
          isPending={isPending}
          state={state}
          submitButtonText="Publish Job Listing"
        />
      </div>
    </div>
  );
}