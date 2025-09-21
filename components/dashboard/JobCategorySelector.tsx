"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

// Type definitions
interface JobCategoriesData {
  [category: string]: {
    [subcategory: string]: string[];
  };
}

interface CustomSelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder: string;
  disabled?: boolean;
  className?: string;
}

interface JobSelection {
  category: string;
  subcategory: string;
  job: string;
  fullPath: string;
}

interface JobCategorySelectorProps {
  isDisabled?: boolean;
  category?: string;
  subcategory?: string;
  job?: string;
}

const JobCategorySelector: React.FC<JobCategorySelectorProps> = ({
  isDisabled,
  category = "",
  subcategory = "",
  job = "",
}) => {
  // Sample data structure - replace with your full JSON
  const jobCategories: JobCategoriesData = require("../../lib/job-categories.json");
  // console.log(category, subcategory, job);

  const [selectedCategory, setSelectedCategory] = useState<string>(category);
  const [selectedSubcategory, setSelectedSubcategory] =
    useState<string>(subcategory);
  const [selectedJob, setSelectedJob] = useState<string>(job);
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);
  const [availableJobs, setAvailableJobs] = useState<string[]>([]);

  // Update subcategories when main category changes
  useEffect(() => {
    if (selectedCategory) {
      const subcategories = Object.keys(jobCategories[selectedCategory] || {});
      setAvailableSubcategories(subcategories);
      // Preserve an existing valid subcategory or fallback to incoming prop
      const nextSub =
        selectedSubcategory && subcategories.includes(selectedSubcategory)
          ? selectedSubcategory
          : subcategory && subcategories.includes(subcategory)
            ? subcategory
            : "";
      setSelectedSubcategory(nextSub);
      // Reset jobs list here; actual job selection handled in jobs effect
      setAvailableJobs([]);
      if (!nextSub) {
        setSelectedJob("");
      }
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategory("");
      setSelectedJob("");
      setAvailableJobs([]);
    }
  }, [selectedCategory, subcategory]);

  // Update jobs when subcategory changes
  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const jobs = jobCategories[selectedCategory]?.[selectedSubcategory] || [];
      setAvailableJobs(jobs);
      // Preserve existing or incoming job if valid, else default to the first job
      const nextJob =
        selectedJob && jobs.includes(selectedJob)
          ? selectedJob
          : job && jobs.includes(job)
            ? job
            : jobs[0] || "";
      setSelectedJob(nextJob);
    } else {
      setAvailableJobs([]);
      setSelectedJob("");
    }
  }, [selectedCategory, selectedSubcategory, job]);

  // If incoming props change after mount, reflect them in state
  useEffect(() => {
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [category]);

  const handleSubmit = (): void => {
    if (selectedCategory && selectedSubcategory && selectedJob) {
      const selection: JobSelection = {
        category: selectedCategory,
        subcategory: selectedSubcategory,
        job: selectedJob,
        fullPath: `${selectedCategory} > ${selectedSubcategory} > ${selectedJob}`,
      };
      console.log("Selected job category:", selection);
      alert(`Selected: ${selection.fullPath}`);
    } else {
      alert("Please select a complete job category path");
    }
  };

  const CustomSelect: React.FC<CustomSelectProps> = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    className = "",
  }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
        className={`w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg bg-white appearance-none transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm ${className} ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "cursor-pointer hover:border-orange-300"
        }`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${className} ${
          disabled ? "text-gray-400" : "text-gray-600"
        } pointer-events-none transition-colors`}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Select a category and subcategory that best matches the job role
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-4">
        {/* Main Category */}
        <div className="space-y-2">
          {/* <label className="block text-xs font-medium text-gray-700">
            Primary Category <span className="text-red-500">*</span>
          </label> */}
          <CustomSelect
            name="category"
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={Object.keys(jobCategories)}
            placeholder="Select a primary category..."
            disabled={isDisabled}
          />
        </div>

        {/* Subcategory */}
        <div className="space-y-2">
          {/* <label className="block text-xs font-medium text-gray-700">
            Subcategory <span className="text-red-500">*</span>
          </label> */}
          <CustomSelect
            name="subcategory"
            value={selectedSubcategory}
            onChange={setSelectedSubcategory}
            options={availableSubcategories}
            placeholder={
              selectedCategory
                ? "Select a subcategory..."
                : "First select a primary category"
            }
            disabled={isDisabled || !selectedCategory}
          />
        </div>

        {/* Specific Job */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-2 hidden">
            Specific Role
          </label>
          <CustomSelect
            name="job"
            value={selectedJob}
            onChange={setSelectedJob}
            options={availableJobs}
            placeholder={
              selectedSubcategory
                ? "Select your specific role..."
                : "First select a subcategory"
            }
            disabled={isDisabled || !selectedSubcategory}
            className="hidden"
          />
        </div>
      </div>

      {/* Selection Preview */}
      {(selectedCategory || selectedSubcategory || selectedJob) && (
        <div className="bg-orange-50/80 border border-orange-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Current Selection
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-left text-sm">
              <span className="text-gray-600">Category:</span>
              <span className="font-semibold text-orange-700">
                {selectedCategory || "Not selected"}
              </span>
            </div>
            <div className="flex items-center justify-left text-sm">
              <span className="text-gray-600">Subcategory:</span>
              <span className="font-semibold text-orange-700">
                {selectedSubcategory || "Not selected"}
              </span>
            </div>
            {/* <div>
                Role:{" "}
                <span className="font-medium">
                  {selectedJob || "Not selected"}
                </span>
              </div> */}
          </div>
          {selectedCategory && selectedSubcategory && selectedJob && (
            <div className="mt-3 p-3 bg-white border border-orange-300 rounded-md">
              <div className="text-sm text-orange-700">
                <strong>Full Path:</strong> {selectedCategory} →{" "}
                {selectedSubcategory} {/*→ {selectedJob}*/}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Submit Button */}
      {/* <button
          type="button"
          onClick={handleSubmit}
          disabled={!selectedCategory || !selectedSubcategory || !selectedJob}
          className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
            selectedCategory && selectedSubcategory && selectedJob
              ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {selectedCategory && selectedSubcategory && selectedJob 
            ? 'Confirm Selection' 
            : 'Please complete all selections'
          }
        </button> */}

      {/* Instructions */}
      {/* <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">How it works:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>1. Choose your primary job category</li>
          <li>2. Select a more specific subcategory</li>
          <li>3. Pick your exact role from the available options</li>
          <li>4. Confirm your selection to save to your profile</li>
        </ul>
      </div> */}
    </div>
  );
};

export default JobCategorySelector;
