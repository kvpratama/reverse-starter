const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function SkeletonElement({ className }: { className: string }) {
  return <div className={`bg-gray-200 rounded ${className}`}></div>;
}

export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto p-4 lg:p-8">
      <div className="relative overflow-hidden rounded-lg border bg-white shadow-lg">
        <div className={`${shimmer}`}>
          {/* Header */}

          <div className="p-6 space-y-8">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <SkeletonElement className="h-4 w-20" />
                <SkeletonElement className="h-5 w-28" />
              </div>
              <div className="space-y-2">
                <SkeletonElement className="h-4 w-12" />
                <SkeletonElement className="h-5 w-16" />
              </div>
              <div className="space-y-2">
                <SkeletonElement className="h-4 w-24" />
                <SkeletonElement className="h-5 w-32" />
              </div>
              <div className="space-y-2">
                <SkeletonElement className="h-4 w-24" />
                <SkeletonElement className="h-5 w-32" />
              </div>
            </div>

            <SkeletonElement className="h-px w-full" />

            {/* Career Focus */}
            <div className="space-y-3">
              <SkeletonElement className="h-6 w-40" />
              <div className="flex flex-wrap items-center gap-2">
                <SkeletonElement className="h-7 w-28 rounded-md" />
                <SkeletonElement className="h-7 w-32 rounded-md" />
              </div>
            </div>

            {/* Skills */}
            <div className="space-y-3">
              <SkeletonElement className="h-6 w-24" />
              <div className="flex flex-wrap gap-2">
                <SkeletonElement className="h-6 w-20 rounded-full" />
                <SkeletonElement className="h-6 w-24 rounded-full" />
                <SkeletonElement className="h-6 w-16 rounded-full" />
                <SkeletonElement className="h-6 w-28 rounded-full" />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-3">
              <SkeletonElement className="h-6 w-20" />
              <div className="space-y-2 p-4 bg-gray-50 rounded-lg border">
                <SkeletonElement className="h-4 w-full" />
                <SkeletonElement className="h-4 w-full" />
                <SkeletonElement className="h-4 w-3/4" />
              </div>
            </div>

            {/* Work Experience */}
            <div className="space-y-4">
              <SkeletonElement className="h-6 w-48" />
              <div className="space-y-4">
                <div className="p-4 border rounded-lg space-y-3 bg-white shadow-sm">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <SkeletonElement className="h-5 w-40" />
                      <SkeletonElement className="h-4 w-32" />
                    </div>
                    <SkeletonElement className="h-4 w-24" />
                  </div>
                  <div className="space-y-2 pt-2 pl-4 border-l-2">
                    <SkeletonElement className="h-4 w-full" />
                    <SkeletonElement className="h-4 w-5/6" />
                  </div>
                </div>
                <div className="p-4 border rounded-lg space-y-3 bg-white shadow-sm">
                  <div className="flex justify-between">
                    <div className="space-y-2">
                      <SkeletonElement className="h-5 w-40" />
                      <SkeletonElement className="h-4 w-32" />
                    </div>
                    <SkeletonElement className="h-4 w-24" />
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Button */}
            <SkeletonElement className="h-10 w-36 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
