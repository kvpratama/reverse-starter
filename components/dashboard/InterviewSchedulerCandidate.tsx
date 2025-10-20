'use client';
import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  ChevronLeft,
  Video,
  Mail,
  MapPin,
  Briefcase,
  Building,
  Check,
  Phone,
  User,
  Users,
  Laptop,
  MessageCircle,
  Trophy,
  BadgeCheck,
} from "lucide-react";
import Link from "next/link";

interface CandidateInterviewSchedulerProps {
  invitationId: string;
  onComplete?: () => void;
}

type View =
  | "invitation"
  | "select-date"
  | "select-time"
  | "confirmation"
  | "final";

interface InterviewInvitation {
  id: string;
  interviewType: string;
  duration: number;
  companyName: string;
  jobTitle: string;
  jobLocation: string;
  recruiterName: string;
  companyProfile: string;
  dateTimeSlots: Array<{
    date: string;
    times: string[];
  }>;
  meetingLink: string | null;
  notes: string | null;
  status: string;
  confirmedDate: string | null;
  // Add recruiter and profile information for conflict checking
  recruiterId?: string;
  profileId?: string;
}

const interviewTypeIcons: Record<string, typeof Phone> = {
  phone_screen: Phone,
  technical: Laptop,
  behavioral: MessageCircle,
  final_round: Trophy,
  hr_round: BadgeCheck,
  team_meet: Users,
};

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

const interviewTypeLabels: Record<string, string> = {
  phone_screen: "Phone Screen",
  technical: "Technical Interview",
  behavioral: "Behavioral Interview",
  final_round: "Final Round",
  hr_round: "HR Round",
  team_meet: "Team Meet & Greet",
};

// Helper function to check if two time slots conflict
const isTimeSlotConflict = (
  slot1Date: string,
  slot1Time: string,
  slot1Duration: number,
  slot2Date: string,
  slot2Time: string,
  slot2Duration: number
): boolean => {
  // Convert dateString from MM/DD/YYYY to YYYY-MM-DD for proper parsing
  let slot1IsoDateString = slot1Date;
  try {
    slot1IsoDateString = convertToISODate(slot1Date);
  } catch (error) {
    return false; // If date conversion fails, consider no conflict
  }

  let slot2IsoDateString = slot2Date;
  try {
    slot2IsoDateString = convertToISODate(slot2Date);
  } catch (error) {
    return false; // If date conversion fails, consider no conflict
  }

  const slot1Start = new Date(slot1IsoDateString + "T" + slot1Time + ":00");
  const slot1End = new Date(slot1Start.getTime() + slot1Duration * 60 * 1000);

  const slot2Start = new Date(slot2IsoDateString + "T" + slot2Time + ":00");
  const slot2End = new Date(slot2Start.getTime() + slot2Duration * 60 * 1000);

  // Check if the bookings are on the same day
  if (slot1Start.toDateString() !== slot2Start.toDateString()) return false;

  // Check for overlap
  return (
    (slot1Start < slot2End && slot1End > slot2Start) || // Overlap
    (slot2Start <= slot1Start && slot2End >= slot1End)   // Complete overlap
  );
};

// Helper function to filter available time slots based on existing bookings
const filterAvailableSlots = (
  originalSlots: Array<{ date: string; times: string[] }>,
  existingBookings: Array<{
    scheduledDate: string;
    duration: number;
  }>,
  interviewDuration: number
): Array<{ date: string; times: string[] }> => {
  return originalSlots
    .map((slot) => ({
      date: slot.date,
      times: slot.times.filter((time) => {
        // Check if this time slot conflicts with any existing booking
        return !existingBookings.some((booking) => {
          const bookingDate = new Date(booking.scheduledDate).toISOString().split('T')[0];
          const bookingTime = new Date(booking.scheduledDate).toTimeString().slice(0, 5);

          return isTimeSlotConflict(
            slot.date,
            time,
            interviewDuration,
            bookingDate,
            bookingTime,
            booking.duration
          );
        });
      }),
    }))
    .filter((slot) => slot.times.length > 0); // Only include dates with available times
};

// Function to fetch existing bookings for recruiter and candidate
const fetchExistingBookings = async (recruiterId?: string, profileId?: string, userId?: string, userRole?: number) => {
  try {
    const response = await fetch('/api/interviews/conflicts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recruiterId, profileId, userId, userRole }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch existing bookings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching existing bookings:', error);
    return [];
  }
};

// Function to get current user session
const getCurrentUser = async () => {
  try {
    const response = await fetch('/api/user');
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error('Error fetching user session:', error);
    return null;
  }
};

const CandidateInterviewScheduler: React.FC<
  CandidateInterviewSchedulerProps
> = ({ invitationId, onComplete }) => {
  const [view, setView] = useState<View>("invitation");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [invitation, setInvitation] = useState<InterviewInvitation | null>(
    null
  );
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Helper function to sort dateTimeSlots chronologically by date
  const getSortedDateTimeSlots = () => {
    return invitation
      ? [...invitation.dateTimeSlots].sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        )
      : [];
  };

  // Helper function to get sorted times for a specific date
  const getSortedTimesForDate = (date: string) => {
    if (!invitation) return [];
    const slot = invitation.dateTimeSlots.find((s) => s.date === date);
    return slot ? [...slot.times].sort() : [];
  };

  useEffect(() => {
    fetchInvitation();
  }, [invitationId]);

  const fetchInvitation = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/interviews/invitations/${invitationId}`
      );

      if (!response.ok) {
        throw new Error("Invitation not found");
      }

      const data = await response.json();

      // Get current user for conflict checking (for jobseekers with multiple profiles)
      const currentUser = await getCurrentUser();

      // Fetch existing bookings for conflict checking
      const existingBookings = await fetchExistingBookings(
        data.recruiterId,
        data.profileId, // For recruiters creating invitations
        currentUser?.id, // For jobseekers - their user ID
        currentUser?.roleId // For jobseekers - their role ID
      );

      // Filter available slots based on existing bookings
      const filteredSlots = filterAvailableSlots(
        data.dateTimeSlots,
        existingBookings,
        data.duration
      );

      // Update the invitation with filtered slots
      setInvitation({
        ...data,
        dateTimeSlots: filteredSlots,
      });

      // Check if invitation is already confirmed
      if (data.status === "confirmed" && data.confirmedDate) {
        const confirmedDate = new Date(data.confirmedDate);

        // Extract date in YYYY-MM-DD format for selectedDate
        const year = confirmedDate.getFullYear();
        const month = String(confirmedDate.getMonth() + 1).padStart(2, '0');
        const day = String(confirmedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Extract time in HH:MM format for selectedTime
        const hours = String(confirmedDate.getHours()).padStart(2, '0');
        const minutes = String(confirmedDate.getMinutes()).padStart(2, '0');
        const timeStr = `${hours}:${minutes}`;

        setSelectedDate(dateStr);
        setSelectedTime(timeStr);
        setView("final"); // Skip directly to final confirmation
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInterview = async () => {
    if (!selectedDate || !selectedTime) return;

    // Convert date from MM/DD/YYYY to YYYY-MM-DD format
    let formattedDate = selectedDate;
    try {
      formattedDate = convertToISODate(selectedDate);
    } catch (error) {
      setError("Invalid date format");
      return;
    }

    // Validate the converted date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
      setError("Invalid date format");
      return;
    }

    if (!/^\d{2}:\d{2}$/.test(selectedTime)) {
      setError("Invalid time format");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `/api/interviews/invitations/${invitationId}/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            selectedDate: formattedDate,
            selectedTime,
          }),
        }
      );

      if (response.ok) {
        setView("final");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to confirm interview");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to confirm interview"
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading && !invitation) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800">{error || "Invitation not found"}</p>
        </div>
      </div>
    );
  }

  const InterviewTypeIcon =
    interviewTypeIcons[invitation.interviewType] || Briefcase;
  const interviewTypeLabel =
    interviewTypeLabels[invitation.interviewType] || invitation.interviewType;

  return (
    <div className="bg-white rounded-lg p-6 max-w-3xl mx-auto">
      {/* Step 1: Invitation Welcome */}
      {view === "invitation" && (
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            🎉 Congratulations!
          </h1>
          <p className="text-xl text-gray-700 mb-8">
            You've been invited to interview with{" "}
            <span className="font-semibold text-orange-500">
              {invitation.companyName}
            </span>
          </p>

          <div className="bg-orange-50 rounded-xl p-6 mb-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {invitation.jobTitle}
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Building className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span className="font-medium">{invitation.companyName}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span>{invitation.jobLocation}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <InterviewTypeIcon className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span>{interviewTypeLabel}</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span>{invitation.duration} minutes</span>
              </div>

              <div className="flex items-center gap-3 text-gray-700">
                <User className="w-5 h-5 text-orange-600 flex-shrink-0" />
                <span>Interviewer: {invitation.recruiterName}</span>
              </div>
            </div>
          </div>

          {invitation.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8 text-left">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Interview Preparation
              </h3>
              <p className="text-yellow-800 text-sm">{invitation.notes}</p>
            </div>
          )}

          <button
            onClick={() => setView("select-date")}
            className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition text-lg"
          >
            Schedule Your Interview
          </button>
        </div>
      )}

      {/* Step 2: Select Date */}
      {view === "select-date" && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("invitation")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Choose an Interview Date
            </h2>
            <div className="w-6"></div>
          </div>

          <div className="mb-6 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm text-orange-700">
              <span className="font-semibold">{invitation.companyName}</span>{" "}
              has offered the following dates. Please select one that works best
              for you.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {getSortedDateTimeSlots().map((slot) => {
              const date = new Date(slot.date);
              const isSelected = selectedDate === slot.date;

              return (
                <button
                  key={slot.date}
                  onClick={() => {
                    setSelectedDate(slot.date);
                    setSelectedTime(null);
                  }}
                  className={`w-full text-left border-2 rounded-lg p-4 transition ${
                    isSelected
                      ? "border-orange-600 bg-orange-50"
                      : "border-gray-200 hover:border-orange-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">
                        {date.toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.times.length} time slot
                        {slot.times.length !== 1 ? "s" : ""} available
                      </p>
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        isSelected
                          ? "border-orange-600 bg-orange-600"
                          : "border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setView("select-time")}
            disabled={!selectedDate}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Next: Choose Time
          </button>
        </div>
      )}

      {/* Step 3: Select Time */}
      {view === "select-time" && selectedDate && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("select-date")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Choose a Time Slot
            </h2>
            <div className="w-6"></div>
          </div>

          <div className="mb-6 p-4 bg-orange-50 rounded-lg">
            <p className="text-sm font-medium text-orange-700 mb-1">
              Selected Date
            </p>
            <p className="text-orange-600">
              {new Date(selectedDate).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {getSortedTimesForDate(selectedDate).map((time) => {
              const isSelected = selectedTime === time;

              return (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-4 px-4 rounded-lg border-2 font-semibold transition ${
                    isSelected
                      ? "border-orange-500 bg-orange-500 text-white"
                      : "border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50"
                  }`}
                >
                  {time}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setView("confirmation")}
            disabled={!selectedTime}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Review & Confirm
          </button>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {view === "confirmation" && selectedDate && selectedTime && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setView("select-time")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-gray-900">
              Confirm Your Interview
            </h2>
            <div className="w-6"></div>
          </div>

          <div className="bg-orange-50 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">
              Interview Details
            </h3>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Company</p>
                  <p className="font-semibold text-gray-900">
                    {invitation.companyName}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Position</p>
                  <p className="font-semibold text-gray-900">
                    {invitation.jobTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <InterviewTypeIcon className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Interview Type</p>
                  <p className="font-semibold text-gray-900">
                    {interviewTypeLabel}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Date & Time</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-orange-700 font-medium">{selectedTime}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p className="font-semibold text-gray-900">
                    {invitation.duration} minutes
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-600">Interviewer</p>
                  <p className="font-semibold text-gray-900">
                    {invitation.recruiterName}
                  </p>
                </div>
              </div>

              {invitation.meetingLink && (
                <div className="flex items-start gap-3">
                  <Video className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-600">Meeting Link</p>
                    <a
                      href={invitation.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-orange-500 hover:text-orange-600 font-medium text-sm break-all"
                    >
                      {invitation.meetingLink}
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <Mail className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Email Confirmation</p>
                <p>
                  You'll receive a calendar invite at your email address with
                  all the interview details.
                </p>
              </div>
            </div>
          </div> */}

          <button
            onClick={handleConfirmInterview}
            disabled={loading}
            className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold hover:bg-orange-700 transition text-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Confirming..." : "Confirm Interview"}
          </button>
        </div>
      )}

      {/* Step 5: Final Confirmation */}
      {view === "final" && selectedDate && selectedTime && (
        <div className="text-center py-8">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-12 h-12 text-green-600" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Interview Confirmed!
          </h2>
          <p className="text-gray-600 text-lg mb-8">
            Your interview with{" "}
            <span className="font-semibold">{invitation.companyName}</span> has
            been scheduled.
          </p>

          <div className="bg-orange-50 rounded-xl p-6 max-w-md mx-auto mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">
              Your Interview Details
            </h3>

            <div className="space-y-3 text-left">
              <div>
                <p className="text-sm text-gray-600">Position</p>
                <p className="font-semibold text-gray-900">
                  {invitation.jobTitle}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Date & Time</p>
                <p className="font-semibold text-gray-900">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p className="text-orange-600 font-medium">{selectedTime}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="font-semibold text-gray-900">
                  {invitation.duration} minutes
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-semibold text-gray-900">
                  {interviewTypeLabel}
                </p>
              </div>

              {invitation.meetingLink && (
                <div className="pt-3 border-t border-orange-100">
                  <p className="text-sm text-gray-600 mb-2">Meeting Link</p>
                  <a
                    href={invitation.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition font-medium"
                  >
                    <Video className="w-4 h-4" />
                    Join Meeting
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto mb-6">
            <div className="flex gap-2">
              <Calendar className="w-5 h-5 text-orange-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-800 text-left">
                <p className="font-medium mb-1">Check your calendar</p>
                <p>
                  Check your calendar for the interview details and reminders. <Link href="/jobseeker/calendar" className="text-orange-600 hover:text-orange-700 font-medium">View Calendar</Link>
                </p>
              </div>
            </div>
          </div>

          {invitation.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto text-left">
              <h4 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Preparation Notes
              </h4>
              <p className="text-yellow-800 text-sm">{invitation.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CandidateInterviewScheduler;
