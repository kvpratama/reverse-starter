import { getUser } from "@/lib/db/queries";
import { getJobPostsByUser } from "@/lib/db/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
  CardFooter,
} from "@/components/ui/card";

export default async function MyJobsPage() {
  const user = await getUser();

  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }

  const jobPosts = await getJobPostsByUser(user.id);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {jobPosts.map((jobPost) => (
        <Card key={jobPost.id}>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {jobPost.jobTitle}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-muted-foreground">
              {jobPost.jobDescription && jobPost.jobDescription.length > 100
                ? `${jobPost.jobDescription.slice(0, 100)}...`
                : jobPost.jobDescription}
            </p>
          </CardContent>
          <CardContent>
            <p className="text-muted-foreground">
              Last updated:{" "}
              {jobPost.updatedAt.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </CardContent>
          <CardFooter>
            <Link href={`/recruiter/my-job-postings/${jobPost.id}`}>
              <Button
                size="sm"
                variant="outline"
                className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white rounded-full hover:cursor-pointer"
              >
                View Job Posting
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
