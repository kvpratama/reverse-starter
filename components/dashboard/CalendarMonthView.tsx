"use client";

import { useState, useTransition } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Video,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { InterviewBookingsWithDetails } from "@/app/types/interview";
import { RECRUITER_ROLE_ID } from "@/lib/db/schema";

const interviewTypeColors = {
  phone_screen: "bg-blue-500",
  technical: "bg-purple-500",
  behavioral: "bg-green-500",
  final_round: "bg-red-500",
  hr_round: "bg-yellow-500",
  team_meet: "bg-indigo-500",
};

const interviewTypeLabels = {
  phone_screen: "Phone Screen",
  technical: "Technical",
  behavioral: "Behavioral",
  final_round: "Final Round",
  hr_round: "HR Round",
  team_meet: "Team Meet",
};

const statusColors = {
  scheduled: "bg-green-100 text-green-800",
  completed: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
  rescheduled: "bg-yellow-100 text-yellow-800",
  no_show: "bg-orange-100 text-orange-800",
};

type Props = {
  interviews: InterviewBookingsWithDetails[];
  userId: string;
  userRole: number;
  initialMonth: number;
  initialYear: number;
};

export default function CalendarMonthView({
  interviews,
  userId,
  userRole,
  initialMonth,
  initialYear,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [currentDate, setCurrentDate] = useState(
    new Date(initialYear, initialMonth, 1)
  );
  const [selectedEvent, setSelectedEvent] =
    useState<InterviewBookingsWithDetails | null>(null);

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getMonthData = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: Array<{
      date: number;
      isCurrentMonth: boolean;
      fullDate: Date;
    }> = [];

    // Previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        date: prevMonthLastDay - i,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, prevMonthLastDay - i),
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i),
      });
    }

    // Next month's leading days
    const remainingDays = 42 - days.length; // 6 rows * 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i),
      });
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    return interviews
      .filter((interview) => {
        const interviewDate = new Date(interview.scheduledDate);
        return (
          interviewDate.getDate() === date.getDate() &&
          interviewDate.getMonth() === date.getMonth() &&
          interviewDate.getFullYear() === date.getFullYear()
        );
      })
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() -
          new Date(b.scheduledDate).getTime()
      );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatEventTime = (date: Date, duration: number) => {
    const start = formatTime(date);
    const end = new Date(date.getTime() + duration * 60000);
    return `${start} - ${formatTime(end)}`;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + offset,
      1
    );
    setCurrentDate(newDate);

    // Update URL params to trigger server-side data fetch
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", newDate.getMonth().toString());
      params.set("year", newDate.getFullYear().toString());
      router.push(`?${params.toString()}`);
    });
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);

    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("month", today.getMonth().toString());
      params.set("year", today.getFullYear().toString());
      router.push(`?${params.toString()}`);
    });
  };

  const monthData = getMonthData(currentDate);

  // Determine user type for display purposes
  const isRecruiter = userRole === RECRUITER_ROLE_ID;

  return (
    <div className="w-full h-screen flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <button
              onClick={goToToday}
              disabled={isPending}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Today
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeMonth(-1)}
                disabled={isPending}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => changeMonth(1)}
                disabled={isPending}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            {isPending && (
              <div className="ml-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs">
          {Object.entries(interviewTypeLabels).map(([type, label]) => (
            <div key={type} className="flex items-center gap-1">
              <div
                className={`w-3 h-3 rounded ${interviewTypeColors[type as keyof typeof interviewTypeColors]}`}
              />
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-h-full">
          {/* Days of Week Header */}
          <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50 sticky top-0 z-10">
            {daysOfWeek.map((day) => (
              <div
                key={day}
                className="p-2 text-center text-sm font-semibold text-gray-700"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div
            className="grid grid-cols-7 auto-rows-fr"
            style={{ minHeight: "calc(100vh - 200px)" }}
          >
            {monthData.map((day, index) => {
              const events = getEventsForDate(day.fullDate);
              const isTodayDate = isToday(day.fullDate);

              return (
                <div
                  key={index}
                  className={`border-b border-r border-gray-200 p-2 min-h-[120px] ${
                    !day.isCurrentMonth ? "bg-gray-50" : "bg-white"
                  } ${index % 7 === 0 ? "border-l" : ""}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span
                      className={`text-sm font-medium ${
                        !day.isCurrentMonth
                          ? "text-gray-400"
                          : isTodayDate
                            ? "bg-orange-500 text-white rounded-full w-7 h-7 flex items-center justify-center"
                            : "text-gray-900"
                      }`}
                    >
                      {day.date}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-1">
                    {events.slice(0, 3).map((event) => (
                      <button
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className={`w-full text-left px-2 py-1 rounded text-xs font-medium text-white truncate hover:opacity-90 transition-opacity ${
                          interviewTypeColors[
                            event.interviewType as keyof typeof interviewTypeColors
                          ]
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">
                            {formatTime(new Date(event.scheduledDate))}{" "}
                            {event.jobTitle}
                          </span>
                        </div>
                      </button>
                    ))}
                    {events.length > 3 && (
                      <button
                        className="w-full text-left px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded"
                        onClick={() => setSelectedEvent(events[3])}
                      >
                        +{events.length - 3} more
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
            onClick={() => setSelectedEvent(null)}
          />
          <div className="relative z-10 mx-4 max-w-3xl animate-in zoom-in-95 duration-200">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-start justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-4 h-4 rounded ${interviewTypeColors[selectedEvent.interviewType as keyof typeof interviewTypeColors]}`}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {selectedEvent.jobTitle}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedEvent.companyName}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {formatEventTime(
                        new Date(selectedEvent.scheduledDate),
                        selectedEvent.duration
                      )}
                    </p>
                    <p className="text-sm text-gray-600">
                      {new Date(selectedEvent.scheduledDate).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Duration: {selectedEvent.duration} minutes
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                      strokeWidth="2"
                    />
                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2" />
                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2" />
                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {
                        interviewTypeLabels[
                          selectedEvent.interviewType as keyof typeof interviewTypeLabels
                        ]
                      }
                    </p>
                    <p className="text-sm text-gray-600">Interview Type</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 text-gray-400 mt-0.5 flex items-center justify-center text-base flex-shrink-0">
                    👤
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {isRecruiter
                        ? selectedEvent.candidateName
                        : selectedEvent.recruiterName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {isRecruiter ? "Candidate" : "Recruiter"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {isRecruiter ? selectedEvent.candidateEmail : ""}
                    </p>
                  </div>
                </div>

                {selectedEvent.meetingLink && (
                  <div className="flex items-start gap-3">
                    <Video className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Video Meeting
                      </p>
                      <a
                        href={selectedEvent.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-700 break-all"
                      >
                        {selectedEvent.meetingLink}
                      </a>
                    </div>
                  </div>
                )}

                {selectedEvent.location && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        In-Person
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedEvent.location}
                      </p>
                    </div>
                  </div>
                )}

                {isRecruiter && selectedEvent.candidateNotes && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-1">
                        Candidate Notes
                      </p>
                      <p className="text-gray-700">
                        {selectedEvent.candidateNotes}
                      </p>
                    </div>
                  </div>
                )}

                {isRecruiter && selectedEvent.recruiterNotes && (
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-1">My Notes</p>
                      <p className="text-gray-700">
                        {selectedEvent.recruiterNotes}
                      </p>
                    </div>
                  </div>
                )}

                {!isRecruiter && selectedEvent.candidateNotes && (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 mb-1">My Notes</p>
                      <p className="text-gray-700">
                        {selectedEvent.candidateNotes}
                      </p>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[
                        selectedEvent.status as keyof typeof statusColors
                      ] || "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedEvent.status
                      .split("_")
                      .map(
                        (word) => word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
