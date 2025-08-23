import { getUser } from "@/lib/db/queries";
import { getJobPostsByUser } from "@/lib/db/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardAction, CardFooter } from "@/components/ui/card";

export default async function MyJobsPage() {
  const user = await getUser();

  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }

  const jobPosts = await getJobPostsByUser(user.id);

  return (
    <div>
      <h1 className="text-2xl font-bold">My Jobs</h1>
      <div className="mt-4 space-y-3">
        {jobPosts.map((jobPost) => (
          <Card key={jobPost.id}>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{jobPost.jobTitle}</CardTitle>
              <CardAction>
                <Link href={`/recruiter/my-job-postings/${jobPost.id}`}>
                  <Button size="sm" variant="outline" className="bg-orange-500 text-white hover:bg-orange-600 hover:text-white">View</Button>
                </Link>
              </CardAction>
            </CardHeader>
            
            
            <CardContent>
              <p className="text-muted-foreground">
                {jobPost.jobDescription && jobPost.jobDescription.length > 100
                  ? `${jobPost.jobDescription.slice(0, 100)}...`
                  : jobPost.jobDescription}
              </p>
            </CardContent>
            <CardFooter>
              <p className="text-muted-foreground">
                Last updated: {jobPost.updatedAt.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}