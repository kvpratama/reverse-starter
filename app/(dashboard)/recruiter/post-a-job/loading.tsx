const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function FormSectionSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
        <div className="p-2 bg-gray-200 rounded-lg h-9 w-9"></div>
        <div className="h-6 w-1/3 rounded bg-gray-200"></div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-10 w-full rounded-md bg-gray-200"></div>
        </div>
        <div className="space-y-2">
          <div className="h-4 w-1/4 rounded bg-gray-200"></div>
          <div className="h-20 w-full rounded-md bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className={`${shimmer} relative overflow-hidden min-h-screen`}>
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block h-16 w-16 bg-gray-200 rounded-2xl mb-4"></div>
          <div className="h-10 w-3/4 mx-auto rounded bg-gray-200 mb-2"></div>
          <div className="h-4 w-1/2 mx-auto rounded bg-gray-200"></div>
        </div>

        <div className="space-y-8">
          {/* Card Skeleton */}
          <div className="rounded-lg bg-white/80 p-8 space-y-4">
            <FormSectionSkeleton />
          </div>
          <div className="rounded-lg bg-white/80 p-8 space-y-4">
            <FormSectionSkeleton />
          </div>
          <div className="rounded-lg bg-white/80 p-8 space-y-4">
            <FormSectionSkeleton />
          </div>

          {/* Submit Button Skeleton */}
          <div className="flex justify-center pt-4">
            <div className="h-12 w-48 rounded-md bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
