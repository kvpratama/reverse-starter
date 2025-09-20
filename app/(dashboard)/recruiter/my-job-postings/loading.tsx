const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function JobCardSkeleton() {
    return (
        <div className="relative overflow-hidden rounded-lg border bg-white shadow-md transition-all duration-300 hover:shadow-lg">
            <div className={`${shimmer} p-6`}>
                {/* Card Header */}
                <div className="mb-4">
                    <div className="h-5 w-3/4 rounded bg-gray-200"></div>
                </div>

                {/* Card Content */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        {/* <Building2 className="h-4 w-4 text-gray-300" /> */}
                        <div className="h-4 w-1/2 rounded bg-gray-200"></div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <MapPin className="h-4 w-4 text-gray-300" /> */}
                        <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                    </div>
                    <div className="space-y-2 pt-2">
                        <div className="h-3 w-full rounded bg-gray-200"></div>
                        <div className="h-3 w-full rounded bg-gray-200"></div>
                        <div className="h-3 w-5/6 rounded bg-gray-200"></div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2">
                            {/* <Star className="h-3 w-3 text-gray-300" /> */}
                            <div className="h-3 w-16 rounded bg-gray-200"></div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            <div className="h-5 w-12 rounded-full bg-gray-200"></div>
                            <div className="h-5 w-16 rounded-full bg-gray-200"></div>
                            <div className="h-5 w-14 rounded-full bg-gray-200"></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                            {/* <Clock className="h-3 w-3 text-gray-300" /> */}
                            <div className="h-3 w-24 rounded bg-gray-200"></div>
                        </div>
                    </div>
                </div>

                {/* Card Footer */}
                <div className="pt-4 mt-4 border-t">
                    <div className="flex gap-2">
                        <div className="h-9 flex-1 rounded-md bg-gray-200"></div>
                        <div className="h-9 w-10 rounded-md bg-gray-200"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden flex items-center justify-between">
        <div className={`${shimmer} space-y-2`}>
          <div className="h-7 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className={`${shimmer} h-10 w-48 rounded-md bg-gray-200`}></div>
      </div>

      {/* Job Cards Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
      </div>

      {/* Stats Footer */}
      <div className="relative overflow-hidden mt-8 p-4 rounded-lg border border-gray-100 bg-white">
        <div className={`${shimmer} flex items-center justify-between`}>
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div>
                    <div className="h-4 w-36 rounded bg-gray-200 mb-1"></div>
                    <div className="h-3 w-48 rounded bg-gray-200"></div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
