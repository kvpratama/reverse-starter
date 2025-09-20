import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  FileText,
  GraduationCap,
  Briefcase,
  Globe,
  Award,
} from "lucide-react";
import type { JobseekerProfile } from "@/app/types/types";

export function JobseekerProfileCardUI({
  profile,
  screeningQuestions,
  screeningAnswers,
}: {
  profile: JobseekerProfile;
  screeningQuestions?: { question: string }[];
  screeningAnswers?: { answer: string }[];
}) {
  return (
    <Card className="max-w-4xl mx-auto shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
      {profile.profileName && profile.email && (
        <CardHeader className="pb-4 bg-gradient-to-r rounded-t-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <User className="h-6 w-6 text-orange-500" />
                {profile.profileName}
              </CardTitle>

              <CardDescription className="text-lg flex items-center gap-2 text-orange-500">
                <Mail className="h-6 w-6" />
                {profile.email}
              </CardDescription>
            </div>
          </div>
          <Separator />
        </CardHeader>
      )}

      <CardContent className="p-6 space-y-8">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <User className="h-4 w-4 text-orange-500" />
              Full Name
            </div>
            <p className="font-semibold text-gray-900">
              {profile.name || "Not provided"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Calendar className="h-4 w-4 text-orange-500" />
              Age
            </div>
            <p className="font-semibold text-gray-900">
              {profile.age ?? "Not specified"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <Globe className="h-4 w-4 text-orange-500" />
              Visa Status
            </div>
            <p className="font-semibold text-gray-900">
              {profile.visaStatus || "Not specified"}
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
              <MapPin className="h-4 w-4 text-orange-500" />
              Nationality
            </div>
            <p className="font-semibold text-gray-900">
              {profile.nationality || "Not specified"}
            </p>
          </div>
        </div>

        <Separator />

        {/* Job Category & Role */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-orange-500" />
            Career Focus
          </h3>
          <div className="flex flex-wrap items-center gap-2">
            {profile.jobCategory?.name && (
              <Badge
                variant="secondary"
                className="bg-orange-100 text-orange-800 hover:bg-orange-200 px-3 py-1"
              >
                {profile.jobCategory.name}
              </Badge>
            )}
            {profile.jobSubcategory?.name && (
              <>
                <span className="text-gray-400">→</span>
                <Badge
                  variant="secondary"
                  className="bg-orange-200 text-orange-900 hover:bg-orange-300 px-3 py-1"
                >
                  {profile.jobSubcategory.name}
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Skills */}
        {profile?.skills && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-orange-500" />
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.split(",").map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200 text-orange-800 hover:bg-orange-100 transition-colors"
                >
                  {skill.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              About
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-400">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap break-words">
                {profile.bio}
              </p>
            </div>
          </div>
        )}

        {/* Work Experience */}
        {Array.isArray(profile.workExperience) &&
          profile.workExperience.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-orange-500" />
                Work Experience
              </h3>
              <div className="space-y-4">
                {profile.workExperience.map((we, index) => (
                  <div
                    key={we.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {we.position || "Position not specified"}
                        </h4>
                        <p className="text-orange-600 font-medium">
                          {we.company || "Company not specified"}
                        </p>
                      </div>
                      {(we.startDate || we.endDate) && (
                        <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0 ml-4">
                          <Calendar className="h-4 w-4" />
                          {[we.startDate, we.endDate]
                            .filter(Boolean)
                            .join(" - ")}
                        </div>
                      )}
                    </div>
                    {we.description && (
                      <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words mt-3 pl-4 border-l-2 border-orange-200">
                        {we.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Education */}
        {Array.isArray(profile.education) && profile.education.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-orange-500" />
              Education
            </h3>
            <div className="space-y-4">
              {profile.education.map((ed, index) => (
                <div
                  key={ed.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {ed.degree || "Degree not specified"}
                      </h4>
                      <p className="text-orange-600 font-medium">
                        {ed.institution || "Institution not specified"}
                      </p>
                      {ed.fieldOfStudy && (
                        <p className="text-sm text-gray-600 mt-1">
                          Field: {ed.fieldOfStudy}
                        </p>
                      )}
                    </div>
                    {(ed.startDate || ed.endDate) && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 shrink-0 ml-4">
                        <Calendar className="h-4 w-4" />
                        {[ed.startDate, ed.endDate].filter(Boolean).join(" - ")}
                      </div>
                    )}
                  </div>
                  {ed.description && (
                    <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap break-words mt-3 pl-4 border-l-2 border-orange-200">
                      {ed.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Screening Q&A */}
        {((screeningQuestions && screeningQuestions.length > 0) ||
          (screeningAnswers && screeningAnswers.length > 0)) && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-500" />
              Screening Questions
            </h3>
            <div className="space-y-4">
              {Array.from({
                length: Math.max(
                  screeningQuestions?.length || 0,
                  screeningAnswers?.length || 0,
                ),
              }).map((_, idx) => {
                const q = screeningQuestions?.[idx]?.question;
                const a = screeningAnswers?.[idx]?.answer;
                return (
                  <div
                    key={idx}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4"
                  >
                    <div className="text-sm font-semibold text-blue-900 mb-2">
                      Q{idx + 1}: {q || `Question ${idx + 1}`}
                    </div>
                    <div className="text-sm text-gray-700 pl-4 border-l-2 border-blue-300 whitespace-pre-wrap">
                      {a || "No answer provided."}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {profile.resumeUrl && (
          <a
            href={profile.resumeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0"
          >
            <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-md transition-all duration-200 hover:shadow-lg">
              <FileText className="h-4 w-4 mr-2" />
              View Resume
            </Button>
          </a>
        )}
      </CardContent>
    </Card>
  );
}
