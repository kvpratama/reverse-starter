export default function JobsSkeleton() {
  return (
    <div className="space-y-4">
      {/* Results Header Skeleton */}
      <div className="bg-white rounded-lg px-6 py-4 mb-6">
        <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
      </div>

      {/* Job Cards Skeleton */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="animate-pulse">
            {/* Company Name */}
            <div className="flex items-center gap-2 mb-2">
              <div className="h-4 w-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>

            {/* Job Title */}
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-3" />

            {/* Location and Time */}
            <div className="flex gap-4 mb-3">
              <div className="h-4 bg-gray-200 rounded w-24" />
              <div className="h-4 bg-gray-200 rounded w-32" />
            </div>

            {/* Description */}
            <div className="space-y-2 mb-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>

            {/* Skills */}
            <div className="flex gap-2 mb-3">
              <div className="h-6 bg-gray-200 rounded-full w-20" />
              <div className="h-6 bg-gray-200 rounded-full w-24" />
              <div className="h-6 bg-gray-200 rounded-full w-16" />
            </div>

            {/* Perks */}
            <div className="h-4 bg-gray-200 rounded w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}