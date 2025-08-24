import Link from "next/link";
import { getUser, getJobPostWithCandidatesForUser } from "@/lib/db/queries";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function JobPostDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
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

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobPost.jobDescription}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Requirements</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobPost.jobRequirements}
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Perks</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobPost.perks}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Potential Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {candidates.length === 0 ? (
            <p className="text-muted-foreground">No candidates yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {candidates.map((c) => (
                <Card key={c.id} className="h-full">
                  <CardHeader className="border-b pb-4">
                    <CardTitle className="text-base">
                      {c.profile?.name ||
                        c.profile?.profileName ||
                        "Unnamed Profile"}
                    </CardTitle>
                    <CardAction>
                      <div className="text-sm text-muted-foreground">
                        Match: {Math.round((c.similarityScore || 0) * 100)}%
                      </div>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <div className="text-sm text-muted-foreground">
                      {typeof c.profile?.desiredSalary === "number"
                        ? `$${c.profile.desiredSalary.toLocaleString()}`
                        : null}
                    </div>
                    {c.profile?.skills ? (
                      <div className="text-sm">
                        <span className="font-medium">Skills:</span>{" "}
                        {c.profile.skills}
                      </div>
                    ) : null}
                    {c.profile?.bio ? (
                      <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {c.profile.bio}
                      </div>
                    ) : null}
                  </CardContent>
                  <CardFooter>
                    <Link href="#">
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white rounded-full hover:cursor-pointer"
                      >
                        Invite for Interview
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
