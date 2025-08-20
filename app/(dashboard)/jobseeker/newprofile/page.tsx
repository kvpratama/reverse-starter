'use client';

import { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { handleResumeUploadAndAnalysis } from '@/app/(dashboard)/jobseeker/newprofile/actions';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

type ActionState = {
  error?: string;
  success?: boolean;
  analysis?: {
    blobUrl: string;
    bio: string;
    skills: string;
    fileurl: string;
    experience: string;
  }
};

export default function NewProfilePage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(
    handleResumeUploadAndAnalysis,
    {}
  );

  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium text-gray-900 mb-6">
        New Profile from Resume
      </h1>

      {!state.success && !state.analysis && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Your Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" action={formAction}>
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
                />
              </div>
              {state.error && (
                <p className="text-red-500 text-sm">{state.error}</p>
              )}
              <Button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 text-white"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Upload and Analyze'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {state.success && state.analysis && (
        <Card>
        <CardHeader>
          <CardTitle>Create a new Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" action={formAction}>
            <div>
              <Label htmlFor="profileName" className="mb-2">
                Profile Name
              </Label>
              <Input
                id="profileName"
                name="profileName"
                placeholder="e.g. Frontend Developer Profile"
                required
              />
            </div>
            <div>
              {/* a disable field for resume */}
              <Label htmlFor="resume" className="mb-2">
                Resume (PDF)
              </Label>
              <div className="flex items-center space-x-2">
                <input type="hidden" id="resumeLink" name="resumeLink" value={state.analysis.fileurl} readOnly/>
                <a className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded" href={state.analysis.fileurl} target="_blank" rel="noopener noreferrer">Open</a>
              </div>
            </div>
            <div>
              <Label htmlFor="bio" className="mb-2">
                Bio
              </Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="Tell us about yourself"
                defaultValue={state.analysis.bio}
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
                defaultValue={state.analysis.skills}
              />
            </div>
            <div>
              <Label className="mb-2">Experience Level</Label>
              <RadioGroup
                name="experience"
                className="flex space-x-4"
                defaultValue={state.analysis.experience}
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
                Desired Salary
              </Label>
              <Input
                id="desiredSalary"
                name="desiredSalary"
                type="number"
                placeholder="e.g. 100000"
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
                  Uploading...
                </>
              ) : (
                'Create Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      )}
    </section>
  );
}
