"use client";

import React, { useState, useEffect } from "react";
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
}

interface JobSelection {
  category: string;
  subcategory: string;
  job: string;
  fullPath: string;
}

const JobCategorySelector: React.FC = () => {
  // Sample data structure - replace with your full JSON
  const jobCategories: JobCategoriesData = require("../../lib/job-categories.json");

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>("");
  const [selectedJob, setSelectedJob] = useState<string>("");
  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);
  const [availableJobs, setAvailableJobs] = useState<string[]>([]);

  // Update subcategories when main category changes
  useEffect(() => {
    if (selectedCategory) {
      const subcategories = Object.keys(jobCategories[selectedCategory] || {});
      setAvailableSubcategories(subcategories);
      setSelectedSubcategory("");
      setSelectedJob("");
      setAvailableJobs([]);
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategory("");
      setSelectedJob("");
      setAvailableJobs([]);
    }
  }, [selectedCategory]);

  // Update jobs when subcategory changes
  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const jobs = jobCategories[selectedCategory][selectedSubcategory] || [];
      setAvailableJobs(jobs);
      setSelectedJob("");
    } else {
      setAvailableJobs([]);
      setSelectedJob("");
    }
  }, [selectedCategory, selectedSubcategory]);

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
  }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required
        className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg bg-white appearance-none  transition-colors ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "cursor-pointer hover:border-gray-400"
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
        className={`absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 ${
          disabled ? "text-gray-400" : "text-gray-600"
        } pointer-events-none`}
      />
    </div>
  );

  return (
    <div className="mx-auto border border-gray-300 p-6 bg-white rounded-xl shadow-md">
      <div className="mb-6">
        <h2 className="text-2xl text-gray-900 mb-2">
          Select a Job Category
        </h2>
        <p className="text-gray-600">
          Choose the category that best describes the professional role
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Main Category */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Category
            </label>
            <CustomSelect
              name="category"
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={Object.keys(jobCategories)}
              placeholder="Select a primary category..."
            />
          </div>

          {/* Subcategory */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
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
              disabled={!selectedCategory}
            />
          </div>

          {/* Specific Job */}
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-2">
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
              disabled={!selectedSubcategory}
            />
          </div>
        </div>

        {/* Selection Preview */}
        {(selectedCategory || selectedSubcategory || selectedJob) && (
          <div className="bg-orange-50 p-4 rounded-lg border">
            <h3 className="text-sm font-semibold text-orange-600 mb-2">
              Current Selection:
            </h3>
            <div className="text-sm text-orange-500 space-y-1">
              <div>
                Category:{" "}
                <span className="font-medium">
                  {selectedCategory || "Not selected"}
                </span>
              </div>
              <div>
                Subcategory:{" "}
                <span className="font-medium">
                  {selectedSubcategory || "Not selected"}
                </span>
              </div>
              <div>
                Role:{" "}
                <span className="font-medium">
                  {selectedJob || "Not selected"}
                </span>
              </div>
            </div>
            {selectedCategory && selectedSubcategory && selectedJob && (
              <div className="mt-3 p-2 bg-orange-100 rounded border-l-4 border-orange-400">
                <div className="text-sm text-orange-600">
                  <strong>Full Path:</strong> {selectedCategory} →{" "}
                  {selectedSubcategory} → {selectedJob}
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
      </div>

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
