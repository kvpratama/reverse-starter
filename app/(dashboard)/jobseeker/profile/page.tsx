import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/session";
import { getJobseekerProfiles } from "@/lib/db/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileActiveToggle } from "@/components/dashboard/ProfileActiveToggle";
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
            <p className="text-sm text-gray-500">
              {profile.bio ? profile.bio.slice(0, 100) : ""}...
            </p>
            {/* <p className="text-sm text-gray-500">Skills: {profile.skills}</p> */}
            {/* <p className="text-sm text-gray-500">
              Experience: {profile.experience}
            </p> */}
            {/* <p className="text-sm text-gray-500">
              Desired Salary: ${profile.desiredSalary}
            </p> */}
            {/* <a
              href={profile.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              View Resume
            </a> */}
          </CardContent>
          <CardFooter className="flex items-center justify-between">
            <ProfileActiveToggle
              profileId={profile.id}
              active={Boolean(profile.active)}
            />
            <Link href={`/jobseeker/profile/${profile.id}`}>
              <Button
                variant="outline"
                className="bg-orange-500 hover:bg-orange-600 text-white hover:text-white rounded-full hover:cursor-pointer"
              >
                View Profile
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
