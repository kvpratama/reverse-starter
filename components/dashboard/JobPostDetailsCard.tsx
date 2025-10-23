"use client";
import React from "react";
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
  MapPin,
  Calendar,
  Wallet,
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

const formatCurrency = (value: number | undefined) => {
  if (value === undefined) {
    return "";
  }
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(value);
};

type ActionState = {
  companyName?: string;
  companyProfile?: string;
  title?: string;
  location?: string;
  description?: string;
  requirements?: string;
  perks?: string;
  minSalary?: string;
  maxSalary?: string;
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
    formData: FormData
  ) => Promise<ActionState>;
  submitButtonText?: string;
  submitButtonIcon?: React.ElementType;
  jobCategories?: JobCategoriesData;
}) {
  // Use useActionState to get both state and pending status
  const [formState, formActionHandler, isPending] = useActionState(
    formAction ?? (async () => ({}) as ActionState),
    {} as ActionState // initial state with proper typing
  );

  const disabled = mode === "view";

  const minSalaryDefaultValue = disabled
    ? formatCurrency(jobPost?.minSalary)
    : (formState?.minSalary ??
      (jobPost?.minSalary !== undefined ? jobPost.minSalary.toString() : ""));

  const maxSalaryDefaultValue = disabled
    ? formatCurrency(jobPost?.maxSalary)
    : (formState?.maxSalary ??
      (jobPost?.maxSalary !== undefined ? jobPost.maxSalary.toString() : ""));

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
    type = "text",
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
    type?: string;
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
      type: component === "input" ? type : undefined,
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

  const SalaryRangeField = ({
    minSalary,
    maxSalary,
    disabled,
    isPending,
  }: {
    minSalary?: string;
    maxSalary?: string;
    disabled: boolean;
    isPending: boolean;
  }) => {
    const [minDisplayValue, setMinDisplayValue] = React.useState(
      minSalary
        ? new Intl.NumberFormat("ko-KR").format(
            parseInt(minSalary.replace(/[^0-9]/g, "")) || 0
          )
        : ""
    );
    const [maxDisplayValue, setMaxDisplayValue] = React.useState(
      maxSalary
        ? new Intl.NumberFormat("ko-KR").format(
            parseInt(maxSalary.replace(/[^0-9]/g, "")) || 0
          )
        : ""
    );

    const formatSalaryNumber = (value: string | undefined) => {
      if (!value) return "";
      const num = parseInt(value.replace(/[^0-9]/g, ""));
      if (isNaN(num)) return "";
      return new Intl.NumberFormat("ko-KR").format(num);
    };

    const getSalaryRange = () => {
      if (!minSalary && !maxSalary) return "Not specified";
      if (minSalary && maxSalary) {
        return `₩${formatSalaryNumber(minSalary)} - ₩${formatSalaryNumber(maxSalary)}`;
      }
      if (minSalary) return `₩${formatSalaryNumber(minSalary)}+`;
      return `Up to ₩${formatSalaryNumber(maxSalary)}`;
    };

    const handleSalaryChange = (
      e: React.ChangeEvent<HTMLInputElement>,
      setter: (value: string) => void
    ) => {
      const input = e.target.value.replace(/[^0-9]/g, "");
      if (input === "") {
        setter("");
        return;
      }
      const formatted = new Intl.NumberFormat("ko-KR").format(parseInt(input));
      setter(formatted);
    };

    // View mode for job seekers
    if (disabled && !isPending) {
      return (
        <div className="space-y-2">
          <Label className="text-sm font-medium text-orange-700">
            Salary Range
          </Label>
          <p className="text-sm text-gray-500 text-muted-foreground">
            {getSalaryRange()}
          </p>
        </div>
      );
    }

    // Edit mode for employers
    return (
      <>
        <div className="space-y-2">
          <Label
            htmlFor="minSalary"
            className={`text-sm font-medium text-orange-700 flex items-center gap-1 ${
              isPending ? "opacity-60" : ""
            }`}
          >
            Minimum Salary (₩)
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="minSalary"
            type="text"
            placeholder="e.g., 5,000,000"
            value={minDisplayValue}
            onChange={(e) => handleSalaryChange(e, setMinDisplayValue)}
            disabled={isPending}
            className={`transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
              isPending ? "opacity-60" : ""
            }`}
            required
          />
          <input
            type="hidden"
            name="minSalary"
            value={minDisplayValue.replace(/[^0-9]/g, "")}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="maxSalary"
            className={`text-sm font-medium text-orange-700 flex items-center gap-1 ${
              isPending ? "opacity-60" : ""
            }`}
          >
            Maximum Salary (₩)
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="maxSalary"
            type="text"
            placeholder="e.g., 10,000,000"
            value={maxDisplayValue}
            onChange={(e) => handleSalaryChange(e, setMaxDisplayValue)}
            disabled={isPending}
            className={`transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 ${
              isPending ? "opacity-60" : ""
            }`}
            required
          />
          <input
            type="hidden"
            name="maxSalary"
            value={maxDisplayValue.replace(/[^0-9]/g, "")}
          />
        </div>
      </>
    );
  };

  return (
    <>
      <div
        className="min-h-screen rounded-lg"
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

            {/* Single Card with Header and Content */}
            <Card
              className={`shadow-lg border-0 overflow-hidden py-0 ${isPending ? "opacity-70" : ""}`}
            >
              {/* Header Section (Orange theme) */}
              {disabled && (
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 px-8 py-8 text-white rounded-t-lg">
                  <div className="flex items-start gap-3 mb-3">
                    <Building2 className="h-6 w-6 flex-shrink-0 mt-1" />
                    <div>
                      <h2 className="text-lg font-medium opacity-90">
                        {formState?.companyName ??
                          jobPost?.companyName ??
                          "Company Name"}
                      </h2>
                      <h1 className="text-3xl font-bold mt-1">
                        {formState?.title ?? jobPost?.jobTitle ?? "Job Title"}
                      </h1>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    {(formState?.location || jobPost?.jobLocation) && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {formState?.location ?? jobPost?.jobLocation}
                        </span>
                      </div>
                    )}
                    {minSalaryDefaultValue ||
                      (maxSalaryDefaultValue && (
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          <span>
                            {minSalaryDefaultValue && maxSalaryDefaultValue
                              ? `${minSalaryDefaultValue} - ${maxSalaryDefaultValue}`
                              : minSalaryDefaultValue
                                ? `${minSalaryDefaultValue}+`
                                : `Up to ${maxSalaryDefaultValue}`}
                          </span>
                        </div>
                      ))}
                    {jobPost?.createdAt && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          Posted{" "}
                          {new Date(jobPost.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {jobPost?.updatedAt &&
                      jobPost?.updatedAt !== jobPost?.createdAt && (
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Updated{" "}
                            {new Date(jobPost.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                  </div>
                  <div className="space-y-2 mt-4">
                    {jobPost?.jobCategories &&
                      jobPost.jobCategories[0]?.name && (
                        <div className="flex items-center">
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                            {jobPost.jobCategories[0].name}
                          </span>
                        </div>
                      )}
                    {jobPost?.jobSubcategories &&
                      jobPost.jobSubcategories.length > 0 && (
                        <div className="ml-4 space-y-1">
                          {jobPost.jobSubcategories.map((subcategory) => (
                            <div
                              key={subcategory.id}
                              className="flex items-center gap-2"
                            >
                              <div className="w-4 h-px bg-gray-300"></div>
                              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                                {subcategory.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Content Section */}
              <CardContent className="px-8 py-8 space-y-8">
                {/* Company Information */}
                <FormSection
                  title="Company Information"
                  icon={Building2}
                  className="mb-12"
                >
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

                {/* Compensation */}
                <FormSection
                  title="Compensation"
                  icon={Briefcase}
                  className="mb-12"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <SalaryRangeField
                      minSalary={minSalaryDefaultValue}
                      maxSalary={maxSalaryDefaultValue}
                      disabled={disabled}
                      isPending={isPending}
                    />
                  </div>
                </FormSection>

                {/* Job Category */}
                <FormSection title="Job Category" icon={Tags} className="mb-12">
                  {disabled ? (
                    <div className="space-y-2">
                      {jobPost?.jobCategories &&
                        jobPost.jobCategories[0]?.name && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
                              {jobPost.jobCategories[0].name}
                            </span>
                          </div>
                        )}
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
                        jobCategories={jobCategories ?? {}}
                      />
                    </div>
                  )}
                </FormSection>

                {/* Job Details */}
                <FormSection
                  title="Job Details"
                  icon={FileText}
                  className="mb-12"
                >
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

                {/* Skills */}
                <FormSection
                  title="Required Skills"
                  icon={Star}
                  className="mb-12"
                >
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

                {/* Benefits */}
                <FormSection
                  title="Perks & Benefits"
                  icon={Gift}
                  className="mb-12"
                >
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

                {/* Screening Questions */}
                {(mode === "create" || mode === "edit") && (
                  <FormSection
                    title="Screening Questions"
                    icon={HelpCircle}
                    className="mb-12"
                  >
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
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-2">
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
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </>
  );
}
