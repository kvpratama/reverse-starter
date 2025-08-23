import Link from "next/link";
import { getUser, getJobPostWithCandidatesForUser } from "@/lib/db/queries";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function JobPostDetailPage(
  props: { params: Promise<{ id: string }> }
) {
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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{jobPost.jobTitle}</h1>
        <Link href="/recruiter/my-job-postings">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold">Description</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{jobPost.jobDescription}</p>
          </div>
          <div>
            <h3 className="font-semibold">Requirements</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{jobPost.jobRequirements}</p>
          </div>
          <div>
            <h3 className="font-semibold">Perks</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">{jobPost.perks}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Potential Candidates ({candidates.length})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {candidates.length === 0 ? (
            <p className="text-muted-foreground">No candidates yet.</p>
          ) : (
            <ul className="space-y-3">
              {candidates.map((c) => (
                <li key={c.id} className="border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        {c.profile?.name || c.profile?.profileName || "Unnamed Profile"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {/* {c.profile?.email} */}
                        {/* {c.profile?.experience ? ` • ${c.profile.experience}` : ""} */}
                        {typeof c.profile?.desiredSalary === "number"
                          ? ` • $${c.profile.desiredSalary.toLocaleString()}`
                          : ""}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Match: {Math.round((c.similarityScore || 0) * 100)}%
                    </div>
                  </div>
                  {c.profile?.skills ? (
                    <div className="mt-2 text-sm">
                      <span className="font-medium">Skills:</span> {c.profile.skills}
                    </div>
                  ) : null}
                  {c.profile?.bio ? (
                    <div className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">
                      {c.profile.bio}
                    </div>
                  ) : null}
                  {/* {c.profile?.resumeUrl ? (
                    <div className="mt-2">
                      <a
                        className="text-primary underline underline-offset-4"
                        href={c.profile.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        View Resume
                      </a>
                    </div>
                  ) : null} */}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
