import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Calendar, BookOpen, School, FileText } from "lucide-react";

export type Education = {
  start_date: string;
  end_date: string;
  degree: string;
  field_of_study: string;
  institution: string;
  description: string;
};

interface EducationSectionProps {
  educations: Education[];
  disabled?: boolean;
  namePrefix?: string; // defaults to "education"
}

export default function EducationSection({
  educations,
  disabled = false,
  namePrefix = "education",
}: EducationSectionProps) {
  if (!Array.isArray(educations) || educations.length === 0) return null;

  return (
    <div className="space-y-4">
      {educations.map((ed, idx) => (
        <Card
          key={`ed-${idx}`}
          className="border-0 shadow-md bg-gradient-to-br from-white to-blue-50/30 hover:shadow-lg transition-all duration-200"
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
                  <GraduationCap className="w-5 h-5 text-orange-600" />
                  <span className="text-lg font-semibold text-gray-800">
                    {ed.degree || "Degree"} 
                    {ed.field_of_study && (
                      <span className="text-base font-normal text-gray-600 ml-2">
                        in {ed.field_of_study}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </CardTitle>
            {ed.institution && (
              <p className="text-sm text-gray-600 ml-11 flex items-center gap-1">
                <School className="w-4 h-4" />
                {ed.institution}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Degree and Field of Study Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label 
                  htmlFor={`${namePrefix}[${idx}][degree]`}
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  Degree
                </Label>
                <Input
                  id={`${namePrefix}[${idx}][degree]`}
                  name={`${namePrefix}[${idx}][degree]`}
                  defaultValue={ed.degree}
                  disabled={disabled}
                  className="border-2 focus:border-blue-400 transition-colors"
                  placeholder="e.g. Bachelor of Science, Master of Arts"
                />
              </div>
              <div>
                <Label 
                  htmlFor={`${namePrefix}[${idx}][field_of_study]`}
                  className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-gray-500" />
                  Field of Study
                </Label>
                <Input
                  id={`${namePrefix}[${idx}][field_of_study]`}
                  name={`${namePrefix}[${idx}][field_of_study]`}
                  defaultValue={ed.field_of_study}
                  disabled={disabled}
                  className="border-2 focus:border-blue-400 transition-colors"
                  placeholder="e.g. Computer Science, Business Administration"
                />
              </div>
            </div>

            {/* Institution */}
            <div>
              <Label 
                htmlFor={`${namePrefix}[${idx}][institution]`}
                className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2"
              >
                <School className="w-4 h-4 text-gray-500" />
                Institution
              </Label>
              <Input
                id={`${namePrefix}[${idx}][institution]`}
                name={`${namePrefix}[${idx}][institution]`}
                defaultValue={ed.institution}
                disabled={disabled}
                className="border-2 focus:border-blue-400 transition-colors"
                placeholder="e.g. Stanford University, MIT"
              />
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
                  defaultValue={ed.start_date}
                  disabled={disabled}
                  className="border-2 focus:border-blue-400 transition-colors"
                  placeholder="e.g. September 2018"
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
                  defaultValue={ed.end_date}
                  disabled={disabled}
                  className="border-2 focus:border-blue-400 transition-colors"
                  placeholder="e.g. May 2022 or Present"
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
                Description & Achievements
              </Label>
              <Textarea
                id={`${namePrefix}[${idx}][description]`}
                name={`${namePrefix}[${idx}][description]`}
                defaultValue={ed.description}
                rows={4}
                disabled={disabled}
                className="border-2 focus:border-blue-400 transition-colors resize-none"
                placeholder="Describe relevant coursework, academic achievements, honors, GPA, thesis work, or extracurricular activities..."
              />
              <p className="text-xs text-gray-500 mt-1">
                Include honors, relevant coursework, academic projects, or notable achievements
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}