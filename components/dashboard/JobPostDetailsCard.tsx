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
    jobScreeningQuestions?: { question: string }[];
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
              {/* {" > "}
              <span className="text-orange-500">
                {jobPost.jobRole ? jobPost.jobRole.name : "-"}
              </span> */}
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
          <div className="flex flex-wrap gap-2 text-md">
            <span className="font-semibold text-gray-700">Skills:</span>
            {jobPost.coreSkills
              .split(",")
              .map((skill: string, index: number) => (
                <span
                  key={index}
                  className="bg-orange-400 text-gray-800 px-3 py-2 rounded-full text-sm font-medium"
                >
                  {skill.trim()}
                </span>
              ))}
          </div>
        ) : null}
        {jobPost.niceToHaveSkills ? (
          <div className="flex flex-wrap gap-2 text-md">
            <span className="font-semibold text-gray-700">
              Nice To Have Skills:
            </span>
            {jobPost.niceToHaveSkills
              .split(",")
              .map((skill: string, index: number) => (
                <span
                  key={index}
                  className="bg-orange-400 text-gray-800 px-3 py-2 rounded-full text-sm font-medium"
                >
                  {skill.trim()}
                </span>
              ))}
          </div>
        ) : null}
        <div>
          <h3 className="font-semibold">Perks</h3>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {jobPost.perks}
          </p>
        </div>
        {jobPost.jobScreeningQuestions &&
        jobPost.jobScreeningQuestions.length > 0 ? (
          <div className="mt-4">
            <h3 className="font-semibold text-lg">Screening Questions</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {jobPost.jobScreeningQuestions.map((q, index) => (
                <li key={index} className="pl-2">
                  {q.question}
                </li>
              ))}
            </ol>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
