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
  params: { id: string };
}) {
  const { id } = params;
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
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Desired salary</p>
                <p className="font-medium">
                  {profile.desiredSalary != null && !Number.isNaN(profile.desiredSalary)
                    ? `$${Number(profile.desiredSalary).toLocaleString()}`
                    : "-"}
                </p>
              </div> */}
              <div>
                <p className="text-sm text-muted-foreground">Category {'>'} Subcategory {'>'} Role</p>
                <p className="font-medium">{profile.jobCategory?.name ?? "-"} {'>'} {profile.jobSubcategory?.name ?? "-"} {'>'} {profile.jobRole?.name ?? "-"}</p>
              </div>
              {/* <div>
                <p className="text-sm text-muted-foreground">Subcategory</p>
                <p className="font-medium">{profile.jobSubcategory?.name ?? "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium">{profile.jobRole?.name ?? "-"}</p>
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

          {/* Work Experience */}
          {Array.isArray(profile.workExperience) && profile.workExperience.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <div className="mt-3 space-y-4">
                {profile.workExperience.map((we: any) => (
                  <div key={we.id} className="border rounded p-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{we.company || ""}</span>
                      <span>
                        {[we.startDate, we.endDate].filter(Boolean).join(" - ")}
                      </span>
                    </div>
                    <div className="font-medium">{we.position || ""}</div>
                    {we.description && (
                      <p className="text-sm mt-1 whitespace-pre-wrap break-words">{we.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {Array.isArray(profile.education) && profile.education.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold">Education</h3>
              <div className="mt-3 space-y-4">
                {profile.education.map((ed: any) => (
                  <div key={ed.id} className="border rounded p-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{ed.institution || ""}</span>
                      <span>
                        {[ed.startDate, ed.endDate].filter(Boolean).join(" - ")}
                      </span>
                    </div>
                    <div className="font-medium">{ed.degree || ""}</div>
                    {ed.fieldOfStudy && (
                      <div className="text-sm">Field: {ed.fieldOfStudy}</div>
                    )}
                    {ed.description && (
                      <p className="text-sm mt-1 whitespace-pre-wrap break-words">{ed.description}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
