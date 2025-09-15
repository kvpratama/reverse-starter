import { Button } from "@/components/ui/button";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { JobseekerProfileCard } from "@/components/dashboard/JobseekerProfileCard";

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

  return (
    <section className="flex-1 p-4 lg:p-8">
      <div className="mb-4">
        <Link href="/jobseeker/profile">
          <Button variant="ghost">← Back to Profiles</Button>
        </Link>
      </div>
      <JobseekerProfileCard profileId={id} />
    </section>
  );
}
