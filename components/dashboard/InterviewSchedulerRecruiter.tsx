"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  Phone,
  Briefcase,
  User,
  Check,
  Video,
  Mail,
  Plus,
  X,
  Send,
  AlertCircle,
} from "lucide-react";

interface RecruiterInterviewSchedulerProps {
  profileId: string | undefined;
  jobPostId: string | undefined;
  onInvitationSent?: (profileId: string) => void;
}

interface InterviewTypeOption {
  value: string;
  label: string;
  duration: number;
  icon: typeof Phone;
}

interface ExistingBooking {
  scheduledDate: string;
  duration: number;
  status: string;
}

interface RecruiterAvailability {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

const interviewTypes: InterviewTypeOption[] = [
  { value: "phone_screen", label: "Phone Screen", duration: 30, icon: Phone },
  {
    value: "technical",
    label: "Technical Interview",
    duration: 60,
    icon: Briefcase,
  },
  {
    value: "behavioral",
    label: "Behavioral Interview",
    duration: 45,
    icon: User,
  },
  { value: "final_round", label: "Final Round", duration: 60, icon: Check },
  { value: "hr_round", label: "HR Round", duration: 30, icon: User },
  { value: "team_meet", label: "Team Meet & Greet", duration: 30, icon: User },
];

// Utility function for consistent date format conversion
const convertToISODate = (dateStr: string): string => {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr; // Already in YYYY-MM-DD format
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
    const [month, day, year] = dateStr.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  throw new Error("Invalid date format");
};

// URL validation helper function
const isValidUrl = (string: string): boolean => {
  // Returns true if parsing succeeds, false if it fails.
  return URL.canParse(string);
};

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
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type View = "type" | "dates" | "times" | "confirmation" | "sent";

interface DateTimeSlot {
  date: string;
  times: string[];
}

const RecruiterInterviewScheduler: React.FC<
  RecruiterInterviewSchedulerProps
> = ({ profileId, jobPostId, onInvitationSent }) => {
  const [view, setView] = useState<View>("type");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Application data
  const [applicationData, setApplicationData] = useState<any>(null);

  // Recruiter availability
  const [recruiterAvailability, setRecruiterAvailability] = useState<
    RecruiterAvailability[]
  >([]);

  // Existing bookings for conflict checking
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);

  // Interview setup data
  const [interviewType, setInterviewType] = useState<string>("phone_screen");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [dateTimeSlots, setDateTimeSlots] = useState<DateTimeSlot[]>([]);
  const [meetingLink, setMeetingLink] = useState("");
  const [notes, setNotes] = useState("");

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (!profileId || !jobPostId) return;
    fetchApplicationData();
  }, [profileId, jobPostId]);

  useEffect(() => {
    if (applicationData?.recruiter?.id) {
      fetchRecruiterAvailability();
    }
  }, [applicationData]);

  const fetchApplicationData = async () => {
    if (!profileId || !jobPostId) return;
    try {
      setLoading(true);
      const response = await fetch(
        `/api/applications/specific?profileId=${profileId}&jobPostId=${jobPostId}`
      );
      const data = await response.json();
      setApplicationData(data);
    } catch (err) {
      setError("Failed to load application data");
    } finally {
      setLoading(false);
    }
  };

  const fetchRecruiterAvailability = async () => {
    try {
      const response = await fetch(
        `/api/recruiter/availability?recruiterId=${applicationData.recruiter.id}`
      );
      const data = await response.json();
      setRecruiterAvailability(data);

      if (data.length === 0) {
        setError(
          "Recruiter has not set up their availability yet. Please set up your availability first."
        );
      }

      // Fetch existing bookings for conflict checking
      const bookingsResponse = await fetch(
        `/api/interviews/bookings?recruiterId=${applicationData.recruiter.id}`
      );
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json();
        setExistingBookings(bookingsData);
      }
    } catch (err) {
      console.error("Failed to fetch recruiter availability:", err);
      setError("Failed to load availability settings");
    }
  };

  const handleDateSelection = (date: Date) => {
    const dateString = date.toLocaleDateString("en-US").split("T")[0];

    if (selectedDates.includes(dateString)) {
      // Remove date
      setSelectedDates(selectedDates.filter((d) => d !== dateString));
      setDateTimeSlots(dateTimeSlots.filter((dt) => dt.date !== dateString));
    } else {
      // Add date
      setSelectedDates([...selectedDates, dateString]);

      // Automatically select all available time slots for this date
      const availableSlots = generateTimeSlotsForDate(dateString);
      if (availableSlots.length > 0) {
        setDateTimeSlots([
          ...dateTimeSlots,
          { date: dateString, times: availableSlots },
        ]);
      }
    }
  };

  const handleTimeSelection = (date: string, time: string) => {
    const existingSlot = dateTimeSlots.find((dt) => dt.date === date);

    if (existingSlot) {
      if (existingSlot.times.includes(time)) {
        // Remove time
        const updatedTimes = existingSlot.times.filter((t) => t !== time).sort();
        if (updatedTimes.length === 0) {
          setDateTimeSlots(dateTimeSlots.filter((dt) => dt.date !== date));
        } else {
          setDateTimeSlots(
            dateTimeSlots.map((dt) =>
              dt.date === date ? { ...dt, times: updatedTimes } : dt
            )
          );
        }
      } else {
        // Add time
        setDateTimeSlots(
          dateTimeSlots.map((dt) =>
            dt.date === date ? { ...dt, times: [...dt.times, time].sort() } : dt
          )
        );
      }
    } else {
      // Create new slot
      setDateTimeSlots([...dateTimeSlots, { date, times: [time] }]);
    }
  };

  const handleSendInvitation = async () => {
    try {
      setLoading(true);

      // Validate meeting link URL
      if (meetingLink.trim() && !isValidUrl(meetingLink.trim())) {
        setError("Please enter a valid meeting link URL");
        return;
      }

      const response = await fetch("/api/interviews/create-invitation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          jobPostId,
          interviewType,
          dateTimeSlots,
          meetingLink,
          notes,
        }),
      });

      if (response.ok) {
        setView("sent");
        if (onInvitationSent && profileId) {
          onInvitationSent(profileId);
        }
      } else {
        throw new Error("Failed to send invitation");
      }
    } catch (err) {
      setError("Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date): (Date | null)[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const isDateAvailable = (date: Date | null): boolean => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if date is in the future
    if (date < today) return false;

    // Check if recruiter has availability for this day of week
    const dayOfWeek = date.getDay();
    const hasAvailability = recruiterAvailability.some(
      (avail) => avail.dayOfWeek === dayOfWeek && avail.isActive
    );

    return hasAvailability;
  };

  const changeMonth = (increment: number) => {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + increment,
        1
      )
    );
  };

  const getInterviewTypeDetails = (type: string) => {
    return interviewTypes.find((t) => t.value === type) || interviewTypes[0];
  };

  // Generate time slots based on recruiter's availability for a specific date
  const generateTimeSlotsForDate = (dateString: string): string[] => {
    const date = new Date(dateString);
    const dayOfWeek = date.getDay();

    // Find all availability slots for this day of week
    const dayAvailability = recruiterAvailability.filter(
      (avail) => avail.dayOfWeek === dayOfWeek && avail.isActive
    );

    if (dayAvailability.length === 0) {
      return [];
    }

    const slots: string[] = [];

    // Generate 30-minute slots for each availability window
    dayAvailability.forEach((avail) => {
      const [startHour, startMin] = avail.startTime.split(":").map(Number);
      const [endHour, endMin] = avail.endTime.split(":").map(Number);

      let currentHour = startHour;
      let currentMin = startMin;

      while (
        currentHour < endHour ||
        (currentHour === endHour && currentMin < endMin)
      ) {
        const timeSlot = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;

        // Check if this time slot conflicts with any existing booking
        // Convert dateString from MM/DD/YYYY to YYYY-MM-DD for proper parsing
        let isoDateString = dateString;
        try {
          isoDateString = convertToISODate(dateString);
        } catch (error) {
          console.error("Date conversion error:", error);
          continue; // Skip this time slot if date conversion fails
        }

        const slotStart = new Date(isoDateString + "T" + timeSlot + ":00");
        const slotEnd = new Date(slotStart.getTime() + 30 * 60 * 1000); // 30 minutes later

        const hasConflict = existingBookings.some(booking => {
          if (booking.status !== "scheduled") return false;

          const bookingStart = new Date(booking.scheduledDate);
          const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60 * 1000);

          // Check if the booking is on the same day
          if (bookingStart.toDateString() !== slotStart.toDateString()) return false;

          // Check for overlap
          return (
            (slotStart < bookingEnd && slotEnd > bookingStart) || // Overlap
            (bookingStart <= slotStart && bookingEnd >= slotEnd)   // Complete overlap
          );
        });

        // Only add slot if there's no conflict
        if (!hasConflict) {
          slots.push(timeSlot);
        }

        // Increment by 30 minutes
        currentMin += 30;
        if (currentMin >= 60) {
          currentMin = 0;
          currentHour += 1;
        }
      }
    });

    // Remove duplicates and sort
    return [...new Set(slots)].sort();
  };

  // Helper function to sort selected dates chronologically for display
  const getSortedSelectedDates = () => {
    return [...selectedDates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  };

  // Helper function to sort dateTimeSlots chronologically by date
  const getSortedDateTimeSlots = () => {
    return [...dateTimeSlots].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  if (loading && !applicationData) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!applicationData) {
    return <div className="p-6 text-red-600">Failed to load application</div>;
  }

  if (error && recruiterAvailability.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-900 mb-2">
                Availability Not Set
              </h3>
              <p className="text-red-800 mb-4">{error}</p>
              <a
                href="/recruiter/availability"
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                <Clock className="w-4 h-4" />
                Set Up Availability
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 overflow-y-auto">
      {/* Step 1: Select Interview Type */}
      {view === "type" && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Schedule Interview
          </h2>
          <p className="text-gray-600 mb-6">
            Interview with{" "}
            <span className="font-semibold">
              {applicationData.profile.name}
            </span>{" "}
            for{" "}
            <span className="font-semibold">
              {applicationData.jobPost.jobTitle}
            </span>
          </p>

          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Select Interview Type
          </h3>
          <div className="grid md:grid-cols-2 gap-3 mb-6">
            {interviewTypes.map((type) => {
              const Icon = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setInterviewType(type.value)}
                  className={`text-left border-2 rounded-lg p-4 transition ${
                    interviewType === type.value
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-orange-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        {type.label}
                      </p>
                      <p className="text-sm text-gray-600">
                        {type.duration} minutes
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setView("dates")}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition"
          >
            Next: Select Dates
          </button>
        </div>
      )}

      {/* Step 2: Select Multiple Dates */}
      {view === "dates" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("type")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Select Available Dates
            </h2>
            <div className="w-6"></div>
          </div>

          <p className="text-gray-600 mb-4">
            Select multiple dates to offer flexibility to the candidate
          </p>

          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={() => changeMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-semibold text-lg">
              {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              onClick={() => changeMonth(1)}
              className="p-2 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-1">
            {dayNames.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-semibold text-gray-600 py-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2 mb-6 p-2">
            {getDaysInMonth(currentMonth).map((date, idx) => {
              const dateString = date?.toLocaleDateString("en-US").split("T")[0];
              const isSelected =
                dateString && selectedDates.includes(dateString);
              const isAvailable = date && isDateAvailable(date);

              return (
                <button
                  key={idx}
                  onClick={() =>
                    date && isAvailable && handleDateSelection(date)
                  }
                  disabled={!date || !isAvailable}
                  className={`aspect-square w-20 p-2 rounded-lg text-sm transition mx-auto ${
                    date && isAvailable
                      ? "hover:bg-orange-100 cursor-pointer bg-white border border-gray-200"
                      : "text-gray-300 cursor-not-allowed bg-gray-50"
                  } ${isSelected ? "bg-orange-600 border-2 border-orange-600" : ""}`}
                >
                  {date ? date.getDate() : ""}
                </button>
              );
            })}
          </div>
          {selectedDates.length > 0 && (
            <div className="mb-4 p-3 bg-orange-50 rounded-lg">
              <p className="text-sm font-medium text-orange-800 mb-2">
                {selectedDates.length} date
                {selectedDates.length !== 1 ? "s" : ""} selected
              </p>
              <div className="flex flex-wrap gap-2">
                {getSortedSelectedDates().map((date) => (
                  <span
                    key={date}
                    className="text-xs px-2 py-1 bg-orange-100 text-orange-700 rounded"
                  >
                    {new Date(date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => setView("times")}
            disabled={selectedDates.length === 0}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next: Select Time Slots ({selectedDates.length} date
            {selectedDates.length !== 1 ? "s" : ""})
          </button>
        </div>
      )}

      {/* Step 3: Select Times for Each Date */}
      {view === "times" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("dates")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Select Time Slots
            </h2>
            <div className="w-6"></div>
          </div>

          <p className="text-gray-600 mb-6">
            Select available time slots for each date. All slots are
            pre-selected - click to deselect any you don't want to offer.
          </p>

          <div className="space-y-6 mb-6">
            {getSortedSelectedDates().map((date) => {
              const dateSlot = dateTimeSlots.find((dt) => dt.date === date);
              const selectedTimes = dateSlot?.times || [];
              const availableTimeSlots = generateTimeSlotsForDate(date);

              return (
                <div
                  key={date}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-gray-900 mb-3">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </h3>

                  {selectedTimes.length > 0 && (
                    <div className="mb-3 p-2 bg-green-100 rounded flex items-center justify-between">
                      <p className="text-sm text-green-800">
                        {selectedTimes.length} time slot
                        {selectedTimes.length !== 1 ? "s" : ""} selected
                      </p>
                      <button
                        onClick={() => {
                          // Deselect all times for this date
                          setDateTimeSlots(
                            dateTimeSlots.filter((dt) => dt.date !== date)
                          );
                        }}
                        className="text-xs text-green-700 hover:text-green-900 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {availableTimeSlots.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No availability for this date</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {availableTimeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelection(date, time)}
                          className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                            selectedTimes.includes(time)
                              ? "bg-orange-500 text-white border-orange-500"
                              : "bg-white border-gray-200 text-gray-700 hover:border-orange-300"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={() => setView("confirmation")}
            disabled={
              dateTimeSlots.length === 0 ||
              dateTimeSlots.some((dt) => dt.times.length === 0)
            }
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next: Review & Send
          </button>
        </div>
      )}

      {/* Step 4: Confirmation & Send */}
      {view === "confirmation" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("times")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Review & Send Invitation
            </h2>
            <div className="w-6"></div>
          </div>

          <div className="bg-orange-50 p-5 rounded-lg mb-6">
            <h3 className="font-semibold text-orange-900 mb-3">
              Interview Details
            </h3>
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-orange-600">Candidate:</span>{" "}
                <span className="font-medium text-orange-900">
                  {applicationData.profile.name}
                </span>
              </p>
              <p>
                <span className="text-orange-600">Position:</span>{" "}
                <span className="font-medium text-orange-900">
                  {applicationData.jobPost.jobTitle}
                </span>
              </p>
              <p>
                <span className="text-orange-600">Interview Type:</span>{" "}
                <span className="font-medium text-orange-900">
                  {getInterviewTypeDetails(interviewType).label}
                </span>
              </p>
              <p>
                <span className="text-orange-600">Duration:</span>{" "}
                <span className="font-medium text-orange-900">
                  {getInterviewTypeDetails(interviewType).duration} minutes
                </span>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Available Time Slots
            </h3>
            <div className="space-y-3">
              {getSortedDateTimeSlots().map((slot) => (
                <div key={slot.date} className="text-sm">
                  <p className="font-medium text-gray-900 mb-1">
                    {new Date(slot.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {slot.times.map((time) => (
                      <span
                        key={time}
                        className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-700"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={meetingLink}
                onChange={(e) => setMeetingLink(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:border-transparent"
                placeholder="https://meet.google.com/abc-defg-hij"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-transparent"
                placeholder="Any preparation instructions or additional information..."
                rows={4}
              />
            </div>
          </div>

          <button
            onClick={handleSendInvitation}
            disabled={loading || !(meetingLink.trim() && isValidUrl(meetingLink.trim()))}
            className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <Send className="w-5 h-5" />
            {loading ? "Sending..." : "Send Interview Invitation"}
          </button>
        </div>
      )}

      {/* Step 5: Sent Confirmation */}
      {view === "sent" && (
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Invitation Sent!
          </h2>
          <p className="text-gray-600 text-lg mb-6">
            {applicationData.profile.name} will receive an invitation with the
            interview details and can select their preferred time slot.
          </p>

          <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto">
            <p className="text-sm text-gray-600">
              You'll receive a confirmation once the candidate selects a
              time slot.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterInterviewScheduler;
