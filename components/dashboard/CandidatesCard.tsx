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

// Server Component: displays a grid of candidate match cards
export default function CandidatesCard({
  candidates,
}: {
  candidates: Array<{
    id: string;
    similarityScore?: number | null;
    similarityScoreBio?: number | null;
    similarityScoreSkills?: number | null;
    profile?: {
      name?: string | null;
      profileName?: string | null;
      desiredSalary?: number | null;
      skills?: string | null;
      bio?: string | null;
    } | null;
  }>;
}) {
  return (
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
                    {c.profile?.name || c.profile?.profileName || "Unnamed Profile"}
                  </CardTitle>
                  <CardAction>
                    <div className="text-sm text-muted-foreground">
                      Overall Match: {Math.round((c.similarityScore || 0) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Bio Match: {Math.round((c.similarityScoreBio || 0) * 100)}%
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Skills Match: {Math.round((c.similarityScoreSkills || 0) * 100)}%
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
                      <span className="font-medium">Skills:</span> {c.profile.skills}
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
  );
}
