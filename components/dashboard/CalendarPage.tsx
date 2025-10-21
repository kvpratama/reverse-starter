import { Suspense } from "react";
import { redirect } from "next/navigation";
// import { getUser } from '@/lib/auth'; // Your auth helper
import { getSession } from "@/lib/auth/session";
import CalendarMonthView from "@/components/dashboard/CalendarMonthView";
import { getInterviewsForUser } from "@/lib/db/queries";

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string }>;
}) {
  // Get the authenticated user
  const searchParam = await searchParams;
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  // Parse month/year from URL params or use current date
  const currentDate = new Date();
  const month = searchParam.month
    ? parseInt(searchParam.month)
    : currentDate.getMonth();
  const year = searchParam.year
    ? parseInt(searchParam.year)
    : currentDate.getFullYear();

  return (
    <div className="h-screen">
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarData
          userId={session.user.id}
          userRole={session.user.role_id}
          initialMonth={month}
          initialYear={year}
        />
      </Suspense>
    </div>
  );
}

async function CalendarData({
  userId,
  userRole,
  initialMonth,
  initialYear,
}: {
  userId: string;
  userRole: number;
  initialMonth: number;
  initialYear: number;
}) {
  // Fetch interviews based on user role
  const interviews = await getInterviewsForUser(
    userId,
    userRole,
    initialMonth,
    initialYear
  );

  return (
    <CalendarMonthView
      interviews={interviews}
      userId={userId}
      userRole={userRole}
      initialMonth={initialMonth}
      initialYear={initialYear}
    />
  );
}

function CalendarSkeleton() {
  return (
    <div className="w-full h-screen bg-white flex flex-col animate-pulse">
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-9 w-20 bg-gray-200 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 bg-gray-200 rounded-full" />
              <div className="h-9 w-9 bg-gray-200 rounded-full" />
            </div>
            <div className="h-7 w-40 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="p-2 h-10 bg-gray-100" />
          ))}
        </div>
        <div
          className="grid grid-cols-7"
          style={{ minHeight: "calc(100vh - 200px)" }}
        >
          {[...Array(42)].map((_, i) => (
            <div
              key={i}
              className="border-b border-r border-gray-200 p-2 min-h-[120px]"
            >
              <div className="h-4 w-6 bg-gray-200 rounded mb-2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
