"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTransition } from "react";
import JobsSkeleton from "@/app/(dashboard)/jobseeker/explore-jobs/components/JobsSkeleton";
import { ROUTES } from "@/lib/routes";

interface JobsPaginationProps {
  currentPage: number;
  totalPages: number;
  searchParams: Record<string, string | undefined>;
  children: React.ReactNode; // The actual job listings
}

export default function JobsPagination({
  currentPage,
  totalPages,
  searchParams,
  children,
}: JobsPaginationProps) {
  const router = useRouter();
  const params = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const navigateToPage = (page: number) => {
    const newParams = new URLSearchParams(params.toString());
    newParams.set("page", page.toString());

    startTransition(() => {
      router.push(
        ROUTES.jobsWithQuery(Object.fromEntries(newParams as any)),
        {
          scroll: true,
        }
      );
    });
  };

  const getPageNumbers = () => {
    const delta = 2;
    const pages: (number | string)[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== "...") {
        pages.push("...");
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-6">
      {/* Job Listings or Skeleton */}
      {isPending ? <JobsSkeleton /> : children}

      {/* Pagination Controls */}
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage === 1 || isPending}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <div className="hidden sm:flex items-center gap-1">
          {pageNumbers.map((page, index) => {
            if (page === "...") {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="px-4 py-2 text-gray-500"
                >
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
                  ${
                    isActive
                      ? "bg-orange-600 text-white"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-orange-100  hover:cursor-pointer"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        <div className="sm:hidden px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md">
          Page {currentPage} of {totalPages}
        </div>

        <button
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage === totalPages || isPending}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-orange-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors hover:cursor-pointer"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
