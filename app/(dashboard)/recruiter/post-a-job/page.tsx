"use client";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { postJob } from "./actions";
import { Textarea } from "@/components/ui/textarea";
import JobCategorySelector from "@/components/dashboard/JobCategorySelector";
import SkillsInput from "@/components/dashboard/SkillsInput";

type ActionState = {
  companyName?: string;
  companyProfile?: string;
  title?: string;
  location?: string;
  description?: string;
  requirements?: string;
  perks?: string;
  error?: string;
  success?: string;
};

export default function PostAJobPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    postJob,
    {},
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        Post a Job
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
          <div>
              <Label htmlFor="companyName" className="mb-2">
                Company Name
              </Label>
              <Input
                id="companyName"
                name="companyName"
                placeholder="Enter the company name"
                defaultValue={state.companyName}
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="companyProfile" className="mb-2">
                Company Profile
              </Label>
              <Textarea
                id="companyProfile"
                name="companyProfile"
                placeholder="Enter the company profile"
                defaultValue={state.companyProfile}
                disabled={isPending}
                rows={10}
                required
              />
            </div>
            <div>
              <Label htmlFor="title" className="mb-2">
                Job Title
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="Enter the job title"
                defaultValue={state.title}
                disabled={isPending}
                required
              />
            </div>
            <div>
              <Label htmlFor="location" className="mb-2">
                Job Location
              </Label>
              <Input
                id="location"
                name="location"
                placeholder="Enter the job location"
                defaultValue={state.location}
                disabled={isPending}
                required
              />
            </div>
            {/* Job Category Selection */}
            <div>
              <Label className="mb-2">Job Category</Label>
              <div className="mt-2">
                <JobCategorySelector />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="mb-2">
                Job Description
              </Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Enter the job description"
                defaultValue={state.description}
                disabled={isPending}
                rows={10}
                required
              />
            </div>
            <div>
              <Label htmlFor="requirements" className="mb-2">
                Job Requirements
              </Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="Enter the job requirements"
                defaultValue={state.requirements}
                disabled={isPending}
                rows={10}
                required
              />
            </div>
            {/* Core Skills */}
            <div>
              <Label htmlFor="coreSkills" className="mb-2">
                Core Skills
              </Label>
              <SkillsInput
                id="coreSkills"
                name="coreSkills"
                placeholder="Add core skills (press Enter to add)"
                defaultValue={"Example Skill"}
                disabled={isPending}
              />
            </div>
            {/* Nice-to-have Skills */}
            <div>
              <Label htmlFor="niceToHaveSkills" className="mb-2">
                Nice-to-have Skills
              </Label>
              <SkillsInput
                id="niceToHaveSkills"
                name="niceToHaveSkills"
                placeholder="Add nice-to-have skills (press Enter to add)"
                defaultValue={"Example Skill"}
                disabled={isPending}
              />
            </div>
            <div>
              <Label htmlFor="perks" className="mb-2">
                Perks & Benefits
              </Label>
              <Textarea
                id="perks"
                name="perks"
                placeholder="Enter the perks and benefits"
                defaultValue={state.perks}
                disabled={isPending}
                rows={7}
              />
            </div>
            {state.error && (
              <p className="text-red-500 text-sm">{state.error}</p>
            )}
            {state.success && (
              <p className="text-green-500 text-sm">{state.success}</p>
            )}
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post Job"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </section>
  );
}

