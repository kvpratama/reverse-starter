import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/ui/card";
import ProgressRing from "@/components/ui/progress-ring"; // Import the new component

// Server Component: displays a grid of candidate match cards
export default function CandidatesCard({
  candidates,
}: {
  candidates: Array<{
    id: string;
    similarityScore?: number | 0;
    similarityScoreBio?: number | 0;
    similarityScoreSkills?: number | 0;
    profile?: {
      id: string;
      profileName?: string | null;
      name?: string | null;
      email: string;
      resumeUrl: string;
      bio?: string | null;
      skills?: string | null;
      experience?: string | null;
      desiredSalary?: number | null;
      workExperience?: Array<{
        id: string;
        startDate?: string | null;
        endDate?: string | null;
        position?: string | null;
        company?: string | null;
        description?: string | null;
      }>;
      education?: Array<{
        id: string;
        startDate?: string | null;
        endDate?: string | null;
        degree?: string | null;
        institution?: string | null;
        fieldOfStudy?: string | null;
        description?: string | null;
      }>;
    };
  }>;
}) {
  const candidatesToRender = candidates.length > 0 ? candidates : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Potential Candidates ({candidatesToRender.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {candidatesToRender.length === 0 ? (
          <p className="text-muted-foreground">No candidates yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {candidatesToRender.map((c) => {
              const overallScore = Math.round((c.similarityScore || 0));
              const bioScore = Math.round((c.similarityScoreBio || 0));
              const skillsScore = Math.round((c.similarityScoreSkills || 0));

              // Support both nested profile shape and legacy flat mock shape
              const cAny = c as any;
              const name = cAny.name ?? cAny.profile?.name ?? "Unnamed Profile";
              const skills = cAny.skills ?? cAny.profile?.skills ?? "";
              const bio = cAny.bio ?? cAny.profile?.bio ?? "";

              const latestWork = cAny.profile?.workExperience?.[0];
              const latestEdu = cAny.profile?.education?.[0];

              return (
                <Card key={c.id} className="h-full flex flex-col justify-between">
                  <div>
                    <CardHeader className="border-b pb-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-semibold">
                          {name}
                        </CardTitle>
                      </div>
                      <CardAction className="flex space-x-4 pt-2 text-sm text-gray-500">
                        <ProgressRing score={overallScore} title="Overall" size="md" />
                        <ProgressRing score={bioScore} title="Bio" size="md" />
                        <ProgressRing score={skillsScore} title="Skills" size="md" />
                      </CardAction>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {skills && (
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="font-semibold text-gray-700">Skills:</span>
                          {skills.split(',').map((skill: string, index: number) => (
                            <span
                              key={index}
                              className="bg-orange-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {bio && (
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                          {bio.length > 150 ? `${bio.substring(0, 150)}... ` : bio}
                          {bio.length > 150 && (
                            <Link href="#" className="text-blue-500 hover:underline">
                              Read more
                            </Link>
                          )}
                        </div>
                      )}
                      {latestWork && (
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Latest Experience:</span>{" "}
                          <span>
                            {latestWork.position || "Role"}
                            {latestWork.company ? ` @ ${latestWork.company}` : ""}
                          </span>
                          {(latestWork.startDate || latestWork.endDate) && (
                            <span className="text-gray-500">{` (${latestWork.startDate || ""}${latestWork.endDate ? ` - ${latestWork.endDate}` : ""})`}</span>
                          )}
                        </div>
                      )}
                      {latestEdu && (
                        <div className="text-sm text-gray-700">
                          <span className="font-semibold">Education:</span>{" "}
                          <span>
                            {latestEdu.degree || "Degree"}
                            {latestEdu.fieldOfStudy ? ` in ${latestEdu.fieldOfStudy}` : ""}
                            {latestEdu.institution ? ` @ ${latestEdu.institution}` : ""}
                          </span>
                          {(latestEdu.startDate || latestEdu.endDate) && (
                            <span className="text-gray-500">{` (${latestEdu.startDate || ""}${latestEdu.endDate ? ` - ${latestEdu.endDate}` : ""})`}</span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </div>
                  <CardFooter className="pt-4">
                    <Link href="#">
                      <Button
                        size="sm"
                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-full transition-colors"
                      >
                        Invite for Interview
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}