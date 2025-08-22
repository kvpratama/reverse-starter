"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import {
  handleResumeUploadAndAnalysis,
  createProfileFromAnalysis,
} from "@/app/(dashboard)/jobseeker/newprofile/actions";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type ActionState = {
  error?: string;
  success?: boolean;
  analysis?: {
    name: string;
    email: string;
    bio: string;
    skills: string;
    fileurl: string;
    experience: string;
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

      {uploadState.success && uploadState.analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Create a new Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action={createAction}>
              <input
                type="hidden"
                name="resumeLink"
                value={uploadState.analysis.fileurl}
              />
              <div>
                <Label htmlFor="profileName" className="mb-2">
                  Profile Name
                </Label>
                <Input
                  id="profileName"
                  name="profileName"
                  placeholder="e.g. Frontend Developer Profile"
                  required
                  disabled={isCreating}
                />
              </div>
              <div>
                {/* a disable field for resume */}
                <Label htmlFor="resume" className="mb-2">
                  Resume (PDF)
                </Label>
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
                <Label htmlFor="name" className="mb-2">
                  Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g. John Doe"
                  defaultValue={uploadState.analysis.name}
                  disabled={isCreating}
                />
              </div>
              <div>
                <Label htmlFor="email" className="mb-2">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  placeholder="e.g. example@example.com"
                  defaultValue={uploadState.analysis.email}
                  disabled={isCreating}
                />
              </div>
              <div>
                <Label htmlFor="bio" className="mb-2">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  name="bio"
                  placeholder="Tell us about yourself"
                  defaultValue={uploadState.analysis.bio}
                  disabled={isCreating}
                />
              </div>
              <div>
                <Label htmlFor="skills" className="mb-2">
                  Skills
                </Label>
                <Input
                  id="skills"
                  name="skills"
                  placeholder="e.g. React, Node.js, TypeScript"
                  defaultValue={uploadState.analysis.skills}
                  disabled={isCreating}
                />
              </div>
              <div>
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
              </div>
              <div>
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
              </div>
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
