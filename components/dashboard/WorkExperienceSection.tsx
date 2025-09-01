"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="p-8 border border-gray-300 rounded-md bg-white focus-within:ring-1 focus-within:ring-orange-300 focus-within:border-orange-300 shadow-md">
      <h2 className="text-2xl text-gray-900 mb-2">Work Experience</h2>
      <div className="space-y-6 mt-2">
        {experiences.map((we, idx) => (
          <div
            key={`we-${idx}`}
            className="border border-gray-300 shadow-md rounded p-4 space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Position</Label>
                <Input
                  name={`${namePrefix}[${idx}][position]`}
                  defaultValue={we.position}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Company</Label>
                <Input
                  name={`${namePrefix}[${idx}][company]`}
                  defaultValue={we.company}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>Start Date</Label>
                <Input
                  name={`${namePrefix}[${idx}][start_date]`}
                  defaultValue={we.start_date}
                  disabled={disabled}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  name={`${namePrefix}[${idx}][end_date]`}
                  defaultValue={we.end_date}
                  disabled={disabled}
                />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                name={`${namePrefix}[${idx}][description]`}
                defaultValue={we.description}
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
