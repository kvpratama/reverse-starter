import { Suspense } from "react";
import { db } from "@/lib/db/drizzle";
import {
  jobPosts,
  jobPostSubcategories,
  jobSubcategories,
  jobCategories,
} from "@/lib/db/schema";
import { and, desc, eq, ilike, or, sql, gte, lte, isNull } from "drizzle-orm";
import JobsGrid from "@/app/(dashboard)/jobseeker/explore-jobs/components/JobsGrid";
import JobsPagination from "@/app/(dashboard)/jobseeker/explore-jobs/components/JobsPagination";
import JobsSkeleton from "@/app/(dashboard)/jobseeker/explore-jobs/components/JobsSkeleton";
import JobsSearchFilterForm from "@/app/(dashboard)/jobseeker/explore-jobs/components/JobsSearchFilterForm";

type SearchParams = {
  page?: string;
  limit?: string;
  q?: string; // search query
  location?: string;
  minSalary?: string;
  maxSalary?: string;
  category?: string;
  subcategory?: string;
  sort?: "latest" | "oldest";
};

interface ExploreJobsPageProps {
  searchParams: Promise<SearchParams>;
}

async function getJobs(searchParams: Promise<SearchParams>) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const limit = parseInt(params.limit || "10");
  const offset = (page - 1) * limit;

  // Build WHERE conditions
  const conditions = [
    isNull(jobPosts.deletedAt), // Only active jobs
  ];

  // Search query - search across multiple fields
  if (params.q) {
    const searchTerm = `%${params.q}%`;
    conditions.push(
      or(
        ilike(jobPosts.jobTitle, searchTerm),
        ilike(jobPosts.jobDescription, searchTerm),
        ilike(jobPosts.companyName, searchTerm),
        ilike(jobPosts.coreSkills, searchTerm),
        ilike(jobPosts.niceToHaveSkills, searchTerm)
      )!
    );
  }

  // Location filter
  if (params.location) {
    conditions.push(ilike(jobPosts.jobLocation, `%${params.location}%`));
  }

  // Category filter - ensure job has at least one subcategory under the selected category
  if (params.category) {
    conditions.push(
      sql`exists (
        select 1 from ${jobPostSubcategories}
        where ${jobPostSubcategories.jobPostId} = ${jobPosts.id}
          and ${jobPostSubcategories.subcategoryId} in (
            select ${jobSubcategories.id} from ${jobSubcategories}
            where ${jobSubcategories.categoryId} = ${params.category}
          )
      )`
    );
  }

  // Subcategory filter - ensure job is tagged with the selected subcategory
  if (params.subcategory) {
    conditions.push(
      sql`exists (
        select 1 from ${jobPostSubcategories}
        where ${jobPostSubcategories.jobPostId} = ${jobPosts.id}
          and ${jobPostSubcategories.subcategoryId} = ${params.subcategory}
      )`
    );
  }

  let minSalaryFilter: number | undefined;
  if (params.minSalary) {
    const parsed = parseInt(params.minSalary, 10);
    if (!Number.isNaN(parsed)) {
      minSalaryFilter = parsed;
    }
  }

  let maxSalaryFilter: number | undefined;
  if (params.maxSalary) {
    const parsed = parseInt(params.maxSalary, 10);
    if (!Number.isNaN(parsed)) {
      maxSalaryFilter = parsed;
    }
  }

  if (
    minSalaryFilter !== undefined &&
    maxSalaryFilter !== undefined &&
    minSalaryFilter > maxSalaryFilter
  ) {
    const temp = minSalaryFilter;
    minSalaryFilter = maxSalaryFilter;
    maxSalaryFilter = temp;
  }

  if (minSalaryFilter !== undefined) {
    conditions.push(gte(jobPosts.minSalary, minSalaryFilter));
  }

  if (maxSalaryFilter !== undefined) {
    conditions.push(lte(jobPosts.maxSalary, maxSalaryFilter));
  }

  // Sorting
  const orderBy =
    params.sort === "oldest" ? jobPosts.createdAt : desc(jobPosts.createdAt);

  try {
    // Get jobs with pagination
    const jobs = await db
      .select({
        id: jobPosts.id,
        companyName: jobPosts.companyName,
        jobTitle: jobPosts.jobTitle,
        jobLocation: jobPosts.jobLocation,
        jobDescription: jobPosts.jobDescription,
        coreSkills: jobPosts.coreSkills,
        minSalary: jobPosts.minSalary,
        maxSalary: jobPosts.maxSalary,
        perks: jobPosts.perks,
        createdAt: jobPosts.createdAt,
        updatedAt: jobPosts.updatedAt,
      })
      .from(jobPosts)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(jobPosts)
      .where(and(...conditions));

    return {
      jobs,
      total: Number(count),
      page,
      limit,
      totalPages: Math.ceil(Number(count) / limit),
    };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return {
      jobs: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }
}

async function getFilterOptions() {
  try {
    // Get all categories with their subcategories
    const categories = await db
      .select({
        id: jobCategories.id,
        name: jobCategories.name,
      })
      .from(jobCategories);

    const subcategories = await db
      .select({
        id: jobSubcategories.id,
        name: jobSubcategories.name,
        categoryId: jobSubcategories.categoryId,
      })
      .from(jobSubcategories);

    // Get unique locations from job posts
    const locations = await db
      .selectDistinct({ location: jobPosts.jobLocation })
      .from(jobPosts)
      .where(
        and(
          isNull(jobPosts.deletedAt),
          sql`${jobPosts.jobLocation} IS NOT NULL AND ${jobPosts.jobLocation} != ''`
        )
      )
      .orderBy(jobPosts.jobLocation);

    return {
      categories,
      subcategories,
      locations: locations.map((l) => l.location).filter(Boolean) as string[],
    };
  } catch (error) {
    console.error("Error fetching filter options:", error);
    return {
      categories: [],
      subcategories: [],
      locations: [],
    };
  }
}

export default async function ExploreJobsPage({
  searchParams,
}: ExploreJobsPageProps) {
  const resolvedSearchParams = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Explore Jobs
          </h1>
          <p className="text-gray-600">
            Find your next opportunity from thousands of available positions
          </p>
        </div>

        {/* Search Bar */}
        <Suspense
          fallback={
            <div className="h-12 bg-white rounded-lg animate-pulse mb-6" />
          }
        >
          <JobsSearchFilterForm
            filterOptions={await getFilterOptions()}
            initialQuery={resolvedSearchParams.q}
            searchParams={resolvedSearchParams}
            children={<JobsGrid jobs={[]} />}
          />
        </Suspense>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          {/* <aside className="lg:w-64 flex-shrink-0">
            <Suspense fallback={<div className="bg-white rounded-lg p-6 h-96 animate-pulse" />}>
              <FiltersWrapper searchParams={resolvedSearchParams} />
            </Suspense>
          </aside> */}

          {/* Jobs Grid */}
          <main className="flex-1">
            <Suspense fallback={<JobsSkeleton />}>
              <JobsContent searchParams={searchParams} />
            </Suspense>
          </main>
        </div>
      </div>
    </div>
  );
}

// async function FiltersWrapper({ searchParams }: { searchParams: SearchParams }) {
//   const filterOptions = await getFilterOptions();
//   return <JobsFilters filterOptions={filterOptions} searchParams={searchParams} />;
// }

async function JobsContent({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const result = await getJobs(searchParams);

  if (result.jobs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No jobs found
        </h3>
        <p className="text-gray-600">
          Try adjusting your filters or search criteria
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Results Header */}
      <div className="bg-orange-50 rounded-lg px-6 py-4 mb-6 flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-semibold">{result.jobs.length}</span> of{" "}
          <span className="font-semibold">{result.total}</span> jobs
        </p>
        <div className="text-sm text-gray-500">
          Page {result.page} of {result.totalPages}
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-8">
        {result.totalPages > 1 ? (
          <JobsPagination
            currentPage={result.page}
            totalPages={result.totalPages}
            searchParams={params}
            children={<JobsGrid jobs={result.jobs} />}
          />
        ) : (
          <JobsGrid jobs={result.jobs} />
        )}
      </div>
    </>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ searchParams }: ExploreJobsPageProps) {
  const params = await searchParams;
  const query = params.q || "";
  const location = params.location || "";

  let title = "Explore Jobs";
  let description = "Browse and search through thousands of job opportunities.";

  if (query && location) {
    title = `${query} Jobs in ${location}`;
    description = `Find ${query} positions in ${location}. Search and apply to the latest job openings.`;
  } else if (query) {
    title = `${query} Jobs`;
    description = `Find ${query} positions. Search and apply to the latest job openings.`;
  } else if (location) {
    title = `Jobs in ${location}`;
    description = `Browse job opportunities in ${location}. Find and apply to the latest positions.`;
  }

  return {
    title,
    description,
  };
}
