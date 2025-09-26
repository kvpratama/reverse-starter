"use client";

import { useState, useEffect, useMemo } from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import { JobCategoriesData } from "@/app/types/types";

interface OptionObj { id: string; name: string }
interface CustomSelectProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<string | OptionObj>;
  placeholder: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
}

interface JobCategorySelectorProps {
  isDisabled?: boolean;
  category?: string;
  subcategories?: string[]; // Changed from single subcategory to array
  jobCategories: JobCategoriesData;
}

export default function JobCategorySelector({
  isDisabled,
  category,
  subcategories = [],
  job,
  jobCategories,
}: {
  isDisabled: boolean;
  category: string;
  subcategories: string[];
  job: string;
  jobCategories: JobCategoriesData;
}) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedSubcategories, setSelectedSubcategories] = useState<
    string[]
  >(subcategories);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([]);
  const [selectedJob, setSelectedJob] = useState(job);

  const subcategoriesOptions = useMemo(() => {
    return jobCategories[selectedCategory] || [];
  }, [selectedCategory]);
  const [availableSubcategories, setAvailableSubcategories] = useState<string[]>([]);
  const [tempSubcategory, setTempSubcategory] = useState<string>("");

  // Update subcategories when main category changes
  useEffect(() => {
    if (selectedCategory) {
      const subcats = jobCategories[selectedCategory] || [];
      const subcategoryNames = subcats.map((sc) => sc.name);
      setAvailableSubcategories(subcategoryNames);
      
      // Only clear existing selections if category actually changed from a previous selection
      // Don't clear if this is the initial load with props
      if (selectedCategory !== category || selectedSubcategories.length === 0) {
        // Filter existing selections to only include valid ones for this category
        const validSubcategories = selectedSubcategories.filter(sub => 
          subcategoryNames.includes(sub)
        );
        
        // If we have incoming subcategories prop and no current selections, use the props
        const finalSubcategories = validSubcategories.length === 0 && subcategories.length > 0 
          ? subcategories.filter(sub => subcategoryNames.includes(sub))
          : validSubcategories;
          
        setSelectedSubcategories(finalSubcategories);
        
        // Update IDs for valid subcategories
        const validIds = finalSubcategories.map(subName => {
          const found = subcats.find((sc) => sc.name === subName);
          return found?.id ?? "";
        }).filter(id => id !== "");
        setSelectedSubcategoryIds(validIds);
      }
    } else {
      setAvailableSubcategories([]);
      setSelectedSubcategories([]);
      setSelectedSubcategoryIds([]);
    }
    setTempSubcategory("");
  }, [selectedCategory, jobCategories, subcategories]);

  // If incoming props change after mount, reflect them in state
  useEffect(() => {
    if (category && category !== selectedCategory) {
      setSelectedCategory(category);
    }
  }, [category, selectedCategory]);

  useEffect(() => {
    if (subcategories && subcategories.length > 0 && selectedSubcategories.length === 0) {
      setSelectedSubcategories(subcategories);
    }
  }, [subcategories]);

  const addSubcategory = () => {
    if (tempSubcategory && !selectedSubcategories.includes(tempSubcategory)) {
      const newSubcategories = [...selectedSubcategories, tempSubcategory];
      setSelectedSubcategories(newSubcategories);
      
      // Update IDs
      const subcats = jobCategories[selectedCategory] || [];
      const found = subcats.find((sc) => sc.name === tempSubcategory);
      if (found?.id) {
        setSelectedSubcategoryIds(prev => [...prev, found.id]);
      }
      
      setTempSubcategory("");
    }
  };

  const removeSubcategory = (subcategoryToRemove: string) => {
    const newSubcategories = selectedSubcategories.filter(sub => sub !== subcategoryToRemove);
    setSelectedSubcategories(newSubcategories);
    
    // Update IDs
    const subcats = jobCategories[selectedCategory] || [];
    const newIds = newSubcategories.map(subName => {
      const found = subcats.find((sc) => sc.name === subName);
      return found?.id ?? "";
    }).filter(id => id !== "");
    setSelectedSubcategoryIds(newIds);
  };

  const getAvailableOptions = () => {
    return availableSubcategories.filter(sub => !selectedSubcategories.includes(sub));
  };

  const CustomSelect: React.FC<CustomSelectProps> = ({
    name,
    value,
    onChange,
    options,
    placeholder,
    disabled = false,
    className = "",
    required = false,
  }) => (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`w-full px-4 py-3 pr-10 border border-gray-200 rounded-lg bg-white appearance-none transition-all duration-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm ${className} ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "cursor-pointer hover:border-orange-300"
        }`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const key = typeof option === 'string' ? option : option.id || option.name;
          const label = typeof option === 'string' ? option : option.name;
          const val = label;
          return (
            <option key={key} value={val}>
              {label}
            </option>
          );
        })}
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
        Select a category and add multiple subcategories that best match the job role
      </p>
      
      {/* Main Category */}
      <div className="space-y-2">
        <CustomSelect
          name="category"
          value={selectedCategory}
          onChange={setSelectedCategory}
          options={Object.keys(jobCategories)}
          placeholder="Select a primary category..."
          disabled={isDisabled}
          required={true}
        />
      </div>

      {/* Subcategory Addition */}
      {selectedCategory && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <CustomSelect
                name="tempSubcategory"
                value={tempSubcategory}
                onChange={setTempSubcategory}
                options={getAvailableOptions()}
                placeholder="Select a subcategory to add..."
                disabled={isDisabled || !selectedCategory || getAvailableOptions().length === 0}
              />
            </div>
            <button
              type="button"
              onClick={addSubcategory}
              disabled={!tempSubcategory || isDisabled}
              className="px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-1"
            >
              <Plus className="h-4 w-4" />
              Add
            </button>
          </div>
          
          {getAvailableOptions().length === 0 && selectedCategory && (
            <p className="text-xs text-gray-500 italic">
              All subcategories have been added or none available for this category
            </p>
          )}
        </div>
      )}

      {/* Selected Subcategories */}
      {selectedSubcategories.length > 0 && (
        <div className="space-y-2">
          <label className="block text-xs font-medium text-gray-700">
            Selected Subcategories ({selectedSubcategories.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedSubcategories.map((subcategory, index) => (
              <div
                key={`tag-${subcategory}-${index}`}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm border border-orange-200"
              >
                <span>{subcategory}</span>
                {!isDisabled && (
                  <button
                    type="button"
                    onClick={() => removeSubcategory(subcategory)}
                    className="ml-1 hover:bg-orange-200 rounded-full p-1 transition-colors duration-200"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selection Preview */}
      {(selectedCategory || selectedSubcategories.length > 0) && (
        <div className="bg-orange-50/80 border border-orange-200 p-4 rounded-lg">
          <h3 className="text-sm font-semibold text-orange-700 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            Current Selection
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">Category:</span>
              <span className="font-semibold text-orange-700">
                {selectedCategory || "Not selected"}
              </span>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <span className="text-gray-600 mt-0.5">Subcategories:</span>
              <div className="flex-1">
                {selectedSubcategories.length > 0 ? (
                  <div className="space-y-1">
                    {selectedSubcategories.map((sub, index) => (
                      <div key={`preview-${sub}-${index}`} className="font-semibold text-orange-700">
                        {index + 1}. {sub}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 italic">No subcategories selected. <span className="text-red-500">Click "Add" to include one or more subcategories.</span> You can add multiple subcategories.</span>
                )}
              </div>
            </div>
          </div>
          {selectedCategory && selectedSubcategories.length > 0 && (
            <div className="mt-3 p-3 bg-white border border-orange-300 rounded-md">
              <div className="text-sm text-orange-700">
                <strong>Full Path:</strong> {selectedCategory} → [{selectedSubcategories.join(", ")}]
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Hidden inputs for form submission */}
      {selectedSubcategories.map((subcategory, index) => (
        <input
          key={`subcategory-${index}`}
          type="hidden"
          name={`subcategories[]`}
          value={subcategory}
        />
      ))}
      {selectedSubcategoryIds.map((id, index) => (
        <input
          key={`subcategory-id-${index}`}
          type="hidden"
          name={`subcategoryIds[]`}
          value={id}
        />
      ))}
    </div>
  );
}