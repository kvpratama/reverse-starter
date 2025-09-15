import { Card, CardContent } from "@/components/ui/card";

// Server Component: displays job post details
export default function JobPostDetailsCard({
  jobPost,
}: {
  jobPost: {
    jobTitle?: string | null;
    jobDescription?: string | null;
    jobRequirements?: string | null;
    coreSkills?: string | null;
    niceToHaveSkills?: string | null;
    perks?: string | null;
    jobCategory?: { name?: string | null } | null;
    jobSubcategory?: { name?: string | null } | null;
    jobRole?: { name?: string | null } | null;
  };
}) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        {jobPost.jobCategory || jobPost.jobSubcategory || jobPost.jobRole ? (
          <div>
            <h3 className="font-semibold">Job Category</h3>
            <p className="text-muted-foreground">
              <span className="text-orange-300">
                {jobPost.jobCategory ? jobPost.jobCategory.name : "-"}
              </span>
              {" > "}
              <span className="text-orange-400">
                {jobPost.jobSubcategory ? jobPost.jobSubcategory.name : "-"}
              </span>
              {" > "}
              <span className="text-orange-500">
                {jobPost.jobRole ? jobPost.jobRole.name : "-"}
              </span>
            </p>
          </div>
        ) : null}
        <div>
          <h3 className="font-semibold">Job Description</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {jobPost.jobDescription}
          </p>
        </div>
        <div>
          <h3 className="font-semibold">Job Requirements</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {jobPost.jobRequirements}
          </p>
        </div>
        {jobPost.coreSkills ? (
          <div>
            <h3 className="font-semibold">Core Skills</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobPost.coreSkills}
            </p>
          </div>
        ) : null}
        {jobPost.niceToHaveSkills ? (
          <div>
            <h3 className="font-semibold">Nice To Have Skills</h3>
            <p className="text-muted-foreground whitespace-pre-wrap">
              {jobPost.niceToHaveSkills}
            </p>
          </div>
        ) : null}
        <div>
          <h3 className="font-semibold">Perks</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {jobPost.perks}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
