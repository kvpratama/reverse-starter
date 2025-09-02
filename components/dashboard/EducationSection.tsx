"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="p-8 border border-gray-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 shadow-md">
      <h2 className="text-2xl text-gray-900 mb-2">Education</h2>
      <div className="space-y-6 mt-2">
        {educations.map((ed, idx) => (
          <div
            key={`ed-${idx}`}
            className="border border-gray-300 shadow-md rounded p-4 space-y-3"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Degree</Label>
                <Input
                  name={`${namePrefix}[${idx}][degree]`}
                  defaultValue={ed.degree}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Field of Study</Label>
                <Input
                  name={`${namePrefix}[${idx}][field_of_study]`}
                  defaultValue={ed.field_of_study}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  name={`${namePrefix}[${idx}][start_date]`}
                  defaultValue={ed.start_date}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  name={`${namePrefix}[${idx}][end_date]`}
                  defaultValue={ed.end_date}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Institution</Label>
                <Input
                  name={`${namePrefix}[${idx}][institution]`}
                  defaultValue={ed.institution}
                  disabled={disabled}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                name={`${namePrefix}[${idx}][description]`}
                defaultValue={ed.description}
                rows={4}
                disabled={disabled}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
