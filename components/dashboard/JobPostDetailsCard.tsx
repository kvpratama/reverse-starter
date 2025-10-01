"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Building2,
  FileText,
  Gift,
  HelpCircle,
  Briefcase,
  Tags,
  Star,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SkillsInput from "@/components/dashboard/SkillsInput";
import { JobPost } from "@/app/types/types";
import JobCategorySelector from "./JobCategorySelector";
import { useActionState } from "react";
import { JobCategoriesData } from "@/app/types/types";

type ActionState = {
  companyName?: string;
  companyProfile?: string;
  title?: string;
  location?: string;
  description?: string;
  requirements?: string;
  perks?: string;
  screeningQuestion1?: string;
  screeningQuestion2?: string;
  screeningQuestion3?: string;
  coreSkills?: string;
  niceToHaveSkills?: string;
  category?: string;
  subcategories?: string[];
  subcategoryIds?: string[];
  error?: string;
  success?: string;
};

// Server Component: displays job post details
export default function JobPostDetailsCard({
  jobPost,
  mode = "view",
  formAction,
  submitButtonText = "Submit",
  submitButtonIcon: SubmitButtonIcon = Briefcase,
  jobCategories,
}: {
  jobPost?: JobPost;
  mode?: "view" | "edit" | "create";
  formAction?: (
    previousState: ActionState,
    formData: FormData,
  ) => Promise<ActionState>;
  submitButtonText?: string;
  submitButtonIcon?: React.ElementType;
  jobCategories?: JobCategoriesData;
}) {
  // Use useActionState to get both state and pending status
  const [formState, formActionHandler, isPending] = useActionState(
    formAction ?? (async () => ({}) as ActionState),
    {} as ActionState, // initial state with proper typing
  );

  const disabled = mode === "view";

  // Support both flattened name fields and nested objects from DB layer
  const categoryName =
    formState?.category ??
    (jobPost?.jobCategories && jobPost.jobCategories.length > 0
      ? jobPost.jobCategories[0].name
      : "");
  // Ensure subcategoryName is always string[]
  const subcategoryName: string[] = (() => {
    if (jobPost?.jobSubcategories && jobPost.jobSubcategories.length > 0) {
      return jobPost.jobSubcategories.map((s) => s.name);
    }
    return [];
  })();

  const FormSection = ({
    title,
    icon: Icon,
    children,
    className = "",
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
      <div className="space-y-4">{children}</div>
    </div>
  );

  const InputField = ({
    label,
    id,
    name,
    placeholder,
    defaultValue,
    required = true,
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

    // Disable inputs when form is submitting
    const fieldDisabled = disabled || isPending;

    if (disabled && !isPending) {
      return (
        <div className="space-y-2">
          <Label htmlFor={id} className="text-sm font-medium text-orange-700">
            {label}
          </Label>
          <p className="text-sm text-gray-500 text-muted-foreground whitespace-pre-wrap">
            {defaultValue}
          </p>
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
      disabled: fieldDisabled,
      rows: component === "textarea" ? rows : undefined,
      className:
        component === "textarea"
          ? `${commonClasses} resize-none ${fieldDisabled ? "opacity-60" : ""}`
          : `${commonClasses} ${fieldDisabled ? "opacity-60" : ""}`,
    };

    return (
      <div className="space-y-2">
        <Label
          htmlFor={id}
          className={`text-sm font-medium text-orange-700 flex items-center gap-1 ${
            fieldDisabled ? "opacity-60" : ""
          }`}
        >
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
        {description && (
          <p
            className={`text-xs text-gray-500 ${fieldDisabled ? "opacity-60" : ""}`}
          >
            {description}
          </p>
        )}
        <Component {...props} />
      </div>
    );
  };

  return (
    <>
      <div
        className="min-h-screen bg-white rounded-lg"
        data-testid="job-post-details-card"
      >
        <div className="max-w-4xl mx-auto p-4 lg:p-8">
          {/* Show error message */}
          {formState?.error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{formState.error}</p>
            </div>
          )}

          {/* Show success message */}
          {formState?.success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-600 text-sm">{formState.success}</p>
            </div>
          )}

          <form action={formActionHandler} className="space-y-8">
            {mode === "edit" && (
              <input type="hidden" name="jobPostId" value={jobPost?.id} />
            )}

            {/* Company Information */}
            <Card
              className={`shadow-sm border-0 bg-white/80 backdrop-blur-sm ${isPending ? "opacity-70" : ""}`}
            >
              <CardContent className="p-8">
                <FormSection title="Company Information" icon={Building2}>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <InputField
                      label="Company Name"
                      id="companyName"
                      name="companyName"
                      placeholder="e.g., TechCorp Inc."
                      defaultValue={
                        formState?.companyName ?? jobPost?.companyName ?? ""
                      }
                      required
                      disabled={disabled}
                    />
                    <InputField
                      label="Job Location"
                      id="location"
                      name="location"
                      placeholder="e.g., San Francisco, CA (Remote)"
                      defaultValue={
                        formState?.location ?? jobPost?.jobLocation ?? ""
                      }
                      required
                      disabled={disabled}
                    />
                  </div>
                  <InputField
                    label="Company Profile"
                    id="companyProfile"
                    name="companyProfile"
                    placeholder="Tell candidates about your company culture, mission, and what makes it a great place to work..."
                    defaultValue={
                      formState?.companyProfile ?? jobPost?.companyProfile ?? ""
                    }
                    component="textarea"
                    rows={6}
                    required
                    description="This helps candidates understand your company better"
                    disabled={disabled}
                  />
                </FormSection>
              </CardContent>
            </Card>

            {/* Job Category */}
            <Card
              className={`shadow-sm border-0 bg-white/80 backdrop-blur-sm ${isPending ? "opacity-70" : ""}`}
            >
              <CardContent className="p-8">
                <FormSection title="Job Category" icon={Tags}>
                  {disabled ? (
                    <div className="space-y-2">
                      {/* Main Category */}
                      {jobPost?.jobCategories &&
                        jobPost.jobCategories[0]?.name && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              {jobPost.jobCategories[0].name}
                            </span>
                          </div>
                        )}

                      {/* Subcategories with hierarchy visual */}
                      {jobPost?.jobSubcategories &&
                        jobPost.jobSubcategories.length > 0 && (
                          <div className="ml-4 space-y-1">
                            {jobPost.jobSubcategories.map((subcategory) => (
                              <div
                                key={subcategory.id}
                                className="flex items-center gap-2"
                              >
                                <div className="w-4 h-px bg-gray-300"></div>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                                  {subcategory.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ) : (
                    <div>
                      <Label
                        className={`text-sm font-medium text-orange-700 mb-2 block ${isPending ? "opacity-60" : ""}`}
                      >
                        Job Category <span className="text-red-500">*</span>
                      </Label>
                      <JobCategorySelector
                        isDisabled={disabled || isPending}
                        category={categoryName}
                        subcategories={subcategoryName}
                        // job={roleName}
                        jobCategories={jobCategories ?? {}}
                      />
                    </div>
                  )}
                </FormSection>
              </CardContent>
            </Card>

            {/* Job Details */}
            <Card
              className={`shadow-sm border-0 bg-white/80 backdrop-blur-sm ${isPending ? "opacity-70" : ""}`}
            >
              <CardContent className="p-8">
                <FormSection title="Job Details" icon={FileText}>
                  <InputField
                    label="Job Title"
                    id="title"
                    name="title"
                    placeholder="e.g., Senior Full Stack Developer"
                    defaultValue={formState?.title ?? jobPost?.jobTitle ?? ""}
                    required
                    disabled={disabled}
                  />

                  <InputField
                    label="Job Description"
                    id="description"
                    name="description"
                    placeholder="Describe the role, responsibilities, and what the candidate will be working on..."
                    defaultValue={
                      formState?.description ?? jobPost?.jobDescription ?? ""
                    }
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
                    defaultValue={
                      formState?.requirements ?? jobPost?.jobRequirements ?? ""
                    }
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
            <Card
              className={`shadow-sm border-0 bg-white/80 backdrop-blur-sm ${isPending ? "opacity-70" : ""}`}
            >
              <CardContent className="p-8">
                <FormSection title="Required Skills" icon={Star}>
                  <div className="gap-6">
                    <div className="space-y-2 mb-6">
                      <Label
                        className={`text-sm font-medium text-orange-700 ${isPending ? "opacity-60" : ""}`}
                      >
                        Core Skills <span className="text-red-500">*</span>
                      </Label>
                      <p
                        className={`text-xs text-gray-500 mb-2 ${isPending ? "opacity-60" : ""}`}
                      >
                        Essential skills candidates must have
                      </p>
                      <SkillsInput
                        id="coreSkills"
                        name="coreSkills"
                        placeholder="Add core skills (press Enter to add)"
                        defaultValue={
                          formState?.coreSkills ?? jobPost?.coreSkills ?? ""
                        }
                        disabled={disabled || isPending}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        className={`text-sm font-medium text-orange-700 ${isPending ? "opacity-60" : ""}`}
                      >
                        Nice-to-have Skills
                        <span className="text-red-500">*</span>
                      </Label>
                      <p
                        className={`text-xs text-gray-500 mb-2 ${isPending ? "opacity-60" : ""}`}
                      >
                        Bonus skills that would be great to have
                      </p>
                      <SkillsInput
                        id="niceToHaveSkills"
                        name="niceToHaveSkills"
                        placeholder="Add nice-to-have skills (press Enter to add)"
                        defaultValue={
                          formState?.niceToHaveSkills ??
                          jobPost?.niceToHaveSkills ??
                          ""
                        }
                        disabled={disabled || isPending}
                      />
                    </div>
                  </div>
                </FormSection>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card
              className={`shadow-sm border-0 bg-white/80 backdrop-blur-sm ${isPending ? "opacity-70" : ""}`}
            >
              <CardContent className="p-8">
                <FormSection title="Perks & Benefits" icon={Gift}>
                  <InputField
                    label="Perks & Benefits"
                    id="perks"
                    name="perks"
                    placeholder="List the benefits, perks, and compensation details that make this role attractive..."
                    defaultValue={formState?.perks ?? jobPost?.perks ?? ""}
                    component="textarea"
                    rows={6}
                    description="Include salary range, health benefits, vacation time, remote work options, etc."
                    disabled={disabled}
                  />
                </FormSection>
              </CardContent>
            </Card>

            {/* Screening Questions */}
            {(mode === "create" || mode === "edit") && (
              <Card
                className={`shadow-sm border-0 bg-white/80 backdrop-blur-sm ${isPending ? "opacity-70" : ""}`}
              >
                <CardContent className="p-8">
                  <FormSection title="Screening Questions" icon={HelpCircle}>
                    <div className="space-y-4">
                      <p
                        className={`text-sm text-gray-600 ${isPending ? "opacity-60" : ""}`}
                      >
                        Ask up to 3 questions to help screen candidates before
                        interviews
                      </p>
                      <InputField
                        label="Screening Question 1"
                        id="screeningQuestion1"
                        name="screeningQuestion1"
                        placeholder="e.g., What interests you most about this role?"
                        defaultValue={
                          formState?.screeningQuestion1 ??
                          jobPost?.screeningQuestions?.[0]?.question ??
                          ""
                        }
                        required
                        disabled={disabled}
                      />
                      <InputField
                        label="Screening Question 2"
                        id="screeningQuestion2"
                        name="screeningQuestion2"
                        placeholder="e.g., Describe your experience with [relevant technology/skill]"
                        defaultValue={
                          formState?.screeningQuestion2 ??
                          jobPost?.screeningQuestions?.[1]?.question ??
                          ""
                        }
                        required
                        disabled={disabled}
                      />
                      <InputField
                        label="Screening Question 3"
                        id="screeningQuestion3"
                        name="screeningQuestion3"
                        placeholder="e.g., What are your long-term career goals?"
                        defaultValue={
                          formState?.screeningQuestion3 ??
                          jobPost?.screeningQuestions?.[2]?.question ??
                          ""
                        }
                        required
                        disabled={disabled}
                      />
                    </div>
                  </FormSection>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-center">
              {/* Show error message */}
              {formState?.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{formState.error}</p>
                </div>
              )}

              {/* Show success message */}
              {formState?.success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{formState.success}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              {(mode === "create" || mode === "edit") && (
                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-12 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isPending || disabled}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <SubmitButtonIcon className="mr-3 h-5 w-5" />
                      {submitButtonText}
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
