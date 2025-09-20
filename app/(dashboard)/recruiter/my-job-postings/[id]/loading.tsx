const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

export default function Loading() {
  return (
    <div className={`${shimmer} relative overflow-hidden space-y-6`}>
      {/* Back Button */}
      <div className="mb-4">
        <div className="h-9 w-44 rounded-md bg-gray-200" />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-1/3 rounded-md bg-gray-200" />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex space-x-8">
          <div className="h-10 w-20 bg-gray-300 rounded-t-md" />
          <div className="h-10 w-28 bg-gray-200 rounded-t-md" />
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-6 pt-4">
        <div className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white">
            <div className="h-6 w-1/4 rounded bg-gray-200" />
            <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
        </div>
        <div className="space-y-4 p-6 border border-gray-200 rounded-lg bg-white">
            <div className="h-6 w-1/4 rounded bg-gray-200" />
            <div className="space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-5/6 rounded bg-gray-200" />
            </div>
        </div>
      </div>
    </div>
  );
}
