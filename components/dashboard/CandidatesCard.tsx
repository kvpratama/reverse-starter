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

// Mock data for debugging
const mockCandidates = [
  {
    id: "1",
    profileId: "1",
    similarityScore: 0.95,
    similarityScoreBio: 0.88,
    similarityScoreSkills: 0.75,
    status: "applied",
    name: "Alice Johnson",
    skills: "React, Next.js, TypeScript, Tailwind CSS, Node.js",
    bio: "A highly motivated software engineer with 5 years of experience in full-stack web development. Specializes in building scalable and performant applications using modern JavaScript frameworks. Passionate about clean code and continuous learning.",
  },
  {
    id: "2",
    profileId: "2",
    similarityScore: 0.72,
    similarityScoreBio: 0.55,
    similarityScoreSkills: 0.80,
    name: "Bob Smith",
    skills: "Python, Django, Flask, PostgreSQL",
    bio: "Backend developer with a focus on data analysis and API development. Experienced in building robust server-side applications and managing databases. Strong problem-solving skills and a collaborative team player.",
  },
  {
    id: "3",
    profileId: "3",
    similarityScore: 0.65,
    similarityScoreBio: 0.95,
    similarityScoreSkills: 0.52,
    name: "Charlie Brown",
    skills: "UI/UX Design, Figma, Sketch, Adobe XD",
    bio: "Creative and detail-oriented UI/UX designer with a passion for user-centric design. Skilled in wireframing, prototyping, and user research. Proven ability to translate complex concepts into intuitive and beautiful interfaces.",
  },
  {
    id: "4",
    profileId: "4",
    similarityScore: 0.81,
    similarityScoreBio: 0.70,
    similarityScoreSkills: 0.88,
    name: "Diana Prince",
    skills: "Golang, Docker, Kubernetes, AWS",
    bio: null,
  },
];

// Server Component: displays a grid of candidate match cards
export default function CandidatesCard({
  candidates,
}: {
  candidates: Array<{
    id: string;
    similarityScore?: number | null;
    similarityScoreBio?: number | null;
    similarityScoreSkills?: number | null;
    profileId?: string | null;
    name?: string | null;
    profileName?: string | null;
    desiredSalary?: number | null;
    skills?: string | null;
    bio?: string | null;
  }>;
}) {
  const candidatesToRender = candidates.length > 0 ? candidates : mockCandidates;

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
              const overallScore = Math.round((c.similarityScore || 0) * 100);
              const bioScore = Math.round((c.similarityScoreBio || 0) * 100);
              const skillsScore = Math.round((c.similarityScoreSkills || 0) * 100);
              
              return (
                <Card key={c.id} className="h-full flex flex-col justify-between">
                  <div>
                    <CardHeader className="border-b pb-4">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-xl font-semibold">
                          {c.name || "Unnamed Profile"}
                        </CardTitle>
                        
                      </div>
                      <CardAction className="flex space-x-4 pt-2 text-sm text-gray-500">
                        <ProgressRing score={overallScore} title="Overall" size="md" />
                        <ProgressRing score={bioScore} title="Bio" size="md" />
                        <ProgressRing score={skillsScore} title="Skills" size="md" />
                      </CardAction>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                      {c.skills && (
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span className="font-semibold text-gray-700">Skills:</span>
                          {c.skills.split(',').map((skill, index) => (
                            <span
                              key={index}
                              className="bg-orange-200 text-gray-800 px-2 py-1 rounded-full text-xs font-medium"
                            >
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                      {c.bio && (
                        <div className="text-sm text-gray-600 whitespace-pre-wrap">
                          {c.bio.length > 150
                            ? `${c.bio.substring(0, 150)}... `
                            : c.bio}
                          {c.bio.length > 150 && (
                            <Link href="#" className="text-blue-500 hover:underline">
                              Read more
                            </Link>
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