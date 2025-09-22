import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { JobseekerProfileCardUI } from "@/components/dashboard/JobseekerProfileCardUI";
import { getJobseekerProfileById } from "@/lib/db/queries";
import { JobseekerProfile } from "@/app/types/types";
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
    return (
      <section className="flex-1 p-4 lg:p-8">
        <div className="mb-4">
          <Link href="/jobseeker/profile">
            <Button variant="ghost">← Back to Profiles</Button>
          </Link>
        </div>
        <p>Profile not found.</p>
      </section>
    );
  }

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-4">
        <Link href="/jobseeker/profile">
          <Button variant="ghost">← Back to Profiles</Button>
        </Link>
      </div>
      <JobseekerProfileCardUI profile={profile as JobseekerProfile} />
    </section>
  );
}
