import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import {
  interviewInvitations,
  jobseekersProfile,
  jobPosts,
  users,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { id } = await params;
    const invitations = await db
      .select({
        invitation: interviewInvitations,
        profile: jobseekersProfile,
        jobPost: jobPosts,
        recruiter: users,
      })
      .from(interviewInvitations)
      .innerJoin(
        jobseekersProfile,
        eq(interviewInvitations.profileId, jobseekersProfile.id)
      )
      .innerJoin(jobPosts, eq(interviewInvitations.jobPostId, jobPosts.id))
      .innerJoin(users, eq(interviewInvitations.recruiterId, users.id))
      .where(eq(interviewInvitations.id, id))
      .limit(1);

    if (invitations.length === 0) {
      return NextResponse.json(
        { error: "Invitation not found" },
        { status: 404 }
      );
    }

    const invitation = invitations[0];

    // Parse dateTimeSlots from JSON
    const dateTimeSlots = JSON.parse(
      invitation.invitation.dateTimeSlots as string
    );

    // Calculate duration based on interview type (you can adjust these)
    const durations: Record<string, number> = {
      phone_screen: 30,
      technical: 60,
      behavioral: 45,
      final_round: 60,
      hr_round: 30,
      team_meet: 30,
    };

    const response = {
      id: invitation.invitation.id,
      interviewType: invitation.invitation.interviewType,
      duration: durations[invitation.invitation.interviewType] || 30,
      companyName: invitation.jobPost.companyName,
      jobTitle: invitation.jobPost.jobTitle,
      jobLocation: invitation.jobPost.jobLocation,
      recruiterName: invitation.recruiter.name,
      companyProfile: invitation.jobPost.companyProfile,
      dateTimeSlots,
      meetingLink: invitation.invitation.meetingLink,
      notes: invitation.invitation.notes,
      status: invitation.invitation.status,
      confirmedDate: invitation.invitation.confirmedDate,
      recruiterId: invitation.invitation.recruiterId,
      profileId: invitation.invitation.profileId,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching invitation:", error);
    return NextResponse.json(
      { error: "Failed to fetch invitation" },
      { status: 500 }
    );
  }
}
