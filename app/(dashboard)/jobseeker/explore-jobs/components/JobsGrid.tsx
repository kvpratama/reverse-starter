import { MapPin, Building2, Clock, ExternalLink, Wallet } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

interface Job {
  id: string;
  companyName: string | null;
  jobTitle: string | null;
  jobLocation: string | null;
  jobDescription: string | null;
  coreSkills: string | null;
  minSalary: number | null;
  maxSalary: number | null;
  perks: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface JobsGridProps {
  jobs: Job[];
}

export default function JobsGrid({ jobs }: JobsGridProps) {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  const truncateText = (text: string | null, maxLength: number) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const skills = job.coreSkills?.split(",").slice(0, 5) || [];

  const formatSalary = (value: number | null) => {
    if (value === null || value === undefined) return null;
    return new Intl.NumberFormat("ko-KR", {
      style: "currency",
      currency: "KRW",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formattedMinSalary = formatSalary(job.minSalary);
  const formattedMaxSalary = formatSalary(job.maxSalary);

  // Calculate time ago
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
  };

  const timeAgo = getTimeAgo(job.updatedAt);

  return (
    <Link
      href={ROUTES.job(job.id)}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-200 hover:border-orange-400"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Company and Title */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="h-4 w-4 text-orange-500 flex-shrink-0" />
              <span className="text-sm font-medium text-gray-600">
                {job.companyName || "Company Name Not Provided"}
              </span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 hover:text-orange-600 transition-colors">
              {job.jobTitle || "Job Title Not Provided"}
            </h3>
          </div>

          {/* Location and Time */}
          <div className="flex flex-wrap items-center gap-4 mb-3 text-sm text-gray-600">
            {job.jobLocation && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-orange-500" />
                <span>{job.jobLocation}</span>
              </div>
            )}
            {formattedMinSalary && formattedMaxSalary && (
              <div className="flex items-center gap-1">
                <Wallet className="h-4 w-4 text-orange-500" />
                <span>
                  {formattedMinSalary} - {formattedMaxSalary}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-orange-500" />
              <span>Updated {timeAgo}</span>
            </div>
          </div>

          {/* Description */}
          {job.jobDescription && (
            <p className="text-gray-700 mb-3 line-clamp-2">
              {job.jobDescription}
            </p>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full"
                >
                  {skill.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Perks Preview */}
          {job.perks && (
            <p className="text-sm text-gray-600">
              <span className="font-medium">Perks:</span>{" "}
              {truncateText(job.perks, 100)}
            </p>
          )}
        </div>

        {/* External Link Icon */}
        <div className="flex-shrink-0">
          <ExternalLink className="h-5 w-5 text-orange-500" />
        </div>
      </div>
    </Link>
  );
}
