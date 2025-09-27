"use client";
import {
  Loader2,
  FileText,
  User,
  Briefcase,
  GraduationCap,
  Globe,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import JobCategorySelector from "@/components/dashboard/JobCategorySelector";
import SkillsInput from "@/components/dashboard/SkillsInput";
import WorkExperienceSection from "@/components/dashboard/WorkExperienceSection";
import EducationSection from "@/components/dashboard/EducationSection";
import VisaCategorySelect from "@/components/dashboard/VisaCategorySelect";
import NationalitySelect from "@/components/dashboard/NationalitySelect";
import { useTransition } from "react";
import { JobCategoriesData } from "@/app/types/types";

export type AnalysisDefaults = {
  name: string;
  email?: string;
  age: number;
  visaStatus: string;
  nationality: string;
  bio: string;
  skills: string;
  fileurl: string;
  work_experience?: Array<{
    start_date: string;
    end_date: string;
    position: string;
    company: string;
    description: string;
  }>;
  education?: Array<{
    start_date: string;
    end_date: string;
    degree: string;
    field_of_study: string;
    institution: string;
    description: string;
  }>;
};

export default function CreateProfileForm({
  action,
  isCreating,
  defaults,
  error,
  jobCategoriesData,
}: {
  action: (formData: FormData) => void;
  isCreating: boolean;
  defaults: AnalysisDefaults;
  error?: string;
  jobCategoriesData: JobCategoriesData;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(() => {
      const form = e.currentTarget as HTMLFormElement;
      const formData = new FormData();

      // Collect all form data
      const inputs = form.querySelectorAll("input, textarea, select");
      inputs.forEach((input: any) => {
        if (
          input.name &&
          input.value &&
          !input.disabled &&
          input.type !== "hidden"
        ) {
          formData.append(input.name, input.value);
        }
        if (input.type === "hidden" && input.name) {
          formData.append(input.name, input.value);
        }
      });

      action(formData);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Create Your Profile
          </h1>
          <p className="text-lg text-gray-600">
            Build a comprehensive profile to showcase your skills and experience
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Name Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  1
                </Badge>
                Profile Name
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                id="profileName"
                name="profileName"
                placeholder="Name this profile e.g. Senior Sales Manager Profile"
                required
                disabled={isCreating || isPending}
                className="h-12 text-lg border-2 focus:border-orange-400 transition-colors"
              />
            </CardContent>
          </Card>

          {/* Job Category Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  2
                </Badge>
                <Briefcase className="w-5 h-5" />
                Job Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JobCategorySelector isDisabled={isCreating || isPending} category="" subcategories={[]} jobCategories={jobCategoriesData} />
            </CardContent>
          </Card>

          {/* Resume Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  3
                </Badge>
                <FileText className="w-5 h-5" />
                Resume Document
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-2 border-orange-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Resume.pdf</p>
                    <p className="text-sm text-gray-600">
                      Your uploaded resume document
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="bg-white hover:bg-orange-50 border-orange-300"
                  onClick={() => window.open(defaults.fileurl, "_blank")}
                >
                  View PDF
                </Button>
              </div>
              <input
                type="hidden"
                id="resumeLink"
                name="resumeLink"
                value={defaults.fileurl}
                readOnly
              />
            </CardContent>
          </Card>

          {/* Personal Information Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  4
                </Badge>
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div>
                <Label
                  htmlFor="name"
                  className="text-base font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. John Doe"
                  defaultValue={defaults.name}
                  disabled={isCreating || isPending}
                  className="h-12 text-lg border-2 focus:border-orange-400 transition-colors"
                />
              </div>

              {/* Hidden Email */}
              <Input
                id="email"
                name="email"
                placeholder="e.g. example@example.com"
                defaultValue={defaults.email}
                disabled={isCreating || isPending}
                className="hidden"
              />

              {/* Age, Visa, Nationality Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label
                    htmlFor="age"
                    className="text-base font-medium text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    Age
                  </Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    min="18"
                    max="120"
                    required
                    disabled={isCreating || isPending}
                    className="text-lg focus:border-orange-400 transition-colors"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="visaStatus"
                    className="text-base font-medium text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Visa Status
                  </Label>
                  <VisaCategorySelect
                    id="visaStatus"
                    name="visaStatus"
                    required
                    placeholderOptionLabel="Select visa status"
                    disabled={isCreating || isPending}
                  />
                </div>
                <div>
                  <Label
                    htmlFor="nationality"
                    className="text-base font-medium text-gray-700 mb-2 flex items-center gap-2"
                  >
                    <Globe className="w-4 h-4" />
                    Nationality
                  </Label>
                  <NationalitySelect
                    id="nationality"
                    name="nationality"
                    required
                    placeholderOptionLabel="Select nationality"
                    disabled={isCreating || isPending}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bio Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  5
                </Badge>
                Professional Bio
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Share your professional story, achievements, and career goals
              </p>
            </CardHeader>
            <CardContent>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about your professional background, key achievements, and career objectives..."
                defaultValue={defaults.bio}
                rows={12}
                disabled={isCreating || isPending}
                className="text-base border-2 focus:border-orange-400 transition-colors resize-none"
              />
            </CardContent>
          </Card>

          {/* Work Experience Section */}
          {Array.isArray(defaults.work_experience) &&
            defaults.work_experience.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                    <Badge
                      variant="secondary"
                      className="w-6 h-6 rounded-full p-4 flex items-center justify-center"
                    >
                      6
                    </Badge>
                    <Briefcase className="w-5 h-5" />
                    Work Experience
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {defaults.work_experience.length} position
                    {defaults.work_experience.length !== 1 ? "s" : ""} found in
                    your resume
                  </p>
                </CardHeader>
                <CardContent>
                  <WorkExperienceSection
                    experiences={defaults.work_experience}
                    disabled={isCreating || isPending}
                  />
                </CardContent>
              </Card>
            )}

          {/* Education Section */}
          {Array.isArray(defaults.education) &&
            defaults.education.length > 0 && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                    <Badge
                      variant="secondary"
                      className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                    >
                      7
                    </Badge>
                    <GraduationCap className="w-5 h-5" />
                    Education
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {defaults.education.length} qualification
                    {defaults.education.length !== 1 ? "s" : ""} found in your
                    resume
                  </p>
                </CardHeader>
                <CardContent>
                  <EducationSection
                    educations={defaults.education}
                    disabled={isCreating || isPending}
                  />
                </CardContent>
              </Card>
            )}

          {/* Skills Section */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
                <Badge
                  variant="secondary"
                  className="w-6 h-6 rounded-full p-0 flex items-center justify-center"
                >
                  8
                </Badge>
                Skills & Technologies
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Add your technical skills, tools, and technologies
              </p>
            </CardHeader>
            <CardContent>
              <SkillsInput
                id="skills"
                name="skills"
                placeholder="Press Enter to add; e.g. Software Development, Presentation, Project Management, Leadership"
                defaultValue={defaults.skills}
                disabled={isCreating || isPending}
              />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <p className="text-red-600 text-sm flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded-full flex-shrink-0"></span>
                  {error}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Submit Button */}
          <div className="text-center pt-4">
            <Button
              type="submit"
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              disabled={isCreating || isPending}
            >
              {isCreating || isPending ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Creating Your Profile...
                </>
              ) : (
                <>
                  <User className="mr-3 h-5 w-5" />
                  Create Profile
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
