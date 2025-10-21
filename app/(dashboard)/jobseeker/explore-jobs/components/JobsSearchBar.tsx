// app/explore-jobs/components/JobsSearchBar.tsx
'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface JobsSearchBarProps {
  initialQuery?: string;
}

export default function JobsSearchBar({ initialQuery = '' }: JobsSearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams(searchParams.toString());
    
    if (query.trim()) {
      params.set('q', query.trim());
    } else {
      params.delete('q');
    }
    
    // Reset to page 1 when searching
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`/jobseeker/explore-jobs?${params.toString()}`);
    });
  };

  const handleClear = () => {
    setQuery('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('q');
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`/jobseeker/explore-jobs?${params.toString()}`);
    });
  };

  return (
    <form onSubmit={handleSearch} className="mb-6">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className={`h-5 w-5 ${isPending ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by job title, company, skills..."
          className="block w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={isPending}
        />
        <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              disabled={isPending}
            >
              Clear
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={isPending}
          >
            {isPending ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </form>
  );
}