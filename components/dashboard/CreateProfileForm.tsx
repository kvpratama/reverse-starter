"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import JobCategorySelector from "@/components/dashboard/JobCategorySelector";
import SkillsInput from "@/components/dashboard/SkillsInput";
import WorkExperienceSection from "@/components/dashboard/WorkExperienceSection";
import EducationSection from "@/components/dashboard/EducationSection";
import VisaCategorySelect from "@/components/dashboard/VisaCategorySelect";
import NationalitySelect from "@/components/dashboard/NationalitySelect";

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
}: {
  action: (formData: FormData) => void;
  isCreating: boolean;
  defaults: AnalysisDefaults;
  error?: string;
}) {
  return (
    <Card>
      <CardContent>
        <form className="space-y-4" action={action}>
          <div>
            <h2 className="text-2xl text-gray-900 mb-2">Profile Name</h2>
            <Input
              id="profileName"
              name="profileName"
              placeholder="e.g. Sales Manager Profile"
              required
              disabled={isCreating}
            />
          </div>

          <div>
            <JobCategorySelector />
          </div>

          <div>
            <h2 className="text-2xl text-gray-900 mb-2">Your Resume (PDF)</h2>
            <div className="flex items-center space-x-2">
              <input
                type="hidden"
                id="resumeLink"
                name="resumeLink"
                value={defaults.fileurl}
                readOnly
              />
              <a
                className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded"
                href={defaults.fileurl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open
              </a>
            </div>
          </div>

          <div>
            <h2 className="text-2xl text-gray-900 mb-2">Your Name</h2>
            <Input
              id="name"
              name="name"
              placeholder="e.g. John Doe"
              defaultValue={defaults.name}
              disabled={isCreating}
            />
          </div>

          <div>
            <Input
              id="email"
              name="email"
              placeholder="e.g. example@example.com"
              defaultValue={defaults.email}
              disabled={isCreating}
              hidden
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="age" className="mb-2">
                Age
              </Label>
              <Input
                id="age"
                name="age"
                type="number"
                min="18"
                max="120"
                required
                disabled={isCreating}
              />
            </div>
            <div>
              <Label htmlFor="visaStatus" className="mb-2">
                Visa Status
              </Label>
              <VisaCategorySelect
                id="visaStatus"
                name="visaStatus"
                required
                placeholderOptionLabel="Select a visa status"
                disabled={isCreating}
              />
            </div>
            <div>
              <Label htmlFor="nationality" className="mb-2">
                Nationality
              </Label>
              <NationalitySelect
                id="nationality"
                name="nationality"
                required
                placeholderOptionLabel="Select nationality"
                disabled={isCreating}
              />
            </div>
          </div>

          <div>
            <h2 className="text-2xl text-gray-900 mb-2">Bio</h2>
            <Textarea
              id="bio"
              name="bio"
              placeholder="Tell us about yourself"
              defaultValue={defaults.bio}
              rows={12}
              disabled={isCreating}
            />
          </div>

          {Array.isArray(defaults.work_experience) &&
            defaults.work_experience.length > 0 && (
              <WorkExperienceSection
                experiences={defaults.work_experience}
                disabled={isCreating}
              />
            )}

          {Array.isArray(defaults.education) &&
            defaults.education.length > 0 && (
              <EducationSection
                educations={defaults.education}
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
              defaultValue={defaults.skills}
              disabled={isCreating}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

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
  );
}
