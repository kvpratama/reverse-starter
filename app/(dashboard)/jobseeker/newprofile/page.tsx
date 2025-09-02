"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import JobCategorySelector from "@/components/dashboard/JobCategorySelector";
import { Loader2 } from "lucide-react";
import SkillsInput from "@/components/dashboard/SkillsInput";
import WorkExperienceSection from "@/components/dashboard/WorkExperienceSection";
import EducationSection from "@/components/dashboard/EducationSection";
import {
  handleResumeUploadAndAnalysis,
  createProfileFromAnalysis,
} from "@/app/(dashboard)/jobseeker/newprofile/actions";
import { Textarea } from "@/components/ui/textarea";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ActionState = {
  error?: string;
  success?: boolean;
  analysis?: {
    name: string;
    email?: string;
    bio: string;
    skills: string;
    fileurl: string;
    // experience: string;
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
};


export default function NewProfilePage() {
  const [uploadState, uploadAction, isUploading] = useActionState<
    ActionState,
    FormData
  >(handleResumeUploadAndAnalysis, {});

  const [createState, createAction, isCreating] = useActionState<
    ActionState,
    FormData
  >(createProfileFromAnalysis, {});

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        New Profile from Resume
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        {!uploadState.success && !uploadState.analysis && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Your Resume</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" action={uploadAction}>
                <div>
                  <Label htmlFor="resume" className="mb-2">
                    Resume (PDF)
                  </Label>
                  <Input
                    id="resume"
                    name="resume"
                    type="file"
                    required
                    accept="application/pdf"
                    disabled={isUploading}
                  />
                </div>
                {uploadState.error && (
                  <p className="text-red-500 text-sm">{uploadState.error}</p>
                )}
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    "Upload"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
      {uploadState.success && uploadState.analysis && (
        <Card>
          <CardContent>
            <form className="space-y-4" action={createAction}>
              <div>
                <h2 className="text-2xl text-gray-900 mb-2">
                  Profile Name
                </h2>
                <Input
                  id="profileName"
                  name="profileName"
                  placeholder="e.g. Frontend Developer Profile"
                  required
                  disabled={isCreating}
                />
              </div>
              <div>
                <JobCategorySelector />
              </div>
              <div>
                {/* a disable field for resume */}
                <h2 className="text-2xl text-gray-900 mb-2">
                  Your Resume (PDF)
                </h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="hidden"
                    id="resumeLink"
                    name="resumeLink"
                    value={uploadState.analysis.fileurl}
                    readOnly
                  />
                  <a
                    className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                    href={uploadState.analysis.fileurl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open
                  </a>
                </div>
              </div>
              <div>
                <h2 className="text-2xl text-gray-900 mb-2">
                  Your Name
                </h2>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. John Doe"
                  defaultValue={uploadState.analysis.name}
                  disabled={isCreating}
                />
              </div>
              <div>
                {/* <Label htmlFor="email" className="mb-2">
                  Email
                </Label> */}
                <Input
                  id="email"
                  name="email"
                  placeholder="e.g. example@example.com"
                  defaultValue={uploadState.analysis.email}
                  disabled={isCreating}
                  hidden
                />
              </div>
              <div>
                <h2 className="text-2xl text-gray-900 mb-2">
                  Bio
                </h2>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself"
                  defaultValue={uploadState.analysis.bio}
                  rows={12}
                  disabled={isCreating}
                />
              </div>
              {/* Editable sections from parsed resume */}
              {Array.isArray(uploadState.analysis.work_experience) &&
                uploadState.analysis.work_experience.length > 0 && (
                  <WorkExperienceSection
                    experiences={uploadState.analysis.work_experience}
                    disabled={isCreating}
                  />
                )}
              {Array.isArray(uploadState.analysis.education) &&
                uploadState.analysis.education.length > 0 && (
                  <EducationSection
                    educations={uploadState.analysis.education}
                    disabled={isCreating}
                  />
                )}
              <div>
                <Label htmlFor="skills" className="mb-2">
                  Skills
                </Label>
                <SkillsInput
                  id="skills"
                  name="skills"
                  placeholder="e.g. React, Node.js, TypeScript"
                  defaultValue={uploadState.analysis.skills}
                  disabled={isCreating}
                />
              </div>
              {/* <div>
                <Label className="mb-2">Experience Level</Label>
                <RadioGroup
                  name="experience"
                  className="flex space-x-4"
                  defaultValue={uploadState.analysis.experience}
                  disabled={isCreating}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="entry" id="entry" />
                    <Label htmlFor="entry">Entry</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mid" id="mid" />
                    <Label htmlFor="mid">Mid-level</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="senior" id="senior" />
                    <Label htmlFor="senior">Senior</Label>
                  </div>
                </RadioGroup>
              </div> */}
              {/* <div>
                <Label htmlFor="desiredSalary" className="mb-2">
                  Desired Yearly Salary (Won)
                </Label>
                <Input
                  id="desiredSalary"
                  name="desiredSalary"
                  type="number"
                  placeholder="e.g. 100000"
                  disabled={isCreating}
                />
              </div> */}
              {createState.error && (
                <p className="text-red-500 text-sm">{createState.error}</p>
              )}
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Profile"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
