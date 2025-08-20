import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getJobseekerProfiles } from "@/lib/db/queries";

export default async function JobseekerProfilePage() {
  const session = await getSession();
  const profiles = await getJobseekerProfiles(session?.user?.id || "");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {profiles.map((profile) => (
        <Card key={profile.id}>
          <CardHeader>
            <CardTitle>{profile.profileName}</CardTitle>
            <CardDescription>{profile.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Bio: {profile.bio}</p>
            <p className="text-sm text-gray-500">Skills: {profile.skills}</p>
            <p className="text-sm text-gray-500">
              Experience: {profile.experience}
            </p>
            <p className="text-sm text-gray-500">
              Desired Salary: ${profile.desiredSalary}
            </p>
            <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Resume
            </a>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
