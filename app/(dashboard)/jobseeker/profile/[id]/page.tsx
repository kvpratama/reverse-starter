import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { getJobseekerProfileById } from "@/lib/db/queries";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.user?.id) {
    notFound();
  }

  const profile = await getJobseekerProfileById(id, session.user.id);
  if (!profile) {
    notFound();
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-4">
        <Link href="/jobseeker/profile">
          <Button variant="ghost">← Back to Profiles</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{profile.profileName}</CardTitle>
          <CardDescription>{profile.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Full name</p>
                <p className="font-medium">{profile.name || "-"}</p>
              </div>
              {/* <div>
                <p className="text-sm text-muted-foreground">Experience level</p>
                <p className="font-medium capitalize">{profile.experience || "-"}</p>
              </div> */}
              {/* <div>
                <p className="text-sm text-muted-foreground">Desired salary</p>
                <p className="font-medium">{profile.desiredSalary ? `$${profile.desiredSalary.toLocaleString()}` : "-"}</p>
              </div> */}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Skills</p>
                <p className="text-sm whitespace-pre-wrap break-words">
                  {profile.skills || "-"}
                </p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bio</p>
            <p className="font-small whitespace-pre-wrap break-words">
              {profile.bio || "-"}
            </p>
          </div>

          {profile.resumeUrl && (
            <div className="mt-6">
              <Link
                href={profile.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="rounded-full bg-orange-500 hover:bg-orange-600 text-white hover:text-white hover:cursor-pointer">
                  View Resume
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
