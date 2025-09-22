import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getSession } from "@/lib/auth/session";
import { getJobseekerProfiles } from "@/lib/db/queries";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProfileActiveToggle } from "@/components/dashboard/ProfileActiveToggle";
import { User, FileText, Eye, Edit, Plus, Users, Award } from "lucide-react";

export default async function JobseekerProfilePage() {
  const session = await getSession();
  const profiles = await getJobseekerProfiles(session?.user?.id || "");

  if (!session?.user?.id) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <Users className="w-8 h-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              You must be logged in to view your profiles.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 mx-auto bg-orange-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-orange-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900">
              No Profiles Yet
            </h2>
            <p className="text-gray-600">
              Kickstart your job search by creating your first profile—start
              applying for roles and get noticed by top employers.
            </p>
          </div>
          <Link href="/jobseeker/create-profile">
            <Button className="bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Create Your Profile
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Profiles</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Creating multiple profiles lets you highlight different strengths
            and boosts your chances of being noticed by employers.
          </p>
        </div>
        <Link href="/jobseeker/newprofile">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md">
            <Plus className="w-4 h-4 mr-2" />
            Create New Profile
          </Button>
        </Link>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {profiles.map((profile) => (
          <Card
            key={profile.id}
            className="hover:shadow-lg transition-all duration-300 border-0 shadow-md bg-gradient-to-br from-white to-gray-50"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <CardTitle className="text-lg font-bold text-gray-900 leading-tight">
                    {profile.profileName}
                  </CardTitle>
                  {/* <CardDescription className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-orange-500" />
                    {profile.email}
                  </CardDescription> */}
                </div>
                {/* <div className="flex items-center gap-2">
                  <Badge 
                    variant={profile.active ? "default" : "secondary"}
                    className={profile.active 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-gray-100 text-gray-600 border-gray-200"
                    }
                  >
                    {profile.active ? "Active" : "Inactive"}
                  </Badge>
                </div> */}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Basic Info
              <div className="grid grid-cols-2 gap-4 text-sm">
                {profile.name && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <User className="w-3 h-3" />
                      <span className="text-xs font-medium">Name</span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{profile.name}</p>
                  </div>
                )}
                
                {profile.age && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span className="text-xs font-medium">Age</span>
                    </div>
                    <p className="font-medium text-gray-900">{profile.age}</p>
                  </div>
                )}

                {profile.nationality && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <Globe className="w-3 h-3" />
                      <span className="text-xs font-medium">Nationality</span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{profile.nationality}</p>
                  </div>
                )}

                {profile.visaStatus && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-1 text-gray-500">
                      <FileText className="w-3 h-3" />
                      <span className="text-xs font-medium">Visa Status</span>
                    </div>
                    <p className="font-medium text-gray-900 truncate">{profile.visaStatus}</p>
                  </div>
                )}
              </div> */}

              {/* Skills */}
              {profile.skills && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <Award className="w-3 h-3" />
                    <span className="text-xs font-medium">Skills</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {profile.skills
                      .split(",")
                      .slice(0, 3)
                      .map((skill, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs bg-orange-50 border-orange-200 text-orange-800"
                        >
                          {skill.trim()}
                        </Badge>
                      ))}
                    {profile.skills.split(",").length > 3 && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-gray-100 border-gray-300 text-gray-600"
                      >
                        +{profile.skills.split(",").length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Bio */}
              {profile.bio && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-gray-500">
                    <FileText className="w-3 h-3" />
                    <span className="text-xs font-medium">About</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                    {profile.bio.length > 120
                      ? `${profile.bio.slice(0, 120)}...`
                      : profile.bio}
                  </p>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-4">
              <div className="flex flex-col gap-3 w-full">
                {/* Toggle and Resume Link */}
                <div className="flex items-center justify-between w-full min-h-[32px]">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <ProfileActiveToggle
                      profileId={profile.id}
                      active={Boolean(profile.active)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full">
                  <Link
                    href={`/jobseeker/profile/${profile.id}`}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white shadow-sm transition-all duration-200 hover:shadow-md"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Profile
                    </Button>
                  </Link>
                  <Link href={`/jobseeker/profile/${profile.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-orange-200 text-orange-600 hover:bg-orange-50 hover:border-orange-300 shadow-sm"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Stats Footer */}
      <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {profiles.length} Profile{profiles.length !== 1 ? "s" : ""}{" "}
                Created
              </p>
              <p className="text-xs text-gray-600">
                {profiles.filter((p) => p.active).length} active,{" "}
                {profiles.filter((p) => !p.active).length} inactive
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
