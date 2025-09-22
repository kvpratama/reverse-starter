import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Calendar, Building, FileText } from "lucide-react";

export type WorkExperience = {
  start_date: string;
  end_date: string;
  position: string;
  company: string;
  description: string;
};

interface WorkExperienceSectionProps {
  experiences: WorkExperience[];
  disabled?: boolean;
  namePrefix?: string; // defaults to "work_experience"
}

export default function WorkExperienceSection({
  experiences,
  disabled = false,
  namePrefix = "work_experience",
}: WorkExperienceSectionProps) {
  if (!Array.isArray(experiences) || experiences.length === 0) return null;

  return (
    <div className="space-y-4">
      {experiences.map((we, idx) => (
        <Card
          key={`we-${idx}`}
          data-testid={`work-experience-card-${idx}`}
          className="border-0 shadow-md bg-gradient-to-br from-white to-gray-50/50 hover:shadow-lg transition-all duration-200"
        >
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  variant="secondary"
                  className="w-8 h-8 rounded-full p-0 flex items-center justify-center bg-orange-100 text-orange-700"
                >
                  {idx + 1}
                </Badge>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <span className="text-lg font-semibold text-gray-800">
                    {we.position || "Position"}
                    {we.company && (
                      <span className="text-base font-normal text-gray-600 ml-2">
                        at {we.company}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Position and Company Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor={`${namePrefix}[${idx}][position]`}
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <Briefcase className="w-4 h-4 text-gray-500" />
                  Position
                </Label>
                <Input
                  id={`${namePrefix}[${idx}][position]`}
                  name={`${namePrefix}[${idx}][position]`}
                  defaultValue={we.position}
                  disabled={disabled}
                  className="border-2 focus:border-orange-400 transition-colors"
                  placeholder="e.g. Senior Software Engineer"
                  aria-label="Position"
                />
              </div>
              <div>
                <Label
                  htmlFor={`${namePrefix}[${idx}][company]`}
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <Building className="w-4 h-4 text-gray-500" />
                  Company
                </Label>
                <Input
                  id={`${namePrefix}[${idx}][company]`}
                  name={`${namePrefix}[${idx}][company]`}
                  defaultValue={we.company}
                  disabled={disabled}
                  className="border-2 focus:border-orange-400 transition-colors"
                  placeholder="e.g. Tech Solutions Inc."
                  aria-label="Company"
                />
              </div>
            </div>

            {/* Date Range Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor={`${namePrefix}[${idx}][start_date]`}
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-gray-500" />
                  Start Date
                </Label>
                <Input
                  id={`${namePrefix}[${idx}][start_date]`}
                  name={`${namePrefix}[${idx}][start_date]`}
                  defaultValue={we.start_date}
                  disabled={disabled}
                  className="border-2 focus:border-orange-400 transition-colors"
                  placeholder="e.g. January 2020"
                  aria-label="Start Date"
                />
              </div>
              <div>
                <Label
                  htmlFor={`${namePrefix}[${idx}][end_date]`}
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <Calendar className="w-4 h-4 text-gray-500" />
                  End Date
                </Label>
                <Input
                  id={`${namePrefix}[${idx}][end_date]`}
                  name={`${namePrefix}[${idx}][end_date]`}
                  defaultValue={we.end_date}
                  disabled={disabled}
                  className="border-2 focus:border-orange-400 transition-colors"
                  placeholder="e.g. Present or December 2023"
                  aria-label="End Date"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor={`${namePrefix}[${idx}][description]`}
                className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-gray-500" />
                Job Description & Key Achievements
              </Label>
              <Textarea
                id={`${namePrefix}[${idx}][description]`}
                name={`${namePrefix}[${idx}][description]`}
                defaultValue={we.description}
                rows={4}
                disabled={disabled}
                className="border-2 focus:border-orange-400 transition-colors resize-none"
                placeholder="Describe your key responsibilities, achievements, and impact in this role..."
                aria-label="Job Description & Key Achievements"
              />
              <p className="text-xs text-gray-500 mt-1">
                Include specific achievements, technologies used, and measurable
                results where possible
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
