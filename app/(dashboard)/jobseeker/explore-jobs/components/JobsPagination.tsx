// app/explore-jobs/components/JobsPagination.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTransition } from 'react';

interface JobsPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
}

export default function JobsPagination({ 
  currentPage, 
  totalPages,
  searchParams 
}: JobsPaginationProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigateToPage = (page: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set('page', page.toString());
    
    startTransition(() => {
      router.push(`/jobseeker/explore-jobs?${newParams.toString()}`);
    });

    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const delta = 2; // Number of pages to show on each side of current page
    const pages: (number | string)[] = [];
    
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // First page
        i === totalPages || // Last page
        (i >= currentPage - delta && i <= currentPage + delta) // Pages around current
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => navigateToPage(currentPage - 1)}
        disabled={currentPage === 1 || isPending}
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      {/* Page Numbers */}
      <div className="hidden sm:flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-4 py-2 text-gray-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => navigateToPage(pageNum)}
              disabled={isPending}
              className={`
                px-4 py-2 text-sm font-medium rounded-md transition-colors
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {pageNum}
            </button>
          );
        })}
      </div>

      {/* Mobile Page Indicator */}
      <div className="sm:hidden px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
        Page {currentPage} of {totalPages}
      </div>

      {/* Next Button */}
      <button
        onClick={() => navigateToPage(currentPage + 1)}
        disabled={currentPage === totalPages || isPending}
        className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}