const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function ProfileCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-lg border bg-white shadow-md">
      <div className={`${shimmer} p-6 space-y-4`}>
        {/* Card Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="h-5 w-32 rounded bg-gray-200"></div>
          </div>
        </div>

        {/* Card Content */}
        <div className="space-y-4">
          {/* Skills */}
          <div className="space-y-2">
            <div className="h-3 w-12 rounded bg-gray-200"></div>
            <div className="flex flex-wrap gap-2">
              <div className="h-5 w-16 rounded-full bg-gray-200"></div>
              <div className="h-5 w-20 rounded-full bg-gray-200"></div>
              <div className="h-5 w-14 rounded-full bg-gray-200"></div>
            </div>
          </div>
          {/* Bio */}
          <div className="space-y-2">
            <div className="h-3 w-12 rounded bg-gray-200"></div>
            <div className="h-4 w-full rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 rounded bg-gray-200"></div>
          </div>
        </div>

        {/* Card Footer */}
        <div className="pt-4 space-y-3">
          <div className="flex justify-between items-center h-8">
            <div className="h-6 w-24 rounded bg-gray-200"></div>
          </div>
          <div className="flex gap-2 w-full">
            <div className="h-9 w-full rounded-md bg-gray-200"></div>
            <div className="h-9 w-9 rounded-md bg-gray-200"></div>
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
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-gray-200"></div>
          <div className="h-4 w-64 rounded bg-gray-200"></div>
        </div>
        <div className="h-10 w-40 rounded-md bg-gray-200"></div>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <ProfileCardSkeleton />
        <ProfileCardSkeleton />
        <ProfileCardSkeleton />
      </div>

      {/* Stats Footer */}
      <div className="relative overflow-hidden mt-8 p-4 rounded-lg border border-gray-200 bg-gray-50">
        <div className={`${shimmer} flex items-center justify-between`}>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
            <div>
              <div className="h-4 w-32 rounded bg-gray-200 mb-1"></div>
              <div className="h-3 w-48 rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}