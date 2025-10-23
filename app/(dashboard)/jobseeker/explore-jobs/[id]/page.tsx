import { notFound } from "next/navigation";
import { db } from "@/lib/db/drizzle";
import {
  jobPosts,
  jobPostSubcategories,
  jobSubcategories,
  jobCategories,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import JobPostDetailsCard from "@/components/dashboard/JobPostDetailsCard";
import type { JobPost as AppJobPost } from "@/app/types/types";
import { Button } from "@/components/ui/button";

interface JobDetailPageProps {
  id: string;
}

type JobWithCategories = AppJobPost & {
  categories: { categoryName: string; subcategoryName: string }[];
};

async function getJobById(id: string): Promise<JobWithCategories | null> {
  try {
    const [job] = await db
      .select({
        id: jobPosts.id,
        jobPostId: jobPosts.id,
        companyName: jobPosts.companyName,
        companyProfile: jobPosts.companyProfile,
        jobTitle: jobPosts.jobTitle,
        jobLocation: jobPosts.jobLocation,
        minSalary: jobPosts.minSalary,
        maxSalary: jobPosts.maxSalary,
        jobDescription: jobPosts.jobDescription,
        jobRequirements: jobPosts.jobRequirements,
        perks: jobPosts.perks,
        coreSkills: jobPosts.coreSkills,
        niceToHaveSkills: jobPosts.niceToHaveSkills,
        screeningQuestions: jobPosts.screeningQuestions,
        createdAt: jobPosts.createdAt,
        updatedAt: jobPosts.updatedAt,
      })
      .from(jobPosts)
      .where(and(eq(jobPosts.id, id), isNull(jobPosts.deletedAt)))
      .limit(1);

    if (!job) return null;

    // Get job categories/subcategories
    const categoryRows = await db
      .select({
        categoryId: jobCategories.id,
        categoryName: jobCategories.name,
        subcategoryId: jobSubcategories.id,
        subcategoryName: jobSubcategories.name,
      })
      .from(jobPostSubcategories)
      .innerJoin(
        jobSubcategories,
        eq(jobPostSubcategories.subcategoryId, jobSubcategories.id)
      )
      .innerJoin(
        jobCategories,
        eq(jobSubcategories.categoryId, jobCategories.id)
      )
      .where(eq(jobPostSubcategories.jobPostId, id));

    const jobCategoriesArr = Array.from(
      new Map(
        categoryRows.map((r) => [
          r.categoryId,
          { id: r.categoryId, name: r.categoryName },
        ])
      ).values()
    );
    const jobSubcategoriesArr = categoryRows.map((r) => ({
      id: r.subcategoryId,
      name: r.subcategoryName,
    }));
    const categories = categoryRows.map((r) => ({
      categoryName: r.categoryName,
      subcategoryName: r.subcategoryName,
    }));

    // Normalize date fields to ISO strings to match AppJobPost type
    const createdAt = job.createdAt
      ? new Date(job.createdAt as unknown as Date).toISOString()
      : undefined;
    const updatedAt = job.updatedAt
      ? new Date(job.updatedAt as unknown as Date).toISOString()
      : undefined;

    return {
      // Coerce nullable DB fields to non-null strings to satisfy AppJobPost
      id: job.id,
      jobPostId: job.jobPostId,
      companyName: job.companyName ?? "",
      companyProfile: job.companyProfile ?? "",
      jobTitle: job.jobTitle ?? "",
      jobLocation: job.jobLocation ?? "",
      minSalary: job.minSalary,
      maxSalary: job.maxSalary,
      jobDescription: job.jobDescription ?? "",
      jobRequirements: job.jobRequirements ?? "",
      coreSkills: job.coreSkills ?? null,
      niceToHaveSkills: job.niceToHaveSkills ?? null,
      perks: job.perks ?? null,
      screeningQuestions: (job.screeningQuestions as any) ?? [],
      createdAt,
      updatedAt,
      jobCategories: jobCategoriesArr,
      jobSubcategories: jobSubcategoriesArr,
      categories,
    };
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<JobDetailPageProps>;
}) {
  const resolvedParams = await params;

  // Validate that id is provided and is a string
  if (!resolvedParams.id || typeof resolvedParams.id !== "string") {
    notFound();
  }

  const job = await getJobById(resolvedParams.id);

  if (!job) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <Link href={ROUTES.jobs}>
        <Button variant="ghost">← Back to Explore Jobs</Button>
      </Link>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <JobPostDetailsCard jobPost={job} mode="view" />

        {/* Apply Button */}
        <div className="pt-6 flex justify-center">
          <button className="w-full sm:w-auto px-8 py-3 mx-4 bg-orange-600 text-white font-semibold rounded-lg hover:bg-orange-700 transition-colors">
            Apply for this Position
          </button>
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<JobDetailPageProps>;
}) {
  const resolvedParams = await params;

  // Validate that id is provided and is a string
  if (!resolvedParams.id || typeof resolvedParams.id !== "string") {
    return {
      title: "Job Not Found",
    };
  }

  const job = await getJobById(resolvedParams.id);

  if (!job) {
    return {
      title: "Job Not Found",
    };
  }

  return {
    title: `${job.jobTitle} at ${job.companyName}`,
    description:
      job.jobDescription?.slice(0, 160) || "View job details and apply.",
  };
}
