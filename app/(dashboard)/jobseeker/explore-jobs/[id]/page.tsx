import { notFound } from "next/navigation";
import { db } from "@/lib/db/drizzle";
import {
  jobPosts,
  jobPostSubcategories,
  jobSubcategories,
  jobCategories,
} from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import {
  MapPin,
  Building2,
  Calendar,
  Briefcase,
  Award,
  Gift,
  ArrowLeft,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

interface JobDetailPageProps {
  id: string;
}

const formatCurrency = (value: number | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
};

async function getJobById(id: string) {
  try {
    const [job] = await db
      .select({
        id: jobPosts.id,
        userId: jobPosts.userId,
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
    const categories = await db
      .select({
        categoryName: jobCategories.name,
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

    return { ...job, categories };
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

  const coreSkills = job.coreSkills?.split(",").filter(Boolean) || [];
  const niceToHaveSkills =
    job.niceToHaveSkills?.split(",").filter(Boolean) || [];
  const perks = job.perks?.split("\n").filter(Boolean) || [];
  const minSalary = formatCurrency(job.minSalary ?? null);
  const maxSalary = formatCurrency(job.maxSalary ?? null);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href={ROUTES.jobs}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        {/* Main Job Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white">
            <div className="flex items-start gap-3 mb-3">
              <Building2 className="h-6 w-6 flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-lg font-medium opacity-90">
                  {job.companyName || "Company Name Not Provided"}
                </h2>
                <h1 className="text-3xl font-bold mt-1">
                  {job.jobTitle || "Job Title Not Provided"}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4 text-sm">
              {job.jobLocation && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.jobLocation}</span>
                </div>
              )}
              {minSalary && maxSalary && (
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span>
                    {minSalary} - {maxSalary}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
              {job.updatedAt !== job.createdAt && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Updated {new Date(job.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Categories */}
            {job.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {job.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm"
                  >
                    {cat.categoryName} • {cat.subcategoryName}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="px-8 py-8 space-y-8">
            {/* Company Profile */}
            {job.companyProfile && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-gray-600" />
                  About the Company
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.companyProfile}
                </p>
              </section>
            )}

            {/* Job Description */}
            {job.jobDescription && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-gray-600" />
                  Job Description
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.jobDescription}
                </p>
              </section>
            )}

            {/* Requirements */}
            {job.jobRequirements && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-gray-600" />
                  Requirements
                </h2>
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {job.jobRequirements}
                </p>
              </section>
            )}

            {/* Core Skills */}
            {coreSkills.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {coreSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Nice to Have Skills */}
            {niceToHaveSkills.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">
                  Nice to Have
                </h2>
                <div className="flex flex-wrap gap-2">
                  {niceToHaveSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Perks */}
            {perks.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Gift className="h-5 w-5 text-gray-600" />
                  Perks & Benefits
                </h2>
                <ul className="space-y-2">
                  {perks.map((perk, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-gray-700"
                    >
                      <span className="text-blue-600 mt-1">•</span>
                      <span>{perk.trim()}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Apply Button */}
            <div className="pt-6 border-t border-gray-200">
              <button className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                Apply for this Position
              </button>
            </div>
          </div>
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
