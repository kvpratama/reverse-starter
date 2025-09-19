import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Building2, MapPin, FileText, Users, Gift, HelpCircle, Briefcase, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SkillsInput from "@/components/dashboard/SkillsInput";
import { JobPost } from "@/app/types/types";

// Server Component: displays job post details
export default function JobPostDetailsCard({
  jobPost,
  disabled=false,
}: {
  jobPost: JobPost;
  disabled?: boolean;
}) {
  const FormSection = ({ 
    title, 
    icon: Icon, 
    children, 
    className = "" 
  }: { 
    title: string; 
    icon: any; 
    children: React.ReactNode; 
    className?: string;
  }) => (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
        <div className="p-2 bg-orange-50 rounded-lg">
          <Icon className="h-5 w-5 text-orange-600" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
  const InputField = ({
    label,
    id,
    name,
    placeholder,
    defaultValue,
    required = false,
    disabled = false,
    component = "input",
    rows = 4,
    description,
  }: {
    label: string;
    id: string;
    name: string;
    placeholder: string;
    defaultValue?: string;
    required?: boolean;
    disabled?: boolean;
    component?: "input" | "textarea";
    rows?: number;
    description?: string;
  }) => {
    const commonClasses =
      "transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500";
  
    if (disabled) {
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className="text-sm font-medium text-orange-700">
            {label}
          </Label>
          <p className="text-sm text-gray-500 text-muted-foreground whitespace-pre-wrap">{defaultValue}</p>
        </div>
      );
    }
  
    const Component = component === "input" ? Input : Textarea;
    const props = {
      id,
      name,
      placeholder,
      defaultValue,
      required,
      disabled,
      rows: component === "textarea" ? rows : undefined,
      className:
        component === "textarea"
          ? `${commonClasses} resize-none`
          : commonClasses,
    };
  
    return (
      <div className="space-y-2">
        <Label htmlFor={id} className="text-sm font-medium text-orange-700 flex items-center gap-1">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && <p className="text-xs text-gray-500">{description}</p>}
        <Component {...props} />
      </div>
    );
  };
  return (
    <>
      <div className="min-h-screen bg-white rounded-lg">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        {/* <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Post a New Job
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Create an engaging job listing to attract the best candidates for your team
          </p>
        </div> */}

        <form className="space-y-8">
          {/* Company Information */}
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <FormSection title="Company Information" icon={Building2}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <InputField
                    label="Company Name"
                    id="companyName"
                    name="companyName"
                    placeholder="e.g., TechCorp Inc."
                    defaultValue={jobPost.companyName || ""}
                    required
                    disabled={disabled}
                  />
                  <InputField
                    label="Job Location"
                    id="location"
                    name="location"
                    placeholder="e.g., San Francisco, CA (Remote)"
                    defaultValue={jobPost.jobLocation || ""}
                    required
                    disabled={disabled}
                  />
                </div>
                <InputField
                  label="Company Profile"
                  id="companyProfile"
                  name="companyProfile"
                  placeholder="Tell candidates about your company culture, mission, and what makes it a great place to work..."
                  defaultValue={jobPost.companyProfile || ""}
                  component="textarea"
                  rows={6}
                  required
                  description="This helps candidates understand your company better"
                  disabled={disabled}
                />
              </FormSection>
            </CardContent>
          </Card>

          {/* Job Details */}
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <FormSection title="Job Details" icon={FileText}>
                <InputField
                  label="Job Title"
                  id="title"
                  name="title"
                  placeholder="e.g., Senior Full Stack Developer"
                  defaultValue={jobPost.jobTitle || ""}
                  required
                  disabled={disabled}
                />
                
                {/* <div>
                  <Label className="text-sm font-medium text-gray-700 mb-2 block">
                    Job Category <span className="text-red-500">*</span>
                  </Label>
                  <JobCategorySelector isDisabled={isPending} />
                </div> */}

                <InputField
                  label="Job Description"
                  id="description"
                  name="description"
                  placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                  defaultValue={jobPost.jobDescription || ""}
                  component="textarea"
                  rows={8}
                  required
                  description="Be specific about daily responsibilities and team dynamics"
                  disabled={disabled}
                />

                <InputField
                  label="Job Requirements"
                  id="requirements"
                  name="requirements"
                  placeholder="List the required qualifications, experience, and technical skills..."
                  defaultValue={jobPost.jobRequirements || ""}
                  component="textarea"
                  rows={8}
                  required
                  description="Include years of experience, education, and must-have skills"
                  disabled={disabled}
                />
              </FormSection>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <FormSection title="Required Skills" icon={Star}>
                <div className="gap-6 ">
                  <div className="space-y-2 mb-6">
                    <Label className="text-sm font-medium text-orange-700">
                      Core Skills <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Essential skills candidates must have
                    </p>
                    <SkillsInput
                      id="coreSkills"
                      name="coreSkills"
                      placeholder="Add core skills (press Enter to add)"
                      defaultValue={jobPost.coreSkills || ""}
                      disabled={disabled}  
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-orange-700">
                      Nice-to-have Skills<span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-500 mb-2">
                      Bonus skills that would be great to have
                    </p>
                    <SkillsInput
                      id="niceToHaveSkills"
                      name="niceToHaveSkills"
                      placeholder="Add nice-to-have skills (press Enter to add)"
                      defaultValue={jobPost.niceToHaveSkills || ""}
                      disabled={disabled}
                    />
                  </div>
                </div>
              </FormSection>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <FormSection title="Perks & Benefits" icon={Gift}>
                <InputField
                  label="Perks & Benefits"
                  id="perks"
                  name="perks"
                  placeholder="List the benefits, perks, and compensation details that make this role attractive..."
                  defaultValue={jobPost.perks || ""}
                  component="textarea"
                  rows={6}
                  description="Include salary range, health benefits, vacation time, remote work options, etc."
                  disabled={disabled}
                />
              </FormSection>
            </CardContent>
          </Card>

          {/* Screening Questions */}
          {jobPost.jobScreeningQuestions && (
          <Card className="shadow-sm border-0 bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <FormSection title="Screening Questions" icon={HelpCircle}>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Ask up to 3 questions to help screen candidates before interviews
                  </p>
                  <InputField
                    label="Screening Question 1"
                    id="screeningQuestion1"
                    name="screeningQuestion1"
                    placeholder="e.g., What interests you most about this role?"
                    defaultValue={jobPost.jobScreeningQuestions?.[0].question || ""}
                    required
                  />
                  <InputField
                    label="Screening Question 2"
                    id="screeningQuestion2"
                    name="screeningQuestion2"
                    placeholder="e.g., Describe your experience with [relevant technology/skill]"
                    defaultValue={jobPost.jobScreeningQuestions?.[1].question || ""}
                    required
                  />
                  <InputField
                    label="Screening Question 3"
                    id="screeningQuestion3"
                    name="screeningQuestion3"
                    placeholder="e.g., What are your long-term career goals?"
                    defaultValue={jobPost.jobScreeningQuestions?.[2].question || ""}
                    required
                  />
                </div>
              </FormSection>
            </CardContent>
          </Card>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            {!disabled ? (
              <Button
                type="submit"
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                // disabled={disabled}
            >
              Update
            </Button>
            ) : (
              <p></p>
            )}
          </div>
        </form>
      </div>
    </div>
    </>
  );
}
