import Link from "next/link";
import { getUser, getJobPostWithCandidatesForUser, getJobCategoriesData } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import JobWithTabs from "@/components/dashboard/JobWithTabs";
import { updateJob } from "./actions";

export default async function JobPostDetailPage(props: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { id } = await props.params;
  const rawSearch = (await props.searchParams) || {};
  const tabParam = (
    Array.isArray(rawSearch["tab"]) ? rawSearch["tab"][0] : rawSearch["tab"]
  ) as string | undefined;
  const activeTab = tabParam === "candidates" ? "candidates" : "job";
  const user = await getUser();
  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }

  const data = await getJobPostWithCandidatesForUser(id, user.id);
  if (!data) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Job not found</h1>
        <Link href="/recruiter/my-job-postings">
          <Button variant="outline">Back to My Jobs</Button>
        </Link>
      </div>
    );
  }
  const jobCategoriesData = await getJobCategoriesData();

  const { jobPost, candidates } = data;

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Link href="/recruiter/my-job-postings">
          <Button variant="ghost">← Back to My Job Posting</Button>
        </Link>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{jobPost.jobTitle}</h1>
      </div>
      <JobWithTabs jobPost={jobPost} candidates={candidates} updateJob={updateJob} jobCategories={jobCategoriesData} />
    </div>
  );
}
