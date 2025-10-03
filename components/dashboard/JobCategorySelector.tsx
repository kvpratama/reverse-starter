"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ChevronDown, X, Plus } from "lucide-react";
import { JobCategoriesData } from "@/app/types/types";

interface OptionObj {
  id: string;
  name: string;
}
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
  // job,
  jobCategories,
}: {
  isDisabled: boolean;
  category: string;
  subcategories: string[];
  // job: string;
  jobCategories: JobCategoriesData;
}) {
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [selectedSubcategories, setSelectedSubcategories] =
    useState<string[]>(subcategories);
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<
    string[]
  >([]);
  // const [selectedJob, setSelectedJob] = useState(job);

  const [availableSubcategories, setAvailableSubcategories] = useState<
    string[]
  >([]);
  const [tempSubcategory, setTempSubcategory] = useState<string>("");

  // Track if this is the initial mount to handle prop initialization properly
  const isInitialMount = useRef(true);
  const prevSelectedCategory = useRef(selectedCategory);

  // Update subcategories when main category changes
  useEffect(() => {
    if (selectedCategory) {
      const subcats = jobCategories[selectedCategory] || [];
      const subcategoryNames = subcats.map((sc) => sc.name);
      setAvailableSubcategories(
        subcategoryNames.sort((a, b) => a.localeCompare(b)),
      );

      // Check if category actually changed (not just initial load or prop sync)
      const categoryChanged = prevSelectedCategory.current !== selectedCategory;

      if (categoryChanged && !isInitialMount.current) {
        // Category was changed by user interaction - clear subcategories
        setSelectedSubcategories([]);
        setSelectedSubcategoryIds([]);
      } else if (isInitialMount.current || selectedSubcategories.length === 0) {
        // Initial load or no existing subcategories - use props if available
        const validSubcategories = subcategories.filter((sub) =>
          subcategoryNames.includes(sub),
        );

        if (validSubcategories.length > 0) {
          setSelectedSubcategories(validSubcategories);

          // Update IDs for valid subcategories
          const validIds = validSubcategories
            .map((subName) => {
              const found = subcats.find((sc) => sc.name === subName);
              return found?.id ?? "";
            })
            .filter((id) => id !== "");
          setSelectedSubcategoryIds(validIds);
        }
      }

      // Update the previous category reference
      prevSelectedCategory.current = selectedCategory;
    } else {
      setAvailableSubcategories([]);
      if (!isInitialMount.current) {
        // Only clear if not initial mount
        setSelectedSubcategories([]);
        setSelectedSubcategoryIds([]);
      }
      prevSelectedCategory.current = selectedCategory;
    }
    setTempSubcategory("");

    // Mark that initial mount is complete
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [selectedCategory, jobCategories]);

  // Initialize from props only on mount - remove the prop syncing effects that cause conflicts
  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    }
    if (subcategories && subcategories.length > 0) {
      setSelectedSubcategories(subcategories);
    }
  }, []); // Empty dependency array - only run on mount

  const addSubcategory = () => {
    if (tempSubcategory && !selectedSubcategories.includes(tempSubcategory)) {
      const newSubcategories = [...selectedSubcategories, tempSubcategory];
      setSelectedSubcategories(newSubcategories);

      // Update IDs
      const subcats = jobCategories[selectedCategory] || [];
      const found = subcats.find((sc) => sc.name === tempSubcategory);
      if (found?.id) {
        setSelectedSubcategoryIds((prev) => [...prev, found.id]);
      }

      setTempSubcategory("");
    }
  };

  const removeSubcategory = (subcategoryToRemove: string) => {
    const newSubcategories = selectedSubcategories.filter(
      (sub) => sub !== subcategoryToRemove,
    );
    setSelectedSubcategories(newSubcategories);

    // Update IDs
    const subcats = jobCategories[selectedCategory] || [];
    const newIds = newSubcategories
      .map((subName) => {
        const found = subcats.find((sc) => sc.name === subName);
        return found?.id ?? "";
      })
      .filter((id) => id !== "");
    setSelectedSubcategoryIds(newIds);
  };

  const getAvailableOptions = () => {
    return availableSubcategories
      .filter((sub) => !selectedSubcategories.includes(sub))
      .sort((a, b) => a.localeCompare(b));
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
        className={`w-full px-4 py-3 pr-10 border-1 border-gray-200 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-orange-200 text-sm ${className} ${
          disabled
            ? "bg-gray-50 text-gray-400 cursor-not-allowed"
            : "cursor-pointer hover:border-orange-300"
        }`}
        required={required}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => {
          const key =
            typeof option === "string" ? option : option.id || option.name;
          const label = typeof option === "string" ? option : option.name;
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
        Select a category and add multiple subcategories that best match the job
        role
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
                disabled={
                  isDisabled ||
                  !selectedCategory ||
                  getAvailableOptions().length === 0
                }
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
          {/* Alerts */}
          {selectedSubcategories.length < 1 ? (
            <AlertSubcategory
              type="error"
              message="Please add at least one subcategory to proceed."
            />
          ) : (
            <AlertSubcategory
              type="success"
              message="Consider adding more relevant subcategories to increase visibility"
            />
          )}

          {getAvailableOptions().length === 0 && selectedCategory && (
            <p className="text-xs text-gray-500 italic">
              All subcategories have been added or none available for this
              category
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
      {selectedSubcategories.length > 0 && (
        <div
          className={`border p-4 rounded-lg transition-colors bg-orange-50 border border-orange-200`}
        >
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full bg-orange-500`}></div>
            <span className="text-orange-700">Current Selection</span>
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
                      <div
                        key={`preview-${sub}-${index}`}
                        className="font-semibold text-orange-700"
                      >
                        {index + 1}. {sub}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-gray-500 italic block">
                      No subcategories selected
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {selectedCategory && selectedSubcategories.length > 0 && (
            <div className="mt-3 p-3 bg-white border border-orange-300 rounded-md">
              <div className="text-sm text-orange-700">
                <strong>Full Path:</strong> {selectedCategory} → [
                {selectedSubcategories.join(", ")}]
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

type AlertType = "error" | "success";

interface AlertProps {
  type: AlertType;
  message: string;
}

const AlertSubcategory: React.FC<AlertProps> = ({ type, message }) => {
  const styles: Record<
    AlertType,
    { container: string; icon: string; iconPath: string }
  > = {
    error: {
      container: "bg-red-100 border border-red-300 text-red-700",
      icon: "text-red-600",
      iconPath:
        "M10 18a8 8 0 100-16 8 8 0 000 16zM7.293 7.293a1 1 0 011.414 0L10 8.586l1.293-1.293a1 1 0 111.414 1.414L11.414 10l1.293 1.293a1 1 0 01-1.414 1.414L10 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L8.586 10 7.293 8.707a1 1 0 010-1.414z",
    },
    success: {
      container: "bg-green-100 border border-green-300 text-green-700",
      icon: "text-green-600",
      iconPath:
        "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.707a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414L9 13.414l4.707-4.707z",
    },
  };

  const style = styles[type];

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded text-xs font-medium rounded-lg ${style.container}`}
      role="alert"
    >
      <svg
        className={`w-4 h-4 mt-0.5 flex-shrink-0 ${style.icon}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path fillRule="evenodd" d={style.iconPath} clipRule="evenodd" />
      </svg>
      <span>{message}</span>
    </div>
  );
};
