// app/explore-jobs/components/JobsFilters.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Filter, X } from 'lucide-react';

interface FilterOptions {
  categories: Array<{ id: string; name: string }>;
  subcategories: Array<{ id: string; name: string; categoryId: string }>;
  locations: string[];
}

interface JobsFiltersProps {
  filterOptions: FilterOptions;
  searchParams: Record<string, string | undefined>;
}

export default function JobsFilters({ filterOptions, searchParams }: JobsFiltersProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const updateFilter = (key: string, value: string) => {
    const newParams = new URLSearchParams(params.toString());
    
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    
    // Reset to page 1 when filters change
    newParams.set('page', '1');
    
    startTransition(() => {
      router.push(`/jobseeker/explore-jobs?${newParams.toString()}`);
    });
  };

  const clearAllFilters = () => {
    const newParams = new URLSearchParams();
    // Keep search query if exists
    if (params.get('q')) {
      newParams.set('q', params.get('q')!);
    }
    newParams.set('page', '1');
    
    startTransition(() => {
      router.push(`/jobseeker/explore-jobs?${newParams.toString()}`);
    });
  };

  const hasActiveFilters = params.get('location') || params.get('category') || 
                          params.get('subcategory') || params.get('sort') ||
                          params.get('minSalary') || params.get('maxSalary');

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            disabled={isPending}
          >
            <X className="h-4 w-4" />
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Location Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <select
            value={searchParams.location || ''}
            onChange={(e) => updateFilter('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending}
          >
            <option value="">All Locations</option>
            {filterOptions.locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        {/* Salary Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Salary Range
          </label>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Min salary"
              value={searchParams.minSalary || ''}
              onChange={(e) => updateFilter('minSalary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPending}
            />
            <input
              type="number"
              placeholder="Max salary"
              value={searchParams.maxSalary || ''}
              onChange={(e) => updateFilter('maxSalary', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPending}
            />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={searchParams.category || ''}
            onChange={(e) => {
              updateFilter('category', e.target.value);
              // Clear subcategory when category changes
              if (searchParams.subcategory) {
                updateFilter('subcategory', '');
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending}
          >
            <option value="">All Categories</option>
            {filterOptions.categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Filter - Only show if category is selected */}
        {searchParams.category && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subcategory
            </label>
            <select
              value={searchParams.subcategory || ''}
              onChange={(e) => updateFilter('subcategory', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isPending}
            >
              <option value="">All Subcategories</option>
              {filterOptions.subcategories
                .filter((sub) => sub.categoryId === searchParams.category)
                .map((subcategory) => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={searchParams.sort || 'latest'}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isPending}
          >
            <option value="latest">Latest Updated</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {isPending && (
        <div className="mt-4 text-sm text-gray-500 text-center">
          Applying filters...
        </div>
      )}
    </div>
  );
}