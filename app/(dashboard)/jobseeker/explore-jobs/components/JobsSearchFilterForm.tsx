"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, Filter, X, ChevronDown } from "lucide-react";
import { useState } from "react";
import JobsSkeleton from "@/app/(dashboard)/jobseeker/explore-jobs/components/JobsSkeleton";
import { ROUTES } from "@/lib/routes";

interface FilterOptions {
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; name: string; categoryId: string }>;
  locations: string[];
}

interface JobsSearchFilterFormProps {
  filterOptions: FilterOptions;
  initialQuery?: string;
  searchParams: Record<string, string | undefined>;
  children: React.ReactNode; // The actual job listings
}

export default function JobsSearchFilterForm({
  filterOptions,
  initialQuery = "",
  searchParams,
  children,
}: JobsSearchFilterFormProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [locationValue, setLocationValue] = useState(
    searchParams.location || ""
  );
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.category || ""
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState(
    searchParams.subcategory || ""
  );
  const [sortValue, setSortValue] = useState(searchParams.sort || "latest");
  const [minSalaryValue, setMinSalaryValue] = useState(
    searchParams.minSalary || ""
  );
  const [maxSalaryValue, setMaxSalaryValue] = useState(
    searchParams.maxSalary || ""
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newParams = new URLSearchParams();

    // Add all form values to params
    const query = formData.get("q") as string;
    const location = formData.get("location") as string;
    const minSalary = formData.get("minSalary") as string;
    const maxSalary = formData.get("maxSalary") as string;
    const category = formData.get("category") as string;
    const subcategory = formData.get("subcategory") as string;
    const sort = formData.get("sort") as string;

    if (query?.trim()) newParams.set("q", query.trim());
    if (location) newParams.set("location", location);
    if (minSalary) newParams.set("minSalary", minSalary);
    if (maxSalary) newParams.set("maxSalary", maxSalary);
    if (category) newParams.set("category", category);
    if (subcategory) newParams.set("subcategory", subcategory);
    if (sort) newParams.set("sort", sort);

    // Always reset to page 1 on new search/filter
    newParams.set("page", "1");

    // Keep limit if it exists
    if (params.get("limit")) {
      newParams.set("limit", params.get("limit")!);
    }

    startTransition(() => {
      router.push(
        ROUTES.jobsWithQuery(Object.fromEntries(newParams as any)),
        {
          scroll: true,
        }
      );
    });
  };

  const handleClearAll = () => {
    const newParams = new URLSearchParams();
    // Keep search query if exists
    if (params.get("q")) {
      newParams.set("q", params.get("q")!);
    }
    newParams.set("page", "1");
    setLocationValue("");
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSortValue("latest");
    setMinSalaryValue("");
    setMaxSalaryValue("");

    startTransition(() => {
      router.push(
        ROUTES.jobsWithQuery(Object.fromEntries(newParams as any)),
        {
          scroll: true,
        }
      );
    });
  };

  const hasActiveFilters =
    searchParams.location ||
    searchParams.category ||
    searchParams.subcategory ||
    searchParams.minSalary ||
    searchParams.maxSalary ||
    (searchParams.sort && searchParams.sort !== "latest");

  const filteredSubcategories = selectedCategory
    ? filterOptions.subcategories
        .filter((sub) => sub.categoryId === selectedCategory)
        .sort((a, b) => a.name.localeCompare(b.name))
    : [];

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6"
      >
        {/* Main Search Bar */}
        <div className="p-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search
                  className={`h-5 w-5 ${isPending ? "text-orange-500" : "text-gray-400"}`}
                />
              </div>
              <input
                type="text"
                name="q"
                defaultValue={initialQuery}
                placeholder="Search by job title, company, skills..."
                className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-orange-500 focus:border-transparent focus:outline-none"
                disabled={isPending}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-4 py-3 rounded-lg font-medium transition-colors flex items-center gap-2
                ${
                  showFilters || hasActiveFilters
                    ? "bg-orange-600 text-white hover:bg-orange-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }
              `}
              disabled={isPending}
            >
              <Filter className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && (
                <span className="bg-white text-orange-600 px-2 py-0.5 rounded-full text-xs font-bold">
                  •
                </span>
              )}
              <ChevronDown
                className={`h-4 w-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
              />
            </button>

            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 font-medium"
            >
              {isPending ? "Searching..." : "Search"}
            </button>
          </div>
        </div>

        {/* Expandable Filters Section */}
        {showFilters && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Filter Options
              </h3>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                  Clear all filters
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <select
                  name="location"
                  value={locationValue}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white focus:outline-none"
                  disabled={isPending}
                  onChange={(e) => setLocationValue(e.target.value)}
                >
                  <option value="">All Locations</option>
                  {filterOptions.locations.map((location) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={selectedCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white focus:outline-none"
                  disabled={isPending}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCategory(value);
                    setSelectedSubcategory("");
                  }}
                >
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory - only show if category selected */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory
                </label>
                <select
                  name="subcategory"
                  value={selectedSubcategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white disabled:bg-gray-100 focus:outline-none"
                  disabled={isPending || !selectedCategory}
                  onChange={(e) => setSelectedSubcategory(e.target.value)}
                >
                  <option value="">
                    {selectedCategory
                      ? "All Subcategories"
                      : "Select category first"}
                  </option>
                  {filteredSubcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  name="sort"
                  value={sortValue}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent bg-white focus:outline-none"
                  disabled={isPending}
                  onChange={(e) => setSortValue(e.target.value)}
                >
                  <option value="latest">Latest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </div>

              {/* Min Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Min Salary
                </label>
                <input
                  type="number"
                  name="minSalary"
                  value={minSalaryValue}
                  placeholder="e.g. 50000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent focus:outline-none"
                  disabled={isPending}
                  onChange={(e) => setMinSalaryValue(e.target.value)}
                />
              </div>

              {/* Max Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Salary
                </label>
                <input
                  type="number"
                  name="maxSalary"
                  value={maxSalaryValue}
                  placeholder="e.g. 150000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-orange-500 focus:border-transparent focus:outline-none"
                  disabled={isPending}
                  onChange={(e) => setMaxSalaryValue(e.target.value)}
                />
              </div>
            </div>

            {/* Apply Filters Button (Mobile) */}
            <div className="mt-4 sm:hidden">
              <button
                type="submit"
                disabled={isPending}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 font-medium"
              >
                {isPending ? "Applying..." : "Apply Filters"}
              </button>
            </div>
          </div>
        )}
      </form>

      {/* Job Listings or Skeleton */}
      {isPending ? <JobsSkeleton /> : children}
    </>
  );
}
