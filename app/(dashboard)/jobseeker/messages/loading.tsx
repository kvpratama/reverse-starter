const shimmer =
  "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent";

function ConversationListItemSkeleton() {
  return (
    <div className="relative overflow-hidden p-4 flex items-start gap-4">
      <div className={`${shimmer} relative shrink-0`}>
        <div className="h-12 w-12 rounded-full bg-gray-200"></div>
      </div>
      <div className={`${shimmer} flex-1 overflow-hidden`}>
        <div className="h-5 w-3/4 rounded bg-gray-200 mb-2"></div>
        <div className="h-4 w-full rounded bg-gray-200"></div>
      </div>
      <div className={`${shimmer} text-xs self-start`}>
        <div className="h-3 w-20 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}

function MessageBubbleSkeleton({ isSent }: { isSent?: boolean }) {
  return (
    <div className={`flex items-end gap-3 ${isSent ? "flex-row-reverse" : ""}`}>
      {!isSent && (
        <div className="relative shrink-0">
          <div className="h-8 w-8 rounded-full bg-gray-200"></div>
        </div>
      )}
      <div
        className={`relative overflow-hidden max-w-md p-3 rounded-xl ${
          isSent
            ? "bg-gray-200 rounded-br-none"
            : "bg-gray-200 rounded-bl-none"
        }`}
      >
        <div className={`${shimmer} space-y-2`}>
          <div className="h-4 w-48 rounded bg-gray-300"></div>
          <div className="h-3 w-32 rounded bg-gray-300"></div>
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <div className="flex h-full w-full">
      {/* Left Panel: Conversation List Skeleton */}
      <div className="w-full max-w-xs border-r border-gray-200 flex flex-col">
        <div className="relative overflow-hidden p-4 border-b border-gray-200">
          <div className={`${shimmer} space-y-4`}>
            <div className="h-7 w-36 rounded bg-gray-200"></div>
            <div className="h-10 w-full rounded-md bg-gray-200"></div>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <ConversationListItemSkeleton />
          <ConversationListItemSkeleton />
          <ConversationListItemSkeleton />
          <ConversationListItemSkeleton />
        </div>
      </div>

      {/* Right Panel: Chat Window Skeleton */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header Skeleton */}
        <div className="relative overflow-hidden p-4 border-b border-gray-200 flex items-center gap-4">
          <div className={`${shimmer} relative shrink-0`}>
            <div className="h-12 w-12 rounded-full bg-gray-200"></div>
          </div>
          <div className={`${shimmer} flex-1`}>
            <div className="h-6 w-40 rounded bg-gray-200 mb-2"></div>
            <div className="h-4 w-48 rounded bg-gray-200"></div>
          </div>
        </div>

        {/* Messages Skeleton */}
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
          <div className="space-y-6">
            <MessageBubbleSkeleton />
            <MessageBubbleSkeleton />
            <MessageBubbleSkeleton />
          </div>
        </div>

        {/* Message Input Skeleton */}
        {/* <div className="relative overflow-hidden p-4 border-t border-gray-200 bg-white">
          <div className={`${shimmer} flex items-center gap-4`}>
            <div className="h-10 flex-1 rounded-full bg-gray-200"></div>
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
