import { Briefcase } from "lucide-react";
import { postJob } from "./actions";
import JobPostDetailsCard from "@/components/dashboard/JobPostDetailsCard";
import { getJobCategoriesData } from "@/lib/db/queries";

// Server Component
export default async function PostAJobPage() {
  const jobCategoriesData = await getJobCategoriesData();

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
            Create an engaging job listing to attract the best candidates for
            your team
          </p>
        </div>

        {/* Job Form */}
        <JobPostDetailsCard
          mode="create"
          formAction={postJob} // server action passed directly
          submitButtonText="Publish Job Listing"
          jobCategories={jobCategoriesData}
        />
      </div>
    </div>
  );
}
