import { getUser } from "@/lib/db/queries";
import { getJobPostsByUser } from "@/lib/db/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Building2,
  MapPin,
  Users,
  Eye,
  Edit,
  Briefcase,
  Clock,
  Star,
} from "lucide-react";

export default async function MyJobsPage() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              You must be logged in to view your job postings.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const jobPosts = await getJobPostsByUser(user.id);

  if (jobPosts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              No Job Postings Yet
            </h2>
            <p className="text-gray-600">
              You haven't created any job postings yet. Create your first job
              posting to start attracting candidates.
            </p>
          </div>
          <Link href="/recruiter/post-a-job">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              Create First Job Posting
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Job Postings</h1>
          <p className="text-gray-600 mt-1">
            Manage and track your job postings
          </p>
        </div>
        <Link href="/recruiter/post-a-job">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
            <Briefcase className="w-4 h-4 mr-2" />
            Create New Job Posting
          </Button>
        </Link>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {jobPosts.map((jobPost) => (
          <Card
            key={jobPost.id}
            className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50"
          >
            <CardHeader className="">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
                    {jobPost.jobTitle}
                  </CardTitle>
                </div>
                {/* <Badge 
                  variant="secondary" 
                  className="bg-green-100 text-green-800 border-green-200 shrink-0"
                >
                  Active
                </Badge> */}
              </div>
            </CardHeader>

            <CardContent className="space-y-2">
              {jobPost.companyName && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  <span className="font-medium">{jobPost.companyName}</span>
                </div>
              )}
              {/* Location */}
              {jobPost.jobLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4 text-orange-500 shrink-0" />
                  <span className="font-medium">{jobPost.jobLocation}</span>
                </div>
              )}

              {/* Description */}
              {jobPost.jobDescription && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {jobPost.jobDescription.length > 120
                      ? `${jobPost.jobDescription.slice(0, 120)}...`
                      : jobPost.jobDescription}
                  </p>
                </div>
              )}

              {/* Core Skills */}
              {jobPost.coreSkills && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Star className="w-3 h-3" />
                    Core Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {jobPost.coreSkills
                      .split(",")
                      .slice(0, 3)
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100"
                        >
                          {skill.trim()}
                        </Badge>
                      ))}
                    {jobPost.coreSkills.split(",").length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-gray-100 border-gray-300 text-gray-600"
                      >
                        +{jobPost.coreSkills.split(",").length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  <span>
                    Updated{" "}
                    {jobPost.updatedAt.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-4 space-y-3">
              <div className="flex gap-2 w-full">
                <Link
                  href={`/recruiter/my-job-postings/${jobPost.id}`}
                  className="flex-1"
                >
                  <Button
                    size="sm"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
                <Link href={`/recruiter/my-job-postings/${jobPost.id}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 shadow-sm"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {jobPosts.length} Active Job Posting
                {jobPosts.length !== 1 ? "s" : ""}
              </p>
              <p className="text-xs text-gray-600">
                Last updated:{" "}
                {new Date().toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
          {/* <Link href="/recruiter/analytics">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-orange-600 hover:bg-orange-100"
            >
              View Analytics
            </Button>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
